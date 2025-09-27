"use client";
import { useState, useEffect } from "react";
import { getReceiptUrl } from "@/utils/receiptStorage";
import { updateOrderStatus } from "@/app/admin/order/actions";
import { ZoomInIcon, ZoomOutIcon, ImageIcon, AlertCircleIcon } from "lucide-react";

const ReceiptViewer = ({ orderId, currentStatus = "payment-pending" }) => {
  const [receiptUrl, setReceiptUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    const fetchReceiptUrl = async () => {
      if (!orderId) {
        setError("ID do pedido não fornecido");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const url = await getReceiptUrl(orderId);
        setReceiptUrl(url);
      } catch (err) {
        console.error("Erro ao buscar comprovante:", err);
        setError("Erro ao carregar comprovante: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReceiptUrl();
  }, [orderId]);

  const handleStatusUpdate = async (newStatus) => {
    if (!newStatus) {
      setError("Por favor, selecione um status antes de atualizar.");
      return;
    }

    if (newStatus === currentStatus) {
      setError("O status selecionado é o mesmo que o atual.");
      return;
    }

    try {
      setUpdating(true);
      setError(null);
      await updateOrderStatus(parseInt(orderId), newStatus);
      // A página será recarregada automaticamente pelo redirect na action
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      setError("Erro ao atualizar status: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Carregando comprovante...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg border-2 border-dashed border-red-300">
        <AlertCircleIcon className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-700 text-center">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (!receiptUrl) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-yellow-50 rounded-lg border-2 border-dashed border-yellow-300">
        <ImageIcon className="h-12 w-12 text-yellow-500 mb-4" />
        <p className="text-yellow-700 text-center font-medium">
          Comprovante não encontrado
        </p>
        <p className="text-yellow-600 text-sm text-center mt-2">
          O cliente ainda não enviou o comprovante de pagamento para este pedido.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Receipt Image Display */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-2">
            <ImageIcon className="h-5 w-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">Comprovante de Pagamento</h3>
          </div>
          <button
            onClick={toggleZoom}
            className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            {isZoomed ? (
              <>
                <ZoomOutIcon className="h-4 w-4" />
                <span>Reduzir</span>
              </>
            ) : (
              <>
                <ZoomInIcon className="h-4 w-4" />
                <span>Ampliar</span>
              </>
            )}
          </button>
        </div>
        
        <div className={`p-4 ${isZoomed ? 'overflow-auto max-h-96' : ''}`}>
          <img
            src={receiptUrl}
            alt="Comprovante de Pagamento"
            className={`w-full h-auto rounded border ${
              isZoomed ? 'max-w-none cursor-zoom-out' : 'max-w-md mx-auto cursor-zoom-in'
            }`}
            onClick={toggleZoom}
            onError={(e) => {
              console.error("Erro ao carregar imagem:", e);
              setError("Erro ao carregar a imagem do comprovante");
            }}
          />
        </div>
      </div>

      {/* Status Update Controls */}
      <div className="bg-white rounded-lg border shadow-sm p-4">
        <h4 className="font-medium text-gray-900 mb-3">Atualizar Status do Pedido</h4>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label htmlFor="status-select" className="block text-sm font-medium text-gray-700 mb-2">
              Selecione o novo status:
            </label>
            <select
              id="status-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              disabled={updating}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Selecione um status...</option>
              <option value="payment-pending">Pagamento Pendente</option>
              <option value="pending-verification">Aguardando Verificação</option>
              <option value="processing">Processando</option>
              <option value="completed">Completado</option>
              <option value="shipped">Enviado</option>
              <option value="delivered">Entregue</option>
              <option value="canceled">Cancelado</option>
              <option value="waiting">Aguardando</option>
            </select>
          </div>
          
          <div className="flex-shrink-0">
            <button
              onClick={() => handleStatusUpdate(selectedStatus)}
              disabled={updating || !selectedStatus || selectedStatus === currentStatus}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                updating || !selectedStatus || selectedStatus === currentStatus
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              }`}
            >
              {updating ? "Atualizando..." : "Atualizar Status"}
            </button>
          </div>
        </div>
        
        {updating && (
          <div className="mt-3 flex items-center space-x-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm">Atualizando status do pedido...</span>
          </div>
        )}
      </div>

      {/* Current Status Display */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Status atual:</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            currentStatus === "processing" ? "bg-blue-100 text-blue-800" :
            currentStatus === "payment-pending" ? "bg-yellow-100 text-yellow-800" :
            currentStatus === "pending-verification" ? "bg-orange-100 text-orange-800" :
            currentStatus === "canceled" ? "bg-red-100 text-red-800" :
            currentStatus === "completed" ? "bg-green-100 text-green-800" :
            "bg-gray-100 text-gray-800"
          }`}>
            {currentStatus === "processing" ? "Processando" :
             currentStatus === "payment-pending" ? "Pagamento Pendente" :
             currentStatus === "pending-verification" ? "Aguardando Verificação" :
             currentStatus === "canceled" ? "Cancelado" :
             currentStatus === "completed" ? "Completado" :
             currentStatus}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReceiptViewer;