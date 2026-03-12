import React from "react";
import { Badge } from "@/components/ui/Badge";

type OrderStatus = "pending" | "processing" | "completed" | "cancelled";
type SubmissionStatus = "sent" | "opened" | "replied" | "rejected";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

interface SubmissionStatusBadgeProps {
  status: SubmissionStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const map: Record<OrderStatus, { label: string; variant: "warning" | "info" | "success" | "error" }> = {
    pending: { label: "Pending", variant: "warning" },
    processing: { label: "Processing", variant: "info" },
    completed: { label: "Completed", variant: "success" },
    cancelled: { label: "Cancelled", variant: "error" },
  };
  const { label, variant } = map[status] ?? { label: status, variant: "neutral" as any };
  return <Badge label={label} variant={variant} />;
}

export function SubmissionStatusBadge({ status }: SubmissionStatusBadgeProps) {
  const map: Record<SubmissionStatus, { label: string; variant: "info" | "primary" | "success" | "error" }> = {
    sent: { label: "Sent", variant: "info" },
    opened: { label: "Opened", variant: "primary" },
    replied: { label: "Replied", variant: "success" },
    rejected: { label: "Rejected", variant: "error" },
  };
  const { label, variant } = map[status] ?? { label: status, variant: "neutral" as any };
  return <Badge label={label} variant={variant} size="sm" />;
}
