import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, UserPlus, Receipt, AlertTriangle, Clock, Bell, ArrowRight } from "lucide-react";
import { useState } from "react";
import ProductForm from "@/components/forms/product-form";
import ClientForm from "@/components/forms/client-form";
import SaleForm from "@/components/forms/sale-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function QuickActions() {
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  const quickActions = [
    {
      id: "product",
      label: "Add New Product",
      icon: Plus,
      description: "Add a new laptop or desktop to inventory",
      primary: true,
    },
    {
      id: "client",
      label: "Add Client",
      icon: UserPlus,
      description: "Register a new client",
      primary: false,
    },
    {
      id: "sale",
      label: "Record Sale",
      icon: Receipt,
      description: "Create a new sale transaction",
      primary: false,
    },
  ];

  const alerts = [
    {
      id: "low-stock",
      type: "error" as const,
      icon: AlertTriangle,
      title: "Low Stock Alert",
      description: "15 items below threshold",
      color: "bg-red-50 border-red-200",
      iconColor: "text-error",
    },
    {
      id: "pending-orders",
      type: "warning" as const,
      icon: Clock,
      title: "Pending Orders",
      description: "8 orders need attention",
      color: "bg-yellow-50 border-yellow-200",
      iconColor: "text-warning",
    },
    {
      id: "recovery-ready",
      type: "info" as const,
      icon: Bell,
      title: "Recovery Ready",
      description: "12 items ready for sale",
      color: "bg-blue-50 border-blue-200",
      iconColor: "text-primary",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-900">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                onClick={() => setActiveDialog(action.id)}
                variant={action.primary ? "default" : "outline"}
                className={`w-full flex items-center justify-between p-3 h-auto ${
                  action.primary
                    ? "bg-primary text-white hover:bg-blue-700"
                    : "border border-gray-300 hover:bg-gray-50"
                }`}
              >
                <span className="flex items-center">
                  <Icon className="mr-3 h-4 w-4" />
                  {action.label}
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            );
          })}
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-900">Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {alerts.map((alert) => {
            const Icon = alert.icon;
            return (
              <Alert key={alert.id} className={alert.color}>
                <div className="flex items-start space-x-3">
                  <Icon className={`mt-1 h-4 w-4 ${alert.iconColor}`} />
                  <div>
                    <p className={`font-medium text-sm ${alert.iconColor}`}>{alert.title}</p>
                    <AlertDescription className="text-gray-600 text-xs">
                      {alert.description}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            );
          })}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <Dialog open={activeDialog === "product"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <ProductForm
            onSuccess={() => setActiveDialog(null)}
            onCancel={() => setActiveDialog(null)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === "client"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
          <ClientForm
            onSuccess={() => setActiveDialog(null)}
            onCancel={() => setActiveDialog(null)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={activeDialog === "sale"} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Record New Sale</DialogTitle>
          </DialogHeader>
          <SaleForm
            onSuccess={() => setActiveDialog(null)}
            onCancel={() => setActiveDialog(null)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
