import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertProductSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { InsertProduct, Product } from "@shared/schema";

interface ProductFormProps {
  product?: Product;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      brand: "",
      model: "",
      productType: "laptop",
      condition: "new",
      costPrice: 0,
      specifications: "",
      prodId: "",
      prodHealth: "working",
      prodStatus: "available",
      lastAuditDate: "",
      auditStatus: "",
      returnDate: "",
      maintenanceDate: "",
      maintenanceStatus: "",
      orderStatus: "INVENTORY",
      createdBy: "",
    },
  });

  // Watch for product creation to show generated IDs
  const [generatedAdsId, setGeneratedAdsId] = useState<string>("");
  const [generatedReferenceNumber, setGeneratedReferenceNumber] = useState<string>("");

  // Prefill form when editing
  useEffect(() => {
    if (product) {
      form.reset({
        brand: product.brand,
        model: product.model,
        productType: (product.productType === "laptop" || product.productType === "desktop") ? product.productType : "laptop",
        condition: product.condition as "new" | "refurbished" | "used" || "new",
        costPrice: parseFloat(product.costPrice) || 0,
        specifications: product.specifications || "",
        prodId: product.prodId || "",
        prodHealth: product.prodHealth as "working" | "maintenance" | "expired" || "working",
        prodStatus: product.prodStatus as "available" | "leased" | "sold" | "leased but not working" | "leased but maintenance" | "returned" || "available",
        lastAuditDate: product.lastAuditDate || "",
        auditStatus: product.auditStatus || "",
        returnDate: product.returnDate || "",
        maintenanceDate: product.maintenanceDate || "",
        maintenanceStatus: product.maintenanceStatus || "",
        orderStatus: product.orderStatus as "INVENTORY" | "RENT" | "PURCHASE" || "INVENTORY",
        createdBy: product.createdBy || "",
      });
    } else {
      form.reset({
        brand: "",
        model: "",
        productType: "laptop",
        condition: "new",
        costPrice: 0,
        specifications: "",
        prodId: "",
        prodHealth: "working",
        prodStatus: "available",
        lastAuditDate: "",
        auditStatus: "",
        returnDate: "",
        maintenanceDate: "",
        maintenanceStatus: "",
        orderStatus: "INVENTORY",
        createdBy: "",
      });
    }
  }, [product, form]);

  // Create mutation
  const createProductMutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      const response = await apiRequest("POST", "/api/products", data);
      return response.json();
    },
    onSuccess: (product) => {
      // Set the generated IDs for display
      setGeneratedAdsId(product.adsId);
      setGeneratedReferenceNumber(product.referenceNumber);

      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: `Product created successfully!\nAds ID: ₹{product.adsId}\nReference: ₹{product.referenceNumber}`,
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateProductMutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      if (!product) throw new Error("No product to update");
      const response = await apiRequest("PUT", `/api/products/${product.adsId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertProduct) => {
    if (product) {
      updateProductMutation.mutate(data);
    } else {
      createProductMutation.mutate(data);
    }
  };

  const isLoading = createProductMutation.isPending || updateProductMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <Input placeholder="Apple" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <Input placeholder="MacBook Pro" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Display generated IDs for new products */}
        {generatedAdsId && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div>
              <FormLabel className="text-green-700">Generated Ads ID</FormLabel>
              <Input value={generatedAdsId} readOnly className="bg-green-100" />
            </div>
            <div>
              <FormLabel className="text-green-700">Reference Number</FormLabel>
              <Input value={generatedReferenceNumber} readOnly className="bg-green-100" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <Input placeholder="Apple" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <Input placeholder="MacBook Pro" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="productType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || "laptop"}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="laptop">Laptop</SelectItem>
                    <SelectItem value="desktop">Desktop</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condition</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="refurbished">Refurbished</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="costPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost Price (₹)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="1499.99" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prodId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product ID</FormLabel>
                <FormControl>
                  <Input placeholder="MBP001" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="prodHealth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Health</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || "working"}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select health status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="working">Working</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prodStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || "available"}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="leased">Leased</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="leased but not working">Leased but not working</SelectItem>
                    <SelectItem value="leased but maintenance">Leased but maintenance</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="orderStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || "INVENTORY"}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select order status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="RENT">Rent</SelectItem>
                    <SelectItem value="PURCHASE">Purchase</SelectItem>
                    <SelectItem value="INVENTORY">Inventory</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="createdBy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Created By (Employee ID)</FormLabel>
                <FormControl>
                  <Input placeholder="ADS0001" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="specifications"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Specifications</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="16GB RAM, 512GB SSD, M2 Pro chip..."
                  className="min-h-[80px]"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? product
                ? "Saving..."
                : "Creating..."
              : product
                ? "Save Changes"
                : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
