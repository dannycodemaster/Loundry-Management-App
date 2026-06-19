DROP POLICY IF EXISTS "Anon can select orders" ON public.orders;
DROP POLICY IF EXISTS "Anon can select garments" ON public.garments;
REVOKE SELECT ON public.orders FROM anon;
REVOKE SELECT ON public.garments FROM anon;
REVOKE EXECUTE ON FUNCTION public.increment_customer_stats(uuid, numeric) FROM anon, PUBLIC;