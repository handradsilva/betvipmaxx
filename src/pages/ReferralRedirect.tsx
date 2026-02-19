import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Index from "./Index";

const ReferralRedirect = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const ref = searchParams.get("ref");

  useEffect(() => {
    if (ref) {
      navigate(`/auth?mode=register&ref=${ref}`, { replace: true });
    }
  }, [ref, navigate]);

  if (ref) return null;

  return <Index />;
};

export default ReferralRedirect;
