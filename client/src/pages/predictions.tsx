import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target, AlertTriangle, BarChart3, Calendar } from "lucide-react";
import { useState } from "react";
import type { SaleWithDetails, Product } from "@shared/schema";

export default function Predictions() {
  const [timeframe, setTimeframe] = useState("30");

  const { data: sales, isLoading: salesLoading } = useQuery<SaleWithDetails[]>({
    queryKey: ["/api/sales"],
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const isLoading = salesLoading || productsLoading;

  // Calculate predictions based on historical data
  const calculatePredictions = () => {
    if (!sales || !products) return null;

    const days = parseInt(timeframe);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentSales = sales.filter(sale => new Date(sale.saleDate) >= cutoffDate);
    
    // Sales trend analysis
    const totalRevenue = recentSales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0);
    const avgDailyRevenue = totalRevenue / days;
    const projectedMonthlyRevenue = avgDailyRevenue * 30;

    // Product performance analysis
    const productSales = recentSales.reduce((acc, sale) => {
      const key = sale.product.id;
      if (!acc[key]) {
        acc[key] = {
          product: sale.product,
          totalQuantity: 0,
          totalRevenue: 0,
          avgPrice: 0,
        };
      }
      acc[key].totalQuantity += sale.quantity;
      acc[key].totalRevenue += parseFloat(sale.totalAmount);
      return acc;
    }, {} as Record<number, any>);

    const topProducts = Object.values(productSales)
      .sort((a: any, b: any) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);

    // Stock predictions
    const lowStockItems = products.filter(p => p.stockQuantity < 10);
    const outOfStockSoon = products.filter(p => {
      const dailySales = recentSales
        .filter(sale => sale.productId === p.id)
        .reduce((sum, sale) => sum + sale.quantity, 0) / days;
      
      return dailySales > 0 && (p.stockQuantity / dailySales) < 14; // Will run out in 2 weeks
    });

    // Growth predictions
    const firstHalf = recentSales.filter(sale => {
      const saleDate = new Date(sale.saleDate);
      const midpoint = new Date(cutoffDate.getTime() + (Date.now() - cutoffDate.getTime()) / 2);
      return saleDate <= midpoint;
    });
    
    const secondHalf = recentSales.filter(sale => {
      const saleDate = new Date(sale.saleDate);
      const midpoint = new Date(cutoffDate.getTime() + (Date.now() - cutoffDate.getTime()) / 2);
      return saleDate > midpoint;
    });

    const firstHalfRevenue = firstHalf.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0);
    const secondHalfRevenue = secondHalf.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0);
    const growthRate = firstHalfRevenue > 0 ? ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100 : 0;

    return {
      projectedMonthlyRevenue,
      avgDailyRevenue,
      topProducts,
      lowStockItems,
      outOfStockSoon,
      growthRate,
      totalSales: recentSales.length,
    };
  };

  const predictions = calculatePredictions();

  if (isLoading) {
    return (
      <div className="pt-16 lg:pt-0">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Predictions</h2>
              <p className="text-gray-600">Sales and inventory forecasting analytics</p>
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </header>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-32 w-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 lg:pt-0">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Predictions</h2>
            <p className="text-gray-600">Sales and inventory forecasting analytics</p>
          </div>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        {!predictions ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No prediction data available</h3>
              <p className="text-gray-600">
                Start recording sales to generate predictions and forecasts
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Revenue Predictions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Daily Average</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">${predictions.avgDailyRevenue.toFixed(0)}</p>
                  <p className="text-sm text-gray-600 mt-1">Based on {timeframe} days</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Monthly Projection</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">
                    ${predictions.projectedMonthlyRevenue.toFixed(0)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Projected revenue</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Growth Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <p className={`text-2xl font-bold ${predictions.growthRate >= 0 ? 'text-success' : 'text-error'}`}>
                      {predictions.growthRate >= 0 ? '+' : ''}{predictions.growthRate.toFixed(1)}%
                    </p>
                    {predictions.growthRate >= 0 ? (
                      <TrendingUp className="ml-2 h-5 w-5 text-success" />
                    ) : (
                      <TrendingDown className="ml-2 h-5 w-5 text-error" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Period growth rate</p>
                </CardContent>
              </Card>
            </div>

            {/* Top Performing Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="mr-2 h-5 w-5" />
                    Top Performing Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {predictions.topProducts.length === 0 ? (
                    <p className="text-gray-600 text-center py-4">No sales data available</p>
                  ) : (
                    <div className="space-y-4">
                      {predictions.topProducts.map((item: any, index: number) => (
                        <div key={item.product.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-primary">#{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium">{item.product.name}</p>
                              <p className="text-sm text-gray-600">{item.totalQuantity} units sold</p>
                            </div>
                          </div>
                          <p className="font-semibold text-success">
                            ${item.totalRevenue.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Stock Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Stock Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {predictions.lowStockItems.length > 0 && (
                      <div>
                        <h4 className="font-medium text-error mb-2">Low Stock ({predictions.lowStockItems.length})</h4>
                        <div className="space-y-2">
                          {predictions.lowStockItems.slice(0, 3).map((product) => (
                            <div key={product.id} className="flex items-center justify-between">
                              <span className="text-sm">{product.name}</span>
                              <Badge variant="destructive" className="bg-red-100 text-error hover:bg-red-100">
                                {product.stockQuantity} left
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {predictions.outOfStockSoon.length > 0 && (
                      <div>
                        <h4 className="font-medium text-warning mb-2">Running Out Soon ({predictions.outOfStockSoon.length})</h4>
                        <div className="space-y-2">
                          {predictions.outOfStockSoon.slice(0, 3).map((product) => (
                            <div key={product.id} className="flex items-center justify-between">
                              <span className="text-sm">{product.name}</span>
                              <Badge variant="secondary" className="bg-yellow-100 text-warning hover:bg-yellow-100">
                                {"< 2 weeks"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {predictions.lowStockItems.length === 0 && predictions.outOfStockSoon.length === 0 && (
                      <div className="text-center py-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Target className="h-6 w-6 text-success" />
                        </div>
                        <p className="text-success font-medium">All stock levels healthy</p>
                        <p className="text-sm text-gray-600">No immediate restocking needed</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Forecasting Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Forecasting Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-primary">{predictions.totalSales}</p>
                    <p className="text-sm text-gray-600">Sales in period</p>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-success">
                      {Math.round(predictions.totalSales / parseInt(timeframe) * 30)}
                    </p>
                    <p className="text-sm text-gray-600">Projected monthly sales</p>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      ${Math.round(predictions.avgDailyRevenue * 365)}
                    </p>
                    <p className="text-sm text-gray-600">Annual projection</p>
                  </div>
                  
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-warning">
                      {predictions.topProducts.length > 0 ? Math.round(predictions.topProducts[0]?.totalQuantity / parseInt(timeframe) * 30) : 0}
                    </p>
                    <p className="text-sm text-gray-600">Top product monthly est.</p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {predictions.growthRate > 10 && (
                      <li>• Consider increasing inventory for high-growth products</li>
                    )}
                    {predictions.lowStockItems.length > 0 && (
                      <li>• Restock {predictions.lowStockItems.length} low inventory items immediately</li>
                    )}
                    {predictions.outOfStockSoon.length > 0 && (
                      <li>• Plan restocking for {predictions.outOfStockSoon.length} fast-moving items</li>
                    )}
                    {predictions.topProducts.length > 0 && (
                      <li>• Focus marketing efforts on top-performing product: {predictions.topProducts[0]?.product.name}</li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
