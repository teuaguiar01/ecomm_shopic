'use server'

import { getServerSession } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/utils/prisma'
import { revalidatePath } from 'next/cache'

async function getUserById(userId) {
    return await prisma.user.findFirst({
        where: {
            id: userId
        }
    })
}

async function getUserOrdersById(userId) {
    return await prisma.order.findMany({
        where: {
            users_id: userId
        }
    })
}

async function getUserAddressById() {
    const id = (await getServerSession())?.user?.id
    if (id)
        return await prisma.address.findFirst({
            where: {
                users_id: id
            }
        })
    else
        return null
}
async function getOrderItemByOrderId(orderId) {
    return await prisma.orderItem.findMany({
        where: {
            orders_id: orderId
        }
    })
}

async function updateUser(data, address) {
    const updates = []
    
    updates.push(
        prisma.user.update({
            where: {
                id: (await getServerSession()).user.id
            },
            data: {
                name: data.name,
                cpf: data.cpf,
                phone: data.phone
            }
        })
    )
    const target = await prisma.address.findFirst({
        where: {
            users_id: (await getServerSession()).user.id
        }
    })

    if (target) {
        updates.push(
            prisma.address.update({
                where: {
                    id: target.id
                },
                data: {
                    street: address.street,
                    complement: address.complement,
                    type: 'billing_shipping',
                    city: address.city,
                    state: address.state,
                    country: address.country,
                    zip_code: address.zip_code,
                    number: address.number,
                    neighborhood: address.neighborhood
                }
            })
        )
    } else {
        updates.push(
            prisma.address.create({
                data: {
                    street: address.street,
                    complement: address.complement,
                    type: 'billing_shipping',
                    city: address.city,
                    state: address.state,
                    country: address.country,
                    zip_code: address.zip_code,
                    number: address.number,
                    neighborhood: address.neighborhood,
                    user: {
                      connect: {
                        id: (await getServerSession()).user.id
                      }
                    }
                }
            })
        )
    }

    await prisma.$transaction(updates)
    
    // Revalidar a página para atualizar os dados
    revalidatePath('/user')
    
    return true
}

export {
    getUserById,
    getUserOrdersById,
    getOrderItemByOrderId,
    getUserAddressById,
    updateUser
}
