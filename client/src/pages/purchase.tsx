import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, TrendingUp } from "lucide-react";

export default function Purchase() {
  return (
    <div className="pt-16 lg:pt-0">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Purchase</h2>
            <p className="text-gray-600">Purchase management system (Coming Soon)</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Pending Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-gray-600">Awaiting purchase</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Suppliers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-gray-600">Active suppliers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Monthly Spend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">₹0</p>
              <p className="text-xs text-gray-600">This month</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Purchase Management</h3>
            <p className="text-gray-600 mb-4">
              This section is under development. Future features will include:
            </p>
            <ul className="text-left max-w-md mx-auto text-sm text-gray-600 space-y-2">
              <li>• Supplier management</li>
              <li>• Purchase order tracking</li>
              <li>• Inventory replenishment</li>
              <li>• Cost analysis and optimization</li>
              <li>• Supplier performance metrics</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}