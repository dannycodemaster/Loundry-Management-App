import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/StatusBadge';
import { Input } from '@/components/ui/input';
import { Phone, ArrowLeft, Package, ChevronRight } from 'lucide-react';

const CustomerPortal = () => {
  const { orders } = useApp();
  const [phone, setPhone] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const customerOrders = orders.filter(o => o.customerPhone === phone);
  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoggedIn(true);
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-primary">✨ FreshPress</h1>
            <p className="text-muted-foreground text-sm mt-2">Track your orders</p>
          </div>
          <form onSubmit={handleLogin} className="rounded-lg border border-border bg-card p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-card-foreground">Phone Number</label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234..." className="pl-9" required />
              </div>
            </div>
            <button type="submit" className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
              View My Orders
            </button>
            <p className="text-xs text-center text-muted-foreground">Enter the phone number used for your orders</p>
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

        {/* Progress */}
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

        {/* Items */}
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

        {/* Payment */}
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
        <button onClick={() => { setLoggedIn(false); setPhone(''); }} className="text-xs text-primary hover:underline">Logout</button>
      </div>

      {customerOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No orders found for this number</p>
          <p className="text-xs text-muted-foreground mt-1">Try a different phone number</p>
        </div>
      ) : (
        <div className="space-y-3">
          {customerOrders.map(order => (
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
