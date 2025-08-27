
"use server";

import type { User } from "firebase/auth";

interface CreateDirectPaymentArgs {
    amount: number;
    context: string;
    user: {
        uid: string;
        email: string | null;
        displayName: string | null;
    };
    payment: {
        method: 'mpesa' | 'emola';
        phone: string;
    }
}

interface CreatePaymentResponse {
    success: boolean;
    message: string;
    transactionId?: string;
}

<<<<<<< HEAD
export async function createDirectPayment(args: CreateDirectPaymentArgs): Promise<CreatePaymentResponse> {
    const { amount, context, user, payment } = args;
    const apiKey = process.env.NHONGA_API_KEY;

    if (!apiKey) {
        console.error("A chave da API de pagamento (NHONGA_API_KEY) não está configurada nas variáveis de ambiente do servidor.");
        return {
            success: false,
            message: "Ocorreu um erro no servidor. A configuração de pagamento está incompleta."
        };
    }

    // Basic phone validation for Mozambique
    const phoneRegex = /^(84|85|86|87)\d{7}$/;
    const cleanedPhone = payment.phone.replace(/\s+/g, '');
    if (!phoneRegex.test(cleanedPhone)) {
        return {
            success: false,
            message: "Número de telefone inválido. Use um formato válido de Moçambique (ex: 841234567)."
        }
    }
=======
export async function createPayment(args: CreatePaymentArgs): Promise<CreatePaymentResponse> {
    const { amount, context, userId } = args;
    const apiKey = process.env.NHONGA_API_KEY;

    if (!apiKey) {
        throw new Error("A chave da API de pagamento não está configurada no servidor.");
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://rentspotmz.site';
>>>>>>> fde9184 (elimine todas as pastas com API e inicie a integração da API do zero no)

    const payload = {
        method: payment.method,
        amount,
        context,
<<<<<<< HEAD
        useremail: user.email || 'nao_fornecido@rentspotmz.site',
        userwhatsApp: cleanedPhone, // Assuming the payment phone is also the WhatsApp number
        phone: cleanedPhone,
        custom_data: {
            userId: user.uid
=======
        callbackUrl: `${baseUrl}/api/payment/callback`,
        returnUrl: `${baseUrl}/dashboard/upgrade/success`,
        currency: "MZN",
        enviroment: "prod",
        custom_data: {
            userId: userId
>>>>>>> fde9184 (elimine todas as pastas com API e inicie a integração da API do zero no)
        }
    };

    try {
        const response = await fetch('https://nhonga.net/api/payment/mobile', {
            method: 'POST',
            headers: {
                'apiKey': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.success && data.id) {
            return {
                success: true,
                message: "Pedido de pagamento enviado. Por favor, confirme no seu telemóvel.",
                transactionId: data.id,
            };
        } else {
            return {
                success: false,
                message: data.error || "Ocorreu um erro desconhecido ao iniciar o pagamento.",
            };
        }

    } catch (error: any) {
        console.error("Erro ao comunicar com a API da Nhonga:", error);
        return {
            success: false,
            message: `Não foi possível conectar ao serviço de pagamento: ${error.message}`,
        };
    }
}
