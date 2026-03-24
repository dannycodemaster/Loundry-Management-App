import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/StatusBadge';
import { Input } from '@/components/ui/input';
import { Phone, ArrowLeft, Package, ChevronRight, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { Order, Garment } from '@/types';

const CustomerPortal = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'orders'>('phone');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('OTP sent');
      setStep('otp');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await loadOrders();
    setStep('orders');
  };

  const loadOrders = async () => {
    const { data: orderRows } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_phone', phone)
      .order('created_at', { ascending: false });

    if (!orderRows) { setOrders([]); return; }

    const orderIds = orderRows.map(o => o.id);
    const { data: garmentRows } = await supabase.from('garments').select('*').in('order_id', orderIds);

    const garmentsByOrder: Record<string, Garment[]> = {};
    (garmentRows || []).forEach(g => {
      if (!garmentsByOrder[g.order_id]) garmentsByOrder[g.order_id] = [];
      garmentsByOrder[g.order_id].push({
        id: g.id, type: g.type as Garment['type'], customType: g.custom_type || undefined,
        quantity: g.quantity, service: g.service as Garment['service'], price: Number(g.price),
      });
    });

    setOrders(orderRows.map(o => ({
      id: o.id, orderNumber: o.order_number, customerId: o.customer_id,
      customerName: o.customer_name, customerPhone: o.customer_phone, customerAddress: o.customer_address,
      garments: garmentsByOrder[o.id] || [], totalCost: Number(o.total_cost),
      status: o.status as Order['status'], paymentStatus: o.payment_status as Order['paymentStatus'],
      paymentMethod: o.payment_method as Order['paymentMethod'], amountPaid: Number(o.amount_paid),
      deliveryStatus: o.delivery_status as Order['deliveryStatus'], deliveryFee: Number(o.delivery_fee),
      pickupAddress: o.pickup_address || undefined, deliveryAddress: o.delivery_address || undefined,
      assignedRider: o.assigned_rider || undefined, createdAt: o.created_at, updatedAt: o.updated_at,
    })));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setStep('phone');
    setPhone('');
    setOtp('');
    setOrders([]);
  };

  if (step === 'phone') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-primary">✨ FreshPress</h1>
            <p className="text-muted-foreground text-sm mt-2">Track your orders</p>
          </div>
          <form onSubmit={handleSendOtp} className="rounded-lg border border-border bg-card p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-card-foreground">Phone Number</label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234..." className="pl-9" required type="tel" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
            <p className="text-xs text-center text-muted-foreground">Enter the phone number used for your orders</p>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-primary">✨ FreshPress</h1>
            <p className="text-muted-foreground text-sm mt-2">Enter verification code</p>
          </div>
          <form onSubmit={handleVerifyOtp} className="rounded-lg border border-border bg-card p-6 space-y-4">
            <p className="text-sm text-muted-foreground text-center">Code sent to <span className="font-medium text-card-foreground">{phone}</span></p>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter 6-digit code" className="pl-9 text-center tracking-widest text-lg" maxLength={6} required />
            </div>
            <button type="submit" disabled={loading} className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
              {loading ? 'Verifying...' : 'Verify & View Orders'}
            </button>
            <button type="button" onClick={() => { setStep('phone'); setOtp(''); }} className="w-full text-xs text-primary hover:underline">
              Use a different number
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (selectedOrder) {
    const statusFlow = ['received', 'in-progress', 'ready', 'collected'] as const;
    const currentIdx = statusFlow.indexOf(selectedOrder.status);

    return (
      <div className="min-h-screen bg-background p-4 max-w-lg mx-auto">
        <button onClick={() => setSelectedOrderId(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> My Orders
        </button>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">{selectedOrder.orderNumber}</h2>
          <OrderStatusBadge status={selectedOrder.status} />
        </div>
        <div className="rounded-lg border border-border bg-card p-4 mb-4">
          <div className="flex items-center gap-1">
            {statusFlow.map((s, i) => (
              <div key={s} className="flex-1">
                <div className={`h-2 rounded-full ${i <= currentIdx ? 'bg-primary' : 'bg-muted'}`} />
                <p className={`text-[10px] mt-1 ${i <= currentIdx ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                  {s.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 mb-4">
          <h3 className="text-sm font-semibold text-card-foreground mb-2">Items</h3>
          {selectedOrder.garments.map(g => (
            <div key={g.id} className="flex justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="text-sm text-card-foreground">{g.type}</p>
                <p className="text-xs text-muted-foreground">{g.service} × {g.quantity}</p>
              </div>
              <p className="text-sm font-medium text-card-foreground">₦{(g.price * g.quantity).toLocaleString()}</p>
            </div>
          ))}
          <div className="flex justify-between pt-3 mt-1">
            <span className="font-semibold text-sm text-card-foreground">Total</span>
            <span className="font-bold text-primary">₦{selectedOrder.totalCost.toLocaleString()}</span>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-card-foreground">Payment</span>
            <PaymentStatusBadge status={selectedOrder.paymentStatus} />
          </div>
          <p className="text-sm text-muted-foreground mt-2">Paid: ₦{selectedOrder.amountPaid.toLocaleString()}</p>
          {selectedOrder.paymentStatus !== 'paid' && (
            <p className="text-sm text-destructive font-medium mt-1">Balance: ₦{(selectedOrder.totalCost - selectedOrder.amountPaid).toLocaleString()}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">My Orders</h1>
          <p className="text-xs text-muted-foreground">{phone}</p>
        </div>
        <button onClick={handleLogout} className="text-xs text-primary hover:underline">Logout</button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No orders found for this number</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <button key={order.id} onClick={() => setSelectedOrderId(order.id)}
              className="w-full text-left rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-card-foreground">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground mt-1">{order.garments.reduce((s, g) => s + g.quantity, 0)} items · ₦{order.totalCost.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <OrderStatusBadge status={order.status} />
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerPortal;
