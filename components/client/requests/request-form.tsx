"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { ImageUploadIcon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { APPAREL_TYPES } from "@/lib/labels";
import {
  useAddReferenceImages,
  useCreateRequest,
  useUpdateRequest,
} from "@/lib/hooks/use-requests";
import {
  requestFormSchema,
  type RequestFormValues,
} from "@/lib/validation/request";
import type { DesignRequest } from "@/lib/api/types";

/**
 * Create/edit form for a design request. The endpoint is multipart (design
 * image), so the hooks build `FormData` at submit. On create we also upload any
 * reference images via the dedicated endpoint; on edit those are managed on the
 * detail page. Validation is inline (Zod → FormMessage); the outcome is a toast.
 */
export function RequestForm({ request }: { request?: DesignRequest }) {
  const mode = request ? "edit" : "create";
  const router = useRouter();

  const createRequest = useCreateRequest();
  const updateRequest = useUpdateRequest(request?.id ?? "");
  // Bound to the created id per call — the request doesn't exist yet on create.
  const addReferenceImages = useAddReferenceImages();

  const [designPreview, setDesignPreview] = useState<string | null>(
    request?.design_image ?? null,
  );
  // Track a stable id per selected file — names can collide, so they can't be
  // React keys on their own.
  const [referenceFiles, setReferenceFiles] = useState<
    { id: string; file: File }[]
  >([]);
  // Track the blob URL so we can revoke it (the initial value is a remote URL).
  const objectUrlRef = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      title: request?.title ?? "",
      // Empty until the user picks; validated as a required enum on submit.
      apparel_type: (request?.apparel_type ??
        "") as RequestFormValues["apparel_type"],
      quantity: request?.quantity ?? 1,
      sizes: request?.sizes ?? "",
      color_preferences: request?.color_preferences ?? "",
      deadline: request?.deadline ? request.deadline.slice(0, 10) : "",
      description: request?.description ?? "",
      design_image: undefined,
    },
  });

  const pending =
    createRequest.isPending ||
    updateRequest.isPending ||
    addReferenceImages.isPending;

  const onSubmit = (values: RequestFormValues) => {
    if (mode === "edit" && request) {
      updateRequest.mutate(values, {
        onSuccess: (updated) => {
          toast.success("Request updated");
          router.push(`/client/requests/${updated.id ?? request.id}`);
        },
        onError: (error) =>
          toast.error(
            error instanceof ApiError ? error.message : "Couldn't update request",
          ),
      });
      return;
    }

    createRequest.mutate(values, {
      onSuccess: async (created) => {
        // Upload reference images after the request exists (separate endpoint).
        if (referenceFiles.length > 0) {
          try {
            await addReferenceImages.mutateAsync({
              requestId: created.id,
              files: referenceFiles.map((r) => r.file),
            });
          } catch {
            toast.warning(
              "Request created, but some reference images failed to upload.",
            );
            router.push(`/client/requests/${created.id}`);
            return;
          }
        }
        toast.success("Request posted");
        router.push(`/client/requests/${created.id}`);
      },
      onError: (error) =>
        toast.error(
          error instanceof ApiError ? error.message : "Couldn't post request",
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Branded cotton hoodies" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="apparel_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apparel type</FormLabel>
                    <Select
                      items={APPAREL_TYPES}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {APPAREL_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
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
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        step={1}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="sizes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sizes</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. S, M, L, XL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color_preferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color preferences</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Navy, heather grey" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deadline</FormLabel>
                  <FormControl>
                    <Input type="date" className="w-fit" {...field} />
                  </FormControl>
                  <FormDescription>
                    When you need the finished order delivered.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Fabric, printing/embroidery, packaging, and any other specs vendors should know."
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

        <Card>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="design_image"
              render={({ field: { onChange } }) => (
                <FormItem>
                  <FormLabel>Design image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        onChange(file);
                        if (objectUrlRef.current) {
                          URL.revokeObjectURL(objectUrlRef.current);
                          objectUrlRef.current = null;
                        }
                        objectUrlRef.current = file
                          ? URL.createObjectURL(file)
                          : null;
                        setDesignPreview(objectUrlRef.current);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    The main mockup or artwork (max 5 MB).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {designPreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={designPreview}
                alt="Design preview"
                className="h-40 w-auto rounded-md border border-border object-cover"
              />
            )}

            {mode === "create" && (
              <div className="space-y-2">
                <Label>Reference images (optional)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) =>
                    setReferenceFiles(
                      Array.from(e.target.files ?? []).map((file) => ({
                        id: crypto.randomUUID(),
                        file,
                      })),
                    )
                  }
                />
                <p className="text-muted-foreground text-xs">
                  Extra artwork or examples. You can add more later.
                </p>
                {referenceFiles.length > 0 && (
                  <ul className="text-muted-foreground space-y-1 text-xs">
                    {referenceFiles.map(({ id: fileId, file }) => (
                      <li key={fileId} className="flex items-center gap-1.5">
                        <HugeiconsIcon icon={ImageUploadIcon} className="size-3.5" />
                        <span className="truncate">{file.name}</span>
                        <button
                          type="button"
                          aria-label={`Remove ${file.name}`}
                          className="hover:text-foreground"
                          onClick={() =>
                            setReferenceFiles((prev) =>
                              prev.filter((f) => f.id !== fileId),
                            )
                          }
                        >
                          <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending
              ? "Saving…"
              : mode === "edit"
                ? "Save changes"
                : "Post request"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
