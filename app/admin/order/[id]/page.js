import { prisma } from "@/utils/prisma";
import { getServerSession } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import ReceiptViewer from "@/components/admin/receiptViewer";


export default async function OrderDetails({ params }) {
    const session = await getServerSession();

    // Check if user is admin
    if (!session || !session.user.role || session.user.role !== "admin") {
        redirect("/admin");
    }

    const orderId = parseInt(params.id);

    // Fetch order details with related data
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            address: true,
            order_items: {
                include: {
                    product: {
                        include: {
                            productItem_product: {
                                select: {
                                    name: true,
                                    description: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!order) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Pedido não encontrado</h1>
                    <p className="text-gray-600">O pedido solicitado não existe ou foi removido.</p>
                </div>
            </div>
        );
    }

    // Format status for display
    const getStatusDisplay = (status) => {
        switch (status) {
            case "completed": return "Completado";
            case "shipped": return "Enviado";
            case "payment-pending": return "Pagamento Pendente";
            case "pending-verification": return "Aguardando Verificação";
            case "processing": return "Processando";
            case "waiting": return "Aguardando";
            case "delivered": return "Entregue";
            case "canceled": return "Cancelado";
            default: return status;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "completed": return "bg-green-100 text-green-800";
            case "shipped": return "bg-blue-100 text-blue-800";
            case "payment-pending": return "bg-yellow-100 text-yellow-800";
            case "pending-verification": return "bg-orange-100 text-orange-800";
            case "processing": return "bg-blue-100 text-blue-800";
            case "waiting": return "bg-gray-100 text-gray-800";
            case "delivered": return "bg-green-100 text-green-800";
            case "canceled": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };



    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Pedido #{order.id}
                    </h1>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusDisplay(order.status)}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <span className="font-medium text-gray-700">Data do Pedido:</span>
                        <p className="text-gray-900">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div>
                        <span className="font-medium text-gray-700">Total:</span>
                        <p className="text-gray-900 font-semibold">R$ {order.total.toFixed(2)}</p>
                    </div>
                    <div>
                        <span className="font-medium text-gray-700">Cliente:</span>
                        <p className="text-gray-900">{order.user.name || order.user.email}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Items */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Itens do Pedido</h2>
                    <div className="space-y-4">
                        {order.order_items.map((item, index) => (
                            <div key={index} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900">
                                        {item.product.productItem_product.name}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        SKU: {item.sku} | Tamanho: {item.product.size}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Quantidade: {item.quantity}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-gray-900">
                                        R$ {item.price.toFixed(2)}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Subtotal: R$ {(item.price * item.quantity).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Customer Information */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações do Cliente</h2>
                    <div className="space-y-3">
                        <div>
                            <span className="font-medium text-gray-700">Nome:</span>
                            <p className="text-gray-900">{order.user.name || "Não informado"}</p>
                        </div>
                        <div>
                            <span className="font-medium text-gray-700">Email:</span>
                            <p className="text-gray-900">{order.user.email}</p>
                        </div>

                        {order.address && order.address.length > 0 && (
                            <div>
                                <span className="font-medium text-gray-700">Endereço de Entrega:</span>
                                {order.address.map((addr, index) => (
                                    <div key={index} className="mt-2 p-3 bg-gray-50 rounded">
                                        <p className="text-gray-900">
                                            {addr.name && <span className="font-medium">{addr.name}<br /></span>}
                                            {addr.street} {addr.number && `, ${addr.number}`}
                                            {addr.complement && `, ${addr.complement}`}
                                        </p>
                                        <p className="text-gray-900">
                                            {addr.neighborhood && `${addr.neighborhood}, `}
                                            {addr.city && `${addr.city} - `}
                                            {addr.state}
                                        </p>
                                        <p className="text-gray-900">
                                            CEP: {addr.zip_code}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Receipt Viewer - Show for all orders */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Comprovante de Pagamento</h2>
                <ReceiptViewer
                    orderId={order.id.toString()}
                    currentStatus={order.status}
                />
            </div>
        </div>
    );
}