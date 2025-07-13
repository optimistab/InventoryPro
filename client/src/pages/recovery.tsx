import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Recycle, Edit, Wrench, CheckCircle, Package } from "lucide-react";
import { useState } from "react";
import RecoveryForm from "@/components/forms/recovery-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { RecoveryItem } from "@shared/schema";

export default function Recovery() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isRecoveryFormOpen, setIsRecoveryFormOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: recoveryItems, isLoading } = useQuery<RecoveryItem[]>({
    queryKey: ["/api/recovery-items"],
  });

  const filteredItems = recoveryItems?.filter(item => {
    const matchesSearch = item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "received": return Package;
      case "repairing": return Wrench;
      case "ready": return CheckCircle;
      case "sold": return CheckCircle;
      default: return Package;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received": return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "repairing": return "bg-yellow-100 text-warning hover:bg-yellow-100";
      case "ready": return "bg-green-100 text-success hover:bg-green-100";
      case "sold": return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      default: return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const statusCounts = recoveryItems?.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const totalValue = filteredItems.reduce((sum, item) => 
    sum + (item.estimatedValue ? parseFloat(item.estimatedValue) : 0), 0
  );

  if (isLoading) {
    return (
      <div className="pt-16 lg:pt-0">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Recovery</h2>
              <p className="text-gray-600">Manage refurbished laptop recovery and repair</p>
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
            <h2 className="text-2xl font-bold text-gray-900">Recovery</h2>
            <p className="text-gray-600">Manage refurbished laptop recovery and repair</p>
          </div>
          <Button onClick={() => setIsRecoveryFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Recovery Item
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{filteredItems.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Ready for Sale</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-success">{statusCounts.ready || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">In Repair</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-warning">{statusCounts.repairing || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Est. Value</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search recovery items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            <option value="received">Received</option>
            <option value="repairing">Repairing</option>
            <option value="ready">Ready</option>
            <option value="sold">Sold</option>
          </select>
          
          <div className="text-sm text-gray-600">
            {filteredItems.length} of {recoveryItems?.length || 0} items
          </div>
        </div>

        {/* Recovery Items Grid */}
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Recycle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recovery items found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first recovery item"}
              </p>
              <Button onClick={() => setIsRecoveryFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Recovery Item
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const StatusIcon = getStatusIcon(item.status);
              return (
                <Card key={item.id} className="border border-gray-100 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Recycle className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{item.brand} {item.model}</CardTitle>
                          <p className="text-sm text-gray-600">
                            Recovered: {new Date(item.recoveryDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Status:</span>
                        <Badge className={getStatusColor(item.status)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {item.status}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Condition:</span>
                        <Badge variant="outline">
                          {item.condition}
                        </Badge>
                      </div>
                      
                      {item.estimatedValue && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Est. Value:</span>
                          <span className="font-semibold text-success">
                            ${parseFloat(item.estimatedValue).toLocaleString()}
                          </span>
                        </div>
                      )}
                      
                      {item.repairCost && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Repair Cost:</span>
                          <span className="font-semibold text-error">
                            ${parseFloat(item.repairCost).toLocaleString()}
                          </span>
                        </div>
                      )}

                      {item.notes && (
                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {item.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Recovery Item Dialog */}
      <Dialog open={isRecoveryFormOpen} onOpenChange={setIsRecoveryFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Recovery Item</DialogTitle>
          </DialogHeader>
          <RecoveryForm
            onSuccess={() => setIsRecoveryFormOpen(false)}
            onCancel={() => setIsRecoveryFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
