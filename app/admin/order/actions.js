'use server'

import { prisma } from '@/utils/prisma'
import { getServerSession } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'

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
        await prisma.order.update({
            where: { id: parseInt(orderId) },
            data: { status: newStatus }
        });

        // Redirect to refresh the page with updated data
        redirect(`/admin/order/${orderId}`)
    } catch (error) {
        console.error("Error updating order status:", error)
        throw new Error("Failed to update order status")
    }
}

export { queryAllOrders, updateOrderStatus }