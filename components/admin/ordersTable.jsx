"use client";
import { AdminTable } from "@/components/admin/adminTable";
import ReceiptLink from "@/components/admin/receiptLink";

const OrdersTable = ({ orders }) => {
  console.log(`📊 ORDERS TABLE DEBUG:`);
  console.log(`   Recebeu ${orders.length} pedidos`);
  
  // Adicionar a coluna de comprovante aos dados
  const ordersWithReceipt = orders.map(order => {
    console.log(`   Processando pedido ${order.id}:`);
    console.log(`     Status: "${order.status}"`);
    console.log(`     ID: ${order.id}`);
    console.log(`     User: ${order.user}`);
    
    return {
      ...order,
      receipt: <ReceiptLink orderId={order.id} />
    };
  });

  const actions = [
    {
      name: 'Ver Detalhes',
      color: 'blue',
      dest: '/admin/order/$1'
    }
  ];
  
  console.log(`   Actions configuradas:`, actions);

  const headers = ['Pedido', 'Status', 'Total', 'Comprador', 'Comprovante', 'Ação'];

  console.log(`   Dados finais para AdminTable:`, ordersWithReceipt);
  console.log(`   Headers:`, headers);
  console.log('📊 FIM ORDERS TABLE DEBUG');
  console.log('========================');

  return (
    <AdminTable
      title="Pedidos"
      headers={headers}
      data={ordersWithReceipt}
      actions={actions}
    />
  );
};

export default OrdersTable;