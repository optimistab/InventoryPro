import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users, 
  Recycle, 
  TrendingUp, 
  FileText,
  Laptop,
  User,
  X,
  LogOut
} from "lucide-react";

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Sales", href: "/sales", icon: ShoppingCart },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Recovery", href: "/recovery", icon: Recycle },
  { name: "Predictions", href: "/predictions", icon: TrendingUp },
  { name: "Reports", href: "/reports", icon: FileText },
];

export default function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const [location] = useLocation();

  const handleLogout = async () => {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/";
  };

  const SidebarContent = () => (
    <>
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Laptop className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">LaptopTracker</h1>
            <p className="text-gray-400 text-sm">Pro</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6 flex-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));
          
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center px-6 py-3 text-gray-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer",
                  isActive && "bg-primary/10 border-r-2 border-primary text-primary"
                )}
                onClick={onMobileClose}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-6">
        <div className="bg-slate-800 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <User className="text-sm text-white" />
            </div>
            <div>
              <p className="font-medium text-sm text-white">John Manager</p>
              <p className="text-gray-400 text-xs">Administrator</p>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-2 text-gray-300 hover:bg-slate-800 hover:text-white transition-colors rounded-lg"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex-shrink-0 hidden lg:flex lg:flex-col">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50" 
            onClick={onMobileClose}
          />
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 text-white flex flex-col">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <Laptop className="text-white text-lg" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">LaptopTracker</h1>
                    <p className="text-gray-400 text-sm">Pro</p>
                  </div>
                </div>
                <button 
                  onClick={onMobileClose}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <nav className="mt-6 flex-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));
                
                return (
                  <Link key={item.name} href={item.href}>
                    <div
                      className={cn(
                        "flex items-center px-6 py-3 text-gray-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer",
                        isActive && "bg-primary/10 border-r-2 border-primary text-primary"
                      )}
                      onClick={onMobileClose}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </div>
                  </Link>
                );
              })}
            </nav>
            
            <div className="p-6">
              <div className="bg-slate-800 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <User className="text-sm text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-white">John Manager</p>
                    <p className="text-gray-400 text-xs">Administrator</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2 text-gray-300 hover:bg-slate-800 hover:text-white transition-colors rounded-lg"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
