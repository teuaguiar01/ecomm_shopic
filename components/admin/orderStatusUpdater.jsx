"use client";
import { useState } from "react";
import { updateOrderStatus } from "@/app/admin/order/actions";

const OrderStatusUpdater = ({ orderId, currentStatus, children }) => {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      setError(null);
      await updateOrderStatus(orderId, newStatus);
    } catch (err) {
      console.error("Error updating status:", err);
      setError(err.message || "Erro ao atualizar status");
    } finally {
      setUpdating(false);
    }
  };

  return children({ handleStatusUpdate, updating, error });
};

export default OrderStatusUpdater;