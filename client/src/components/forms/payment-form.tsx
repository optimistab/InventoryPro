import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, Search, DollarSign } from "lucide-react";

interface PaymentFormProps {
  orderId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface Order {
  id: number;
  adsId: string;
  customerId: number;
  orderId: string;
  orderStatus: string;
  requiredPieces: number;
  deliveredPieces: number;
  paymentPerPiece: string;
  securityDeposit: string | null;
  totalPayment: string;
  contractDate: string;
  deliveryDate: string | null;
  quotedPrice: string | null;
  discount: string | null;
  prodId: string | null;
  prodName: string | null;
  prodCategory: string | null;
  createdAt: string;
}

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  company: string | null;
  isActive: boolean;
}

export default function PaymentForm({ orderId, onSuccess, onCancel }: PaymentFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [paymentType, setPaymentType] = useState<string>("");
  const [referenceNumber, setReferenceNumber] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Search states
  const [orderSearch, setOrderSearch] = useState("");

  // Fetch data
  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  // Filter orders based on search
  const filteredOrders = orders?.filter(order =>
    order.orderId.toLowerCase().includes(orderSearch.toLowerCase()) ||
    order.adsId.includes(orderSearch) ||
    order.prodName?.toLowerCase().includes(orderSearch.toLowerCase())
  ) || [];

  // Set selected order if orderId is provided
  useEffect(() => {
    if (orderId && orders) {
      const order = orders.find(o => o.orderId === orderId);
      if (order) {
        setSelectedOrder(order);
      }
    }
  }, [orderId, orders]);

  // Calculate remaining balance
  const calculateRemainingBalance = () => {
    if (!selectedOrder) return 0;

    const totalPaid = 0; // TODO: Calculate from existing payments
    const totalAmount = parseFloat(selectedOrder.totalPayment);
    const securityDeposit = selectedOrder.securityDeposit ? parseFloat(selectedOrder.securityDeposit) : 0;

    return totalAmount + securityDeposit - totalPaid;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOrder) {
      toast({
        title: "Order required",
        description: "Please select an order",
        variant: "destructive",
      });
      return;
    }

    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast({
        title: "Invalid payment amount",
        description: "Please enter a valid payment amount",
        variant: "destructive",
      });
      return;
    }

    // TODO: Implement payment recording logic
    // This would typically create a payment record in the database
    toast({
      title: "Payment recorded successfully",
      description: `Payment of ₹{paymentAmount} recorded for Order ₹{selectedOrder.orderId}`,
    });

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Order Selection</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selectedOrder ? (
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search orders by Order ID, ADS ID, or Product Name..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>

              {ordersLoading ? (
                <div className="text-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <p className="text-sm text-gray-600 mt-2">Loading orders...</p>
                </div>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {filteredOrders.slice(0, 5).map((order) => (
                    <div
                      key={order.id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{order.orderId}</div>
                          <div className="text-sm text-gray-600">
                            {order.prodName || order.adsId} • Customer ID: {order.customerId}
                          </div>
                        </div>
                        <Badge
                          variant={order.orderStatus === "REN" ? "default" : "secondary"}
                        >
                          {order.orderStatus === "REN" ? "Rental" : "Purchase"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">{selectedOrder.orderId}</div>
                <div className="text-sm text-gray-600">
                  {selectedOrder.prodName || selectedOrder.adsId}
                </div>
                <div className="text-sm text-gray-600">
                  Customer ID: {selectedOrder.customerId}
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedOrder(null)}
              >
                Change Order
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Summary */}
      {selectedOrder && (
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Total Amount:</span>
                <span className="ml-2">₹{parseFloat(selectedOrder.totalPayment).toFixed(2)}</span>
              </div>
              <div>
                <span className="font-medium">Security Deposit:</span>
                <span className="ml-2">
                  {selectedOrder.securityDeposit
                    ? `₹{parseFloat(selectedOrder.securityDeposit).toFixed(2)}`
                    : "N/A"
                  }
                </span>
              </div>
              <div>
                <span className="font-medium">Remaining Balance:</span>
                <span className="ml-2 text-green-600 font-semibold">
                  ₹{calculateRemainingBalance().toFixed(2)}
                </span>
              </div>
              <div>
                <span className="font-medium">Order Type:</span>
                <Badge
                  variant={selectedOrder.orderStatus === "REN" ? "default" : "secondary"}
                  className="ml-2"
                >
                  {selectedOrder.orderStatus === "REN" ? "Rental" : "Purchase"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Payment Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentAmount">Payment Amount *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="paymentAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date *</Label>
              <Input
                id="paymentDate"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="debit_card">Debit Card</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentType">Payment Type</Label>
              <Select value={paymentType} onValueChange={setPaymentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Payment</SelectItem>
                  <SelectItem value="partial">Partial Payment</SelectItem>
                  <SelectItem value="advance">Advance Payment</SelectItem>
                  <SelectItem value="security_deposit">Security Deposit</SelectItem>
                  <SelectItem value="monthly_installment">Monthly Installment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="referenceNumber">Reference Number (Optional)</Label>
            <Input
              id="referenceNumber"
              type="text"
              placeholder="Transaction ID, Cheque Number, etc."
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about the payment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
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
          disabled={!selectedOrder || !paymentAmount}
        >
          Record Payment
        </Button>
      </div>
    </form>
  );
}