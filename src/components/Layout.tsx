import React from "react";
import Sidebar from "@/components/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Outlet } from "react-router-dom"; // Import Outlet

// Rozhraní LayoutProps již nepotřebuje children, protože se používá Outlet
interface LayoutProps {}

const Layout: React.FC<LayoutProps> = () => {
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {isMobile ? (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar />
          </SheetContent>
        </Sheet>
      ) : (
        <Sidebar />
      )}
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <Outlet /> {/* Zde se vykreslí vnořené trasy */}
      </main>
    </div>
  );
};

export default Layout;