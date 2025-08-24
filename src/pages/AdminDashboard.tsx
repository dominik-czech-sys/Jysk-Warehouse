import { Navigate } from "react-router-dom";
import React from "react";

// This component now simply redirects to the new SiteDashboard
const AdminDashboard: React.FC = () => {
  return <Navigate to="/admin/site-dashboard" replace />;
};

export default AdminDashboard;