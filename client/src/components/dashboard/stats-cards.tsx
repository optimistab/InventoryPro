import { Card, CardContent } from "@/components/ui/card";
import { Package, DollarSign, Users, Recycle, TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardsProps {
  stats?: {
    totalInventory: number;
    monthlySales: number;
    activeClients: number;
    recoveryItems: number;
    salesGrowth: number;
    clientGrowth: number;
  };
  isLoading: boolean;
}

export default function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-12 w-12 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              <Package className="h-8 w-8 mx-auto mb-2" />
              <p>No stats available</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Inventory",
      value: stats.totalInventory.toLocaleString(),
      change: "+12% from last month",
      icon: Package,
      iconBg: "bg-blue-100",
      iconColor: "text-primary",
      positive: true,
    },
    {
      title: "Monthly Sales",
      value: `₹${stats.monthlySales.toLocaleString()}`,
      change: `${stats.salesGrowth > 0 ? '+' : ''}${stats.salesGrowth}% from last month`,
      icon: DollarSign,
      iconBg: "bg-green-100",
      iconColor: "text-secondary",
      positive: stats.salesGrowth > 0,
    },
    {
      title: "Active Clients",
      value: stats.activeClients.toLocaleString(),
      change: `${stats.clientGrowth > 0 ? '+' : ''}${stats.clientGrowth}% from last month`,
      icon: Users,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      positive: stats.clientGrowth > 0,
    },
    {
      title: "Recovery Items",
      value: stats.recoveryItems.toLocaleString(),
      change: "+15% from last month",
      icon: Recycle,
      iconBg: "bg-yellow-100",
      iconColor: "text-warning",
      positive: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="border border-gray-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-sm mt-1 flex items-center ${
                    stat.positive ? 'text-success' : 'text-warning'
                  }`}>
                    {stat.positive ? (
                      <TrendingUp className="mr-1 h-3 w-3" />
                    ) : (
                      <TrendingDown className="mr-1 h-3 w-3" />
                    )}
                    {stat.change}
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`${stat.iconColor} h-6 w-6`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
