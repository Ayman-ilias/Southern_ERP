"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Search, Edit, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { SizeSelector } from "@/components/ui/size-selector";

export default function SampleTNAPage() {
  const [tnaRecords, setTnaRecords] = useState<any[]>([]);
  const [filteredTnaRecords, setFilteredTnaRecords] = useState<any[]>([]);
  const [samples, setSamples] = useState<any[]>([]);
  const [styleVariants, setStyleVariants] = useState<any[]>([]);
  const [selectedSampleId, setSelectedSampleId] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [editingTna, setEditingTna] = useState<any>(null);
  const [isSetStyle, setIsSetStyle] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    buyer: "",
  });
  const [formData, setFormData] = useState({
    sample_id: "",
    buyer_name: "",
    style_name: "",
    sample_type: "",
    sample_description: "",
    item: "",
    gauge: "",
    worksheet_rcv_date: "",
    yarn_rcv_date: "",
    required_date: "",
    color: "",
    piece_name: "",
    notes: "",
  });
  // For set pieces: array of piece-specific data
  const [setPiecesData, setSetPiecesData] = useState<Array<{
    piece_name: string;
    variant_id: number;
    color: string;
    color_code: string;
    sizes: string[];
  }>>([]);

  useEffect(() => {
    loadTNARecords();
    loadSamples();
  }, []);

  const loadTNARecords = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
      const response = await fetch(`${API_URL}/api/v1/samples/tna`);
      if (response.ok) {
        const data = await response.json();
          // Records loaded successfully
        setTnaRecords(Array.isArray(data) ? data : []);
        setFilteredTnaRecords(Array.isArray(data) ? data : []);
      } else {
        // Failed to load records
        setTnaRecords([]);
        setFilteredTnaRecords([]);
      }
    } catch (error) {
      // Failed to load TNA records
      setTnaRecords([]);
      setFilteredTnaRecords([]);
    }
  };

  const loadSamples = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
      const response = await fetch(`${API_URL}/api/v1/samples/`);
      if (response.ok) {
        const data = await response.json();
        setSamples(Array.isArray(data) ? data : []);
      } else {
        setSamples([]);
      }
    } catch (error) {
      // Failed to load samples
      setSamples([]);
    }
  };

  // Apply filters
  useEffect(() => {
    let result = [...tnaRecords];

    // Search filter (sample ID, buyer, style, color)
    if (filters.search && filters.search !== "all") {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (tna: any) =>
          tna.sample_id?.toLowerCase().includes(searchLower) ||
          tna.buyer_name?.toLowerCase().includes(searchLower) ||
          tna.style_name?.toLowerCase().includes(searchLower) ||
          tna.color?.toLowerCase().includes(searchLower)
      );
    }

    // Buyer filter
    if (filters.buyer && filters.buyer !== "all") {
      result = result.filter((tna: any) => tna.buyer_name === filters.buyer);
    }

    setFilteredTnaRecords(result);
  }, [tnaRecords, filters]);

  // Group TNA records by sample_id
  const groupedTnaRecords = React.useMemo(() => {
    const groups = new Map<string, any[]>();

    filteredTnaRecords.forEach((tna: any) => {
      if (!groups.has(tna.sample_id)) {
        groups.set(tna.sample_id, []);
      }
      groups.get(tna.sample_id)!.push(tna);
    });

    // Convert to array and sort by created_at (most recent first)
    return Array.from(groups.entries()).map(([sample_id, records]) => ({
      sample_id,
      records: records.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
      // Use the first record for common fields
      buyer_name: records[0].buyer_name,
      style_name: records[0].style_name,
      yarn_rcv_date: records[0].yarn_rcv_date,
      required_date: records[0].required_date,
      isSet: records.length > 1 && records.some(r => r.piece_name),
    })).sort((a, b) =>
      new Date(b.records[0].created_at).getTime() - new Date(a.records[0].created_at).getTime()
    );
  }, [filteredTnaRecords]);

  const clearFilters = () => {
    setFilters({ search: "", buyer: "" });
  };

  // Get unique buyers for filter
  const uniqueBuyers = [...new Set(tnaRecords.map((tna: any) => tna.buyer_name).filter(Boolean))].sort();

  const handleSampleSelect = async (sampleId: string) => {
    setSelectedSampleId(sampleId);
    setSelectedVariantId(""); // Reset variant selection
    setSetPiecesData([]); // Reset set pieces data

    try {
      // Fetch sample details by sample_id (e.g., "BUY_2025_11_001")
      const sample = await api.samples.getBySampleId(sampleId);

      // Fetch style summary to check if it's a set
      const styleSummary = await api.styles.getById(sample.style_id);
      const isSet = styleSummary.is_set && styleSummary.set_piece_count > 0;
      setIsSetStyle(isSet);

      // Fetch style variants for this sample's style
      let variants: any[] = [];
      if (sample.style_id) {
        try {
          variants = await api.styleVariants.getAll(sample.style_id);
          setStyleVariants(variants);
          // Variants fetched successfully

          // If it's a set, initialize setPiecesData with all pieces
          if (isSet && variants.length > 0) {
            // Group variants by piece_name
            const piecesMap = new Map<string, any>();
            variants.forEach(v => {
              if (v.piece_name && !piecesMap.has(v.piece_name)) {
                piecesMap.set(v.piece_name, v);
              }
            });

            const initialPieces = Array.from(piecesMap.values()).map(v => ({
              piece_name: v.piece_name,
              variant_id: v.id,
              color: v.colour_name || "",
              color_code: v.colour_code || "",
              sizes: v.sizes || [],
            }));
            setSetPiecesData(initialPieces);
          }
        } catch (error) {
          // Error fetching variants
          setStyleVariants([]);
        }
      }

      // Check if TNA record already exists for this sample
      // Note: For set styles, we don't load existing records for editing
      // because each piece needs its own separate TNA record
      const existingTna = !isSet ? tnaRecords.find(tna => tna.sample_id === sampleId) : null;

      if (existingTna) {
        // Load existing TNA data (only for non-set styles)
        setEditingTna(existingTna);
        setFormData({
          sample_id: existingTna.sample_id,
          buyer_name: existingTna.buyer_name,
          style_name: existingTna.style_name,
          sample_type: existingTna.sample_type,
          sample_description: existingTna.sample_description || "",
          item: existingTna.item || "",
          gauge: existingTna.gauge || "",
          worksheet_rcv_date: existingTna.worksheet_rcv_date || "",
          yarn_rcv_date: existingTna.yarn_rcv_date || "",
          required_date: existingTna.required_date || "",
          color: existingTna.color || "",
          piece_name: existingTna.piece_name || "",
          notes: existingTna.notes || "",
        });
        toast.success("Existing TNA record loaded");
      } else {
        // Auto-fill fields from primary info for new TNA
        setEditingTna(null);

        // If only one variant, auto-select it
        if (variants.length === 1) {
          setSelectedVariantId(variants[0].id.toString());
          setFormData({
            sample_id: sample.sample_id,
            buyer_name: sample.buyer_name,
            style_name: sample.style_name,
            sample_type: sample.sample_type,
            sample_description: sample.sample_description,
            item: sample.item,
            gauge: sample.gauge,
            worksheet_rcv_date: sample.worksheet_rcv_date,
            // Manual fields remain empty for user input
            yarn_rcv_date: "",
            required_date: "",
            color: variants[0].colour_name || "",
            piece_name: variants[0].piece_name || "",
            notes: "",
          });
          toast.success("Sample and variant loaded successfully");
        } else {
          setFormData({
            sample_id: sample.sample_id,
            buyer_name: sample.buyer_name,
            style_name: sample.style_name,
            sample_type: sample.sample_type,
            sample_description: sample.sample_description,
            item: sample.item,
            gauge: sample.gauge,
            worksheet_rcv_date: sample.worksheet_rcv_date,
            // Manual fields remain empty for user input
            yarn_rcv_date: "",
            required_date: "",
            color: "",
            piece_name: "",
            notes: "",
          });
          toast.success(
            variants.length > 0
              ? `Sample loaded. Select a color/piece variant (${variants.length} available)`
              : "Sample loaded successfully"
          );
        }
      }
    } catch (error) {
      const { handleApiError } = await import("@/lib/error-handler");
      toast.error(handleApiError(error, "Unable to load sample information. Please try again."));
    }
  };

  const handleVariantSelect = (variantId: string) => {
    setSelectedVariantId(variantId);

    const selectedVariant = styleVariants.find(v => v.id.toString() === variantId);
    if (selectedVariant) {
      setFormData({
        ...formData,
        color: selectedVariant.colour_name || "",
        piece_name: selectedVariant.piece_name || "",
      });
      toast.success(
        selectedVariant.piece_name
          ? `Selected: ${selectedVariant.piece_name} - ${selectedVariant.colour_name}`
          : `Selected color: ${selectedVariant.colour_name}`
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTna) {
        // Update existing TNA record
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
        await fetch(`${API_URL}/api/v1/samples/tna/${editingTna.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        toast.success("TNA record updated successfully");
      } else {
        // Create new TNA record(s)
        if (isSetStyle && setPiecesData.length > 0) {
          // Create multiple TNA records for set pieces
          // Creating set pieces
          const createPromises = setPiecesData.map(piece => {
            const tnaData = {
              ...formData,
              color: piece.color,
              piece_name: piece.piece_name,
              // Note: sizes are stored in variant, not in TNA
            };
            // Creating record for piece
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
            return fetch(`${API_URL}/api/v1/samples/tna`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(tnaData),
            });
          });

          const responses = await Promise.all(createPromises);

          // Check if all requests were successful
          const allSuccessful = responses.every(r => r.ok);
          if (allSuccessful) {
            // Parse response data to verify
            const savedRecords = await Promise.all(responses.map(r => r.json()));
            toast.success(`${setPiecesData.length} TNA records created for set pieces`);
          } else {
            toast.error("Some TNA records failed to save");
            const failedResponses = await Promise.all(
              responses.filter(r => !r.ok).map(async r => ({
                status: r.status,
                error: await r.json().catch(() => ({ detail: "Unknown error" }))
              }))
            );
            // Some saves failed
            return; // Don't reset form or reload if save failed
          }
        } else {
          // Single TNA record
          // Creating single record
          const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
          const response = await fetch(`${API_URL}/api/v1/samples/tna`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          });

          if (response.ok) {
            toast.success("TNA record created successfully");
          } else {
            const error = await response.json();
            const { handleApiError } = await import("@/lib/error-handler");
            toast.error(handleApiError(error, "Unable to create TNA record. Please try again."));
            return;
          }
        }
      }

      resetForm();
      // Add small delay to ensure DB has committed
      setTimeout(() => {
        // Reloading records after save
        loadTNARecords();
      }, 500);
    } catch (error) {
      const { handleApiError } = await import("@/lib/error-handler");
      toast.error(handleApiError(error, "Unable to save TNA record. Please try again."));
    }
  };

  const handleEdit = (tna: any) => {
    setEditingTna(tna);
    setSelectedSampleId(tna.sample_id);
    setFormData({
      sample_id: tna.sample_id,
      buyer_name: tna.buyer_name,
      style_name: tna.style_name,
      sample_type: tna.sample_type,
      sample_description: tna.sample_description || "",
      item: tna.item || "",
      gauge: tna.gauge || "",
      worksheet_rcv_date: tna.worksheet_rcv_date || "",
      yarn_rcv_date: tna.yarn_rcv_date || "",
      required_date: tna.required_date || "",
      color: tna.color || "",
      piece_name: tna.piece_name || "",
      notes: tna.notes || "",
    });
    toast.info("TNA record loaded for editing");
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this TNA record?")) {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
        await fetch(`${API_URL}/api/v1/samples/tna/${id}`, {
          method: "DELETE",
        });
        toast.success("TNA record deleted successfully");
        loadTNARecords();
      } catch (error) {
        const { handleApiError } = await import("@/lib/error-handler");
        toast.error(handleApiError(error, "Unable to delete TNA record. Please try again."));
      }
    }
  };

  const resetForm = () => {
    setSelectedSampleId("");
    setSelectedVariantId("");
    setStyleVariants([]);
    setSetPiecesData([]);
    setIsSetStyle(false);
    setEditingTna(null);
    setFormData({
      sample_id: "",
      buyer_name: "",
      style_name: "",
      sample_type: "",
      sample_description: "",
      item: "",
      gauge: "",
      worksheet_rcv_date: "",
      yarn_rcv_date: "",
      required_date: "",
      color: "",
      piece_name: "",
      notes: "",
    });
  };

  // Helper: Update color for a specific piece
  const updatePieceColor = (pieceIndex: number, variantId: number) => {
    const variant = styleVariants.find(v => v.id === variantId);
    if (variant) {
      setSetPiecesData(prev => {
        const updated = [...prev];
        updated[pieceIndex] = {
          ...updated[pieceIndex],
          variant_id: variantId,
          color: variant.colour_name || "",
          color_code: variant.colour_code || "",
          sizes: variant.sizes || [],
        };
        return updated;
      });
    }
  };

  // Helper: Update sizes for a specific piece
  const updatePieceSizes = (pieceIndex: number, sizes: string[]) => {
    setSetPiecesData(prev => {
      const updated = [...prev];
      updated[pieceIndex] = {
        ...updated[pieceIndex],
        sizes: sizes,
      };
      return updated;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sample TNA</h1>
        <p className="text-muted-foreground">
          Time and Action plan - Auto-fill from Sample Primary Info
        </p>
      </div>

      {/* Sample Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Sample</CardTitle>
          <CardDescription>
            Choose a sample to auto-fill information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="sample_select">Sample ID</Label>
                <Select value={selectedSampleId} onValueChange={handleSampleSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Sample ID" />
                  </SelectTrigger>
                  <SelectContent>
                    {samples.map((sample) => (
                      <SelectItem key={sample.id} value={sample.sample_id}>
                        {sample.sample_id} - {sample.buyer_name} - {sample.style_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => selectedSampleId && handleSampleSelect(selectedSampleId)}
                disabled={!selectedSampleId}
                variant="outline"
                className="mt-8"
              >
                <Search className="mr-2 h-4 w-4" />
                Load Info
              </Button>
            </div>

            {/* Set Pieces Selector - Shows for set styles */}
            {isSetStyle && setPiecesData.length > 0 && selectedSampleId && (
              <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <h3 className="text-sm font-semibold mb-3">Set Pieces - Select Colors & Sizes</h3>
                <div className="space-y-3">
                  {setPiecesData.map((piece, index) => (
                    <div key={index} className="p-3 bg-white dark:bg-slate-900 border rounded-lg">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs">Piece Name</Label>
                          <Input value={piece.piece_name} disabled className="h-9 font-medium" />
                        </div>
                        <div>
                          <Label className="text-xs">Color *</Label>
                          <Select
                            value={piece.variant_id.toString()}
                            onValueChange={(val) => updatePieceColor(index, parseInt(val))}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {styleVariants
                                .filter(v => v.piece_name === piece.piece_name)
                                .map((variant) => (
                                  <SelectItem key={variant.id} value={variant.id.toString()}>
                                    {variant.colour_name} {variant.colour_code ? `(${variant.colour_code})` : ""}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Sizes</Label>
                          <SizeSelector
                            value={piece.sizes}
                            onValueChange={(sizes) => updatePieceSizes(index, sizes)}
                            placeholder="Select sizes..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  ✓ All {setPiecesData.length} pieces will be saved together
                </p>
              </div>
            )}

            {/* Single Variant Selector - Shows for non-set styles with multiple colors */}
            {!isSetStyle && styleVariants.length > 1 && selectedSampleId && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <Label htmlFor="variant_select" className="text-sm font-medium mb-2 block">
                  Select Color / Piece Variant *
                </Label>
                <Select value={selectedVariantId} onValueChange={handleVariantSelect}>
                  <SelectTrigger className="bg-white dark:bg-slate-950">
                    <SelectValue placeholder="Choose color and piece..." />
                  </SelectTrigger>
                  <SelectContent>
                    {styleVariants.map((variant) => (
                      <SelectItem key={variant.id} value={variant.id.toString()}>
                        {variant.piece_name
                          ? `${variant.piece_name} - ${variant.colour_name}${variant.colour_code ? ` (${variant.colour_code})` : ""}`
                          : `${variant.colour_name}${variant.colour_code ? ` (${variant.colour_code})` : ""}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {styleVariants.length} color/piece combinations available for this style
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* TNA Form */}
      {formData.sample_id && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingTna ? "Edit" : "New"} TNA Information for {formData.sample_id}
            </CardTitle>
            <CardDescription>
              {editingTna
                ? "Update TNA details and save changes"
                : "Fields below are auto-filled. Add yarn date, required date, and color."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Auto-filled fields (readonly) */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="grid gap-2">
                  <Label>Sample ID</Label>
                  <Input value={formData.sample_id} disabled className="font-mono font-bold" />
                </div>
                <div className="grid gap-2">
                  <Label>Buyer</Label>
                  <Input value={formData.buyer_name} disabled />
                </div>
                <div className="grid gap-2">
                  <Label>Style</Label>
                  <Input value={formData.style_name} disabled />
                </div>
                <div className="grid gap-2">
                  <Label>Sample Type</Label>
                  <Input value={formData.sample_type} disabled />
                </div>
                <div className="grid gap-2">
                  <Label>Item</Label>
                  <Input value={formData.item} disabled />
                </div>
                <div className="grid gap-2">
                  <Label>Gauge</Label>
                  <Input value={formData.gauge} disabled />
                </div>
                <div className="grid gap-2">
                  <Label>Worksheet Rcv Date</Label>
                  <Input value={formData.worksheet_rcv_date} disabled />
                </div>
                <div className="grid gap-2">
                  <Label>Sample Description</Label>
                  <Input value={formData.sample_description} disabled />
                </div>
              </div>

              {/* Manual input fields */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">TNA Details (Manual Entry)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="yarn_rcv_date">Yarn Rcv Date</Label>
                    <Input
                      id="yarn_rcv_date"
                      type="date"
                      value={formData.yarn_rcv_date}
                      onChange={(e) =>
                        setFormData({ ...formData, yarn_rcv_date: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="required_date">Required Date</Label>
                    <Input
                      id="required_date"
                      type="date"
                      value={formData.required_date}
                      onChange={(e) =>
                        setFormData({ ...formData, required_date: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                {/* Show set pieces summary for set styles, or color/piece fields for non-set */}
                {isSetStyle && setPiecesData.length > 0 ? (
                  <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                    <Label className="text-sm font-semibold mb-2 block">
                      Set Pieces Configuration (Configured Above)
                    </Label>
                    <div className="space-y-2">
                      {setPiecesData.map((piece, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded font-medium">
                            {piece.piece_name}
                          </span>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-medium">{piece.color}</span>
                          {piece.color_code && (
                            <span className="text-xs text-muted-foreground">({piece.color_code})</span>
                          )}
                          {piece.sizes.length > 0 && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">
                                Sizes: {piece.sizes.join(", ")}
                              </span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      ✓ All {setPiecesData.length} pieces configured and ready to save
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="color">Color (Auto-filled from Variant) *</Label>
                      <Input
                        id="color"
                        value={formData.color}
                        disabled
                        className="font-medium"
                        placeholder="Select variant to auto-fill..."
                      />
                      <p className="text-xs text-muted-foreground">
                        {styleVariants.length > 0
                          ? "Selected from variant dropdown above"
                          : "No variants available for this style"}
                      </p>
                    </div>

                    {formData.piece_name && (
                      <div className="grid gap-2">
                        <Label htmlFor="piece_name">Piece Name (Auto-filled)</Label>
                        <Input
                          id="piece_name"
                          value={formData.piece_name}
                          disabled
                          className="font-medium"
                        />
                        <p className="text-xs text-muted-foreground">
                          For set pieces only
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {editingTna ? "Update TNA" : "Save TNA"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Clear
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* TNA Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>TNA Records</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search sample ID, buyer, style, color..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select
                value={filters.buyer}
                onValueChange={(value) => setFilters({ ...filters, buyer: value })}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by Buyer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Buyers</SelectItem>
                  {uniqueBuyers.map((buyer: string) => (
                    <SelectItem key={buyer} value={buyer}>
                      {buyer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={clearFilters} title="Clear filters">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Showing {groupedTnaRecords.length} sample{groupedTnaRecords.length !== 1 ? 's' : ''} ({filteredTnaRecords.length} record{filteredTnaRecords.length !== 1 ? 's' : ''}) of {tnaRecords.length} total records
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sample ID</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Style</TableHead>
                  <TableHead>Piece</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Yarn Rcv Date</TableHead>
                  <TableHead>Required Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedTnaRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      {tnaRecords.length === 0
                        ? "No TNA records found."
                        : "No TNA records match your filters. Try adjusting your search criteria."}
                    </TableCell>
                  </TableRow>
                ) : (
                  groupedTnaRecords.map((group, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono">{group.sample_id}</TableCell>
                      <TableCell>{group.buyer_name}</TableCell>
                      <TableCell>{group.style_name}</TableCell>
                      <TableCell>
                        {group.isSet ? (
                          <div className="flex flex-col gap-1">
                            {group.records.map((record: any, rIdx: number) => (
                              <span
                                key={rIdx}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded text-xs font-medium w-fit"
                              >
                                {record.piece_name}
                              </span>
                            ))}
                          </div>
                        ) : group.records[0].piece_name ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded text-xs font-medium">
                            {group.records[0].piece_name}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {group.isSet ? (
                          <div className="flex flex-col gap-1">
                            {group.records.map((record: any, rIdx: number) => (
                              <span key={rIdx} className="text-sm">
                                {record.color}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span>{group.records[0].color}</span>
                        )}
                      </TableCell>
                      <TableCell>{group.yarn_rcv_date}</TableCell>
                      <TableCell>{group.required_date}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(group.records[0])}
                            title="Edit first piece"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {group.records.map((record: any, rIdx: number) => (
                            <Button
                              key={rIdx}
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(record.id)}
                              title={`Delete ${record.piece_name || 'record'}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
