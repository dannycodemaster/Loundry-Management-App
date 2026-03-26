import AdminLayout from '@/components/AdminLayout';
import StatCard from '@/components/StatCard';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/StatusBadge';
import { useApp } from '@/context/AppContext';
import { ShoppingBag, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { orders, loading } = useApp();

  const pendingOrders = orders.filter(o => o.status !== 'collected').length;
  const readyOrders = orders.filter(o => o.status === 'ready').length;
  const recentOrders = orders.slice(0, 5);

  if (loading) return <AdminLayout><p className="text-muted-foreground p-8">Loading...</p></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back! Here's your overview.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard title="Total Orders" value={orders.length} icon={<ShoppingBag className="h-6 w-6" />} trend="+12% this week" />
        <StatCard title="Pending" value={pendingOrders} icon={<Clock className="h-6 w-6" />} />
        <StatCard title="Ready" value={readyOrders} icon={<CheckCircle className="h-6 w-6" />} />
      </div>

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
