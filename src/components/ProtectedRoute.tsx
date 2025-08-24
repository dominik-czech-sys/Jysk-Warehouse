import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth"; // Předpokládáme, že useAuth je hook pro AuthContext

interface ProtectedRouteProps {
  allowedRoles?: string[]; // Volitelné, pokud chcete omezit přístup na základě rolí
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-lg text-gray-700 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Pokud uživatel nemá povolenou roli, přesměrujte ho na nepovolenou stránku nebo dashboard
    return <Navigate to="/" replace />; // Nebo na /unauthorized
  }

  return <Outlet />;
};

export default ProtectedRoute;