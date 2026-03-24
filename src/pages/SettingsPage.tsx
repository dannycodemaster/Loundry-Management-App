import AdminLayout from '@/components/AdminLayout';
import { defaultPricing } from '@/data/mockData';
import { GarmentType } from '@/types';

const garmentTypes: GarmentType[] = ['T-shirt', 'Shirt', 'Trousers', 'Gown', 'Native (Up & Down)', 'Suit', 'Jacket', 'Others'];

const SettingsPage = () => {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Settings</h1>

      <div className="rounded-lg border border-border bg-card p-4 mb-6">
        <h2 className="text-sm font-semibold text-card-foreground mb-4">Pricing Configuration</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-muted-foreground font-medium">Garment</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Washing</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Ironing</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Dry Clean</th>
              </tr>
            </thead>
            <tbody>
              {garmentTypes.map(type => {
                const prices = {
                  washing: defaultPricing.find(p => p.garmentType === type && p.service === 'washing')?.price || 0,
                  ironing: defaultPricing.find(p => p.garmentType === type && p.service === 'ironing')?.price || 0,
                  'dry-cleaning': defaultPricing.find(p => p.garmentType === type && p.service === 'dry-cleaning')?.price || 0,
                };
                return (
                  <tr key={type} className="border-b border-border last:border-0">
                    <td className="py-2.5 font-medium text-card-foreground">{type}</td>
                    <td className="py-2.5 text-right text-muted-foreground">₦{prices.washing.toLocaleString()}</td>
                    <td className="py-2.5 text-right text-muted-foreground">₦{prices.ironing.toLocaleString()}</td>
                    <td className="py-2.5 text-right text-muted-foreground">₦{prices['dry-cleaning'].toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-card-foreground mb-2">Business Info</h2>
        <p className="text-sm text-muted-foreground">FreshPress Dry Cleaners</p>
        <p className="text-xs text-muted-foreground mt-1">Configure your business details, branches, and staff access after connecting to Lovable Cloud.</p>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;
