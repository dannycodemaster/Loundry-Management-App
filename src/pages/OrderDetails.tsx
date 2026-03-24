import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/StatusBadge';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, Phone, MapPin, Truck } from 'lucide-react';
import { OrderStatus } from '@/types';

const statusFlow: OrderStatus[] = ['received', 'in-progress', 'ready', 'collected'];

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, updateOrderStatus } = useApp();
  const order = orders.find(o => o.id === id);

  if (!order) return <AdminLayout><p className="text-muted-foreground p-8">Order not found</p></AdminLayout>;

  const currentIdx = statusFlow.indexOf(order.status);

  const handleAdvanceStatus = async () => {
    if (currentIdx < statusFlow.length - 1) {
      await updateOrderStatus(order.id, statusFlow[currentIdx + 1]);
    }
  };

  return (
    <AdminLayout>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground mt-1">Created {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Status Progress */}
      <div className="rounded-lg border border-border bg-card p-4 mb-4">
        <h3 className="text-sm font-semibold text-card-foreground mb-3">Order Progress</h3>
        <div className="flex items-center gap-1">
          {statusFlow.map((s, i) => (
            <div key={s} className="flex-1">
              <div className={`h-2 rounded-full ${i <= currentIdx ? 'bg-primary' : 'bg-muted'}`} />
              <p className={`text-xs mt-1 ${i <= currentIdx ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                {s.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
            </div>
          ))}
        </div>
        {currentIdx < statusFlow.length - 1 && (
          <button onClick={handleAdvanceStatus} className="mt-4 w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            Mark as {statusFlow[currentIdx + 1].replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        )}
      </div>

      {/* Customer Info */}
      <div className="rounded-lg border border-border bg-card p-4 mb-4">
        <h3 className="text-sm font-semibold text-card-foreground mb-3">Customer</h3>
        <p className="text-sm font-medium text-card-foreground">{order.customerName}</p>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <Phone className="h-3 w-3" /> {order.customerPhone}
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" /> {order.customerAddress}
        </div>
      </div>

      {/* Garments */}
      <div className="rounded-lg border border-border bg-card p-4 mb-4">
        <h3 className="text-sm font-semibold text-card-foreground mb-3">Garments</h3>
        <div className="divide-y divide-border">
          {order.garments.map(g => (
            <div key={g.id} className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-sm font-medium text-card-foreground">{g.type}{g.customType ? ` (${g.customType})` : ''}</p>
                <p className="text-xs text-muted-foreground">{g.service} × {g.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-card-foreground">₦{(g.price * g.quantity).toLocaleString()}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-3 mt-2 border-t border-border">
          <p className="text-sm font-semibold text-card-foreground">Total</p>
          <p className="text-lg font-bold text-primary">₦{order.totalCost.toLocaleString()}</p>
        </div>
      </div>

      {/* Payment */}
      <div className="rounded-lg border border-border bg-card p-4 mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-card-foreground">Payment</h3>
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          <p>Paid: ₦{order.amountPaid.toLocaleString()} / ₦{order.totalCost.toLocaleString()}</p>
          {order.paymentMethod && <p className="mt-1 capitalize">Method: {order.paymentMethod.replace('-', ' ')}</p>}
          {order.paymentStatus !== 'paid' && (
            <p className="mt-1 text-destructive font-medium">Balance: ₦{(order.totalCost - order.amountPaid).toLocaleString()}</p>
          )}
        </div>
      </div>

      {/* Delivery */}
      {order.deliveryStatus !== 'none' && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-card-foreground">Delivery</h3>
          </div>
          <p className="text-sm text-muted-foreground capitalize">{order.deliveryStatus.replace(/-/g, ' ')}</p>
          {order.deliveryAddress && <p className="text-xs text-muted-foreground mt-1">To: {order.deliveryAddress}</p>}
          {order.deliveryFee > 0 && <p className="text-xs text-muted-foreground mt-1">Fee: ₦{order.deliveryFee.toLocaleString()}</p>}
        </div>
      )}
    </AdminLayout>
  );
};

export default OrderDetails;
