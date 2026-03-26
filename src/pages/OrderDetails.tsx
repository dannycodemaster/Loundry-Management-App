import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/StatusBadge';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, Phone, MapPin, Truck, CreditCard } from 'lucide-react';
import { OrderStatus, PaymentStatus, PaymentMethod } from '@/types';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import OrderReceipt from '@/components/OrderReceipt';

const statusFlow: OrderStatus[] = ['received', 'in-progress', 'ready', 'collected'];

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, updateOrderStatus, updatePaymentStatus } = useApp();
  const order = orders.find(o => o.id === id);

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [showReceipt, setShowReceipt] = useState(false);

  if (!order) return <AdminLayout><p className="text-muted-foreground p-8">Order not found</p></AdminLayout>;

  const currentIdx = statusFlow.indexOf(order.status);
  const grandTotal = order.totalCost + order.deliveryFee;
  const balance = grandTotal - order.amountPaid;

  const handleAdvanceStatus = async () => {
    if (currentIdx < statusFlow.length - 1) {
      const nextStatus = statusFlow[currentIdx + 1];
      await updateOrderStatus(order.id, nextStatus);
      if (nextStatus === 'collected') {
        setShowReceipt(true);
      }
    }
  };

  const handleMarkPaid = async () => {
    await updatePaymentStatus(order.id, 'paid', grandTotal, paymentMethod);
    toast.success('Marked as fully paid');
    setShowPaymentForm(false);
  };

  const handleMarkUnpaid = async () => {
    await updatePaymentStatus(order.id, 'unpaid', 0);
    toast.success('Marked as unpaid');
    setShowPaymentForm(false);
  };

  const handlePartialPayment = async () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) { toast.error('Enter a valid amount'); return; }
    const newPaid = order.amountPaid + amount;
    const status: PaymentStatus = newPaid >= grandTotal ? 'paid' : 'partially-paid';
    await updatePaymentStatus(order.id, status, Math.min(newPaid, grandTotal), paymentMethod);
    toast.success(`₦${amount.toLocaleString()} payment recorded`);
    setPaymentAmount('');
    setShowPaymentForm(false);
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

      {/* Payment Management */}
      <div className="rounded-lg border border-border bg-card p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-card-foreground">Payment</h3>
          </div>
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>

        <div className="space-y-1.5 text-sm text-muted-foreground mb-3">
          <div className="flex justify-between"><span>Total Cost</span><span className="text-card-foreground font-medium">₦{grandTotal.toLocaleString()}</span></div>
          <div className="flex justify-between"><span>Amount Paid</span><span className="text-success font-medium">₦{order.amountPaid.toLocaleString()}</span></div>
          {balance > 0 && (
            <div className="flex justify-between"><span>Balance Remaining</span><span className="text-destructive font-bold">₦{balance.toLocaleString()}</span></div>
          )}
        </div>

        {!showPaymentForm ? (
          <button onClick={() => setShowPaymentForm(true)} className="w-full rounded-lg border border-primary bg-primary/5 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors">
            Update Payment
          </button>
        ) : (
          <div className="space-y-3 pt-2 border-t border-border">
            {/* Payment method selector */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Payment Method</label>
              <div className="flex gap-2">
                {(['cash', 'bank-transfer', 'pos'] as PaymentMethod[]).map(m => (
                  <button key={m} onClick={() => setPaymentMethod(m)}
                    className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium border transition-colors capitalize ${paymentMethod === m ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border hover:bg-accent'}`}>
                    {m.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Partial payment input */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Record Payment Amount</label>
              <div className="flex gap-2">
                <Input type="number" placeholder={`Balance: ₦${balance.toLocaleString()}`} value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} className="flex-1" />
                <button onClick={handlePartialPayment} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                  Record
                </button>
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex gap-2">
              <button onClick={handleMarkPaid} className="flex-1 rounded-lg bg-success/10 border border-success/20 px-3 py-2.5 text-xs font-medium text-success hover:bg-success/20 transition-colors">
                Mark Fully Paid
              </button>
              <button onClick={handleMarkUnpaid} className="flex-1 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors">
                Mark Unpaid
              </button>
            </div>

            <button onClick={() => setShowPaymentForm(false)} className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1">
              Cancel
            </button>
          </div>
        )}
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
      {/* Receipt Modal */}
      {showReceipt && <OrderReceipt order={order} onClose={() => setShowReceipt(false)} />}

      {/* View Receipt button for collected orders */}
      {order.status === 'collected' && (
        <button onClick={() => setShowReceipt(true)} className="w-full mt-4 rounded-lg border border-primary bg-primary/5 px-4 py-3 text-sm font-medium text-primary hover:bg-primary/10 transition-colors">
          View Receipt
        </button>
      )}
    </AdminLayout>
  );
};

export default OrderDetails;
