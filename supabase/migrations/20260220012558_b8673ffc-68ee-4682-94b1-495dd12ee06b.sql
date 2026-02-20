
CREATE OR REPLACE FUNCTION public.handle_transaction_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status = 'completed' AND OLD.status = 'pending' THEN
    IF NEW.type = 'deposit' THEN
      UPDATE public.profiles SET balance = balance + (NEW.amount * 10) WHERE user_id = NEW.user_id;
    ELSIF NEW.type = 'withdrawal' THEN
      UPDATE public.profiles SET balance = balance - NEW.amount WHERE user_id = NEW.user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;
