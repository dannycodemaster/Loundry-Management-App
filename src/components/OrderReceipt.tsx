import { useRef, useState } from 'react';
import { Order } from '@/types';
import { X, Printer, Download, FileImage } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface OrderReceiptProps {
  order: Order;
  onClose: () => void;
}

const OrderReceipt = ({ order, onClose }: OrderReceiptProps) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const totalItems = order.garments.reduce((sum, g) => sum + g.quantity, 0);
  const grandTotal = order.totalCost + order.deliveryFee;
  const balance = grandTotal - order.amountPaid;
  const [downloading, setDownloading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const captureReceipt = async () => {
    if (!receiptRef.current) return null;
    return html2canvas(receiptRef.current, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
    });
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const canvas = await captureReceipt();
      if (!canvas) return;
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
      pdf.save(`Receipt-${order.orderNumber}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadImage = async () => {
    setDownloading(true);
    try {
      const canvas = await captureReceipt();
      if (!canvas) return;
      const link = document.createElement('a');
      link.download = `Receipt-${order.orderNumber}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm bg-card rounded-xl border border-border shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border print:hidden">
          <h3 className="font-semibold text-card-foreground">Receipt</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4" id="receipt-content" ref={receiptRef} style={{ background: '#ffffff', color: '#000000' }}>
          <div className="text-center">
            <h2 className="text-lg font-bold" style={{ color: '#111' }}>✨ FreshPress</h2>
            <p className="text-xs" style={{ color: '#666' }}>Dry Cleaning Management System</p>
          </div>

          <div style={{ borderTop: '1px dashed #ddd', paddingTop: '12px' }} className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span style={{ color: '#888' }}>Order #</span>
              <span className="font-medium" style={{ color: '#111' }}>{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: '#888' }}>Date</span>
              <span className="font-medium" style={{ color: '#111' }}>{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: '#888' }}>Customer</span>
              <span className="font-medium" style={{ color: '#111' }}>{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: '#888' }}>Phone</span>
              <span className="font-medium" style={{ color: '#111' }}>{order.customerPhone}</span>
            </div>
          </div>

          <div style={{ borderTop: '1px dashed #ddd', paddingTop: '12px' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: '#888' }}>ITEMS</p>
            <div className="space-y-1.5">
              {order.garments.map(g => (
                <div key={g.id} className="flex justify-between text-sm">
                  <span style={{ color: '#111' }}>{g.type}{g.customType ? ` (${g.customType})` : ''} × {g.quantity}</span>
                  <span className="font-medium" style={{ color: '#111' }}>₦{(g.price * g.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px dashed #ddd', paddingTop: '12px' }} className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span style={{ color: '#888' }}>Total Items</span>
              <span className="font-medium" style={{ color: '#111' }}>{totalItems}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between">
                <span style={{ color: '#888' }}>Delivery Fee</span>
                <span className="font-medium" style={{ color: '#111' }}>₦{order.deliveryFee.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold">
              <span style={{ color: '#111' }}>Total Amount</span>
              <span style={{ color: '#2563eb' }}>₦{grandTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: '#888' }}>Amount Paid</span>
              <span className="font-medium" style={{ color: '#16a34a' }}>₦{order.amountPaid.toLocaleString()}</span>
            </div>
            {balance > 0 && (
              <div className="flex justify-between">
                <span style={{ color: '#888' }}>Balance</span>
                <span className="font-bold" style={{ color: '#dc2626' }}>₦{balance.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span style={{ color: '#888' }}>Payment Status</span>
              <span className="font-medium capitalize" style={{ color: order.paymentStatus === 'paid' ? '#16a34a' : order.paymentStatus === 'partially-paid' ? '#f59e0b' : '#dc2626' }}>
                {order.paymentStatus.replace('-', ' ')}
              </span>
            </div>
          </div>

          <div style={{ borderTop: '1px dashed #ddd', paddingTop: '12px' }} className="text-center">
            <p className="text-xs" style={{ color: '#888' }}>Thank you for choosing FreshPress!</p>
          </div>
        </div>

        <div className="p-4 border-t border-border print:hidden flex flex-col gap-2">
          <div className="flex gap-2">
            <button onClick={handlePrint} className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              <Printer className="h-4 w-4" /> Print
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={handleDownloadPDF} disabled={downloading} className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-primary bg-primary/5 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors disabled:opacity-50">
              <Download className="h-4 w-4" /> PDF
            </button>
            <button onClick={handleDownloadImage} disabled={downloading} className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-primary bg-primary/5 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors disabled:opacity-50">
              <FileImage className="h-4 w-4" /> JPEG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderReceipt;
