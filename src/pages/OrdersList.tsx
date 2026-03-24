import AdminLayout from '@/components/AdminLayout';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/StatusBadge';
import { useApp } from '@/context/AppContext';
import { Link } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { OrderStatus } from '@/types';

const OrdersList = () => {
  const { orders } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  const filtered = orders.filter(o => {
    const matchesSearch = o.customerName.toLowerCase().includes(search.toLowerCase()) || o.orderNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statuses: (OrderStatus | 'all')[] = ['all', 'received', 'in-progress', 'ready', 'collected'];

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground text-sm mt-1">{orders.length} total orders</p>
        </div>
        <Link to="/create-order" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          + New Order
        </Link>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-muted'}`}
            >
              {s === 'all' ? 'All' : s.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card divide-y divide-border">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No orders found</div>
        ) : (
          filtered.map(order => (
            <Link key={order.id} to={`/orders/${order.id}`} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-card-foreground">{order.orderNumber}</p>
                  <OrderStatusBadge status={order.status} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{order.customerName} · {order.garments.reduce((s, g) => s + g.quantity, 0)} items</p>
              </div>
              <div className="text-right ml-4 shrink-0">
                <p className="text-sm font-semibold text-card-foreground">₦{order.totalCost.toLocaleString()}</p>
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
            </Link>
          ))
        )}
      </div>
    </AdminLayout>
  );
};

export default OrdersList;
