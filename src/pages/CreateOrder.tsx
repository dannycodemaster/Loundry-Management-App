import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import { useApp } from '@/context/AppContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Garment, GarmentType, ServiceType } from '@/types';
import { defaultPricing } from '@/data/mockData';
import { Plus, Trash2 } from 'lucide-react';

const garmentTypes: GarmentType[] = ['T-shirt', 'Shirt', 'Trousers', 'Gown', 'Native (Up & Down)', 'Suit', 'Jacket', 'Others'];
const serviceTypes: ServiceType[] = ['washing', 'ironing', 'dry-cleaning'];

const CreateOrder = () => {
  const navigate = useNavigate();
  const { addOrder } = useApp();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [garments, setGarments] = useState<Garment[]>([
    { id: crypto.randomUUID(), type: 'Shirt', quantity: 1, service: 'washing', price: 500 },
  ]);

  const getPrice = (type: GarmentType, service: ServiceType) => {
    return defaultPricing.find(p => p.garmentType === type && p.service === service)?.price || 0;
  };

  const updateGarment = (idx: number, field: keyof Garment, value: any) => {
    setGarments(prev => prev.map((g, i) => {
      if (i !== idx) return g;
      const updated = { ...g, [field]: value };
      if (field === 'type' || field === 'service') {
        updated.price = getPrice(
          field === 'type' ? value : g.type,
          field === 'service' ? value : g.service
        );
      }
      return updated;
    }));
  };

  const addGarment = () => {
    setGarments(prev => [...prev, { id: crypto.randomUUID(), type: 'Shirt', quantity: 1, service: 'washing', price: 500 }]);
  };

  const removeGarment = (idx: number) => {
    if (garments.length > 1) setGarments(prev => prev.filter((_, i) => i !== idx));
  };

  const totalCost = garments.reduce((sum, g) => sum + g.price * g.quantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const orderNum = `DC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`;
    addOrder({
      id: crypto.randomUUID(),
      orderNumber: orderNum,
      customerId: crypto.randomUUID(),
      customerName, customerPhone, customerAddress,
      garments, totalCost,
      status: 'received', paymentStatus: 'unpaid', amountPaid: 0,
      deliveryStatus: 'none', deliveryFee: 0,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    });
    navigate('/orders');
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Create New Order</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-4">
          <h2 className="text-sm font-semibold text-card-foreground">Customer Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={customerName} onChange={e => setCustomerName(e.target.value)} required placeholder="Customer name" />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} required placeholder="+234..." />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} placeholder="Customer address" />
          </div>
        </div>

        {/* Garments */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-card-foreground">Garments</h2>
            <button type="button" onClick={addGarment} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              <Plus className="h-3 w-3" /> Add Item
            </button>
          </div>

          {garments.map((g, idx) => (
            <div key={g.id} className="rounded-lg border border-border p-3 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Item {idx + 1}</span>
                {garments.length > 1 && (
                  <button type="button" onClick={() => removeGarment(idx)} className="text-destructive hover:text-destructive/80">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-4">
                <div>
                  <Label className="text-xs">Type</Label>
                  <select value={g.type} onChange={e => updateGarment(idx, 'type', e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground">
                    {garmentTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Service</Label>
                  <select value={g.service} onChange={e => updateGarment(idx, 'service', e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground">
                    {serviceTypes.map(s => <option key={s} value={s}>{s.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Qty</Label>
                  <Input type="number" min={1} value={g.quantity} onChange={e => updateGarment(idx, 'quantity', parseInt(e.target.value) || 1)} />
                </div>
                <div>
                  <Label className="text-xs">Price (₦)</Label>
                  <Input type="number" value={g.price} onChange={e => updateGarment(idx, 'price', parseInt(e.target.value) || 0)} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total & Submit */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-card-foreground">Total Cost</p>
            <p className="text-2xl font-bold text-primary">₦{totalCost.toLocaleString()}</p>
          </div>
          <button type="submit" className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
            Create Order
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default CreateOrder;
