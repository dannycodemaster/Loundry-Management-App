
-- Allow anonymous users to read customers by email+phone (for customer portal login)
CREATE POLICY "Anon can select customers by email and phone"
ON public.customers
FOR SELECT
TO anon
USING (true);

-- Allow anonymous users to read orders (customer portal)
CREATE POLICY "Anon can select orders"
ON public.orders
FOR SELECT
TO anon
USING (true);

-- Allow anonymous users to read garments (customer portal)
CREATE POLICY "Anon can select garments"
ON public.garments
FOR SELECT
TO anon
USING (true);
