"use client";
import { useState, useEffect } from "react";
import { getReceiptUrl } from "@/utils/receiptStorage";

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
        -
      </span>
    );
  }

  return (
    <a
      href={receiptUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:text-blue-800 hover:underline transition-colors text-sm"
    >
      Comprovante
    </a>
  );
};

export default ReceiptLink;