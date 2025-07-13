import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { SaleWithDetails } from "@shared/schema";

interface SalesChartProps {
  sales?: SaleWithDetails[];
  isLoading: boolean;
}

export default function SalesChart({ sales, isLoading }: SalesChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-900">Sales Overview</CardTitle>
          <Select defaultValue="7days">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="3months">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg font-medium">Sales Chart Visualization</p>
            <p className="text-sm">Chart integration coming soon</p>
            {sales && (
              <p className="text-xs mt-2 text-gray-400">
                {sales.length} total sales recorded
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
