
import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';

// Esta função inicializa o Firebase Admin SDK de forma robusta,
// funcionando em diferentes ambientes (Vercel, Firebase App Hosting, Local).

function initializeAdminApp() {
  // Se a aplicação já foi inicializada, retorna a instância existente.
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // Tenta obter as credenciais das variáveis de ambiente da Vercel.
  // Você precisará configurar estas variáveis no seu painel da Vercel.
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : undefined;
  
  // Tenta obter o FIREBASE_CONFIG injetado pelo Firebase App Hosting.
  const firebaseConfig = process.env.FIREBASE_CONFIG 
    ? JSON.parse(process.env.FIREBASE_CONFIG)
    : undefined;

  if (serviceAccount) {
    // Método para Vercel (e outros ambientes com variáveis de ambiente explícitas)
    console.log("Inicializando Firebase Admin com credenciais da conta de serviço (Vercel).");
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL, // Adicione esta variável na Vercel
    });
  } else if (firebaseConfig) {
    // Método para Firebase App Hosting (usa a variável injetada)
    console.log("Inicializando Firebase Admin com a configuração do Firebase App Hosting.");
    return admin.initializeApp({
        databaseURL: firebaseConfig.databaseURL
    });
  } else {
    // Método para desenvolvimento local (Application Default Credentials)
    // Tenta usar credenciais configuradas via `gcloud auth application-default login`.
    console.log("Inicializando Firebase Admin com credenciais padrão da aplicação (desenvolvimento local).");
     try {
       return admin.initializeApp({
         databaseURL: "https://rentspotmoz-gdl8j-default-rtdb.firebaseio.com",
       });
     } catch (e: any) {
        throw new Error(
          `ERRO CRÍTICO: Falha ao inicializar o Firebase Admin SDK. Verifique se as credenciais estão configuradas corretamente para o ambiente. Erro original: ${e.message}`
        );
     }
  }
}

const app = initializeAdminApp();
const adminAuth = getAuth(app);
const adminDb = getDatabase(app);

export { app, adminAuth, adminDb };
