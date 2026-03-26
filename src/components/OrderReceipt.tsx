import { Order } from '@/types';
import { X, Printer } from 'lucide-react';

interface OrderReceiptProps {
  order: Order;
  onClose: () => void;
}

const OrderReceipt = ({ order, onClose }: OrderReceiptProps) => {
  const totalItems = order.garments.reduce((sum, g) => sum + g.quantity, 0);
  const grandTotal = order.totalCost + order.deliveryFee;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm bg-card rounded-xl border border-border shadow-lg">
        <div className="flex items-center justify-between p-4 border-b border-border print:hidden">
          <h3 className="font-semibold text-card-foreground">Receipt</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4" id="receipt-content">
          <div className="text-center">
            <h2 className="text-lg font-bold text-foreground">✨ FreshPress</h2>
            <p className="text-xs text-muted-foreground">Dry Cleaning Management System</p>
          </div>

          <div className="border-t border-dashed border-border pt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order #</span>
              <span className="font-medium text-card-foreground">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium text-card-foreground">{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer</span>
              <span className="font-medium text-card-foreground">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-medium text-card-foreground">{order.customerPhone}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-border pt-3">
            <p className="text-xs font-semibold text-muted-foreground mb-2">ITEMS</p>
            <div className="space-y-1.5">
              {order.garments.map(g => (
                <div key={g.id} className="flex justify-between text-sm">
                  <span className="text-card-foreground">{g.type}{g.customType ? ` (${g.customType})` : ''} × {g.quantity}</span>
                  <span className="font-medium text-card-foreground">₦{(g.price * g.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-dashed border-border pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Items</span>
              <span className="font-medium text-card-foreground">{totalItems}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="font-medium text-card-foreground">₦{order.deliveryFee.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold">
              <span className="text-card-foreground">Total Amount</span>
              <span className="text-primary">₦{grandTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount Paid</span>
              <span className="font-medium text-card-foreground">₦{order.amountPaid.toLocaleString()}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-border pt-3 text-center">
            <p className="text-xs text-muted-foreground">Thank you for choosing FreshPress!</p>
          </div>
        </div>

        <div className="p-4 border-t border-border print:hidden">
          <button onClick={handlePrint} className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            <Printer className="h-4 w-4" /> Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderReceipt;
