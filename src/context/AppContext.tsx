import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Order, Customer } from '@/types';
import { mockOrders, mockCustomers } from '@/data/mockData';

interface AppContextType {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updatePaymentStatus: (orderId: string, paymentStatus: Order['paymentStatus'], amountPaid: number, method?: Order['paymentMethod']) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);

  const addOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o));
  };

  const updatePaymentStatus = (orderId: string, paymentStatus: Order['paymentStatus'], amountPaid: number, method?: Order['paymentMethod']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus, amountPaid, paymentMethod: method || o.paymentMethod, updatedAt: new Date().toISOString() } : o));
  };

  return (
    <AppContext.Provider value={{ orders, setOrders, customers, setCustomers, addOrder, updateOrderStatus, updatePaymentStatus }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
