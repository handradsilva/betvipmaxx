-- 1. Restrict referrals INSERT
DROP POLICY IF EXISTS "System can insert referrals" ON public.referrals;
CREATE POLICY "Users can insert referrals for themselves"
ON public.referrals
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = referred_user_id);

-- 2. Admin-only writes on user_roles
CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Lock down SECURITY DEFINER / internal functions
-- Trigger functions must never be callable from the API
REVOKE ALL ON FUNCTION public.handle_transaction_status_change() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_referral_on_profile() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.generate_referral_code() FROM PUBLIC, anon, authenticated;

-- Admin RPCs: signed-in only (they self-check admin role internally)
REVOKE ALL ON FUNCTION public.admin_get_all_profiles() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_get_all_transactions() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_get_all_referrals() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_update_balance(uuid, numeric) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_toggle_affiliate(uuid, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.admin_get_all_profiles() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_get_all_transactions() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_get_all_referrals() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_update_balance(uuid, numeric) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_toggle_affiliate(uuid, boolean) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;