import { OrderStatus, PaymentStatus } from '@/types';
import { Badge } from '@/components/ui/badge';

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  'received': { label: 'Received', className: 'bg-info/10 text-info border-info/20' },
  'in-progress': { label: 'In Progress', className: 'bg-warning/10 text-warning border-warning/20' },
  'ready': { label: 'Ready', className: 'bg-success/10 text-success border-success/20' },
  'collected': { label: 'Collected', className: 'bg-muted text-muted-foreground border-border' },
};

const paymentConfig: Record<PaymentStatus, { label: string; className: string }> = {
  'paid': { label: 'Paid', className: 'bg-success/10 text-success border-success/20' },
  'partially-paid': { label: 'Partial', className: 'bg-warning/10 text-warning border-warning/20' },
  'unpaid': { label: 'Unpaid', className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

export const OrderStatusBadge = ({ status }: { status: OrderStatus }) => {
  const config = statusConfig[status];
  return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
};

export const PaymentStatusBadge = ({ status }: { status: PaymentStatus }) => {
  const config = paymentConfig[status];
  return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
};
