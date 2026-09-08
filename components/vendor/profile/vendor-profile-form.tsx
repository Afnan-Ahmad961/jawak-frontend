"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ApiError } from "@/lib/api/http";
import {
  useCreateVendorProfile,
  useUpdateVendorProfile,
} from "@/lib/hooks/use-vendors";
import {
  vendorProfileFormSchema,
  type VendorProfileFormValues,
} from "@/lib/validation/vendor-profile";
import type { Vendor, VendorProfilePayload } from "@/lib/api/types";

/**
 * Create/edit the vendor profile. Creating one promotes the account to a vendor
 * (Overview.md §Vendor). `specialties` is entered comma-separated and sent as a
 * string[] (JSONField). Inline validation; toast on outcome.
 */
export function VendorProfileForm({
  vendor,
  onCreated,
}: {
  vendor?: Vendor | null;
  onCreated?: () => void;
}) {
  const mode = vendor ? "edit" : "create";
  const createProfile = useCreateVendorProfile();
  const updateProfile = useUpdateVendorProfile();

  const form = useForm<VendorProfileFormValues>({
    resolver: zodResolver(vendorProfileFormSchema),
    defaultValues: {
      company_name: vendor?.company_name ?? "",
      location: vendor?.location ?? "",
      specialties: (vendor?.specialties ?? []).join(", "),
      capacity:
        vendor?.capacity === null || vendor?.capacity === undefined
          ? undefined
          : Number(vendor.capacity),
      bio: vendor?.bio ?? "",
    },
  });

  const pending = createProfile.isPending || updateProfile.isPending;

  const onSubmit = (values: VendorProfileFormValues) => {
    const payload: VendorProfilePayload = {
      company_name: values.company_name,
      location: values.location || undefined,
      specialties: values.specialties
        ? values.specialties
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
      capacity: values.capacity,
      bio: values.bio || undefined,
    };

    const mutation = mode === "edit" ? updateProfile : createProfile;
    mutation.mutate(payload, {
      onSuccess: () => {
        toast.success(
          mode === "edit" ? "Profile updated" : "Profile created",
        );
        onCreated?.();
      },
      onError: (error) =>
        toast.error(
          error instanceof ApiError ? error.message : "Couldn't save profile",
        ),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Byon Textile Co." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Karachi, PK" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly capacity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        placeholder="e.g. 5000"
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : e.target.valueAsNumber,
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>Units you can produce per month.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="specialties"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specialties</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. hoodies, activewear, embroidery"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Comma-separated. Matching requests notify you automatically.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>About</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell clients about your factory, equipment, certifications, and typical turnaround."
                      className="min-h-28"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={pending}>
            {pending
              ? "Saving…"
              : mode === "edit"
                ? "Save changes"
                : "Create profile"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
