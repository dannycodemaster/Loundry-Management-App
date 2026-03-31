import { useState, useMemo } from 'react';
import AdminLayout from '@/components/AdminLayout';
import StatCard from '@/components/StatCard';
import { OrderStatusBadge } from '@/components/StatusBadge';
import { useApp } from '@/context/AppContext';
import { ShoppingBag, Clock, CheckCircle, Shirt, Pencil, X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GarmentType, ServiceType } from '@/types';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const garmentTypes: GarmentType[] = ['T-shirt', 'Shirt', 'Trousers', 'Gown', 'Native (Up & Down)', 'Suit', 'Jacket', 'Curtains', 'Duvet', 'Bedsheet', 'Pillow Case', 'Shorts', 'Head-tied', 'Hijab', 'Jalabiya (Men)', 'Jalabiya (Women)', 'Children Clothes', 'Others'];
const serviceTypes: ServiceType[] = ['washing-ironing', 'ironing'];
const serviceLabels: Record<ServiceType, string> = { 'washing-ironing': 'Washing, Drying & Ironing', 'ironing': 'Ironing' };

const Dashboard = () => {
  const { orders, loading, refreshOrders } = useApp();
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editGarments, setEditGarments] = useState<{ id: string; type: GarmentType; quantity: number; service: ServiceType; price: number; customType?: string }[]>([]);
  const [saving, setSaving] = useState(false);

  const pendingOrders = orders.filter(o => o.status !== 'collected').length;
  const readyOrders = orders.filter(o => o.status === 'ready').length;
  const receivedOrders = orders.filter(o => o.status === 'received');
  const recentOrders = orders.slice(0, 5);

  // Garment summary across all orders
  const garmentSummary = useMemo(() => {
    const summary: Record<string, number> = {};
    let total = 0;
    orders.forEach(o => {
      o.garments.forEach(g => {
        const label = g.type === 'Others' && g.customType ? g.customType : g.type;
        summary[label] = (summary[label] || 0) + g.quantity;
        total += g.quantity;
      });
    });
    return { summary, total };
  }, [orders]);

  const startEdit = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    setEditGarments(order.garments.map(g => ({ id: g.id, type: g.type, quantity: g.quantity, service: g.service, price: g.price, customType: g.customType })));
    setEditingOrderId(orderId);
  };

  const cancelEdit = () => {
    setEditingOrderId(null);
    setEditGarments([]);
  };

  const saveEdit = async () => {
    if (!editingOrderId) return;
    setSaving(true);
    try {
      for (const g of editGarments) {
        await supabase.from('garments').update({ type: g.type, quantity: g.quantity, service: g.service, price: g.price, custom_type: g.customType || null }).eq('id', g.id);
      }
      const newTotal = editGarments.reduce((sum, g) => sum + g.price * g.quantity, 0);
      await supabase.from('orders').update({ total_cost: newTotal }).eq('id', editingOrderId);
      await refreshOrders();
      toast.success('Order garments updated');
      cancelEdit();
    } catch {
      toast.error('Failed to save changes');
    }
    setSaving(false);
  };

  if (loading) return <AdminLayout><p className="text-muted-foreground p-8">Loading...</p></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back! Here's your overview.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Orders" value={orders.length} icon={<ShoppingBag className="h-6 w-6" />} />
        <StatCard title="Pending" value={pendingOrders} icon={<Clock className="h-6 w-6" />} />
        <StatCard title="Ready" value={readyOrders} icon={<CheckCircle className="h-6 w-6" />} />
        <StatCard title="Total Garments" value={garmentSummary.total} icon={<Shirt className="h-6 w-6" />} />
      </div>

      {/* Garment breakdown */}
      <div className="rounded-lg border border-border bg-card mb-8">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-card-foreground">Garments by Type</h2>
        </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Object.entries(garmentSummary.summary).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
            <div key={type} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
              <span className="text-sm text-foreground truncate">{type}</span>
              <span className="text-sm font-semibold text-primary ml-2">{count}</span>
            </div>
          ))}
          {Object.keys(garmentSummary.summary).length === 0 && (
            <p className="text-sm text-muted-foreground col-span-full">No garments yet</p>
          )}
        </div>
      </div>

      {/* Received orders - editable */}
      <div className="rounded-lg border border-border bg-card mb-8">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-card-foreground">Received Orders ({receivedOrders.length})</h2>
          <p className="text-xs text-muted-foreground mt-1">Click edit to modify garments</p>
        </div>
        <div className="divide-y divide-border">
          {receivedOrders.length === 0 && (
            <p className="text-sm text-muted-foreground p-4">No received orders</p>
          )}
          {receivedOrders.map(order => (
            <div key={order.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Link to={`/orders/${order.id}`} className="hover:underline">
                  <span className="font-medium text-sm text-card-foreground">{order.orderNumber}</span>
                  <span className="text-xs text-muted-foreground ml-2">{order.customerName}</span>
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-card-foreground">₦{order.totalCost.toLocaleString()}</span>
                  {editingOrderId === order.id ? (
                    <>
                      <button onClick={saveEdit} disabled={saving} className="p-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"><Check className="h-4 w-4" /></button>
                      <button onClick={cancelEdit} className="p-1.5 rounded-md bg-muted text-muted-foreground hover:bg-muted/80"><X className="h-4 w-4" /></button>
                    </>
                  ) : (
                    <button onClick={() => startEdit(order.id)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><Pencil className="h-4 w-4" /></button>
                  )}
                </div>
              </div>

              {editingOrderId === order.id ? (
                <div className="space-y-2 mt-2">
                  {editGarments.map((g, i) => (
                    <div key={g.id} className="grid grid-cols-4 gap-2 items-center">
                      <select value={g.type} onChange={e => { const u = [...editGarments]; u[i].type = e.target.value as GarmentType; setEditGarments(u); }} className="col-span-1 text-xs rounded-md border border-input bg-background px-2 py-1.5">
                        {garmentTypes.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <select value={g.service} onChange={e => { const u = [...editGarments]; u[i].service = e.target.value as ServiceType; setEditGarments(u); }} className="col-span-1 text-xs rounded-md border border-input bg-background px-2 py-1.5">
                        {serviceTypes.map(s => <option key={s} value={s}>{serviceLabels[s]}</option>)}
                      </select>
                      <Input type="number" min={1} value={g.quantity} onChange={e => { const u = [...editGarments]; u[i].quantity = parseInt(e.target.value) || 1; setEditGarments(u); }} className="h-8 text-xs" />
                      <Input type="number" min={0} value={g.price} onChange={e => { const u = [...editGarments]; u[i].price = parseFloat(e.target.value) || 0; setEditGarments(u); }} className="h-8 text-xs" placeholder="Price" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {order.garments.map(g => (
                    <span key={g.id} className="text-xs bg-muted rounded px-2 py-0.5 text-muted-foreground">
                      {g.type} × {g.quantity}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold text-card-foreground">Recent Orders</h2>
          <Link to="/orders" className="text-sm text-primary font-medium hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-border">
          {recentOrders.map(order => (
            <Link key={order.id} to={`/orders/${order.id}`} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
              <div className="min-w-0">
                <p className="font-medium text-sm text-card-foreground">{order.orderNumber}</p>
                <p className="text-xs text-muted-foreground truncate">{order.customerName} · {order.garments.length} items</p>
              </div>
              <div className="flex items-center gap-2 ml-4 shrink-0">
                <OrderStatusBadge status={order.status} />
                <span className="text-sm font-semibold text-card-foreground hidden sm:block">₦{order.totalCost.toLocaleString()}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
