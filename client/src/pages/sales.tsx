import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Receipt, Laptop, Monitor } from "lucide-react";
import { useState } from "react";
import SaleForm from "@/components/forms/sale-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { SaleWithDetails } from "@shared/schema";

export default function Sales() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaleFormOpen, setIsSaleFormOpen] = useState(false);

  const { data: sales, isLoading } = useQuery<SaleWithDetails[]>({
    queryKey: ["/api/sales"],
  });

  const filteredSales = sales?.filter(sale =>
    sale.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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

  const totalSales = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0);

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
              <p className="text-2xl font-bold">${totalSales.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Average Sale</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                ${filteredSales.length > 0 ? (totalSales / filteredSales.length).toFixed(0) : '0'}
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
            {filteredSales.length} of {sales?.length || 0} sales
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
              <Card key={sale.id} className="border border-gray-100 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {sale.product.category === "laptop" ? (
                          <Laptop className="h-6 w-6 text-gray-600" />
                        ) : (
                          <Monitor className="h-6 w-6 text-gray-600" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="font-semibold text-gray-900">{sale.product.name}</h3>
                            <p className="text-sm text-gray-600">SKU: {sale.product.sku}</p>
                          </div>
                          
                          <div className="border-l border-gray-200 pl-4">
                            <p className="font-medium text-gray-900">{sale.client.name}</p>
                            <p className="text-sm text-gray-600">{sale.client.email}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Quantity</p>
                        <p className="font-semibold">{sale.quantity}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Unit Price</p>
                        <p className="font-semibold">${parseFloat(sale.unitPrice).toLocaleString()}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="text-lg font-bold text-gray-900">
                          ${parseFloat(sale.totalAmount).toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-medium">{new Date(sale.saleDate).toLocaleDateString()}</p>
                      </div>
                      
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
                    </div>
                  </div>
                  
                  {sale.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600">{sale.notes}</p>
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
    </div>
  );
}
