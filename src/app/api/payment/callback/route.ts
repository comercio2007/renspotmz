
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const signature = req.headers.get('vendorapay-signature');
        const secretKey = process.env.NHONGA_SECRET_KEY;

        if (!secretKey) {
            console.error("[WEBHOOK_ERROR] Chave secreta da VendoraPay (NHONGA_SECRET_KEY) não está configurada.");
            return NextResponse.json({ success: false, error: 'Configuração do servidor incompleta.' }, { status: 500 });
        }

        const hmac = crypto.createHmac('sha256', secretKey);
        hmac.update(JSON.stringify(body));
        const expectedSignature = hmac.digest('hex');

        if (signature !== expectedSignature) {
            console.warn(`[WEBHOOK_WARN] Assinatura de webhook inválida recebida. Assinatura: ${signature}, Esperada: ${expectedSignature}`);
            return NextResponse.json({ success: false, error: 'Assinatura inválida.' }, { status: 401 });
        }

        const { status, id: transactionId } = body;
        const userId = body.custom_data?.userId;

        if (!userId) {
             console.error(`[WEBHOOK_ERROR] Webhook recebido sem userId na transação ${transactionId}. Corpo:`, JSON.stringify(body));
             // Retornar 200 para evitar que a VendoraPay reenvie um webhook inválido.
             return NextResponse.json({ success: true, message: 'Dados em falta no callback (userId), mas aceite para evitar repetição.' });
        }

        console.log(`[WEBHOOK_INFO] Webhook recebido para transação ${transactionId}, utilizador ${userId}, status ${status}.`);

        if (status === 'completed') {
            const userRef = adminDb.ref(`users/${userId}`);
            
            try {
                const snapshot = await userRef.get();

                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    const currentLimit = userData.propertyLimit || 0;
                    const newLimit = currentLimit + 3;

                    await userRef.update({
                        propertyLimit: newLimit
                    });
                    
                    console.log(`[WEBHOOK_SUCCESS] Limite para o utilizador ${userId} aumentado de ${currentLimit} para ${newLimit}. Transação: ${transactionId}.`);
                } else {
                     console.warn(`[WEBHOOK_WARN] Utilizador ${userId} não encontrado na base de dados para a transação ${transactionId}. Não foi possível aumentar o limite.`);
                }
            } catch (dbError: any) {
                console.error(`[WEBHOOK_DB_ERROR] Erro ao aceder/atualizar a base de dados para o utilizador ${userId}:`, dbError);
                // Retornar erro 500 para que a VendoraPay possa tentar novamente se for um problema temporário da base de dados.
                return NextResponse.json({ success: false, error: 'Erro na base de dados interna.' }, { status: 500 });
            }

        } else {
            console.log(`[WEBHOOK_INFO] Transação ${transactionId} para o utilizador ${userId} recebida com o status: ${status}. Nenhuma ação de aumento de limite foi tomada.`);
        }
        
        // Retornar sempre 200 OK para a VendoraPay para indicar que o webhook foi recebido com sucesso.
        return NextResponse.json({ success: true, message: "Webhook processado." });

    } catch (error: any) {
        console.error("[WEBHOOK_FATAL] Erro fatal no processamento do webhook da VendoraPay:", error);
        return NextResponse.json({ success: false, error: 'Erro interno do servidor.' }, { status: 500 });
    }
}
