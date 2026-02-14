
import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';

// Esta função inicializa o Firebase Admin SDK de forma robusta,
// compatível com Vercel (usando variáveis de ambiente) e Firebase App Hosting.
function initializeAdminApp() {
  // Se a aplicação já foi inicializada, retorna a instância existente para evitar duplicação.
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // Abordagem para Vercel: usar a chave da conta de serviço a partir das variáveis de ambiente.
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const databaseURL = process.env.FIREBASE_DATABASE_URL;

  if (serviceAccountKey && databaseURL) {
    console.log("Inicializando Firebase Admin com a chave da conta de serviço.");
    try {
      const credentials = JSON.parse(serviceAccountKey);
      return admin.initializeApp({
        credential: admin.credential.cert(credentials),
        databaseURL: databaseURL,
      });
    } catch (error: any) {
      throw new Error(`ERRO CRÍTICO ao fazer o parse da FIREBASE_SERVICE_ACCOUNT_KEY: ${error.message}`);
    }
  }

  // Fallback para o ambiente do Firebase App Hosting que usa FIREBASE_CONFIG
  const firebaseConfigEnv = process.env.FIREBASE_CONFIG;
  if (firebaseConfigEnv) {
    console.log("Inicializando Firebase Admin com a configuração do ambiente (App Hosting).");
    try {
      const firebaseConfig = JSON.parse(firebaseConfigEnv);
      return admin.initializeApp({
        databaseURL: firebaseConfig.databaseURL,
        projectId: firebaseConfig.projectId,
      });
    } catch (error: any) {
      throw new Error(`ERRO CRÍTICO ao fazer o parse da FIREBASE_CONFIG: ${error.message}`);
    }
  }

  // Se nenhuma credencial for encontrada, lança um erro claro e específico.
  if (!serviceAccountKey) {
     throw new Error(
      'ERRO CRÍTICO: A variável de ambiente FIREBASE_SERVICE_ACCOUNT_KEY não foi encontrada. Esta variável é necessária para o deploy na Vercel.'
    );
  }
   if (!databaseURL) {
     throw new Error(
      'ERRO CRÍTICO: A variável de ambiente FIREBASE_DATABASE_URL não foi encontrada. Esta variável é necessária para o deploy na Vercel.'
    );
  }

  // Fallback genérico, embora improvável de ser alcançado com as verificações acima.
  throw new Error(
    'ERRO CRÍTICO: Configuração do Firebase Admin incompleta. Verifique as suas variáveis de ambiente.'
  );
}

const app = initializeAdminApp();
const adminAuth = getAuth(app);
const adminDb = getDatabase(app);

export { app, adminAuth, adminDb };
