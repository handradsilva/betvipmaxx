import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import ReferralRedirect from "./pages/ReferralRedirect";
import Auth from "./pages/Auth";
import Deposit from "./pages/Deposit";
import Withdraw from "./pages/Withdraw";
import Wallet from "./pages/Wallet";
import MyAccount from "./pages/MyAccount";
import Affiliate from "./pages/Affiliate";
import NotFound from "./pages/NotFound";
import Sports from "./pages/Sports";
import Admin from "./pages/Admin";
import GameDetail from "./pages/GameDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ReferralRedirect />} />
            <Route path="/game/:id" element={<GameDetail />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/withdraw" element={<Withdraw />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/my-account" element={<MyAccount />} />
            <Route path="/affiliate" element={<Affiliate />} />
            <Route path="/sports" element={<Sports />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
