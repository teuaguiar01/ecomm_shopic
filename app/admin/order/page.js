import { prisma } from "@/utils/prisma";
import OrdersTable from "@/components/admin/ordersTable";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ManageOrders() {
    const orders = await prisma.order.findMany({
        select: {
            id: true,
            status: true,
            total: true,
            createdAt: true,
            user: {
                select: {
                    name: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    for (let i = 0; i < orders.length; i++) {
        const element = orders[i];

        // LOG: Status original do banco
        console.log(`🔍 PEDIDO ${element.id}:`);
        console.log(`   Status original do banco: "${element.status}"`);
        console.log(`   Tipo do status: ${typeof element.status}`);

        element.user = element.user.name
        element.total = "R$" + element.total.toFixed(2)

        const originalStatus = element.status;

        switch (element.status) {
            case "completed":
                element.status = "Pago";
                console.log(`   ✅ Status mapeado para: "${element.status}"`);
                break
            case "shipped":
                element.status = "Enviado";
                console.log(`   ✅ Status mapeado para: "${element.status}"`);
                break
            case "payment-pending":
            case "payment_pending":
                element.status = "Pagamento Pendente";
                console.log(`   ✅ Status mapeado para: "${element.status}"`);
                break
            case "pending-verification":
            case "pending_verification":
                element.status = "Aguardando Verificação";
                console.log(`   ✅ Status mapeado para: "${element.status}"`);
                break
            case "processing":
                element.status = "Processando";
                console.log(`   ✅ Status mapeado para: "${element.status}"`);
                break
            case "waiting":
                element.status = "Aguardando";
                console.log(`   ✅ Status mapeado para: "${element.status}"`);
                break
            case "delivered":
                element.status = "Entregue";
                console.log(`   ✅ Status mapeado para: "${element.status}"`);
                break
            case "canceled":
            case "cancelled":
                element.status = "Cancelado";
                console.log(`   ✅ Status mapeado para: "${element.status}"`);
                break
            default:
                // Manter o status original mas formatado
                const formattedStatus = originalStatus.charAt(0).toUpperCase() + originalStatus.slice(1).replace(/[-_]/g, ' ');
                console.log(`   ⚠️  Status DESCONHECIDO: "${originalStatus}" -> formatado para: "${formattedStatus}"`);
                element.status = formattedStatus;
                break
        }

        console.log(`   Status final na tabela: "${element.status}"`);
        console.log('---');
    }

    return (
        <div>
            <OrdersTable orders={orders} />
        </div>
    )
}