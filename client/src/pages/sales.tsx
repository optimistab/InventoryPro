import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Receipt, Laptop, Monitor, CreditCard } from "lucide-react";
import { useState } from "react";
import SaleForm from "@/components/forms/sale-form";
import PaymentForm from "@/components/forms/payment-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { SalesBuy, SalesRent } from "@shared/schema";

export default function Sales() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaleFormOpen, setIsSaleFormOpen] = useState(false);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");

  const { data: salesBuy, isLoading: buyLoading } = useQuery<SalesBuy[]>({
    queryKey: ["/api/sales-buy"],
  });

  const { data: salesRent, isLoading: rentLoading } = useQuery<SalesRent[]>({
    queryKey: ["/api/sales-rent"],
  });

  const isLoading = buyLoading || rentLoading;

  // Combine and filter sales data
  const allSales = [
    ...(salesBuy || []).map(sale => ({ ...sale, type: 'buy' as const })),
    ...(salesRent || []).map(sale => ({ ...sale, type: 'rent' as const }))
  ];

  const filteredSales = allSales.filter(sale =>
    sale.adsId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customerId.toString().includes(searchTerm) ||
    sale.empId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sale.type === 'buy' && sale.orderId?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="pt-16 lg:pt-0">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Sales</h2>
              <p className="text-gray-600">Track and manage all sales transactions</p>
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </header>
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalSales = filteredSales.reduce((sum, sale) => {
    if (sale.type === 'buy') {
      return sum + parseFloat(sale.sellingPrice);
    } else {
      return sum + parseFloat(sale.leaseAmount);
    }
  }, 0);

  return (
    <div className="pt-16 lg:pt-0">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Sales</h2>
            <p className="text-gray-600">Track and manage all sales transactions</p>
          </div>
          <Button onClick={() => setIsSaleFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Record Sale
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{filteredSales.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">₹{totalSales.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Average Sale</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                ₹{filteredSales.length > 0 ? (totalSales / filteredSales.length).toFixed(0) : '0'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search sales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>
          <div className="text-sm text-gray-600">
            {filteredSales.length} of {allSales.length} sales
          </div>
        </div>

        {/* Sales List */}
        {filteredSales.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sales found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? "Try adjusting your search terms" : "Get started by recording your first sale"}
              </p>
              <Button onClick={() => setIsSaleFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Record Sale
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredSales.map((sale) => (
              <Card key={`${sale.type}-${sale.id}`} className="border border-gray-100 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {sale.type === 'buy' ? (
                          <Receipt className="h-6 w-6 text-gray-600" />
                        ) : (
                          <CreditCard className="h-6 w-6 text-gray-600" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {sale.type === 'buy' ? 'Purchase Sale' : 'Rental Sale'}
                            </h3>
                            <p className="text-sm text-gray-600">ADS ID: {sale.adsId}</p>
                          </div>

                          <div className="border-l border-gray-200 pl-4">
                            <p className="font-medium text-gray-900">Customer ID: {sale.customerId}</p>
                            {sale.type === 'buy' && sale.orderId && (
                              <p className="text-sm text-gray-600">Order: {sale.orderId}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      {sale.type === 'rent' && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Leased Qty</p>
                          <p className="font-semibold">{sale.leasedQuantity}</p>
                        </div>
                      )}

                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {sale.type === 'buy' ? 'Selling Price' : 'Lease Amount'}
                        </p>
                        <p className="font-semibold">
                          ₹{parseFloat(sale.type === 'buy' ? sale.sellingPrice : sale.leaseAmount).toLocaleString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-600">Cost Price</p>
                        <p className="font-semibold">
                          ₹{sale.type === 'buy' ? parseFloat(sale.costPrice).toLocaleString() : 'N/A'}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-medium">
                          {new Date(sale.type === 'buy' ? sale.salesDate : sale.paymentDate).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex flex-col items-end space-y-2">
                        <Badge
                          variant={sale.type === 'buy' ? "default" : "secondary"}
                          className={
                            sale.type === 'buy'
                              ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                              : "bg-green-100 text-green-800 hover:bg-green-100"
                          }
                        >
                          {sale.type === 'buy' ? 'Purchase' : 'Rental'}
                        </Badge>
                        {sale.type === 'rent' && (
                          <Badge
                            variant={sale.paymentStatus === "Complete" ? "default" : "secondary"}
                            className={
                              sale.paymentStatus === "Complete"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : sale.paymentStatus === "Pending"
                                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                : "bg-blue-100 text-blue-800 hover:bg-blue-100"
                            }
                          >
                            {sale.paymentStatus}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {sale.type === 'buy' && sale.miscCost && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600">Misc Cost: ₹{parseFloat(sale.miscCost).toLocaleString()}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Record Sale Dialog */}
      <Dialog open={isSaleFormOpen} onOpenChange={setIsSaleFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Record New Sale</DialogTitle>
          </DialogHeader>
          <SaleForm
            onSuccess={() => setIsSaleFormOpen(false)}
            onCancel={() => setIsSaleFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={isPaymentFormOpen} onOpenChange={setIsPaymentFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <PaymentForm
            orderId={selectedOrderId}
            onSuccess={() => setIsPaymentFormOpen(false)}
            onCancel={() => setIsPaymentFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
