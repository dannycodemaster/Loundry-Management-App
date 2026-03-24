import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, Customer, Garment } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface AppContextType {
  orders: Order[];
  customers: Customer[];
  loading: boolean;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string | null>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  updatePaymentStatus: (orderId: string, paymentStatus: Order['paymentStatus'], amountPaid: number, method?: Order['paymentMethod']) => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshCustomers: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Map DB row to frontend Order type
const mapOrder = (row: any, garments: Garment[]): Order => ({
  id: row.id,
  orderNumber: row.order_number,
  customerId: row.customer_id,
  customerName: row.customer_name,
  customerPhone: row.customer_phone,
  customerAddress: row.customer_address,
  garments,
  totalCost: Number(row.total_cost),
  status: row.status as Order['status'],
  paymentStatus: row.payment_status as Order['paymentStatus'],
  paymentMethod: row.payment_method as Order['paymentMethod'],
  amountPaid: Number(row.amount_paid),
  deliveryStatus: row.delivery_status as Order['deliveryStatus'],
  deliveryFee: Number(row.delivery_fee),
  pickupAddress: row.pickup_address,
  deliveryAddress: row.delivery_address,
  assignedRider: row.assigned_rider,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapGarment = (row: any): Garment => ({
  id: row.id,
  type: row.type as Garment['type'],
  customType: row.custom_type,
  quantity: row.quantity,
  service: row.service as Garment['service'],
  price: Number(row.price),
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { session } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshOrders = async () => {
    const { data: orderRows } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (!orderRows) { setOrders([]); return; }

    const { data: garmentRows } = await supabase.from('garments').select('*');
    const garmentsByOrder: Record<string, Garment[]> = {};
    (garmentRows || []).forEach(g => {
      const mapped = mapGarment(g);
      if (!garmentsByOrder[g.order_id]) garmentsByOrder[g.order_id] = [];
      garmentsByOrder[g.order_id].push(mapped);
    });

    setOrders(orderRows.map(o => mapOrder(o, garmentsByOrder[o.id] || [])));
  };

  const refreshCustomers = async () => {
    const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
    if (data) {
      setCustomers(data.map(c => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email || undefined,
        address: c.address,
        totalOrders: c.total_orders,
        totalSpent: Number(c.total_spent),
        createdAt: c.created_at,
      })));
    }
  };

  useEffect(() => {
    if (session) {
      setLoading(true);
      Promise.all([refreshOrders(), refreshCustomers()]).finally(() => setLoading(false));
    }
  }, [session]);

  const addOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> => {
    // Find or create customer
    let customerId = order.customerId;
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', order.customerPhone)
      .maybeSingle();

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const { data: newCustomer } = await supabase
        .from('customers')
        .insert({ name: order.customerName, phone: order.customerPhone, address: order.customerAddress })
        .select('id')
        .single();
      if (newCustomer) customerId = newCustomer.id;
    }

    const { data: newOrder, error } = await supabase.from('orders').insert({
      order_number: order.orderNumber,
      customer_id: customerId,
      customer_name: order.customerName,
      customer_phone: order.customerPhone,
      customer_address: order.customerAddress,
      total_cost: order.totalCost,
      status: order.status,
      payment_status: order.paymentStatus,
      amount_paid: order.amountPaid,
      delivery_status: order.deliveryStatus,
      delivery_fee: order.deliveryFee,
    }).select('id').single();

    if (error || !newOrder) return null;

    // Insert garments
    const garmentInserts = order.garments.map(g => ({
      order_id: newOrder.id,
      type: g.type,
      custom_type: g.customType,
      quantity: g.quantity,
      service: g.service,
      price: g.price,
    }));
    await supabase.from('garments').insert(garmentInserts);

    // Update customer stats
    await supabase.from('customers').update({
      total_orders: (existingCustomer ? 1 : 1), // Will be incremented properly via refresh
      total_spent: order.totalCost,
    }).eq('id', customerId);

    await refreshOrders();
    await refreshCustomers();
    return newOrder.id;
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    await supabase.from('orders').update({ status }).eq('id', orderId);
    await refreshOrders();
  };

  const updatePaymentStatus = async (orderId: string, paymentStatus: Order['paymentStatus'], amountPaid: number, method?: Order['paymentMethod']) => {
    const update: any = { payment_status: paymentStatus, amount_paid: amountPaid };
    if (method) update.payment_method = method;
    await supabase.from('orders').update(update).eq('id', orderId);
    await refreshOrders();
  };

  return (
    <AppContext.Provider value={{ orders, customers, loading, addOrder, updateOrderStatus, updatePaymentStatus, refreshOrders, refreshCustomers }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
