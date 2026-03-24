import AdminLayout from '@/components/AdminLayout';
import { useApp } from '@/context/AppContext';
import { Search, Phone, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const Customers = () => {
  const { customers } = useApp();
  const [search, setSearch] = useState('');

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Customers</h1>
        <p className="text-muted-foreground text-sm mt-1">{customers.length} customers</p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map(customer => (
          <div key={customer.id} className="rounded-lg border border-border bg-card p-4 animate-fade-in">
            <p className="font-semibold text-card-foreground">{customer.name}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" /> {customer.phone}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> {customer.address}
            </div>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">Orders</p>
                <p className="text-sm font-semibold text-card-foreground">{customer.totalOrders}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Spent</p>
                <p className="text-sm font-semibold text-primary">₦{customer.totalSpent.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default Customers;
