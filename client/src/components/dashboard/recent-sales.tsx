import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Laptop, Monitor } from "lucide-react";
import type { SaleWithDetails } from "@shared/schema";

interface RecentSalesProps {
  sales?: SaleWithDetails[];
  isLoading: boolean;
}

export default function RecentSales({ sales, isLoading }: RecentSalesProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-20" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 border-b border-gray-100">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!sales || sales.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-gray-900">Recent Sales</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary text-sm hover:underline">
              View All Sales
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <p>No sales recorded yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentSales = sales.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-900">Recent Sales</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary text-sm hover:underline">
            View All Sales
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-medium text-gray-600 text-sm">Product</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600 text-sm">Client</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600 text-sm">Amount</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600 text-sm">Date</th>
                <th className="text-left py-3 px-2 font-medium text-gray-600 text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map((sale) => (
                <tr key={sale.id} className="border-b border-gray-100">
                  <td className="py-3 px-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                        {sale.product.category === "laptop" ? (
                          <Laptop className="text-gray-600 h-4 w-4" />
                        ) : (
                          <Monitor className="text-gray-600 h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{sale.product.name}</p>
                        <p className="text-gray-600 text-sm">SKU: {sale.product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <p className="font-medium text-gray-900">{sale.client.name}</p>
                    <p className="text-gray-600 text-sm">{sale.client.email}</p>
                  </td>
                  <td className="py-3 px-2 font-semibold text-gray-900">
                    ${parseFloat(sale.totalAmount).toLocaleString()}
                  </td>
                  <td className="py-3 px-2 text-gray-600">
                    {new Date(sale.saleDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-2">
                    <Badge 
                      variant={sale.status === "completed" ? "default" : "secondary"}
                      className={
                        sale.status === "completed" 
                          ? "bg-green-100 text-success hover:bg-green-100" 
                          : sale.status === "pending"
                          ? "bg-yellow-100 text-warning hover:bg-yellow-100"
                          : "bg-red-100 text-error hover:bg-red-100"
                      }
                    >
                      {sale.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
