"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function StyleVariantsPage() {
  const [styleVariants, setStyleVariants] = useState([]);
  const [styleSummaries, setStyleSummaries] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<any>(null);
  const [formData, setFormData] = useState({
    style_summary_id: 0,
    style_name: "",
    style_id: "",
    colour_name: "",
    colour_code: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [variantsData, stylesData] = await Promise.all([
        api.styleVariants.getAll(),
        api.styles.getAll(),
      ]);
      setStyleVariants(variantsData);
      setStyleSummaries(stylesData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVariant) {
        await api.styleVariants.update(editingVariant.id, formData);
        toast.success("Style variant updated successfully");
      } else {
        await api.styleVariants.create(formData);
        toast.success("Style variant created successfully");
      }
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error("Failed to save style variant");
      console.error(error);
    }
  };

  const handleEdit = (variant: any) => {
    setEditingVariant(variant);
    setFormData({
      style_summary_id: variant.style_summary_id,
      style_name: variant.style_name,
      style_id: variant.style_id,
      colour_name: variant.colour_name,
      colour_code: variant.colour_code || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this style variant?")) {
      try {
        await api.styleVariants.delete(id);
        toast.success("Style variant deleted successfully");
        loadData();
      } catch (error) {
        toast.error("Failed to delete style variant");
        console.error(error);
      }
    }
  };

  const resetForm = () => {
    setEditingVariant(null);
    setFormData({
      style_summary_id: 0,
      style_name: "",
      style_id: "",
      colour_name: "",
      colour_code: "",
    });
  };

  const handleStyleSummaryChange = (styleSummaryId: string) => {
    const selectedStyle = styleSummaries.find(
      (style: any) => style.id === parseInt(styleSummaryId)
    );
    if (selectedStyle) {
      setFormData({
        ...formData,
        style_summary_id: selectedStyle.id,
        style_name: selectedStyle.style_name,
        style_id: selectedStyle.style_id,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Style Variants</h1>
          <p className="text-muted-foreground">
            Manage style variants with colors and specifications
          </p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Style Variant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingVariant ? "Edit Style Variant" : "Add New Style Variant"}
              </DialogTitle>
              <DialogDescription>
                {editingVariant
                  ? "Update style variant information"
                  : "Enter style variant details"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="style_summary">Style Summary *</Label>
                  <Select
                    value={formData.style_summary_id.toString()}
                    onValueChange={handleStyleSummaryChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a style" />
                    </SelectTrigger>
                    <SelectContent>
                      {styleSummaries.map((style: any) => (
                        <SelectItem key={style.id} value={style.id.toString()}>
                          {style.style_name} ({style.style_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="style_name">Style Name</Label>
                    <Input
                      id="style_name"
                      value={formData.style_name}
                      onChange={(e) =>
                        setFormData({ ...formData, style_name: e.target.value })
                      }
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="style_id">Style ID</Label>
                    <Input
                      id="style_id"
                      value={formData.style_id}
                      onChange={(e) =>
                        setFormData({ ...formData, style_id: e.target.value })
                      }
                      disabled
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="colour_name">Colour Name *</Label>
                    <Input
                      id="colour_name"
                      required
                      value={formData.colour_name}
                      onChange={(e) =>
                        setFormData({ ...formData, colour_name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="colour_code">Colour Code</Label>
                    <Input
                      id="colour_code"
                      value={formData.colour_code}
                      onChange={(e) =>
                        setFormData({ ...formData, colour_code: e.target.value })
                      }
                    />
                  </div>
                </div>

              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingVariant ? "Update" : "Create"} Style Variant
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Style Name</TableHead>
              <TableHead>Style ID</TableHead>
              <TableHead>Colour Name</TableHead>
              <TableHead>Colour Code</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {styleVariants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No style variants found. Add your first style variant to get started.
                </TableCell>
              </TableRow>
            ) : (
              styleVariants.map((variant: any) => (
                <TableRow key={variant.id}>
                  <TableCell className="font-medium">{variant.style_name}</TableCell>
                  <TableCell>{variant.style_id}</TableCell>
                  <TableCell>{variant.colour_name}</TableCell>
                  <TableCell>{variant.colour_code || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(variant)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(variant.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
