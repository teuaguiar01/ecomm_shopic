'use client'

import { Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Card, Flex, Title, Icon, Badge, Text, Metric, Button, DateRangePicker, SearchSelect, SearchSelectItem } from '@tremor/react';
import { AlertCircleIcon, CheckIcon, ClockIcon, LoaderIcon, PackageCheckIcon, SearchIcon, TruckIcon, XCircle, ExternalLinkIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import ReceiptLink from '@/components/admin/receiptLink';
import { statusTranslator } from '@/utils/orderStatusTranslator';
import dayjs from 'dayjs';

dayjs.extend(require('dayjs/plugin/isBetween'));

const deltaTypes = {
    waiting: { icon: ClockIcon, color: 'gray' },
    "payment-pending": { icon: ClockIcon, color: 'yellow' },
    "payment_pending": { icon: ClockIcon, color: 'yellow' },
    "pending-verification": { icon: AlertCircleIcon, color: 'orange' },
    "pending_verification": { icon: AlertCircleIcon, color: 'orange' },
    completed: { icon: CheckIcon, color: 'emerald' },
    shipped: { icon: TruckIcon, color: 'lime' },
    delivered: { icon: PackageCheckIcon, color: 'green' },
    processing: { icon: LoaderIcon, color: 'blue' },
    "canceled": {icon: XCircle , color:'red' },
    "cancelled": {icon: XCircle , color:'red' },
}

const numberformatter = (number, decimals = 0) =>
    Intl.NumberFormat("pt-BR", {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(Number(number)).toString();


const filterByCustomer = (customer, data) => {
    return data.filter((item) => item.user.name.toLowerCase().includes(customer.toLowerCase()));
};

const filterByDateRange = (range, data) => {
    return data.filter((item) => dayjs(item.createdAt).isBetween(range.from, range.to, 'day', '[]'));
}

function OrdersTable({ orders }) {
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [filteredOrders, setFilteredOrders] = useState(orders);
    const [selectedDateRange, setSelectedDateRange] = useState({});
    const [totalSold, setTotalSold] = useState(0)
    const [total, setTotal] = useState(0)

    useEffect(() => {
        let filteredData = [...orders];

        if (selectedCustomer) {
            filteredData = filterByCustomer(selectedCustomer, filteredData);
        }

        if (selectedDateRange?.from && selectedDateRange?.to) {
            filteredData = filterByDateRange(selectedDateRange, filteredData)
        }

        setFilteredOrders(filteredData)
    }, [orders, selectedCustomer, selectedDateRange]);



    useEffect(() => {
        let total = 0, total2 = 0
        filteredOrders.forEach((order) => {
            const f = parseFloat(order.total) 
            total += f
            if (order.status == 'completed')
                total2 += f
        })
        setTotal(total2)
        setTotalSold(total)
    }, [filteredOrders])

    return (
        <main className='p-12'>
            <Card>
                <Flex className="mb-4" alignItems="start">
                <div className="truncate">
                        <Text>Faturamento</Text>
                        <Metric className="truncate">{numberformatter(total, 2)}</Metric>
                        <Text className='text-xs'>Apenas dos pedidos Pagos</Text>
                    </div>

                    {totalSold > 0 && (
                        <div className="truncate">
                            <Text>Vendas</Text>
                            <Metric className="truncate">{numberformatter(totalSold, 2)}</Metric>
                            <Text className='text-xs'>Total de vendas de todos os pedidos mostrados</Text>
                        </div>
                    )}
                </Flex>

                <Flex className='space-x-0.5' justifyContent='start' alignItems='center'>
                    <Title>Pedidos</Title>
                    <Icon icon={AlertCircleIcon}
                        variant='simple'
                        tooltip='Lista de pedidos dos usuários'
                    />
                </Flex>

                <Flex className='space-x-2 mt-4' justifyContent='evenly'>
                    <SearchSelect className='max-w-full sm:max-w-xs' onValueChange={setSelectedCustomer} placeholder='Buscar usuário...' icon={SearchIcon} value={selectedCustomer}>
                        {orders.reduce((acc, curr) => {
                            if (curr.user.name && !acc.includes(curr.user.name)) {
                                acc.push(curr.user.name)
                            }
                            return acc;
                        }, []).map((name, index) => (
                            <SearchSelectItem key={index} value={name}>
                                {name}
                            </SearchSelectItem>
                        ))}
                    </SearchSelect>
                    <DateRangePicker placeholder='Selecionar período' enableSelect={false} enableClear={true} onValueChange={setSelectedDateRange} />

                </Flex>


                <div className="mt-6 overflow-x-auto">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableHeaderCell className="w-16">ID</TableHeaderCell>
                                <TableHeaderCell className="w-32">Comprador</TableHeaderCell>
                                <TableHeaderCell className="w-20">Total</TableHeaderCell>
                                <TableHeaderCell className="w-32">Status</TableHeaderCell>
                                <TableHeaderCell className="w-20 text-center">Comprovante</TableHeaderCell>
                                <TableHeaderCell className="w-24 text-center">Ação</TableHeaderCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {filteredOrders
                                .map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-mono text-sm">{order.id}</TableCell>
                                        <TableCell className="truncate max-w-32" title={order.user.name}>
                                            {order.user.name || order.user.email}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {numberformatter(order.total, 2)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge 
                                                icon={deltaTypes[order.status]?.icon || ClockIcon} 
                                                color={deltaTypes[order.status]?.color || 'gray'}
                                                size="sm"
                                            >
                                                {statusTranslator(order.status)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <ReceiptLink orderId={order.id} />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button 
                                                variant='secondary' 
                                                size="xs"
                                                icon={ExternalLinkIcon}
                                                onClick={() => { window.location.href = `/admin/order/${order.id}` }}
                                            >
                                                Detalhes
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>


        </main>
    );
}

export default OrdersTable;