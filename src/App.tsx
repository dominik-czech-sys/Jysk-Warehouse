import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ManageArticles from "./pages/ManageArticles";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import CteckaCarkoduPage from "./pages/CteckaCarkoduPage";
import { AuthProvider, AuthContext } from "./contexts/AuthContext";
import { LogProvider } from "./contexts/LogContext"; // Import LogProvider
import { useContext } from "react";

const queryClient = new QueryClient();

// PrivateRoute component to protect routes
const PrivateRoute: React.FC<{ children: JSX.Element; adminOnly?: boolean }> = ({
  children,
  adminOnly = false,
}) => {
  const auth = useContext(AuthContext);
  if (!auth) return <Navigate to="/prihlaseni" replace />; // Should not happen if wrapped in AuthProvider

  if (!auth.isAuthenticated) {
    return <Navigate to="/prihlaseni" replace />;
  }

  if (adminOnly && !auth.isAdmin) {
    return <Navigate to="/" replace />; // Redirect non-admins from admin-only routes
  }

  return children;
};

const AppContent = () => {
  return (
    <Routes>
      <Route path="/prihlaseni" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Index />
          </PrivateRoute>
        }
      />
      <Route
        path="/spravovat-clanky"
        element={
          <PrivateRoute>
            <ManageArticles />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/uzivatele"
        element={
          <PrivateRoute adminOnly>
            <AdminDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/skenovat-carkod"
        element={
          <PrivateRoute>
            <CteckaCarkoduPage />
          </PrivateRoute>
        }
      />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LogProvider> {/* LogProvider nyní obaluje AuthProvider */}
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </LogProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;