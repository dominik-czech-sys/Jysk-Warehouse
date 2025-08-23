import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ManageArticles from "./pages/ManageArticles";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard"; // Old AdminDashboard, now redirects
import SiteDashboard from "./pages/SiteDashboard"; // New SiteDashboard
import CteckaCarkoduPage from "./pages/CteckaCarkoduPage";
import MassAddArticlesPage from "./pages/MassAddArticlesPage";
import ManageShelfRacksPage from "./pages/ManageShelfRacksPage";
import ExportDataPage from "./pages/ExportDataPage"; // Import ExportDataPage
import { AuthProvider, AuthContext } from "./contexts/AuthContext";
import { LogProvider } from "./contexts/LogContext";
import { useContext } from "react";
import { Permission } from "./data/users"; // Import Permission type
import { ThemeProvider } from "./contexts/ThemeContext"; // Import ThemeProvider
import { I18nextProvider } from "react-i18next"; // Import I18nextProvider
import i18n from "./i18n"; // Import i18n instance

const queryClient = new QueryClient();

// PrivateRoute component to protect routes based on permissions
const PrivateRoute: React.FC<{ children: JSX.Element; requiredPermission?: Permission }> = ({
  children,
  requiredPermission,
}) => {
  const auth = useContext(AuthContext);
  if (!auth) return <Navigate to="/prihlaseni" replace />;

  if (!auth.isAuthenticated) {
    return <Navigate to="/prihlaseni" replace />;
  }

  if (requiredPermission && !auth.hasPermission(requiredPermission)) {
    // Redirect to home or show an unauthorized message
    return <Navigate to="/" replace />;
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
        path="/spravovat-artikly"
        element={
          <PrivateRoute requiredPermission="article:view">
            <ManageArticles />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/uzivatele" // This route now redirects to SiteDashboard
        element={
          <PrivateRoute requiredPermission="user:view">
            <AdminDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/site-dashboard" // New route for the comprehensive admin dashboard
        element={
          <PrivateRoute requiredPermission="store:view">
            <SiteDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/regaly"
        element={
          <PrivateRoute requiredPermission="rack:view">
            <ManageShelfRacksPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/skenovat-carkod"
        element={
          <PrivateRoute requiredPermission="article:scan">
            <CteckaCarkoduPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/mass-add-artikly"
        element={
          <PrivateRoute requiredPermission="article:mass_add">
            <MassAddArticlesPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/export-dat" // New route for data export
        element={
          <PrivateRoute requiredPermission="log:view"> {/* Export is typically an admin/manager function */}
            <ExportDataPage />
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
        <LogProvider>
          <AuthProvider>
            <ThemeProvider>
              <I18nextProvider i18n={i18n}> {/* Wrap AppContent with I18nextProvider */}
                <AppContent />
              </I18nextProvider>
            </ThemeProvider>
          </AuthProvider>
        </LogProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;