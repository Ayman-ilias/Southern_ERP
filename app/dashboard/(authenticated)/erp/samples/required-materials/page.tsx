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
import { PlusCircle, Edit, Trash2, Search, X, ArrowRight, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { uomUnits, getCompatibleUoms, convertUom } from "@/lib/uom-units";

export default function RequiredMaterialsPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<any[]>([]);
  const [displayedMaterials, setDisplayedMaterials] = useState<any[]>([]);
  const [styleVariants, setStyleVariants] = useState<any[]>([]);
  const [materialMaster, setMaterialMaster] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const [rowLimit, setRowLimit] = useState<number | "all">(50);
  const [filters, setFilters] = useState({
    search: "",
    style: "",
    material: "",
    uom: "",
  });
  const [formData, setFormData] = useState({
    style_variant_id: 0,
    style_name: "",
    style_id: "",
    material: "",
    uom: "",
    consumption_per_piece: 0,
    converted_uom: "",
    converted_consumption: 0,
    remarks: "",
  });
  const [compatibleUoms, setCompatibleUoms] = useState<string[]>([]);
  const [showConversion, setShowConversion] = useState(false);
  
  // Multiple materials support
  const [selectedMaterials, setSelectedMaterials] = useState<Array<{
    material: string;
    uom: string;
    consumption_per_piece: number;
    converted_uom?: string;
    converted_consumption?: number;
    remarks?: string;
  }>>([]);
  const [currentMaterial, setCurrentMaterial] = useState({
    material: "",
    uom: "",
    consumption_per_piece: 0,
    converted_uom: "",
    converted_consumption: 0,
    remarks: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [materialsData, variantsData, materialMasterData] = await Promise.all([
        api.requiredMaterials.getAll(),
        api.styleVariants.getAll(),
        api.materials.getAll(),
      ]);
      setMaterials(materialsData);
      setStyleVariants(variantsData);
      setMaterialMaster(materialMasterData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    }
  };

  // Extract unique values for filters
  const uniqueStyles = [...new Set(materials.map((m: any) => m.style_name).filter(Boolean))].sort();
  const uniqueMaterials = [...new Set(materials.map((m: any) => m.material).filter(Boolean))].sort();
  const uniqueUoms = [...new Set(materials.map((m: any) => m.uom).filter(Boolean))].sort();

  // Clear filters function
  const clearFilters = () => {
    setFilters({ search: "", style: "", material: "", uom: "" });
  };

  // Apply filters
  useEffect(() => {
    let result = [...materials];

    // Search filter
    if (filters.search && filters.search !== "all") {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((mat: any) =>
        mat.style_name?.toLowerCase().includes(searchLower) ||
        mat.style_id?.toLowerCase().includes(searchLower) ||
        mat.material?.toLowerCase().includes(searchLower) ||
        mat.remarks?.toLowerCase().includes(searchLower)
      );
    }

    // Style filter
    if (filters.style && filters.style !== "all") {
      result = result.filter((mat: any) => mat.style_name === filters.style);
    }

    // Material filter
    if (filters.material && filters.material !== "all") {
      result = result.filter((mat: any) => mat.material === filters.material);
    }

    // UOM filter
    if (filters.uom && filters.uom !== "all") {
      result = result.filter((mat: any) => mat.uom === filters.uom);
    }

    setFilteredMaterials(result);
  }, [materials, filters]);

  // Apply row limit
  useEffect(() => {
    if (rowLimit === "all") {
      setDisplayedMaterials(filteredMaterials);
    } else {
      setDisplayedMaterials(filteredMaterials.slice(0, rowLimit));
    }
  }, [filteredMaterials, rowLimit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMaterial) {
        // Single material update
        const dataToSubmit = {
          ...formData,
          converted_uom: showConversion && formData.converted_uom ? formData.converted_uom : null,
          converted_consumption: showConversion && formData.converted_consumption ? formData.converted_consumption : null,
        };
        await api.requiredMaterials.update(editingMaterial.id, dataToSubmit);
        toast.success("Required material updated successfully");
        setIsDialogOpen(false);
        resetForm();
        loadData();
      } else {
        // Multiple materials creation
        if (selectedMaterials.length === 0) {
          toast.error("Please add at least one material");
          return;
        }

        const createPromises = selectedMaterials.map((mat) => {
          const dataToSubmit = {
            style_variant_id: formData.style_variant_id,
            style_name: formData.style_name,
            style_id: formData.style_id,
            material: mat.material,
            uom: mat.uom,
            consumption_per_piece: mat.consumption_per_piece,
            converted_uom: mat.converted_uom || null,
            converted_consumption: mat.converted_consumption || null,
            remarks: mat.remarks || "",
          };
          return api.requiredMaterials.create(dataToSubmit);
        });

        await Promise.all(createPromises);
        toast.success(`${selectedMaterials.length} required material(s) created successfully`);
        setIsDialogOpen(false);
        resetForm();
        loadData();
      }
    } catch (error) {
      toast.error("Failed to save required material(s)");
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
      converted_uom: material.converted_uom || "",
      converted_consumption: material.converted_consumption || 0,
      remarks: material.remarks || "",
    });
    // Set compatible UOMs
    const compatible = getCompatibleUoms(material.uom);
    setCompatibleUoms(compatible);
    // Show conversion section if material has conversion data
    setShowConversion(!!material.converted_uom);
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
      converted_uom: "",
      converted_consumption: 0,
      remarks: "",
    });
    setCompatibleUoms([]);
    setShowConversion(false);
    setSelectedMaterials([]);
    setCurrentMaterial({
      material: "",
      uom: "",
      consumption_per_piece: 0,
      converted_uom: "",
      converted_consumption: 0,
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

  const handleMaterialChange = (materialName: string) => {
    const selectedMaterial = materialMaster.find((m: any) => m.material_name === materialName);
    const newUom = selectedMaterial?.uom || "";

    if (editingMaterial) {
      // For editing, update formData
      setFormData({
        ...formData,
        material: materialName,
        uom: newUom,
      });
    } else {
      // For new materials, update currentMaterial
      setCurrentMaterial({
        ...currentMaterial,
        material: materialName,
        uom: newUom,
      });
    }

    // Update compatible UOMs when UOM changes
    if (newUom) {
      const compatible = getCompatibleUoms(newUom);
      setCompatibleUoms(compatible);
    }
  };

  const addMaterialToList = () => {
    if (!currentMaterial.material || !currentMaterial.uom || currentMaterial.consumption_per_piece <= 0) {
      toast.error("Please fill in material, UOM, and consumption per piece");
      return;
    }

    // Check if material already added
    if (selectedMaterials.some(m => m.material === currentMaterial.material)) {
      toast.error("This material is already in the list");
      return;
    }

    setSelectedMaterials([...selectedMaterials, { ...currentMaterial }]);
    
    // Reset current material form
    setCurrentMaterial({
      material: "",
      uom: "",
      consumption_per_piece: 0,
      converted_uom: "",
      converted_consumption: 0,
      remarks: "",
    });
    setCompatibleUoms([]);
    setShowConversion(false);
    toast.success("Material added to list");
  };

  const removeMaterialFromList = (index: number) => {
    setSelectedMaterials(selectedMaterials.filter((_, i) => i !== index));
  };

  const handleConversionUomChange = (targetUom: string) => {
    if (!formData.uom || !formData.consumption_per_piece || !targetUom) {
      return;
    }

    const converted = convertUom(formData.consumption_per_piece, formData.uom, targetUom);

    if (converted !== null) {
      setFormData({
        ...formData,
        converted_uom: targetUom,
        converted_consumption: converted,
      });
      toast.success(`Converted to ${targetUom}: ${converted.toFixed(4)}`);
    } else {
      toast.error("Unable to convert between these units");
    }
  };

  const toggleConversion = () => {
    const newShowConversion = !showConversion;
    setShowConversion(newShowConversion);

    // Clear conversion data if hiding
    if (!newShowConversion) {
      setFormData({
        ...formData,
        converted_uom: "",
        converted_consumption: 0,
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

                {editingMaterial ? (
                  // Single material edit mode
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="material">Material *</Label>
                      <Select
                        value={formData.material}
                        onValueChange={handleMaterialChange}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select material from master list" />
                        </SelectTrigger>
                        <SelectContent>
                          {materialMaster.map((mat: any) => (
                            <SelectItem key={mat.id} value={mat.material_name}>
                              {mat.material_name} ({mat.uom})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="uom">UOM (Unit of Measurement) *</Label>
                        <Input
                          id="uom"
                          required
                          value={formData.uom}
                          onChange={(e) =>
                            setFormData({ ...formData, uom: e.target.value })
                          }
                          disabled
                          placeholder="Auto-filled from material"
                        />
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
                  </>
                ) : (
                  // Multiple materials add mode
                  <>
                    <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">Add Materials</Label>
                        <span className="text-sm text-muted-foreground">
                          {selectedMaterials.length} material(s) added
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="current_material">Material *</Label>
                          <Select
                            value={currentMaterial.material}
                            onValueChange={(value) => {
                              const selectedMaterial = materialMaster.find((m: any) => m.material_name === value);
                              const newUom = selectedMaterial?.uom || "";
                              setCurrentMaterial({
                                ...currentMaterial,
                                material: value,
                                uom: newUom,
                              });
                              if (newUom) {
                                const compatible = getCompatibleUoms(newUom);
                                setCompatibleUoms(compatible);
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select material from master list" />
                            </SelectTrigger>
                            <SelectContent>
                              {materialMaster
                                .filter((mat: any) => !selectedMaterials.some(m => m.material === mat.material_name))
                                .map((mat: any) => (
                                  <SelectItem key={mat.id} value={mat.material_name}>
                                    {mat.material_name} ({mat.uom})
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="current_uom">UOM *</Label>
                            <Input
                              id="current_uom"
                              value={currentMaterial.uom}
                              disabled
                              placeholder="Auto-filled from material"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="current_consumption">
                              Consumption per Piece *
                            </Label>
                            <Input
                              id="current_consumption"
                              type="number"
                              step="0.001"
                              min="0"
                              value={currentMaterial.consumption_per_piece || ""}
                              onChange={(e) =>
                                setCurrentMaterial({
                                  ...currentMaterial,
                                  consumption_per_piece: parseFloat(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                        </div>

                        <Button
                          type="button"
                          onClick={addMaterialToList}
                          className="w-full"
                          variant="outline"
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add Material to List
                        </Button>
                      </div>
                    </div>

                    {/* Selected Materials List */}
                    {selectedMaterials.length > 0 && (
                      <div className="space-y-2">
                        <Label>Selected Materials ({selectedMaterials.length})</Label>
                        <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                          {selectedMaterials.map((mat, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-background border rounded-md"
                            >
                              <div className="flex-1">
                                <div className="font-medium">{mat.material}</div>
                                <div className="text-sm text-muted-foreground">
                                  {mat.consumption_per_piece} {mat.uom}
                                  {mat.converted_uom && mat.converted_consumption && (
                                    <span className="ml-2">
                                      ({mat.converted_consumption.toFixed(4)} {mat.converted_uom})
                                    </span>
                                  )}
                                </div>
                                {mat.remarks && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {mat.remarks}
                                  </div>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeMaterialFromList(index)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* UOM Conversion Section - Only for editing or current material */}
                {compatibleUoms.length > 0 && (editingMaterial ? (
                  <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">UOM Conversion (Optional)</Label>
                      <Button
                        type="button"
                        variant={showConversion ? "default" : "outline"}
                        size="sm"
                        onClick={toggleConversion}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {showConversion ? "Hide Conversion" : "Convert UOM"}
                      </Button>
                    </div>

                    {showConversion && (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 space-y-2">
                            <Label className="text-sm text-muted-foreground">From</Label>
                            <div className="flex items-center gap-2 p-3 bg-background border rounded-md">
                              <span className="font-medium">{formData.consumption_per_piece}</span>
                              <span className="text-muted-foreground">{formData.uom}</span>
                            </div>
                          </div>

                          <ArrowRight className="h-5 w-5 text-muted-foreground mt-6" />

                          <div className="flex-1 space-y-2">
                            <Label htmlFor="converted_uom">Convert To</Label>
                            <Select
                              value={formData.converted_uom}
                              onValueChange={handleConversionUomChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select target UOM" />
                              </SelectTrigger>
                              <SelectContent>
                                {compatibleUoms.map((uom) => (
                                  <SelectItem key={uom} value={uom}>
                                    {uom}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {formData.converted_uom && formData.converted_consumption > 0 && (
                          <div className="p-3 bg-primary/5 border border-primary/20 rounded-md">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Converted Value:</span>
                              <span className="text-lg font-bold text-primary">
                                {formData.converted_consumption.toFixed(4)} {formData.converted_uom}
                              </span>
                            </div>
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground">
                          Note: Conversion will only be saved if you complete the conversion above.
                        </p>
                      </>
                    )}
                  </div>
                ) : currentMaterial.material && (
                  <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">UOM Conversion (Optional)</Label>
                      <Button
                        type="button"
                        variant={showConversion ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const newShowConversion = !showConversion;
                          setShowConversion(newShowConversion);
                          if (!newShowConversion) {
                            setCurrentMaterial({
                              ...currentMaterial,
                              converted_uom: "",
                              converted_consumption: 0,
                            });
                          }
                        }}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {showConversion ? "Hide Conversion" : "Convert UOM"}
                      </Button>
                    </div>

                    {showConversion && (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 space-y-2">
                            <Label className="text-sm text-muted-foreground">From</Label>
                            <div className="flex items-center gap-2 p-3 bg-background border rounded-md">
                              <span className="font-medium">{currentMaterial.consumption_per_piece}</span>
                              <span className="text-muted-foreground">{currentMaterial.uom}</span>
                            </div>
                          </div>

                          <ArrowRight className="h-5 w-5 text-muted-foreground mt-6" />

                          <div className="flex-1 space-y-2">
                            <Label>Convert To</Label>
                            <Select
                              value={currentMaterial.converted_uom}
                              onValueChange={(targetUom: string) => {
                                if (!currentMaterial.uom || !currentMaterial.consumption_per_piece || !targetUom) {
                                  return;
                                }
                                const converted = convertUom(currentMaterial.consumption_per_piece, currentMaterial.uom, targetUom);
                                if (converted !== null) {
                                  setCurrentMaterial({
                                    ...currentMaterial,
                                    converted_uom: targetUom,
                                    converted_consumption: converted,
                                  });
                                  toast.success(`Converted to ${targetUom}: ${converted.toFixed(4)}`);
                                } else {
                                  toast.error("Unable to convert between these units");
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select target UOM" />
                              </SelectTrigger>
                              <SelectContent>
                                {compatibleUoms.map((uom) => (
                                  <SelectItem key={uom} value={uom}>
                                    {uom}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {currentMaterial.converted_uom && currentMaterial.converted_consumption > 0 && (
                          <div className="p-3 bg-primary/5 border border-primary/20 rounded-md">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Converted Value:</span>
                              <span className="text-lg font-bold text-primary">
                                {currentMaterial.converted_consumption.toFixed(4)} {currentMaterial.converted_uom}
                              </span>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}

                {editingMaterial ? (
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
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="current_remarks">Remarks (Optional)</Label>
                    <Textarea
                      id="current_remarks"
                      value={currentMaterial.remarks}
                      onChange={(e) =>
                        setCurrentMaterial({ ...currentMaterial, remarks: e.target.value })
                      }
                      rows={2}
                      placeholder="Optional notes for this material"
                    />
                  </div>
                )}
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

      {/* Filters */}
      <div className="rounded-md border p-4 bg-card">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search style, material, remarks..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>
          <Select
            value={filters.style}
            onValueChange={(value) => setFilters({ ...filters, style: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Styles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Styles</SelectItem>
              {uniqueStyles.map((style: string, idx) => (
                <SelectItem key={`style-${idx}`} value={style}>
                  {style}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.material}
            onValueChange={(value) => setFilters({ ...filters, material: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Materials" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Materials</SelectItem>
              {uniqueMaterials.map((material: string, idx) => (
                <SelectItem key={`material-${idx}`} value={material}>
                  {material}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.uom}
            onValueChange={(value) => setFilters({ ...filters, uom: value })}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All UOMs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All UOMs</SelectItem>
              {uniqueUoms.map((uom: string, idx) => (
                <SelectItem key={`uom-${idx}`} value={uom}>
                  {uom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={rowLimit.toString()}
            onValueChange={(value) => setRowLimit(value === "all" ? "all" : parseInt(value))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Rows" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">Show 10</SelectItem>
              <SelectItem value="20">Show 20</SelectItem>
              <SelectItem value="50">Show 50</SelectItem>
              <SelectItem value="all">Show All</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={clearFilters} title="Clear filters">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          Showing {displayedMaterials.length} of {filteredMaterials.length} filtered ({materials.length} total) required materials
        </div>
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
              <TableHead>Converted To</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedMaterials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  {materials.length === 0
                    ? "No required materials found. Add your first required material to get started."
                    : "No required materials match your filters. Try adjusting your search criteria."}
                </TableCell>
              </TableRow>
            ) : (
              displayedMaterials.map((material: any) => (
                <TableRow key={material.id}>
                  <TableCell className="font-medium">
                    {material.style_variant_id}
                  </TableCell>
                  <TableCell>{material.style_name}</TableCell>
                  <TableCell>{material.style_id}</TableCell>
                  <TableCell>{material.material}</TableCell>
                  <TableCell>{material.uom}</TableCell>
                  <TableCell>{material.consumption_per_piece}</TableCell>
                  <TableCell>
                    {material.converted_uom && material.converted_consumption ? (
                      <div className="flex flex-col">
                        <span className="font-medium text-primary">
                          {material.converted_consumption.toFixed(4)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {material.converted_uom}
                        </span>
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
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
