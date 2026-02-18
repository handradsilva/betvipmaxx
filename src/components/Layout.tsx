import { useState } from "react";
import Header from "./Header";
import AppSidebar from "./AppSidebar";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      <div className="flex flex-1 w-full min-w-0">
        <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main
          className={`flex-1 min-w-0 transition-all duration-300 ${
            sidebarOpen ? "md:ml-60" : "ml-0"
          }`}
        >
          <div className="w-full max-w-6xl mx-auto px-2 sm:px-3 md:px-6 py-3 md:py-4">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default Layout;
