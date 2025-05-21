import { Navigate, Outlet, useLocation } from "react-router";

import { useUser } from "@/client/services/user";

export const AuthGuard = () => {
  const location = useLocation();
  const redirectTo = location.pathname + location.search;

  const { user, loading } = useUser();

  if (loading) return null;

  // Allow access even if not logged in
  return <Outlet />;
};