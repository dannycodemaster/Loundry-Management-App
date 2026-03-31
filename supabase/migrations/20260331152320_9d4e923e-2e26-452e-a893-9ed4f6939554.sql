
CREATE OR REPLACE FUNCTION public.increment_customer_stats(p_customer_id uuid, p_order_cost numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.customers
  SET total_orders = total_orders + 1,
      total_spent = total_spent + p_order_cost
  WHERE id = p_customer_id;
END;
$$;
