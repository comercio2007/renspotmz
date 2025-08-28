
'use server'

import { adminAuth, adminDb } from "@/lib/firebase-server";
import { revalidatePath } from "next/cache";
import type { Property } from "@/lib/placeholder-data";
import { ref, update } from "firebase/database";


export type UserRecord = {
    uid: string;
    email: string | undefined;
    displayName: string | undefined;
    disabled: boolean;
    creationTime: string;
    lastSignInTime: string;
    propertyLimit?: number;
};

// Add a type to include a potential error message
export type AdminPanelDataResponse = {
    users: UserRecord[];
    properties: Property[];
    error?: string;
}

export async function getUsers(): Promise<{users?: UserRecord[], error?: string}> {
    try {
        const listUsersResult = await adminAuth.listUsers(1000);
        const authUsers = listUsersResult.users;

        const dbUsersSnapshot = await adminDb.ref('users').get();
        const dbUsersData = dbUsersSnapshot.val() || {};

        const combinedUsers: UserRecord[] = authUsers.map(authUser => {
            const dbUser = dbUsersData[authUser.uid];
            return {
                uid: authUser.uid,
                email: authUser.email,
                displayName: authUser.displayName,
                disabled: authUser.disabled,
                creationTime: authUser.metadata.creationTime,
                lastSignInTime: authUser.metadata.lastSignInTime,
                propertyLimit: dbUser?.propertyLimit ?? 1,
            };
        });

        return { users: combinedUsers };
    } catch (error: any) {
        // Simplified error handling for this specific function
        return { error: `Failed to fetch users: ${error.message}` };
    }
}


export async function getAdminPanelData(): Promise<AdminPanelDataResponse> {
    try {
        // 1. Fetch all users from Firebase Auth
        const listUsersResult = await adminAuth.listUsers(1000); // Fetches up to 1000 users
        const authUsers = listUsersResult.users;

        // 2. Fetch all user metadata from Realtime Database
        const dbUsersSnapshot = await adminDb.ref('users').get();
        const dbUsersData = dbUsersSnapshot.val() || {};
        
        // 3. Fetch all properties
        const propertiesSnapshot = await adminDb.ref('properties').get();

        // 4. Combine Auth and DB user data
        const combinedUsers: UserRecord[] = authUsers.map(authUser => {
            const dbUser = dbUsersData[authUser.uid];
            return {
                uid: authUser.uid,
                email: authUser.email,
                displayName: authUser.displayName,
                disabled: authUser.disabled,
                creationTime: authUser.metadata.creationTime,
                lastSignInTime: authUser.metadata.lastSignInTime,
                propertyLimit: dbUser?.propertyLimit ?? 1, // Default to 1 if not set in DB
            };
        });

        let properties: Property[] = [];
        if (propertiesSnapshot.exists()) {
            const data = propertiesSnapshot.val();
            properties = Object.values(data as Record<string, Property>).sort((a, b) => (b.createdAt as number || 0) - (a.createdAt as number || 0));
        }

        return { users: combinedUsers, properties };

    } catch (error: any) {
        console.error("ERRO CRÍTICO em getAdminPanelData:", error);
        if (error.code === 'auth/invalid-credential' || error.code === 'app/invalid-credential' || error.code === 'auth/internal-error') {
             return { users: [], properties: [], error: "A credencial da conta de serviço do Firebase é inválida ou não está configurada corretamente. Verifique as configurações de permissão no Google Cloud IAM." };
        }
        if (error.code === 'permission-denied' || error.code === 'auth/insufficient-permission') {
            return { users: [], properties: [], error: "Permissão negada. A conta de serviço precisa da permissão 'Firebase Authentication Admin'. Por favor, adicione-a no painel do Google Cloud IAM." };
        }
        // Return a more generic but informative error for other cases
        const detailedError = `Ocorreu um erro ao buscar dados para o painel de administração. Mensagem: ${error.message} (Código: ${error.code || 'N/A'})`;
        return { users: [], properties: [], error: detailedError };
    }
}


export async function deleteUser(uid: string): Promise<{ success: boolean, message: string }> {
     try {
        await adminAuth.deleteUser(uid);
        // Also delete from Realtime Database if there's a user node
        await adminDb.ref(`users/${uid}`).remove();
        revalidatePath('/dashboard/admin');
        return { success: true, message: "Usuário excluído com sucesso." };
    } catch (error: any) {
        console.error("Error deleting user:", error);
        return { success: false, message: `Falha ao excluir usuário: ${error.message}` };
    }
}

export async function toggleUserStatus(uid: string, disabled: boolean): Promise<{ success: boolean, message: string, newStatus: boolean }> {
    const newStatus = !disabled;
    try {
        // Update Firebase Auth
        await adminAuth.updateUser(uid, { disabled: newStatus });
        
        // Update Realtime Database to trigger live listeners for the user
        const userStatusRef = adminDb.ref(`users/${uid}`);
        await userStatusRef.update({ disabled: newStatus });

        revalidatePath('/dashboard/admin');
        const action = newStatus ? "desativado" : "ativado";
        return { success: true, message: `Usuário ${action} com sucesso.`, newStatus };
    } catch (error: any) {
        console.error("Error toggling user status:", error);
        return { success: false, message: `Falha ao alterar o status do usuário: ${error.message}`, newStatus: disabled };
    }
}

export async function updateUserPropertyLimit(uid: string, limit: number): Promise<{ success: boolean, message: string }> {
  try {
    const userRef = adminDb.ref(`users/${uid}`);
    await userRef.update({ propertyLimit: limit });
    revalidatePath('/dashboard/admin');
    return { success: true, message: "Limite de imóveis do usuário atualizado com sucesso." };
  } catch (error: any) {
    console.error("Error updating user property limit:", error);
    return { success: false, message: `Falha ao atualizar o limite: ${error.message}` };
  }
}

export async function increaseUserPropertyLimit(uid: string): Promise<{ success: boolean, message: string }> {
    try {
        const userRef = adminDb.ref(`users/${uid}`);
        const snapshot = await userRef.get();

        if (snapshot.exists()) {
            const userData = snapshot.val();
            const currentLimit = userData.propertyLimit || 0;
            const newLimit = currentLimit + 3;
            await userRef.update({ propertyLimit: newLimit });
            return { success: true, message: "Limite de imóveis aumentado com sucesso." };
        } else {
            // If user doesn't exist in DB, create them with the new limit
            await userRef.set({ propertyLimit: 3 });
            return { success: true, message: "Limite de imóveis definido com sucesso." };
        }
    } catch (error: any) {
        console.error("Error increasing user property limit:", error);
        return { success: false, message: `Falha ao aumentar o limite de imóveis: ${error.message}` };
    }
}


export async function sendPasswordResetLink(email: string): Promise<{ success: boolean, message: string }> {
  try {
    // We try to get the user to see if it exists, but we won't expose the result to the client.
    await adminAuth.getUserByEmail(email);

    // If user exists, we can proceed. If not, the catch block will handle it silently.
    // NOTE: The Admin SDK's generatePasswordResetLink does not actually SEND the email.
    // The client SDK does. So this server action is primarily for user existence validation.
    // For this app, we will let the client-side Firebase SDK handle the actual email sending,
    // which it already does. This server action is now simplified to just return a consistent
    // success message to align with the user's request for better security and UX.
    
    // The client will call firebase's `sendPasswordResetEmail` which handles everything.
    // We just need to give a consistent response from our side.

  } catch (error: any) {
    // We catch the "user-not-found" error but do nothing with it.
    // This prevents leaking information about which emails are registered.
    if (error.code !== 'auth/user-not-found') {
      // We still want to log other, unexpected errors.
      console.error("Error in sendPasswordResetLink:", error);
    }
  }

  // Always return a success message to the client.
  return { success: true, message: "Se o e-mail estiver registado, receberá um link para redefinir a sua senha." };
}
