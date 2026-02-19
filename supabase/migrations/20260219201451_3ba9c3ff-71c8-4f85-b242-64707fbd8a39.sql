
-- Trigger: when a profile's referred_by is set, create a referral record
CREATE OR REPLACE FUNCTION public.handle_referral_on_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _referrer_user_id uuid;
BEGIN
  -- Only act when referred_by is newly set
  IF NEW.referred_by IS NOT NULL AND (OLD.referred_by IS NULL OR OLD.referred_by = '') THEN
    -- Find the referrer by their referral_code
    SELECT user_id INTO _referrer_user_id
    FROM public.profiles
    WHERE referral_code = NEW.referred_by;

    IF _referrer_user_id IS NOT NULL THEN
      -- Insert referral record (ignore if duplicate)
      INSERT INTO public.referrals (referrer_user_id, referred_user_id, status, commission_amount)
      VALUES (_referrer_user_id, NEW.user_id, 'pending', 5.00)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create the trigger on profiles update
DROP TRIGGER IF EXISTS on_profile_referred_by_set ON public.profiles;
CREATE TRIGGER on_profile_referred_by_set
  AFTER UPDATE OF referred_by ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_referral_on_profile();

-- Also handle case where referred_by is set on INSERT (e.g. via signUp flow)
DROP TRIGGER IF EXISTS on_profile_insert_referred ON public.profiles;
CREATE TRIGGER on_profile_insert_referred
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  WHEN (NEW.referred_by IS NOT NULL AND NEW.referred_by != '')
  EXECUTE FUNCTION public.handle_referral_on_profile();
