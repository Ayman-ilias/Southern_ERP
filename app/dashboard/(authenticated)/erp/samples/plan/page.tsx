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
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Search, X } from "lucide-react";
import { toast } from "sonner";

const SUBMIT_STATUSES = [
  { value: "approve", label: "Approve", color: "bg-green-500" },
  { value: "reject_remake", label: "Reject & Request for Remake", color: "bg-yellow-500" },
  { value: "proceed", label: "Proceed Next Stage With Comments", color: "bg-blue-500" },
  { value: "reject_drop", label: "Reject & Drop", color: "bg-red-500" },
  { value: "drop", label: "Drop", color: "bg-gray-500" },
];

export default function SamplePlanPage() {
  const [planRecords, setPlanRecords] = useState<any[]>([]);
  const [filteredPlanRecords, setFilteredPlanRecords] = useState<any[]>([]);
  const [tnaRecords, setTnaRecords] = useState<any[]>([]);
  const [selectedSampleId, setSelectedSampleId] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    buyer: "",
    status: "",
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
    assigned_designer: "",
    required_sample_quantity: "",
    round: 1,
    notes: "",
    submit_status: "",
  });

  useEffect(() => {
    loadPlanRecords();
    loadTNARecords();
  }, []);

  const loadPlanRecords = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/samples/plan");
      if (response.ok) {
        const data = await response.json();
        setPlanRecords(Array.isArray(data) ? data : []);
        setFilteredPlanRecords(Array.isArray(data) ? data : []);
      } else {
        setPlanRecords([]);
        setFilteredPlanRecords([]);
      }
    } catch (error) {
      console.error("Failed to load plan records:", error);
      setPlanRecords([]);
      setFilteredPlanRecords([]);
    }
  };

  const loadTNARecords = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/samples/tna");
      if (response.ok) {
        const data = await response.json();
        setTnaRecords(Array.isArray(data) ? data : []);
      } else {
        setTnaRecords([]);
      }
    } catch (error) {
      console.error("Failed to load TNA records:", error);
      setTnaRecords([]);
    }
  };

  // Apply filters
  useEffect(() => {
    let result = [...planRecords];

    // Search filter (sample ID, buyer, style, designer)
    if (filters.search && filters.search !== "all") {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (plan: any) =>
          plan.sample_id?.toLowerCase().includes(searchLower) ||
          plan.buyer_name?.toLowerCase().includes(searchLower) ||
          plan.style_name?.toLowerCase().includes(searchLower) ||
          plan.assigned_designer?.toLowerCase().includes(searchLower)
      );
    }

    // Buyer filter
    if (filters.buyer && filters.buyer !== "all") {
      result = result.filter((plan: any) => plan.buyer_name === filters.buyer);
    }

    // Status filter
    if (filters.status && filters.status !== "all") {
      result = result.filter((plan: any) => plan.submit_status === filters.status);
    }

    setFilteredPlanRecords(result);
  }, [planRecords, filters]);

  const clearFilters = () => {
    setFilters({ search: "", buyer: "", status: "" });
  };

  // Get unique values for filters
  const uniqueBuyers = [...new Set(planRecords.map((p: any) => p.buyer_name).filter(Boolean))].sort();
  const uniqueStatuses = [...new Set(planRecords.map((p: any) => p.submit_status).filter(Boolean))].sort();

  const handleSampleSelect = async (sampleId: string) => {
    setSelectedSampleId(sampleId);

    try {
      // Fetch TNA details by sample_id
      const response = await fetch(
        `http://localhost:8000/api/v1/samples/tna/${sampleId}`
      );
      const tna = await response.json();

      // Check if plan already exists for this sample
      const existingPlan = planRecords.find((p) => p.sample_id === sampleId);

      // Auto-fill fields from TNA
      setFormData({
        ...formData,
        sample_id: tna.sample_id,
        buyer_name: tna.buyer_name,
        style_name: tna.style_name,
        sample_type: tna.sample_type,
        sample_description: tna.sample_description,
        item: tna.item,
        gauge: tna.gauge,
        worksheet_rcv_date: tna.worksheet_rcv_date,
        yarn_rcv_date: tna.yarn_rcv_date,
        required_date: tna.required_date,
        color: tna.color,
        // Use existing plan data if available
        assigned_designer: existingPlan?.assigned_designer || "",
        required_sample_quantity: existingPlan?.required_sample_quantity || "",
        round: existingPlan?.round || 1,
        notes: existingPlan?.notes || "",
        submit_status: existingPlan?.submit_status || "",
      });

      toast.success("Sample information loaded successfully");
    } catch (error) {
      toast.error("Failed to load sample information");
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.submit_status) {
      toast.error("Please select a submit status");
      return;
    }

    try {
      // Calculate new round if status is "reject_remake"
      const newRound =
        formData.submit_status === "reject_remake"
          ? formData.round + 1
          : formData.round;

      const submissionData = {
        ...formData,
        round: newRound,
      };

      await fetch("http://localhost:8000/api/v1/samples/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      const statusLabel =
        SUBMIT_STATUSES.find((s) => s.value === formData.submit_status)?.label ||
        "Unknown";

      toast.success(
        `Sample plan submitted with status: ${statusLabel}${
          formData.submit_status === "reject_remake"
            ? ` (Round incremented to ${newRound})`
            : ""
        }`
      );

      resetForm();
      loadPlanRecords();
    } catch (error) {
      toast.error("Failed to submit sample plan");
      console.error(error);
    }
  };

  const resetForm = () => {
    setSelectedSampleId("");
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
      assigned_designer: "",
      required_sample_quantity: "",
      round: 1,
      notes: "",
      submit_status: "",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusInfo = SUBMIT_STATUSES.find((s) => s.value === status);
    if (!statusInfo) return null;

    return (
      <Badge className={`${statusInfo.color} text-white`}>
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sample Plan</h1>
        <p className="text-muted-foreground">
          Submit sample plan with designer assignment and status
        </p>
      </div>

      {/* Sample Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Sample</CardTitle>
          <CardDescription>
            Choose a sample from TNA to create/update plan
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
                  {tnaRecords.map((tna, idx) => (
                    <SelectItem key={idx} value={tna.sample_id}>
                      {tna.sample_id} - {tna.buyer_name} - {tna.color}
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

      {/* Plan Form */}
      {formData.sample_id && (
        <Card>
          <CardHeader>
            <CardTitle>Sample Plan for {formData.sample_id}</CardTitle>
            <CardDescription>
              Auto-filled from TNA. Add designer, quantity, and submit status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Auto-filled fields */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
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
                  <Label>Color</Label>
                  <Input value={formData.color} disabled />
                </div>
                <div className="grid gap-2">
                  <Label>Required Date</Label>
                  <Input value={formData.required_date} disabled />
                </div>
                <div className="grid gap-2">
                  <Label>Round (Auto-increments on rejection)</Label>
                  <Input
                    value={formData.round}
                    disabled
                    className="font-bold text-lg text-center"
                  />
                </div>
              </div>

              {/* Manual input fields */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Plan Details (Manual Entry)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="assigned_designer">Assigned Designer</Label>
                    <Input
                      id="assigned_designer"
                      value={formData.assigned_designer}
                      onChange={(e) =>
                        setFormData({ ...formData, assigned_designer: e.target.value })
                      }
                      placeholder="Designer name"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="required_sample_quantity">Required Sample Quantity</Label>
                    <Input
                      id="required_sample_quantity"
                      type="number"
                      value={formData.required_sample_quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          required_sample_quantity: e.target.value,
                        })
                      }
                      placeholder="e.g., 5"
                      required
                    />
                  </div>
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

                <div className="grid gap-2">
                  <Label htmlFor="submit_status">
                    Submit Status <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.submit_status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, submit_status: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select submit status" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBMIT_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                            {status.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.submit_status === "reject_remake" && (
                    <p className="text-sm text-yellow-600 font-medium">
                      ⚠️ Round will be incremented from {formData.round} to{" "}
                      {formData.round + 1}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Submit Plan
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Clear
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Plan Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sample Plan Records</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search sample ID, buyer, style, designer..."
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
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {uniqueStatuses.map((status: string) => (
                    <SelectItem key={status} value={status}>
                      {SUBMIT_STATUSES.find((s) => s.value === status)?.label || status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={clearFilters} title="Clear filters">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Showing {filteredPlanRecords.length} of {planRecords.length} plan records
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sample ID</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Designer</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Round</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlanRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      {planRecords.length === 0
                        ? "No plan records found."
                        : "No plan records match your filters. Try adjusting your search criteria."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPlanRecords.map((plan, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono">{plan.sample_id}</TableCell>
                      <TableCell>{plan.buyer_name}</TableCell>
                      <TableCell>{plan.color}</TableCell>
                      <TableCell>{plan.assigned_designer}</TableCell>
                      <TableCell>{plan.required_sample_quantity}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-bold">
                          Round {plan.round}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(plan.submit_status)}</TableCell>
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
