
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

    const payload = {
        method: payment.method,
        amount,
        context,
        useremail: user.email || 'nao_fornecido@rentspotmz.site',
        userwhatsApp: cleanedPhone, // Assuming the payment phone is also the WhatsApp number
        phone: cleanedPhone,
        custom_data: {
            userId: user.uid
        }
    };

    try {
        const response = await fetch('https://vendorapay.com/api/payment/mobile', {
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
        console.error("Erro ao comunicar com a API da VendoraPay:", error);
        return {
            success: false,
            message: `Não foi possível conectar ao serviço de pagamento: ${error.message}`,
        };
    }
}

interface CheckPaymentStatusResponse {
    status: 'pending' | 'completed' | 'failed' | 'error';
    message: string;
}

export async function checkPaymentStatus(transactionId: string): Promise<CheckPaymentStatusResponse> {
    const apiKey = process.env.NHONGA_API_KEY;
     if (!apiKey) {
        console.error("A chave da API de pagamento (NHONGA_API_KEY) não está configurada.");
        return { status: 'error', message: "Configuração do servidor incompleta." };
    }

    try {
        const response = await fetch(`https://vendorapay.com/api/payment/mobile/${transactionId}`, {
            method: 'GET',
            headers: {
                'apiKey': apiKey,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();

        if (response.ok && data.data) {
             switch (data.data.status) {
                case 'completed':
                    return { status: 'completed', message: 'Pagamento concluído com sucesso.' };
                case 'failed':
                    return { status: 'failed', message: 'O pagamento falhou ou foi cancelado.' };
                default:
                    return { status: 'pending', message: 'O pagamento ainda está pendente.' };
            }
        } else {
             return { status: 'error', message: data.error || 'Não foi possível obter o estado do pagamento.' };
        }

    } catch (error: any) {
        console.error("Erro ao verificar o estado do pagamento:", error);
        return { status: 'error', message: `Erro de comunicação com o serviço de pagamento: ${error.message}` };
    }
}
