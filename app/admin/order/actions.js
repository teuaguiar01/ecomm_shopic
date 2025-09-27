'use server'

import { prisma } from '@/utils/prisma'
import { getServerSession } from '@/app/api/auth/[...nextauth]/route'
import { revalidatePath } from 'next/cache'

async function queryAllOrders() {
    const session = await getServerSession()
    if (!session || !session.user.role || session.user.role != "admin") {
        return false
    }
    const data = await prisma.order.findMany({
        select: {
            id: true,
            users_id: true,
            status: true,
            total: true
        }
    });

    return data;
}

async function updateOrderStatus(orderId, newStatus) {
    const session = await getServerSession()
    if (!session || !session.user.role || session.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required")
    }

    // Validate status
    const validStatuses = [
        "payment-pending",
        "pending-verification",
        "pending_verification", // Ambas as variações
        "processing",
        "completed",
        "shipped",
        "delivered",
        "canceled",
        "waiting"
    ];

    if (!validStatuses.includes(newStatus)) {
        throw new Error("Invalid status provided")
    }

    try {
        const orderIdInt = parseInt(orderId);
        
        // Verificar se o pedido existe
        const existingOrder = await prisma.order.findUnique({
            where: { id: orderIdInt }
        });
        
        if (!existingOrder) {
            throw new Error(`Order with ID ${orderIdInt} not found`);
        }
        
        console.log(`Updating order ${orderIdInt} from "${existingOrder.status}" to "${newStatus}"`);
        
        await prisma.order.update({
            where: { id: orderIdInt },
            data: { status: newStatus }
        });

        console.log(`Order ${orderIdInt} status updated successfully`);
        
        // Revalidar a página para mostrar os dados atualizados
        revalidatePath(`/admin/order/${orderId}`);
        revalidatePath('/admin');
        
        return { success: true, message: "Status updated successfully" };
        
    } catch (error) {
        console.error("Error updating order status:", error);
        console.error("OrderId:", orderId, "NewStatus:", newStatus);
        throw new Error(`Failed to update order status: ${error.message}`);
    }
}

export { queryAllOrders, updateOrderStatus }