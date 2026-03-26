import { Order, Customer, PricingConfig } from '@/types';

export const mockCustomers: Customer[] = [
  { id: 'c1', name: 'Adebayo Johnson', phone: '+2348012345678', address: '12 Admiralty Way, Lekki', totalOrders: 8, totalSpent: 45000, createdAt: '2025-01-15' },
  { id: 'c2', name: 'Chioma Okafor', phone: '+2348098765432', address: '5 Allen Avenue, Ikeja', totalOrders: 15, totalSpent: 92000, createdAt: '2024-11-20' },
  { id: 'c3', name: 'Emeka Nwankwo', phone: '+2348055512345', address: '22 Oba Akran, Ikeja', totalOrders: 3, totalSpent: 18500, createdAt: '2025-02-10' },
  { id: 'c4', name: 'Fatima Bello', phone: '+2348033344455', address: '8 Ahmadu Bello Way, VI', totalOrders: 22, totalSpent: 156000, createdAt: '2024-08-05' },
  { id: 'c5', name: 'Grace Adekunle', phone: '+2348077788899', address: '15 Ogunlana Drive, Surulere', totalOrders: 6, totalSpent: 32000, createdAt: '2025-01-28' },
];

export const mockOrders: Order[] = [
  {
    id: 'o1', orderNumber: 'DC-2025-001', customerId: 'c1', customerName: 'Adebayo Johnson',
    customerPhone: '+2348012345678', customerAddress: '12 Admiralty Way, Lekki',
    garments: [
      { id: 'g1', type: 'Suit', quantity: 2, service: 'washing-ironing', price: 5000 },
      { id: 'g2', type: 'Shirt', quantity: 5, service: 'washing-ironing', price: 500 },
    ],
    totalCost: 12500, status: 'in-progress', paymentStatus: 'partially-paid', paymentMethod: 'bank-transfer',
    amountPaid: 8000, deliveryStatus: 'none', deliveryFee: 0, createdAt: '2025-03-20T10:30:00', updatedAt: '2025-03-21T14:00:00',
  },
  {
    id: 'o2', orderNumber: 'DC-2025-002', customerId: 'c2', customerName: 'Chioma Okafor',
    customerPhone: '+2348098765432', customerAddress: '5 Allen Avenue, Ikeja',
    garments: [
      { id: 'g3', type: 'Gown', quantity: 3, service: 'washing-ironing', price: 4000 },
      { id: 'g4', type: 'Native (Up & Down)', quantity: 2, service: 'ironing', price: 1500 },
    ],
    totalCost: 15000, status: 'ready', paymentStatus: 'paid', paymentMethod: 'pos',
    amountPaid: 15000, deliveryStatus: 'pickup-requested', deliveryFee: 1500,
    deliveryAddress: '5 Allen Avenue, Ikeja', createdAt: '2025-03-19T09:00:00', updatedAt: '2025-03-22T11:00:00',
  },
  {
    id: 'o3', orderNumber: 'DC-2025-003', customerId: 'c3', customerName: 'Emeka Nwankwo',
    customerPhone: '+2348055512345', customerAddress: '22 Oba Akran, Ikeja',
    garments: [
      { id: 'g5', type: 'Trousers', quantity: 4, service: 'washing-ironing', price: 800 },
      { id: 'g6', type: 'T-shirt', quantity: 6, service: 'washing-ironing', price: 400 },
    ],
    totalCost: 5600, status: 'received', paymentStatus: 'unpaid',
    amountPaid: 0, deliveryStatus: 'none', deliveryFee: 0, createdAt: '2025-03-23T08:15:00', updatedAt: '2025-03-23T08:15:00',
  },
  {
    id: 'o4', orderNumber: 'DC-2025-004', customerId: 'c4', customerName: 'Fatima Bello',
    customerPhone: '+2348033344455', customerAddress: '8 Ahmadu Bello Way, VI',
    garments: [
      { id: 'g7', type: 'Jacket', quantity: 1, service: 'washing-ironing', price: 6000 },
    ],
    totalCost: 6000, status: 'collected', paymentStatus: 'paid', paymentMethod: 'cash',
    amountPaid: 6000, deliveryStatus: 'delivered', deliveryFee: 2000,
    deliveryAddress: '8 Ahmadu Bello Way, VI', createdAt: '2025-03-18T16:00:00', updatedAt: '2025-03-22T09:30:00',
  },
  {
    id: 'o5', orderNumber: 'DC-2025-005', customerId: 'c5', customerName: 'Grace Adekunle',
    customerPhone: '+2348077788899', customerAddress: '15 Ogunlana Drive, Surulere',
    garments: [
      { id: 'g8', type: 'Shirt', quantity: 3, service: 'ironing', price: 300 },
      { id: 'g9', type: 'Trousers', quantity: 2, service: 'ironing', price: 500 },
      { id: 'g10', type: 'Gown', quantity: 1, service: 'washing-ironing', price: 4000 },
    ],
    totalCost: 5900, status: 'in-progress', paymentStatus: 'paid', paymentMethod: 'bank-transfer',
    amountPaid: 5900, deliveryStatus: 'none', deliveryFee: 0, createdAt: '2025-03-21T13:45:00', updatedAt: '2025-03-23T10:00:00',
  },
];

export const defaultPricing: PricingConfig[] = [
  { garmentType: 'T-shirt', service: 'washing-ironing', price: 400 },
  { garmentType: 'T-shirt', service: 'ironing', price: 200 },
  { garmentType: 'Shirt', service: 'washing-ironing', price: 500 },
  { garmentType: 'Shirt', service: 'ironing', price: 300 },
  { garmentType: 'Trousers', service: 'washing-ironing', price: 800 },
  { garmentType: 'Trousers', service: 'ironing', price: 500 },
  { garmentType: 'Gown', service: 'washing-ironing', price: 2000 },
  { garmentType: 'Gown', service: 'ironing', price: 1000 },
  { garmentType: 'Native (Up & Down)', service: 'washing-ironing', price: 1500 },
  { garmentType: 'Native (Up & Down)', service: 'ironing', price: 800 },
  { garmentType: 'Suit', service: 'washing-ironing', price: 3000 },
  { garmentType: 'Suit', service: 'ironing', price: 1500 },
  { garmentType: 'Jacket', service: 'washing-ironing', price: 2500 },
  { garmentType: 'Jacket', service: 'ironing', price: 1200 },
  { garmentType: 'Others', service: 'washing-ironing', price: 1000 },
  { garmentType: 'Others', service: 'ironing', price: 500 },
];
