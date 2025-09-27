"use client";
import { useState, useEffect } from "react";
import { getReceiptUrl } from "@/utils/receiptStorage";
import { ImageIcon, ExternalLinkIcon } from "lucide-react";

const ReceiptLink = ({ orderId }) => {
  const [hasReceipt, setHasReceipt] = useState(false);
  const [loading, setLoading] = useState(true);
  const [receiptUrl, setReceiptUrl] = useState(null);

  useEffect(() => {
    const checkReceipt = async () => {
      try {
        setLoading(true);
        const url = await getReceiptUrl(orderId.toString());
        setHasReceipt(!!url);
        setReceiptUrl(url);
      } catch (error) {
        console.error("Erro ao verificar comprovante:", error);
        setHasReceipt(false);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      checkReceipt();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  if (!hasReceipt) {
    return (
      <span className="text-gray-400 text-sm">
        Sem comprovante
      </span>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <a
        href={receiptUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
        title="Ver comprovante"
      >
        <ImageIcon className="h-4 w-4" />
        <ExternalLinkIcon className="h-3 w-3" />
      </a>
    </div>
  );
};

export default ReceiptLink;