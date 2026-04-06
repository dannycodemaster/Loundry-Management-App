import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/StatusBadge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Package, ChevronRight, Phone, LogIn, Shirt } from 'lucide-react';
import { toast } from 'sonner';
import { Order, Garment } from '@/types';
import { useNavigate } from 'react-router-dom';

const CustomerPortal = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'login' | 'orders'>('login');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: orderMatches, error } = await supabase
      .from('orders')
      .select('customer_id, customer_name')
      .ilike('customer_name', name.trim())
      .eq('customer_phone', phone.trim());

    if (error || !orderMatches || orderMatches.length === 0) {
      toast.error('No orders found with this name and phone number. Please check your details.');
      setLoading(false);
      return;
    }

    const customerId = orderMatches[0].customer_id;
    setCustomerName(orderMatches[0].customer_name);

    const { data: orderRows } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (!orderRows) { setOrders([]); setStep('orders'); setLoading(false); return; }

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

    setStep('orders');
    setLoading(false);
  };

  const handleLogout = () => {
    setStep('login');
    setName('');
    setPhone('');
    setOrders([]);
    setSelectedOrderId(null);
    setCustomerName('');
  };

  // Totals across all orders
  const totalClothes = orders.reduce((sum, o) => sum + o.garments.reduce((s, g) => s + g.quantity, 0), 0);
  const totalCost = orders.reduce((sum, o) => sum + o.totalCost + o.deliveryFee, 0);
  const totalPaid = orders.reduce((sum, o) => sum + o.amountPaid, 0);
  const totalBalance = totalCost - totalPaid;

  // LOGIN SCREEN
  if (step === 'login') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-primary">✨ FreshPress</h1>
            <p className="text-muted-foreground text-sm mt-2">Customer Portal</p>
          </div>
          <form onSubmit={handleLogin} className="rounded-lg border border-border bg-card p-6 space-y-4">
            <p className="text-sm text-muted-foreground text-center">Enter the name and phone number used for your orders</p>
            <div>
              <label className="text-sm font-medium text-card-foreground">Full Name</label>
              <div className="relative mt-1">
                <LogIn className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" className="pl-9" required type="text" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-card-foreground">Phone Number</label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234..." className="pl-9" required type="tel" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? 'Checking...' : <>View My Orders <LogIn className="h-4 w-4" /></>}
            </button>
          </form>
          <button onClick={() => navigate('/landing')} className="w-full text-xs text-muted-foreground hover:text-foreground mt-4 text-center">
            ← Back to home
          </button>
        </div>
      </div>
    );
  }

  // ORDER DETAIL VIEW
  if (selectedOrder) {
    const statusFlow = ['received', 'in-progress', 'ready', 'collected'] as const;
    const currentIdx = statusFlow.indexOf(selectedOrder.status);
    const balance = selectedOrder.totalCost + selectedOrder.deliveryFee - selectedOrder.amountPaid;
    const orderTotalClothes = selectedOrder.garments.reduce((s, g) => s + g.quantity, 0);

    return (
      <div className="min-h-screen bg-background p-4 max-w-lg mx-auto">
        <button onClick={() => setSelectedOrderId(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> My Orders
        </button>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">{selectedOrder.orderNumber}</h2>
          <OrderStatusBadge status={selectedOrder.status} />
        </div>

        {/* Status Progress */}
        <div className="rounded-lg border border-border bg-card p-4 mb-4">
          <h3 className="text-sm font-semibold text-card-foreground mb-3">Order Progress</h3>
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
          <p className="text-xs text-muted-foreground mt-3">
            {currentIdx === 0 && '🧺 Your clothes have been received and are awaiting processing.'}
            {currentIdx === 1 && '🫧 Your clothes are currently being cleaned.'}
            {currentIdx === 2 && '✅ Your clothes are ready for pickup/delivery!'}
            {currentIdx === 3 && '🎉 Order completed. Thank you!'}
          </p>
        </div>

        {/* Clothes Summary */}
        <div className="rounded-lg border border-border bg-card p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Shirt className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-card-foreground">Clothes Given ({orderTotalClothes} items)</h3>
          </div>
          {selectedOrder.garments.map(g => (
            <div key={g.id} className="flex justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="text-sm text-card-foreground">{g.type}{g.customType ? ` (${g.customType})` : ''}</p>
                <p className="text-xs text-muted-foreground">
                  {g.service === 'washing-ironing' ? 'Washing, Drying & Ironing' : 'Ironing'} × {g.quantity}
                </p>
              </div>
              <p className="text-sm font-medium text-card-foreground">₦{(g.price * g.quantity).toLocaleString()}</p>
            </div>
          ))}
          {selectedOrder.deliveryFee > 0 && (
            <div className="flex justify-between py-2 border-b border-border">
              <p className="text-sm text-muted-foreground">Delivery Fee</p>
              <p className="text-sm font-medium text-card-foreground">₦{selectedOrder.deliveryFee.toLocaleString()}</p>
            </div>
          )}
          <div className="flex justify-between pt-3 mt-1">
            <span className="font-semibold text-sm text-card-foreground">Total</span>
            <span className="font-bold text-primary">₦{(selectedOrder.totalCost + selectedOrder.deliveryFee).toLocaleString()}</span>
          </div>
        </div>

        {/* Payment Details */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-card-foreground">Payment Status</span>
            <PaymentStatusBadge status={selectedOrder.paymentStatus} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Cost</span>
              <span className="text-sm font-medium text-card-foreground">₦{(selectedOrder.totalCost + selectedOrder.deliveryFee).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Amount Paid</span>
              <span className="text-sm font-medium text-green-600">₦{selectedOrder.amountPaid.toLocaleString()}</span>
            </div>
            {balance > 0 && (
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="text-sm font-semibold text-destructive">Remaining Balance</span>
                <span className="text-sm font-bold text-destructive">₦{balance.toLocaleString()}</span>
              </div>
            )}
            {balance <= 0 && (
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="text-sm font-semibold text-green-600">Fully Paid</span>
                <span className="text-sm font-bold text-green-600">✓</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ORDERS LIST with summary
  return (
    <div className="min-h-screen bg-background p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">My Orders</h1>
          <p className="text-xs text-muted-foreground">Welcome, {customerName}</p>
        </div>
        <button onClick={handleLogout} className="text-xs text-primary hover:underline">Logout</button>
      </div>

      {/* Customer Summary */}
      {orders.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="rounded-lg border border-border bg-card p-3 text-center">
            <p className="text-lg font-bold text-primary">{totalClothes}</p>
            <p className="text-[10px] text-muted-foreground">Total Clothes</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3 text-center">
            <p className="text-lg font-bold text-foreground">₦{totalCost.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Total Cost</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3 text-center">
            <p className={`text-lg font-bold ${totalBalance > 0 ? 'text-destructive' : 'text-green-600'}`}>
              {totalBalance > 0 ? `₦${totalBalance.toLocaleString()}` : '✓ Paid'}
            </p>
            <p className="text-[10px] text-muted-foreground">{totalBalance > 0 ? 'Balance' : 'Settled'}</p>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const balance = order.totalCost + order.deliveryFee - order.amountPaid;
            const clothesCount = order.garments.reduce((s, g) => s + g.quantity, 0);
            return (
              <button key={order.id} onClick={() => setSelectedOrderId(order.id)}
                className="w-full text-left rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-card-foreground">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {clothesCount} clothes
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <OrderStatusBadge status={order.status} />
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                  <div className="flex items-center gap-3">
                    <PaymentStatusBadge status={order.paymentStatus} />
                    {balance > 0 && (
                      <span className="text-xs text-destructive font-medium">Balance: ₦{balance.toLocaleString()}</span>
                    )}
                  </div>
                  <span className="text-sm font-bold text-primary">₦{(order.totalCost + order.deliveryFee).toLocaleString()}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerPortal;
