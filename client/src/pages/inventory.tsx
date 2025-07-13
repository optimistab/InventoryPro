import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Laptop, Monitor, Edit, Trash2, Package } from "lucide-react";
import { useState } from "react";
import ProductForm from "@/components/forms/product-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Product } from "@shared/schema";

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="pt-16 lg:pt-0">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Inventory</h2>
              <p className="text-gray-600">Manage your laptop and computer inventory</p>
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
            <h2 className="text-2xl font-bold text-gray-900">Inventory</h2>
            <p className="text-gray-600">Manage your laptop and computer inventory</p>
          </div>
          <Button onClick={() => setIsProductFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        {/* Search and Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>
          <div className="text-sm text-gray-600">
            {filteredProducts.length} of {products?.length || 0} products
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first product"}
              </p>
              <Button onClick={() => setIsProductFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="border border-gray-100 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {product.category === "laptop" ? (
                          <Laptop className="h-6 w-6 text-gray-600" />
                        ) : (
                          <Monitor className="h-6 w-6 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <p className="text-sm text-gray-600">{product.brand} - {product.model}</p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">SKU:</span>
                      <span className="font-mono text-sm">{product.sku}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Price:</span>
                      <span className="font-semibold">${parseFloat(product.price).toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Stock:</span>
                      <Badge 
                        variant={product.stockQuantity > 10 ? "default" : product.stockQuantity > 0 ? "secondary" : "destructive"}
                        className={
                          product.stockQuantity > 10 
                            ? "bg-green-100 text-success hover:bg-green-100" 
                            : product.stockQuantity > 0
                            ? "bg-yellow-100 text-warning hover:bg-yellow-100"
                            : "bg-red-100 text-error hover:bg-red-100"
                        }
                      >
                        {product.stockQuantity} units
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Condition:</span>
                      <Badge variant="outline">
                        {product.condition}
                      </Badge>
                    </div>

                    {product.specifications && (
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {product.specifications}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Product Dialog */}
      <Dialog open={isProductFormOpen} onOpenChange={setIsProductFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <ProductForm
            onSuccess={() => setIsProductFormOpen(false)}
            onCancel={() => setIsProductFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
