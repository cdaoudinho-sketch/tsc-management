import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { obtenirUtilisateur } from "../services/auth";

type RoleRouteProps = {
  role: string;
  children: ReactNode;
};

export default function RoleRoute({
  role,
  children,
}: RoleRouteProps) {
  const user = obtenirUtilisateur();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}