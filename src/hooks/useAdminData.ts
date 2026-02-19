import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface AdminProfile {
  id: string;
  user_id: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  balance: number;
  pix_key: string | null;
  referral_code: string | null;
  referred_by: string | null;
  affiliate_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminTransaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  status: string;
  gateway_ref: string | null;
  brcode: string | null;
  qrcode_image: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminReferral {
  id: string;
  referrer_user_id: string;
  referred_user_id: string;
  status: string;
  commission_amount: number | null;
  created_at: string;
}

export const useAdminData = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [referrals, setReferrals] = useState<AdminReferral[]>([]);

  const checkAdmin = useCallback(async () => {
    if (!user) { setIsAdmin(false); setLoading(false); return; }
    const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    setIsAdmin(!!data);
    setLoading(false);
  }, [user]);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    const [p, t, r] = await Promise.all([
      supabase.rpc("admin_get_all_profiles"),
      supabase.rpc("admin_get_all_transactions"),
      supabase.rpc("admin_get_all_referrals"),
    ]);
    if (p.data) setProfiles(p.data as AdminProfile[]);
    if (t.data) setTransactions(t.data as AdminTransaction[]);
    if (r.data) setReferrals(r.data as AdminReferral[]);
  }, [user]);

  useEffect(() => { checkAdmin(); }, [checkAdmin]);
  useEffect(() => { if (isAdmin) fetchAll(); }, [isAdmin, fetchAll]);

  const updateBalance = async (targetUserId: string, newBalance: number) => {
    const { error } = await supabase.rpc("admin_update_balance", {
      _target_user_id: targetUserId,
      _new_balance: newBalance,
    });
    if (!error) await fetchAll();
    return { error };
  };

  const toggleAffiliate = async (targetUserId: string, approved: boolean) => {
    const { error } = await supabase.rpc("admin_toggle_affiliate", {
      _target_user_id: targetUserId,
      _approved: approved,
    });
    if (!error) await fetchAll();
    return { error };
  };

  return { isAdmin, loading, profiles, transactions, referrals, updateBalance, toggleAffiliate, refetch: fetchAll };
};
