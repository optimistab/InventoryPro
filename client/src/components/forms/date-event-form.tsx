import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { insertProductDateEventSchema, EVENT_TYPES, type InsertProductDateEvent } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DateEventFormProps {
  adsId: string;
  onSuccess?: () => void;
}

export default function DateEventForm({ adsId, onSuccess }: DateEventFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertProductDateEvent>({
    resolver: zodResolver(insertProductDateEventSchema),
    defaultValues: {
      adsId,
      eventDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    },
  });

  const mutation = useMutation({
    mutationFn: (data: InsertProductDateEvent) => 
      apiRequest("/api/product-date-events", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/product-date-events/product/₹{adsId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/product-date-events"] });
      form.reset({
        adsId,
        eventDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      });
      toast({
        title: "Success",
        description: "Date event added successfully",
      });
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to add date event",
        variant: "destructive",
      });
    },
  });

  const formatEventType = (eventType: string) => {
    return eventType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const onSubmit = (data: InsertProductDateEvent) => {
    mutation.mutate({
      ...data,
      createdAt: new Date().toISOString(),
    });
  };

  return (
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
                  placeholder="Add any additional details about this event..."
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={mutation.isPending} className="w-full">
          {mutation.isPending ? "Adding Event..." : "Add Date Event"}
        </Button>
      </form>
    </Form>
  );
}