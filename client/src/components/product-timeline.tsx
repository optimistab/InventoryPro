import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Plus, Package, ShoppingCart, RotateCcw, Wrench, AlertTriangle, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductDateEventSchema, EVENT_TYPES, type ProductDateEvent, type InsertProductDateEvent } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ProductTimelineProps {
  adsId: string;
  productName?: string;
}

export default function ProductTimeline({ adsId, productName }: ProductTimelineProps) {
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events, isLoading } = useQuery<ProductDateEvent[]>({
    queryKey: [`/api/product-date-events/product/₹{adsId}`],
  });

  const form = useForm<InsertProductDateEvent>({
    resolver: zodResolver(insertProductDateEventSchema),
    defaultValues: {
      adsId,
      eventDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    },
  });

  const addEventMutation = useMutation({
    mutationFn: (data: InsertProductDateEvent) => 
      apiRequest("/api/product-date-events", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/product-date-events/product/₹{adsId}`] });
      setIsAddEventOpen(false);
      form.reset({
        adsId,
        eventDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      });
      toast({
        title: "Success",
        description: "Date event added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add date event",
        variant: "destructive",
      });
    },
  });

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case EVENT_TYPES.PRODUCT_ADDED:
        return <Package className="h-4 w-4" />;
      case EVENT_TYPES.FIRST_SALE:
      case EVENT_TYPES.RESALE_TO_CUSTOMER:
        return <ShoppingCart className="h-4 w-4" />;
      case EVENT_TYPES.RETURNED_FROM_CUSTOMER:
        return <RotateCcw className="h-4 w-4" />;
      case EVENT_TYPES.REPAIR_STARTED:
      case EVENT_TYPES.REPAIR_COMPLETED:
        return <Wrench className="h-4 w-4" />;
      case EVENT_TYPES.RECOVERY_RECEIVED:
        return <RotateCcw className="h-4 w-4" />;
      case EVENT_TYPES.CUSTOMER_COMPLAINT:
      case EVENT_TYPES.WARRANTY_CLAIM:
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case EVENT_TYPES.PRODUCT_ADDED:
        return "bg-blue-100 text-blue-800";
      case EVENT_TYPES.FIRST_SALE:
      case EVENT_TYPES.RESALE_TO_CUSTOMER:
        return "bg-green-100 text-green-800";
      case EVENT_TYPES.RETURNED_FROM_CUSTOMER:
        return "bg-orange-100 text-orange-800";
      case EVENT_TYPES.REPAIR_STARTED:
        return "bg-yellow-100 text-yellow-800";
      case EVENT_TYPES.REPAIR_COMPLETED:
        return "bg-green-100 text-green-800";
      case EVENT_TYPES.RECOVERY_RECEIVED:
        return "bg-purple-100 text-purple-800";
      case EVENT_TYPES.CUSTOMER_COMPLAINT:
      case EVENT_TYPES.WARRANTY_CLAIM:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatEventType = (eventType: string) => {
    return eventType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const onSubmit = (data: InsertProductDateEvent) => {
    addEventMutation.mutate({
      ...data,
      createdAt: new Date().toISOString(),
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-8 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedEvents = events ? [...events].sort((a, b) => 
    new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
  ) : [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-gray-600" />
            Product Timeline {productName && `- ₹{productName}`}
          </CardTitle>
          <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Date Event</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="eventType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select event type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(EVENT_TYPES).map(([key, value]) => (
                              <SelectItem key={key} value={value}>
                                {formatEventType(value)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="eventDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Add any additional details..."
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddEventOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={addEventMutation.isPending}>
                      {addEventMutation.isPending ? "Adding..." : "Add Event"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {sortedEvents.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm">No timeline events recorded yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Add events to track this product's lifecycle
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedEvents.map((event, index) => (
              <div key={event.id} className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ₹{getEventColor(event.eventType)}`}>
                  {getEventIcon(event.eventType)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {formatEventType(event.eventType)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {new Date(event.eventDate).toLocaleDateString()}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(event.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {event.notes && (
                    <p className="text-sm text-gray-600 mt-1">{event.notes}</p>
                  )}
                  {index < sortedEvents.length - 1 && (
                    <div className="w-px h-4 bg-gray-200 ml-4 mt-2"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}