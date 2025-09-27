let dictionary = {
    "completed": "concluído",
    "shipped": "enviado",
    "payment-pending": "pagamento pendente",
    "payment_pending": "pagamento pendente",
    "pending-verification": "aguardando verificação",
    "pending_verification": "aguardando verificação",
    "processing": "em processamento",
    "waiting": "aguardando",
    "delivered": "entregue",
    "canceled": "cancelado",
    "cancelled": "cancelado",
} 

export function statusTranslator(status) {
    if (!Object.keys(dictionary).includes(status)) {
        return "status desconhecido"
    }
    return dictionary[status]
} 