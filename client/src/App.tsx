import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Inventory from "@/pages/inventory";
import Sales from "@/pages/sales";
import Clients from "@/pages/clients";
import Recovery from "@/pages/recovery";
import Predictions from "@/pages/predictions";
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";
import { useState } from "react";
import Home from "./pages/home";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/home" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/sales" component={Sales} />
      <Route path="/clients" component={Clients} />
      <Route path="/recovery" component={Recovery} />
      <Route path="/predictions" component={Predictions} />
      <Route component={NotFound} />
    </Switch>
  );}

function AppLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        isMobileOpen={isMobileSidebarOpen} 
        onMobileClose={() => setIsMobileSidebarOpen(false)} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileHeader onMenuClick={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <Router />
        </main>
      </div>
    </div>
  );}

function App() {
  const [location] = useLocation();

  // Show Home (login) without sidebar for "/" and "/home"
  if (location === "/" || location === "/home") {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Home />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // All other routes use AppLayout (with sidebar)
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppLayout />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
