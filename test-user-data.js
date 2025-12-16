const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkUserData() {
    // Buscar o pedido mais recente
    const latestOrder = await prisma.order.findFirst({
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                include: {
                    addresses: true
                }
            }
        }
    })

    if (latestOrder) {
        console.log('Pedido mais recente:')
        console.log('ID do Pedido:', latestOrder.id)
        console.log('Data:', latestOrder.createdAt)
        console.log('Status:', latestOrder.status)
        console.log('\nDados do Usuário:')
        console.log('ID:', latestOrder.user.id)
        console.log('Nome:', latestOrder.user.name)
        console.log('Email:', latestOrder.user.email)
        console.log('CPF:', latestOrder.user.cpf)
        console.log('Telefone:', latestOrder.user.phone)
        console.log('\nEndereços do usuário:', latestOrder.user.addresses.length)
        latestOrder.user.addresses.forEach(addr => {
            console.log('  - Tipo:', addr.type)
            console.log('    Rua:', addr.street)
            console.log('    Número:', addr.number)
            console.log('    Cidade:', addr.city)
            console.log('    CEP:', addr.zip_code)
            console.log('    users_id:', addr.users_id)
            console.log('    orders_id:', addr.orders_id)
        })
    } else {
        console.log('Nenhum pedido encontrado')
    }

    await prisma.$disconnect()
}

checkUserData()
