"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, ImageUploadIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ApiError } from "@/lib/api/http";
import {
  useAddPortfolioItem,
  useDeletePortfolioItem,
} from "@/lib/hooks/use-vendors";
import type { PortfolioItem } from "@/lib/api/types";

/** Add/remove portfolio items on the vendor's own profile. */
export function PortfolioManager({ items }: { items: PortfolioItem[] }) {
  const addItem = useAddPortfolioItem();
  const deleteItem = useDeletePortfolioItem();

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  const pickFile = (next: File | null) => {
    setFile(next);
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    objectUrlRef.current = next ? URL.createObjectURL(next) : null;
    setPreview(objectUrlRef.current);
  };

  const resetForm = () => {
    pickFile(null);
    setTitle("");
    setDescription("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onAdd = () => {
    if (!file) {
      toast.error("Choose an image first");
      return;
    }
    addItem.mutate(
      { image: file, title: title || undefined, description: description || undefined },
      {
        onSuccess: () => {
          toast.success("Portfolio item added");
          resetForm();
        },
        onError: (error) =>
          toast.error(
            error instanceof ApiError ? error.message : "Couldn't add item",
          ),
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-md border border-border bg-muted"
              >
                <div className="relative aspect-square w-full">
                  <Image
                    src={item.image}
                    alt={item.title ?? "Portfolio item"}
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                </div>
                {item.title && (
                  <p className="truncate px-2 py-1 text-xs font-medium">
                    {item.title}
                  </p>
                )}
                <ConfirmDialog
                  title="Remove this item?"
                  confirmLabel="Remove"
                  destructive
                  pending={deleteItem.isPending}
                  onConfirm={() =>
                    deleteItem.mutate(item.id, {
                      onError: (error) =>
                        toast.error(
                          error instanceof ApiError
                            ? error.message
                            : "Couldn't remove item",
                        ),
                    })
                  }
                  trigger={
                    <button
                      type="button"
                      aria-label="Remove item"
                      className="bg-background/80 text-foreground absolute top-1 right-1 rounded-full p-0.5 opacity-0 outline-none transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                      <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
                    </button>
                  }
                />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ImageUploadIcon}
            title="No portfolio items yet"
            description="Add photos of past work so clients can see your quality."
          />
        )}

        {/* Add form */}
        <div className="space-y-3 rounded-md border border-dashed border-border p-3">
          <div className="space-y-2">
            <Label>Add an item</Label>
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            />
          </div>
          {preview && (
            <div className="relative h-32 w-32 overflow-hidden rounded-md border border-border">
              <Image
                src={preview}
                alt="Preview"
                fill
                sizes="128px"
                className="object-cover"
              />
            </div>
          )}
          <Input
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex justify-end">
            <Button type="button" onClick={onAdd} disabled={addItem.isPending}>
              {addItem.isPending ? "Adding…" : "Add item"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
