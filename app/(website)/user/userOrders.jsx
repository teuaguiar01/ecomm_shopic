'use client'
import React, { useEffect, useState, useTransition } from 'react'
import { getUserOrdersById, getOrderItemByOrderId } from './actions'
import Link from 'next/link'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeaderCell,
	TableRow,
} from '@tremor/react'
import { statusTranslator } from '@/utils/orderStatusTranslator'

const OrdersPage = ({ userId, className }) => {
	const [orders, setOrders] = useState([])
	const [isPending, startTransition] = useTransition()

	useEffect(() => {
		if (!isPending) {
			startTransition(async () => {
				const dataOrders = await getUserOrdersById(userId)

				for (const data of dataOrders) {
					data.orderItems = await getOrderItemByOrderId(data.id)
				}

				setOrders(dataOrders)
			})
		}
	}, [])

	return (
		<div className={`${className} w-full`}>
			<h1 className="text-2xl font-bold mb-5">Seus Pedidos</h1>
			
			{/* Scroll horizontal em telas pequenas */}
			<div className="overflow-x-auto -mx-8 px-8">
				<Table className="table-auto w-full min-w-[600px]">
					<TableHead className="bg-gray-200">
						<TableRow>
							<TableHeaderCell className="text-center">ID</TableHeaderCell>
							<TableHeaderCell className="text-center hidden sm:table-cell">Data</TableHeaderCell>
							<TableHeaderCell className="text-center">Total</TableHeaderCell>
							<TableHeaderCell className="text-center hidden sm:table-cell">Status</TableHeaderCell>
							<TableHeaderCell className="text-center">Ação</TableHeaderCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{orders.map((order) => (
							<TableRow key={order.id}>
								<TableCell className="text-center">{order.id}</TableCell>
								<TableCell className="text-center hidden sm:table-cell">
									{new Date(order.createdAt).toLocaleDateString()}
								</TableCell>
								<TableCell className="text-center">
									{"R$ " + order.total.toFixed(2)}
								</TableCell>
								<TableCell className="text-center hidden sm:table-cell">
									<span className="capitalize">{statusTranslator(order.status)}</span>
								</TableCell>
								<TableCell className="text-center">
									<Link href={`/statusPedido/${order.id}`}>
										<button className="bg-black hover:bg-gray-950 text-white font-bold py-2 px-4 rounded">
											Ver Pedido
										</button>
									</Link>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	)
}

export default OrdersPage
