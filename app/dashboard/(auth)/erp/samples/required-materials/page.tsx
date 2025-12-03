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

export default function RequiredMaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [styleVariants, setStyleVariants] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const [formData, setFormData] = useState({
    style_variant_id: 0,
    style_name: "",
    style_id: "",
    material: "",
    uom: "",
    consumption_per_piece: 0,
    remarks: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [materialsData, variantsData] = await Promise.all([
        api.requiredMaterials.getAll(),
        api.styleVariants.getAll(),
      ]);
      setMaterials(materialsData);
      setStyleVariants(variantsData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMaterial) {
        await api.requiredMaterials.update(editingMaterial.id, formData);
        toast.success("Required material updated successfully");
      } else {
        await api.requiredMaterials.create(formData);
        toast.success("Required material created successfully");
      }
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error("Failed to save required material");
      console.error(error);
    }
  };

  const handleEdit = (material: any) => {
    setEditingMaterial(material);
    setFormData({
      style_variant_id: material.style_variant_id,
      style_name: material.style_name,
      style_id: material.style_id,
      material: material.material,
      uom: material.uom,
      consumption_per_piece: material.consumption_per_piece,
      remarks: material.remarks || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this required material?")) {
      try {
        await api.requiredMaterials.delete(id);
        toast.success("Required material deleted successfully");
        loadData();
      } catch (error) {
        toast.error("Failed to delete required material");
        console.error(error);
      }
    }
  };

  const resetForm = () => {
    setEditingMaterial(null);
    setFormData({
      style_variant_id: 0,
      style_name: "",
      style_id: "",
      material: "",
      uom: "",
      consumption_per_piece: 0,
      remarks: "",
    });
  };

  const handleStyleVariantChange = (variantId: string) => {
    const selectedVariant = styleVariants.find(
      (variant: any) => variant.id === parseInt(variantId)
    );
    if (selectedVariant) {
      setFormData({
        ...formData,
        style_variant_id: selectedVariant.id,
        style_name: selectedVariant.style_name,
        style_id: selectedVariant.style_id,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Required Materials</h1>
          <p className="text-muted-foreground">
            Manage material requirements for style variants
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
              Add Required Material
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMaterial
                  ? "Edit Required Material"
                  : "Add New Required Material"}
              </DialogTitle>
              <DialogDescription>
                {editingMaterial
                  ? "Update required material information"
                  : "Enter required material details"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="style_variant">Style Variant *</Label>
                  <Select
                    value={formData.style_variant_id.toString()}
                    onValueChange={handleStyleVariantChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a style variant" />
                    </SelectTrigger>
                    <SelectContent>
                      {styleVariants.map((variant: any) => (
                        <SelectItem key={variant.id} value={variant.id.toString()}>
                          {variant.style_name} - {variant.colour_name} (
                          {variant.style_id})
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

                <div className="space-y-2">
                  <Label htmlFor="material">Material *</Label>
                  <Input
                    id="material"
                    required
                    value={formData.material}
                    onChange={(e) =>
                      setFormData({ ...formData, material: e.target.value })
                    }
                    placeholder="e.g., Cotton Yarn, Polyester Fabric, Button"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="uom">UOM (Unit of Measurement) *</Label>
                    <Select
                      value={formData.uom}
                      onValueChange={(value) =>
                        setFormData({ ...formData, uom: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select UOM" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">Kilogram (kg)</SelectItem>
                        <SelectItem value="meter">Meter (m)</SelectItem>
                        <SelectItem value="piece">Piece (pcs)</SelectItem>
                        <SelectItem value="yard">Yard (yd)</SelectItem>
                        <SelectItem value="liter">Liter (L)</SelectItem>
                        <SelectItem value="dozen">Dozen (dz)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="consumption_per_piece">
                      Consumption per Piece *
                    </Label>
                    <Input
                      id="consumption_per_piece"
                      type="number"
                      step="0.001"
                      min="0"
                      required
                      value={formData.consumption_per_piece || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          consumption_per_piece: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={formData.remarks}
                    onChange={(e) =>
                      setFormData({ ...formData, remarks: e.target.value })
                    }
                    rows={3}
                    placeholder="Optional notes or comments"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingMaterial ? "Update" : "Create"} Required Material
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
              <TableHead>Style Variant ID</TableHead>
              <TableHead>Style Name</TableHead>
              <TableHead>Style ID</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>UOM</TableHead>
              <TableHead>Consumption/Piece</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No required materials found. Add your first required material to get
                  started.
                </TableCell>
              </TableRow>
            ) : (
              materials.map((material: any) => (
                <TableRow key={material.id}>
                  <TableCell className="font-medium">
                    {material.style_variant_id}
                  </TableCell>
                  <TableCell>{material.style_name}</TableCell>
                  <TableCell>{material.style_id}</TableCell>
                  <TableCell>{material.material}</TableCell>
                  <TableCell>{material.uom}</TableCell>
                  <TableCell>{material.consumption_per_piece}</TableCell>
                  <TableCell>{material.remarks || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(material)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(material.id)}
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
