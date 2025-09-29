'use server'

import { getServerSession } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/utils/prisma'
import { revalidatePath } from 'next/cache';

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

async function updateStatus(orderId, orderStatus) {
    const session = await getServerSession()
    if (!session || !session.user.role || session.user.role != "admin") {
        throw new Error("Unauthorized: Admin access required")
    }

    // Validate status
    const validStatuses = [
        "payment-pending",
        "pending-verification",
        "pending_verification",
        "processing",
        "completed",
        "shipped",
        "delivered",
        "canceled",
        "waiting"
    ];

    if (!validStatuses.includes(orderStatus)) {
        throw new Error("Invalid status provided")
    }

    try {
        const orderIdInt = parseInt(orderId);
        
        await prisma.order.update({
            where: {
                id: orderIdInt
            },
            data: {
                status: orderStatus,
            },
        });

        console.log(`Dashboard: Order ${orderIdInt} status updated to "${orderStatus}"`);
        revalidatePath('/admin/')
    } catch (error) {
        console.error("Dashboard: Error updating order status:", error);
        throw new Error(`Failed to update order status: ${error.message}`);
    }
}

export { queryAllOrders, updateStatus }