import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index"; // Nový Dashboard
import Login from "./pages/Login"; // Přihlašovací stránka
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import { LogProvider } from "./contexts/LogContext";
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import ProtectedRoute from "./components/ProtectedRoute"; // Import ProtectedRoute
import Layout from "./components/Layout"; // Import Layout

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nextProvider i18n={i18n}>
      <LogProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route element={<ProtectedRoute />}> {/* Chráněné trasy */}
                  <Route element={<Layout />}> {/* Rozložení pro chráněné trasy */}
                    <Route path="/" element={<Index />} /> {/* Dashboard */}
                    {/* Zde přidejte další chráněné trasy pro váš systém */}
                    {/* Příklad: */}
                    {/* <Route path="/users" element={<UsersPage />} /> */}
                    {/* <Route path="/stores" element={<StoresPage />} /> */}
                    {/* <Route path="/racks" element={<RacksPage />} /> */}
                    {/* <Route path="/articles" element={<ArticlesPage />} /> */}
                    {/* <Route path="/settings" element={<SettingsPage />} /> */}
                  </Route>
                </Route>
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LogProvider>
    </I18nextProvider>
  </QueryClientProvider>
);

export default App;