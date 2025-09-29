
"use server";
import { v4 as uuidv4 } from 'uuid';
import { receiptExists } from '@/utils/receiptStorage';
import { prisma } from '@/utils/prisma';

export async function GeneratePayment(price, email) {
    try {
        const response = await fetch('https://api.mercadopago.com/v1/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Idempotency-Key': uuidv4(),
                Authorization: `Bearer APP_USR-3973403335554418-112719-85db27b22941e41d74741f7af6ed75c8-2100006760`,
            },
            body: JSON.stringify({
                payer: { email },
                token: uuidv4(),
                description: 'teste',
                transaction_amount: price,
                payment_method_id: 'pix',
            }),
        });
        console.log(response);
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Pagamento criado:', data);
        return data;
    } catch (error) {
        console.error('Erro ao criar pagamento:', error);
        throw error;
    }
}

export async function handler() {
    const { CopyAndPaste } = require("pixjs");

    const data = {
        name: "Tiago Dias Laureano", // Receptor name
        key: "86300844560", // The pix key
        amount: 1.0, // Amount
        city: "Salvador", // String without special characters ex: Sao Paulo
        id: "PAGAMENTO", // Payment identifier
        type: "cpf", // "email" | "phone" | "cpf" | "cnpj" | "random"
    };

    const copyAndPaste = CopyAndPaste(data);

    return {
        message: "Your Copy and Paste has been generated",
        payload: copyAndPaste,
        data,
    };
}

/**
 * Complete payment process with receipt validation
 * @param {string} orderId - The order ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function completePaymentWithReceipt(orderId) {
    try {
        // Validate input
        if (!orderId) {
            return { success: false, error: 'ID do pedido é obrigatório' };
        }

        // Check if order exists
        const order = await prisma.order.findUnique({
            where: { id: parseInt(orderId) }
        });

        if (!order) {
            return { success: false, error: 'Pedido não encontrado' };
        }

        // Check if receipt exists in Firebase Storage
        const hasReceipt = await receiptExists(orderId);
        
        if (!hasReceipt) {
            return { success: false, error: 'Comprovante de pagamento não encontrado. Por favor, envie o comprovante.' };
        }

        // Update order status to indicate payment is pending verification
        await prisma.order.update({
            where: { id: parseInt(orderId) },
            data: { 
                status: 'pending_verification'
            }
        });

        return { success: true };

    } catch (error) {
        console.error('Error completing payment with receipt:', error);
        return { 
            success: false, 
            error: 'Erro interno do servidor. Tente novamente.' 
        };
    }
}

/**
 * Validate receipt upload completion for an order
 * @param {string} orderId - The order ID
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
export async function validateReceiptUpload(orderId) {
    try {
        if (!orderId) {
            return { valid: false, error: 'ID do pedido é obrigatório' };
        }

        // Check if order exists
        const order = await prisma.order.findUnique({
            where: { id: parseInt(orderId) }
        });

        if (!order) {
            return { valid: false, error: 'Pedido não encontrado' };
        }

        // Check if receipt exists in Firebase Storage
        const hasReceipt = await receiptExists(orderId);
        
        return { 
            valid: hasReceipt,
            error: hasReceipt ? null : 'Comprovante não encontrado'
        };

    } catch (error) {
        console.error('Error validating receipt upload:', error);
        return { 
            valid: false, 
            error: 'Erro ao validar comprovante' 
        };
    }
}

/**
 * Get order details for payment page
 * @param {string} orderId - The order ID
 * @returns {Promise<{order?: object, error?: string}>}
 */
export async function getOrderForPayment(orderId) {
    try {
        if (!orderId) {
            return { error: 'ID do pedido é obrigatório' };
        }

        const order = await prisma.order.findUnique({
            where: { id: parseInt(orderId) },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                order_items: {
                    include: {
                        product: {
                            select: {
                                price: true
                            }
                        }
                    }
                }
            }
        });

        if (!order) {
            return { error: 'Pedido não encontrado' };
        }

        return { order };

    } catch (error) {
        console.error('Error getting order for payment:', error);
        return { error: 'Erro ao buscar pedido' };
    }
}