"use client";
import { AdminTable } from "@/components/admin/adminTable";

const OrdersTable = ({ orders }) => {
  console.log(`📊 ORDERS TABLE DEBUG:`);
  console.log(`   Recebeu ${orders.length} pedidos`);
  
  orders.forEach(order => {
    console.log(`   Processando pedido ${order.id}:`);
    console.log(`     Status: "${order.status}"`);
    console.log(`     ID: ${order.id}`);
    console.log(`     User: ${order.user}`);
  });

  const actions = [
    {
      name: 'Ver Detalhes',
      color: 'blue',
      dest: '/admin/order/$1'
    }
  ];
  
  console.log(`   Actions configuradas:`, actions);

  const headers = ['Pedido', 'Status', 'Total', 'Comprador', 'Ação'];

  console.log(`   Dados finais para AdminTable:`, orders);
  console.log(`   Headers:`, headers);
  console.log('📊 FIM ORDERS TABLE DEBUG');
  console.log('========================');

  return (
    <AdminTable
      title="Pedidos"
      headers={headers}
      data={orders}
      actions={actions}
    />
  );
};

export default OrdersTable;