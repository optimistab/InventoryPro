import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Package, Wrench, MessageSquare, RotateCcw } from "lucide-react";
import type { Product } from "@shared/schema";

interface AlertsCardProps {
  products?: Product[];
  isLoading: boolean;
}

export default function AlertsCard({ products, isLoading }: AlertsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-16" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Skeleton className="w-8 h-8 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-3 w-10" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate alert counts
  const lowInventoryCount = products?.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 10).length || 0;
  const recoveryDueCount = 2; // Mock data - would come from recovery items API
  const complaintsCount = 0; // Mock data - would come from complaints API
  const repairsCount = 1; // Mock data - would come from repairs API

  const alerts = [
    {
      id: 'low-inventory',
      title: 'Low Inventory',
      count: lowInventoryCount,
      icon: Package,
      color: 'bg-yellow-100 text-yellow-800',
      iconColor: 'text-yellow-600'
    },
    {
      id: 'recovery-due',
      title: 'Recovery Due',
      count: recoveryDueCount,
      icon: RotateCcw,
      color: 'bg-blue-100 text-blue-800',
      iconColor: 'text-blue-600'
    },
    {
      id: 'complaints',
      title: 'Complaints',
      count: complaintsCount,
      icon: MessageSquare,
      color: 'bg-red-100 text-red-800',
      iconColor: 'text-red-600'
    },
    {
      id: 'repairs',
      title: 'Repairs',
      count: repairsCount,
      icon: Wrench,
      color: 'bg-orange-100 text-orange-800',
      iconColor: 'text-orange-600'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-yellow-600" />
            Alerts
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {alerts.reduce((sum, alert) => sum + alert.count, 0)} Total
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {alerts.map((alert) => {
            const Icon = alert.icon;
            return (
              <div 
                key={alert.id}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${alert.color}`}>
                  <Icon className={`h-4 w-4 ${alert.iconColor}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{alert.title}</span>
                    <Badge 
                      variant={alert.count > 0 ? "default" : "secondary"}
                      className={`text-xs ${alert.count > 0 ? alert.color : 'bg-gray-100 text-gray-600'}`}
                    >
                      {alert.count}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {alert.count > 0 ? `${alert.count} items need attention` : 'All clear'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}