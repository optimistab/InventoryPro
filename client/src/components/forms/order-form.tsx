import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Search, User, Package } from "lucide-react";
import { insertOrderSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Client, InsertOrder } from "@shared/schema";

interface OrderFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface Product {
  id: number;
  adsId: string;
  name: string;
  sku: string;
  category: string;
  stockQuantity: number;
  price: string;
}

export default function OrderForm({ onSuccess, onCancel }: OrderFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form setup with Zod validation
  const form = useForm<InsertOrder>({
    resolver: zodResolver(insertOrderSchema),
    defaultValues: {
      customerId: 0,
      adsIds: [],
      orderId: "",
      orderType: "PURCHASE",
      requiredPieces: 0,
      deliveredPieces: 0,
      paymentPerPiece: 0,
      securityDeposit: undefined,
      totalPaymentReceived: 0,
      contractDate: new Date().toISOString(),
      deliveryDate: undefined,
      quotedPrice: undefined,
      discount: undefined,
      createdAt: new Date().toISOString(),
      createdBy: "",
      productType: "laptop",
    },
  });

  // Form state
  const [selectedCustomer, setSelectedCustomer] = useState<Client | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Array<{
    adsId: string;
    name: string;
    quantity: number;
    paymentPerPiece: number;
  }>>([]);

  // Search states
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  // Fetch data
  const { data: clients, isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Filter data based on search
  const filteredClients = clients?.filter(client =>
    client.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    client.email.toLowerCase().includes(customerSearch.toLowerCase())
  ) || [];

  const filteredProducts = products?.filter(product =>
    product.adsId.includes(productSearch) ||
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.sku.toLowerCase().includes(productSearch.toLowerCase())
  ) || [];

  // Generate Order ID
  const generateOrderId = (customerId: number): string => {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    return `ORD${customerId.toString().padStart(4, '0')}${dateStr}`;
  };

  // Calculate totals
  const calculateTotal = () => {
    return selectedProducts.reduce((total, product) => {
      return total + (product.quantity * product.paymentPerPiece);
    }, 0);
  };

  // Add product to order
  const addProduct = (product: Product) => {
    if (selectedProducts.find(p => p.adsId === product.adsId)) {
      toast({
        title: "Product already added",
        description: "This product is already in the order",
        variant: "destructive",
      });
      return;
    }

    setSelectedProducts(prev => [...prev, {
      adsId: product.adsId,
      name: product.name,
      quantity: 1,
      paymentPerPiece: parseFloat(product.price)
    }]);
  };

  // Remove product from order
  const removeProduct = (adsId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.adsId !== adsId));
  };

  // Update product quantity/price
  const updateProduct = (adsId: string, field: 'quantity' | 'paymentPerPiece', value: number) => {
    setSelectedProducts(prev => prev.map(p =>
      p.adsId === adsId ? { ...p, [field]: value } : p
    ));
  };

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) throw new Error("Failed to create order");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order created successfully",
        description: `Order ${generateOrderId(selectedCustomer!.id)} has been created`,
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Failed to create order",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: InsertOrder) => {
    if (!selectedCustomer) {
      toast({
        title: "Customer required",
        description: "Please select a customer",
        variant: "destructive",
      });
      return;
    }

    if (selectedProducts.length === 0) {
      toast({
        title: "Products required",
        description: "Please add at least one product to the order",
        variant: "destructive",
      });
      return;
    }

    // Prepare the order data with proper schema structure
    const adsIds = selectedProducts.map(p => p.adsId);
    const totalQuantity = selectedProducts.reduce((sum, p) => sum + p.quantity, 0);
    const primaryPaymentPerPiece = selectedProducts[0]?.paymentPerPiece || 0;

    const orderData = {
      ...data,
      customerId: selectedCustomer.id,
      adsIds: adsIds,
      orderId: generateOrderId(selectedCustomer.id),
      requiredPieces: totalQuantity,
      paymentPerPiece: primaryPaymentPerPiece,
      totalPaymentReceived: calculateTotal(),
      quotedPrice: calculateTotal(),
      createdBy: "ADS0001", // Default employee ID
      productType: products?.find(p => p.adsId === selectedProducts[0]?.adsId)?.category as "laptop" | "desktop" || "laptop",
    };

    createOrderMutation.mutate(orderData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Customer Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Customer Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selectedCustomer ? (
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search customers..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>

              {clientsLoading ? (
                <div className="text-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <p className="text-sm text-gray-600 mt-2">Loading customers...</p>
                </div>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {filteredClients.slice(0, 5).map((client) => (
                    <div
                      key={client.id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedCustomer(client)}
                    >
                      <div className="font-medium">{client.name}</div>
                      <div className="text-sm text-gray-600">{client.email}</div>
                    </div>
                  ))}
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  // TODO: Open customer creation modal
                  toast({
                    title: "Feature coming soon",
                    description: "Customer creation form will be implemented",
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Customer
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">{selectedCustomer.name}</div>
                <div className="text-sm text-gray-600">{selectedCustomer.email}</div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedCustomer(null)}
              >
                Change
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Type */}
      <Card>
        <CardHeader>
          <CardTitle>Order Type</CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="orderType"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PURCHASE">Purchase (One-time Payment)</SelectItem>
                      <SelectItem value="RENT">Rental (Monthly Payment)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Product Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Products</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search products by ADS ID, name, or SKU..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>

          {productsLoading ? (
            <div className="text-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              <p className="text-sm text-gray-600 mt-2">Loading products...</p>
            </div>
          ) : (
            <div className="max-h-40 overflow-y-auto space-y-2">
              {filteredProducts.slice(0, 5).map((product) => (
                <div
                  key={product.adsId}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => addProduct(product)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-600">
                        ADS: {product.adsId} | SKU: {product.sku}
                      </div>
                    </div>
                    <Badge variant="outline">₹{product.price}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Selected Products */}
          {selectedProducts.length > 0 && (
            <div className="space-y-3">
              <Separator />
              <h4 className="font-medium">Selected Products:</h4>
              {selectedProducts.map((product) => (
                <div key={product.adsId} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-600">ADS: {product.adsId}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`qty-${product.adsId}`}>Qty:</Label>
                    <Input
                      id={`qty-${product.adsId}`}
                      type="number"
                      min="1"
                      value={product.quantity}
                      onChange={(e) => updateProduct(product.adsId, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-20"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`price-${product.adsId}`}>Price:</Label>
                    <Input
                      id={`price-${product.adsId}`}
                      type="number"
                      step="0.01"
                      value={product.paymentPerPiece}
                      onChange={(e) => updateProduct(product.adsId, 'paymentPerPiece', parseFloat(e.target.value) || 0)}
                      className="w-24"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeProduct(product.adsId)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details */}
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contractDate">Contract Date</Label>
              <Input
                id="contractDate"
                type="date"
                value={contractDate}
                onChange={(e) => setContractDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryDate">Delivery Date (Optional)</Label>
              <Input
                id="deliveryDate"
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
              />
            </div>
          </div>

          {orderType === "REN" && (
            <div className="space-y-2">
              <Label htmlFor="securityDeposit">Security Deposit</Label>
              <Input
                id="securityDeposit"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about the order..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Products:</span>
              <span>{selectedProducts.reduce((sum, p) => sum + p.quantity, 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{calculateTotal().toFixed(2)}</span>
            </div>
            {orderType === "REN" && securityDeposit && (
              <div className="flex justify-between">
                <span>Security Deposit:</span>
                <span>₹{parseFloat(securityDeposit).toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total Amount:</span>
              <span>₹{(calculateTotal() + (orderType === "REN" && securityDeposit ? parseFloat(securityDeposit) : 0)).toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createOrderMutation.isPending || !selectedCustomer || selectedProducts.length === 0}
        >
          {createOrderMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating Order...
            </>
          ) : (
            "Create Order"
          )}
        </Button>
      </div>
      </form>
    </Form>
  );
}