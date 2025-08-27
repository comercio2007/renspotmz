
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-server';
import { increment } from 'firebase/database';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const signature = req.headers.get('nhonga-signature');
        const secretKey = process.env.NHONGA_SECRET_KEY;

        if (!secretKey) {
            console.error("Chave secreta da Nhonga não está configurada.");
            return NextResponse.json({ success: false, error: 'Configuração do servidor incompleta.' }, { status: 500 });
        }

        const hmac = crypto.createHmac('sha256', secretKey);
        hmac.update(JSON.stringify(body));
        const expectedSignature = hmac.digest('hex');

        if (signature !== expectedSignature) {
            console.warn("Assinatura de webhook inválida recebida.");
            return NextResponse.json({ success: false, error: 'Assinatura inválida.' }, { status: 401 });
        }

        const { status, custom_data, id: transactionId } = body;
        const { userId } = custom_data || {};

        if (!userId) {
             console.error(`Webhook recebido sem userId na transação ${transactionId}`);
             return NextResponse.json({ success: false, error: 'Dados em falta no callback.' }, { status: 400 });
        }

        if (status === 'completed') {
            const userRef = adminDb.ref(`users/${userId}`);
            const snapshot = await userRef.get();

            if (snapshot.exists()) {
                await userRef.update({
                    propertyLimit: increment(3)
                });
                console.log(`Limite para o utilizador ${userId} aumentado em +3 para a transação ${transactionId}.`);
            } else {
                 console.warn(`Utilizador ${userId} não encontrado na base de dados para a transação ${transactionId}.`);
            }
        } else {
            console.log(`Transação ${transactionId} para o utilizador ${userId} recebida com o status: ${status}. Nenhuma ação tomada.`);
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Erro no processamento do webhook da Nhonga:", error);
        return NextResponse.json({ success: false, error: 'Erro interno do servidor.' }, { status: 500 });
    }
}
