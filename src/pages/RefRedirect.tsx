import { Navigate, useParams } from "react-router-dom";

/**
 * Handles /ref/:referralCode links: redirects to signup with the referral code
 * so the form can pre-fill it.
 */
export default function RefRedirect() {
  const { referralCode } = useParams<{ referralCode: string }>();
  if (!referralCode) {
    return <Navigate to="/signup" replace />;
  }
  return <Navigate to="/signup" state={{ referralCode }} replace />;
}
