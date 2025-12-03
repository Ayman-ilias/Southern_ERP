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

export default function SampleTNAPage() {
  const [tnaRecords, setTnaRecords] = useState<any[]>([]);
  const [filteredTnaRecords, setFilteredTnaRecords] = useState<any[]>([]);
  const [samples, setSamples] = useState<any[]>([]);
  const [selectedSampleId, setSelectedSampleId] = useState("");
  const [editingTna, setEditingTna] = useState<any>(null);
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
    notes: "",
  });

  useEffect(() => {
    loadTNARecords();
    loadSamples();
  }, []);

  const loadTNARecords = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/samples/tna");
      if (response.ok) {
        const data = await response.json();
        setTnaRecords(Array.isArray(data) ? data : []);
        setFilteredTnaRecords(Array.isArray(data) ? data : []);
      } else {
        setTnaRecords([]);
        setFilteredTnaRecords([]);
      }
    } catch (error) {
      console.error("Failed to load TNA records:", error);
      setTnaRecords([]);
      setFilteredTnaRecords([]);
    }
  };

  const loadSamples = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/samples/");
      if (response.ok) {
        const data = await response.json();
        setSamples(Array.isArray(data) ? data : []);
      } else {
        setSamples([]);
      }
    } catch (error) {
      console.error("Failed to load samples:", error);
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

  const clearFilters = () => {
    setFilters({ search: "", buyer: "" });
  };

  // Get unique buyers for filter
  const uniqueBuyers = [...new Set(tnaRecords.map((tna: any) => tna.buyer_name).filter(Boolean))].sort();

  const handleSampleSelect = async (sampleId: string) => {
    setSelectedSampleId(sampleId);

    try {
      // Fetch sample details by sample_id (e.g., "BUY_2025_11_001")
      const response = await fetch(
        `http://localhost:8000/api/v1/samples/by-sample-id/${sampleId}`
      );
      const sample = await response.json();

      // Check if TNA record already exists for this sample
      const existingTna = tnaRecords.find(tna => tna.sample_id === sampleId);

      if (existingTna) {
        // Load existing TNA data
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
          notes: existingTna.notes || "",
        });
        toast.success("Existing TNA record loaded");
      } else {
        // Auto-fill fields from primary info for new TNA
        setEditingTna(null);
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
          notes: "",
        });
        toast.success("Sample information loaded successfully");
      }
    } catch (error) {
      toast.error("Failed to load sample information");
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTna) {
        // Update existing TNA record
        await fetch(`http://localhost:8000/api/v1/samples/tna/${editingTna.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        toast.success("TNA record updated successfully");
      } else {
        // Create new TNA record
        await fetch("http://localhost:8000/api/v1/samples/tna", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        toast.success("TNA record created successfully");
      }

      resetForm();
      loadTNARecords();
    } catch (error) {
      toast.error("Failed to save TNA record");
      console.error(error);
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
      notes: tna.notes || "",
    });
    toast.info("TNA record loaded for editing");
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this TNA record?")) {
      try {
        await fetch(`http://localhost:8000/api/v1/samples/tna/${id}`, {
          method: "DELETE",
        });
        toast.success("TNA record deleted successfully");
        loadTNARecords();
      } catch (error) {
        toast.error("Failed to delete TNA record");
        console.error(error);
      }
    }
  };

  const resetForm = () => {
    setSelectedSampleId("");
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
      notes: "",
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

                <div className="grid gap-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    placeholder="e.g., Navy Blue, Red, White"
                    required
                  />
                </div>

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
              Showing {filteredTnaRecords.length} of {tnaRecords.length} TNA records
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
                  <TableHead>Color</TableHead>
                  <TableHead>Yarn Rcv Date</TableHead>
                  <TableHead>Required Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTnaRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      {tnaRecords.length === 0
                        ? "No TNA records found."
                        : "No TNA records match your filters. Try adjusting your search criteria."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTnaRecords.map((tna, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono">{tna.sample_id}</TableCell>
                      <TableCell>{tna.buyer_name}</TableCell>
                      <TableCell>{tna.style_name}</TableCell>
                      <TableCell>{tna.color}</TableCell>
                      <TableCell>{tna.yarn_rcv_date}</TableCell>
                      <TableCell>{tna.required_date}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(tna)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(tna.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
