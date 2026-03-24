export type GarmentType = 'T-shirt' | 'Shirt' | 'Trousers' | 'Gown' | 'Native (Up & Down)' | 'Suit' | 'Jacket' | 'Others';
export type ServiceType = 'washing' | 'ironing' | 'dry-cleaning';
export type OrderStatus = 'received' | 'in-progress' | 'ready' | 'collected';
export type PaymentStatus = 'paid' | 'partially-paid' | 'unpaid';
export type PaymentMethod = 'cash' | 'bank-transfer' | 'pos';
export type DeliveryStatus = 'pickup-requested' | 'picked-up' | 'out-for-delivery' | 'delivered' | 'none';

export interface Garment {
  id: string;
  type: GarmentType;
  customType?: string;
  quantity: number;
  service: ServiceType;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  garments: Garment[];
  totalCost: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  amountPaid: number;
  deliveryStatus: DeliveryStatus;
  deliveryFee: number;
  pickupAddress?: string;
  deliveryAddress?: string;
  assignedRider?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
}

export interface PricingConfig {
  garmentType: GarmentType;
  service: ServiceType;
  price: number;
}
