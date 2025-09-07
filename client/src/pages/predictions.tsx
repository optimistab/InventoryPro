import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target, AlertTriangle, BarChart3, Calendar, DollarSign, Package } from "lucide-react";
import { useState } from "react";
import type { Product } from "@shared/schema";

export default function Predictions() {
  const [timeframe, setTimeframe] = useState("30");

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const isLoading = productsLoading;

  // Calculate predictions based on product status and available data
  const calculatePredictions = () => {
    if (!products) return null;

    // Product status analysis
    const availableProducts = products.filter(p => p.prodStatus === 'available');
    const leasedProducts = products.filter(p => p.prodStatus?.includes('leased'));
    const soldProducts = products.filter(p => p.prodStatus === 'sold');
    const maintenanceProducts = products.filter(p =>
      p.prodHealth === 'maintenance' || p.prodStatus === 'leased but maintenance'
    );

    // Cost analysis
    const totalInventoryValue = products.reduce((sum, p) => sum + parseFloat(p.costPrice), 0);
    const avgProductCost = products.length > 0 ? totalInventoryValue / products.length : 0;

    // Product health analysis
    const workingProducts = products.filter(p => p.prodHealth === 'working').length;
    const maintenanceNeeded = products.filter(p => p.prodHealth === 'maintenance').length;
    const expiredProducts = products.filter(p => p.prodHealth === 'expired').length;

    // Status distribution
    const statusDistribution = {
      available: availableProducts.length,
      leased: leasedProducts.length,
      sold: soldProducts.length,
      maintenance: maintenanceProducts.length,
    };

    // Top products by cost (as a proxy for value)
    const topProducts = products
      .sort((a, b) => parseFloat(b.costPrice) - parseFloat(a.costPrice))
      .slice(0, 5)
      .map(product => ({
        product,
        costValue: parseFloat(product.costPrice),
      }));

    // Products needing attention
    const needsAttention = products.filter(p =>
      p.prodHealth === 'maintenance' ||
      p.prodStatus === 'leased but not working' ||
      p.prodStatus === 'leased but maintenance'
    );

    return {
      totalProducts: products.length,
      availableProducts: availableProducts.length,
      leasedProducts: leasedProducts.length,
      soldProducts: soldProducts.length,
      maintenanceProducts: maintenanceProducts.length,
      totalInventoryValue,
      avgProductCost,
      workingProducts,
      maintenanceNeeded,
      expiredProducts,
      statusDistribution,
      topProducts,
      needsAttention,
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
            <h2 className="text-2xl font-bold text-gray-900">Inventory Analytics</h2>
            <p className="text-gray-600">Product status and inventory health insights</p>
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
            {/* Product Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{predictions.totalProducts}</p>
                  <p className="text-sm text-gray-600 mt-1">In inventory</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Available</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-success">{predictions.availableProducts}</p>
                  <p className="text-sm text-gray-600 mt-1">Ready for use</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Leased</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">{predictions.leasedProducts}</p>
                  <p className="text-sm text-gray-600 mt-1">Currently leased</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Maintenance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-warning">{predictions.maintenanceProducts}</p>
                  <p className="text-sm text-gray-600 mt-1">Needs attention</p>
                </CardContent>
              </Card>
            </div>

            {/* Top Value Products & Health Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="mr-2 h-5 w-5" />
                    Highest Value Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {predictions.topProducts.length === 0 ? (
                    <p className="text-gray-600 text-center py-4">No products available</p>
                  ) : (
                    <div className="space-y-4">
                      {predictions.topProducts.map((item, index: number) => (
                        <div key={item.product.adsId} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-primary">#{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium">{item.product.brand} {item.product.model}</p>
                              <p className="text-sm text-gray-600">{item.product.productType}</p>
                            </div>
                          </div>
                          <p className="font-semibold text-success">
                            ₹{item.costValue.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Product Health Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="mr-2 h-5 w-5" />
                    Product Health Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-lg font-bold text-success">{predictions.workingProducts}</p>
                        <p className="text-xs text-gray-600">Working</p>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <p className="text-lg font-bold text-warning">{predictions.maintenanceNeeded}</p>
                        <p className="text-xs text-gray-600">Maintenance</p>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <p className="text-lg font-bold text-error">{predictions.expiredProducts}</p>
                        <p className="text-xs text-gray-600">Expired</p>
                      </div>
                    </div>

                    {predictions.needsAttention.length > 0 && (
                      <div>
                        <h4 className="font-medium text-warning mb-2">Needs Attention ({predictions.needsAttention.length})</h4>
                        <div className="space-y-2">
                          {predictions.needsAttention.slice(0, 3).map((product) => (
                            <div key={product.adsId} className="flex items-center justify-between">
                              <span className="text-sm">{product.brand} {product.model}</span>
                              <Badge variant="secondary" className="bg-yellow-100 text-warning hover:bg-yellow-100">
                                {product.prodHealth || 'Check'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {predictions.needsAttention.length === 0 && (
                      <div className="text-center py-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Target className="h-6 w-6 text-success" />
                        </div>
                        <p className="text-success font-medium">All products healthy</p>
                        <p className="text-sm text-gray-600">No maintenance needed</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Inventory Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Inventory Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-primary">₹{predictions.totalInventoryValue.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Total inventory value</p>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-success">
                      ₹{predictions.avgProductCost.toFixed(0)}
                    </p>
                    <p className="text-sm text-gray-600">Average product cost</p>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {Math.round((predictions.availableProducts / predictions.totalProducts) * 100)}%
                    </p>
                    <p className="text-sm text-gray-600">Utilization rate</p>
                  </div>

                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-warning">
                      {predictions.soldProducts}
                    </p>
                    <p className="text-sm text-gray-600">Products sold</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {predictions.maintenanceProducts > 0 && (
                      <li>• Schedule maintenance for {predictions.maintenanceProducts} products requiring attention</li>
                    )}
                    {predictions.availableProducts < predictions.totalProducts * 0.3 && (
                      <li>• Low availability rate - consider acquiring more products</li>
                    )}
                    {predictions.needsAttention.length > 0 && (
                      <li>• Address {predictions.needsAttention.length} products that need immediate attention</li>
                    )}
                    {predictions.topProducts.length > 0 && (
                      <li>• Focus on high-value product: {predictions.topProducts[0]?.product.brand} {predictions.topProducts[0]?.product.model}</li>
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
