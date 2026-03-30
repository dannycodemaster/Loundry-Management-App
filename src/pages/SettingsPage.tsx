import AdminLayout from '@/components/AdminLayout';
import { GarmentType } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

const garmentTypes: GarmentType[] = ['T-shirt', 'Shirt', 'Trousers', 'Gown', 'Native (Up & Down)', 'Suit', 'Jacket', 'Curtains', 'Duvet', 'Bedsheet', 'Pillow Case', 'Shorts', 'Head-tied', 'Hijab', 'Jalabiya (Men)', 'Jalabiya (Women)', 'Children Clothes', 'Others'];

interface PricingRow {
  id?: string;
  garment_type: string;
  service: string;
  price: number;
}

const SettingsPage = () => {
  const [pricing, setPricing] = useState<PricingRow[]>([]);
  const [editing, setEditing] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('pricing_config').select('*').then(({ data }) => {
      if (data) setPricing(data);
    });
  }, []);

  const getKey = (type: string, service: string) => `${type}__${service}`;

  const getPrice = (type: string, service: string) => {
    const key = getKey(type, service);
    if (key in editing) return editing[key];
    return pricing.find(p => p.garment_type === type && p.service === service)?.price ?? 0;
  };

  const handlePriceChange = (type: string, service: string, value: number) => {
    setEditing(prev => ({ ...prev, [getKey(type, service)]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const services = ['washing-ironing', 'ironing'];
    const upserts: PricingRow[] = [];

    for (const type of garmentTypes) {
      for (const service of services) {
        const key = getKey(type, service);
        if (key in editing) {
          const existing = pricing.find(p => p.garment_type === type && p.service === service);
          if (existing?.id) {
            upserts.push({ id: existing.id, garment_type: type, service, price: editing[key] });
          } else {
            upserts.push({ garment_type: type, service, price: editing[key] });
          }
        }
      }
    }

    if (upserts.length === 0) {
      toast.info('No changes to save');
      setSaving(false);
      return;
    }

    const { error } = await supabase.from('pricing_config').upsert(upserts, { onConflict: 'id' });
    if (error) {
      toast.error('Failed to save pricing');
    } else {
      toast.success('Pricing updated successfully');
      setEditing({});
      const { data } = await supabase.from('pricing_config').select('*');
      if (data) setPricing(data);
    }
    setSaving(false);
  };

  const hasChanges = Object.keys(editing).length > 0;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Settings</h1>

      <div className="rounded-lg border border-border bg-card p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-card-foreground">Pricing Configuration</h2>
          {hasChanges && (
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
              <Save className="h-3.5 w-3.5" /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-muted-foreground font-medium">Garment</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Washing, Drying & Ironing</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Ironing</th>
              </tr>
            </thead>
            <tbody>
              {garmentTypes.map(type => (
                <tr key={type} className="border-b border-border last:border-0">
                  <td className="py-2.5 font-medium text-card-foreground">{type}</td>
                  <td className="py-2.5 text-right">
                    <Input
                      type="number"
                      min={0}
                      value={getPrice(type, 'washing-ironing')}
                      onChange={e => handlePriceChange(type, 'washing-ironing', parseInt(e.target.value) || 0)}
                      className="w-28 ml-auto text-right h-8 text-sm"
                    />
                  </td>
                  <td className="py-2.5 text-right">
                    <Input
                      type="number"
                      min={0}
                      value={getPrice(type, 'ironing')}
                      onChange={e => handlePriceChange(type, 'ironing', parseInt(e.target.value) || 0)}
                      className="w-28 ml-auto text-right h-8 text-sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-card-foreground mb-2">Business Info</h2>
        <p className="text-sm text-muted-foreground">FreshPress Dry Cleaners</p>
        <p className="text-xs text-muted-foreground mt-1">Powered by Lovable Cloud</p>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;
