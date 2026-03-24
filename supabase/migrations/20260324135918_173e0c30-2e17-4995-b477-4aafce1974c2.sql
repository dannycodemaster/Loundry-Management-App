
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT NOT NULL DEFAULT '',
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_spent NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Staff/admin can see all customers; customers can see their own record
CREATE POLICY "Authenticated users can view all customers" ON public.customers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert customers" ON public.customers
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update customers" ON public.customers
  FOR UPDATE TO authenticated USING (true);

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL DEFAULT '',
  total_cost NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'in-progress', 'ready', 'collected')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'partially-paid', 'unpaid')),
  payment_method TEXT CHECK (payment_method IN ('cash', 'bank-transfer', 'pos')),
  amount_paid NUMERIC NOT NULL DEFAULT 0,
  delivery_status TEXT NOT NULL DEFAULT 'none' CHECK (delivery_status IN ('pickup-requested', 'picked-up', 'out-for-delivery', 'delivered', 'none')),
  delivery_fee NUMERIC NOT NULL DEFAULT 0,
  pickup_address TEXT,
  delivery_address TEXT,
  assigned_rider TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all orders" ON public.orders
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert orders" ON public.orders
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update orders" ON public.orders
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete orders" ON public.orders
  FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Garments table
CREATE TABLE public.garments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  custom_type TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  service TEXT NOT NULL CHECK (service IN ('washing', 'ironing', 'dry-cleaning')),
  price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.garments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all garments" ON public.garments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert garments" ON public.garments
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update garments" ON public.garments
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete garments" ON public.garments
  FOR DELETE TO authenticated USING (true);

-- Pricing config table
CREATE TABLE public.pricing_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  garment_type TEXT NOT NULL,
  service TEXT NOT NULL CHECK (service IN ('washing', 'ironing', 'dry-cleaning')),
  price NUMERIC NOT NULL DEFAULT 0,
  UNIQUE (garment_type, service)
);

ALTER TABLE public.pricing_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pricing" ON public.pricing_config
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage pricing" ON public.pricing_config
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insert default pricing
INSERT INTO public.pricing_config (garment_type, service, price) VALUES
  ('T-shirt', 'washing', 500), ('T-shirt', 'ironing', 300), ('T-shirt', 'dry-cleaning', 1000),
  ('Shirt', 'washing', 500), ('Shirt', 'ironing', 300), ('Shirt', 'dry-cleaning', 1000),
  ('Trousers', 'washing', 600), ('Trousers', 'ironing', 400), ('Trousers', 'dry-cleaning', 1200),
  ('Gown', 'washing', 800), ('Gown', 'ironing', 500), ('Gown', 'dry-cleaning', 1500),
  ('Native (Up & Down)', 'washing', 1000), ('Native (Up & Down)', 'ironing', 600), ('Native (Up & Down)', 'dry-cleaning', 2000),
  ('Suit', 'washing', 1500), ('Suit', 'ironing', 800), ('Suit', 'dry-cleaning', 2500),
  ('Jacket', 'washing', 1200), ('Jacket', 'ironing', 600), ('Jacket', 'dry-cleaning', 2000),
  ('Others', 'washing', 500), ('Others', 'ironing', 300), ('Others', 'dry-cleaning', 1000);
