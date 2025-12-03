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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, Search, PlusCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

const SIZE_OPTIONS = ["S", "M", "L", "XL", "2XL", "3XL"];

export default function SMVCalculationPage() {
  const [samples, setSamples] = useState<any[]>([]);
  const [operations, setOperations] = useState<any[]>([]);
  const [smvRecords, setSmvRecords] = useState<any[]>([]);
  const [selectedSampleId, setSelectedSampleId] = useState("");
  const [sampleInfo, setSampleInfo] = useState<any>(null);
  const [operationRows, setOperationRows] = useState<any[]>([]);
  const [customSizeRows, setCustomSizeRows] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadSamples();
    loadOperations();
    loadSMVRecords();
  }, []);

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

  const loadOperations = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/samples/operations-master"
      );
      if (response.ok) {
        const data = await response.json();
        setOperations(Array.isArray(data) ? data : []);
      } else {
        setOperations([]);
      }
    } catch (error) {
      console.error("Failed to load operations:", error);
      setOperations([]);
    }
  };

  const loadSMVRecords = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/samples/smv");
      if (response.ok) {
        const data = await response.json();
        setSmvRecords(Array.isArray(data) ? data : []);
      } else {
        setSmvRecords([]);
      }
    } catch (error) {
      console.error("Failed to load SMV records:", error);
      setSmvRecords([]);
    }
  };

  const handleSampleSelect = async (sampleId: string) => {
    setSelectedSampleId(sampleId);

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/samples/by-sample-id/${sampleId}`
      );
      const sample = await response.json();

      setSampleInfo({
        sample_id: sample.sample_id,
        buyer_name: sample.buyer_name,
        style_name: sample.style_name,
        category: sample.sample_type || "N/A",
        gauge: sample.gauge || "N/A",
      });

      // Initialize with empty operation rows
      setOperationRows([]);

      toast.success("Sample information loaded");
    } catch (error) {
      toast.error("Failed to load sample");
      console.error(error);
    }
  };

  // Convert HH:MM:SS to minutes
  const timeToMinutes = (timeStr: string): number => {
    const parts = timeStr.split(':').map(p => parseInt(p) || 0);
    if (parts.length === 3) {
      const [hours, minutes, seconds] = parts;
      return hours * 60 + minutes + seconds / 60;
    }
    return 0;
  };

  // Convert minutes to HH:MM format
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}:${String(mins).padStart(2, '0')}`;
  };

  const addOperationRow = () => {
    setOperationRows([
      ...operationRows,
      {
        id: Date.now(),
        operation_id: "",
        operation_type: "",
        operation_name: "",
        number_of_operations: 1,
        size: "",
        duration_input: "00:00:00", // HH:MM:SS input
        duration: 0, // minutes
        total_duration: 0,
      },
    ]);
  };

  const removeOperationRow = (id: number) => {
    setOperationRows(operationRows.filter((row) => row.id !== id));
  };

  const updateOperationRow = (id: number, field: string, value: any) => {
    setOperationRows(
      operationRows.map((row) => {
        if (row.id === id) {
          const updated = { ...row, [field]: value };

          // Auto-select operation details when operation is selected
          if (field === "operation_id") {
            const operation = operations.find((op) => op.id.toString() === value);
            if (operation) {
              updated.operation_type = operation.operation_type;
              updated.operation_name = operation.operation_name;
            }
          }

          // Convert time input to minutes
          if (field === "duration_input") {
            updated.duration = timeToMinutes(value);
          }

          // Auto-calculate total duration
          if (field === "number_of_operations" || field === "duration_input" || field === "duration") {
            const num = parseFloat(updated.number_of_operations) || 0;
            const dur = parseFloat(updated.duration) || 0;
            updated.total_duration = num * dur;
          }

          return updated;
        }
        return row;
      })
    );
  };

  const calculateTotalSMV = () => {
    return operationRows.reduce((sum, row) => sum + (row.total_duration || 0), 0);
  };

  const handleSubmit = async () => {
    if (!sampleInfo) {
      toast.error("Please select a sample first");
      return;
    }

    if (operationRows.length === 0) {
      toast.error("Please add at least one operation");
      return;
    }

    try {
      const smvData = {
        sample_id: sampleInfo.sample_id,
        buyer_name: sampleInfo.buyer_name,
        style_name: sampleInfo.style_name,
        category: sampleInfo.category,
        gauge: sampleInfo.gauge,
        operations: JSON.stringify(operationRows), // Convert array to JSON string
        total_smv: calculateTotalSMV(),
      };

      const response = await fetch("http://localhost:8000/api/v1/samples/smv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(smvData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Server error:", errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.success("SMV calculation saved successfully");
      resetForm();
      loadSMVRecords();
    } catch (error: any) {
      toast.error(error.message || "Failed to save SMV calculation");
      console.error(error);
    }
  };

  const resetForm = () => {
    setSelectedSampleId("");
    setSampleInfo(null);
    setOperationRows([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">SMV Calculation</h1>
        <p className="text-muted-foreground">
          Calculate Standard Minute Value for sample making operations
        </p>
      </div>

      {/* Sample Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Sample</CardTitle>
          <CardDescription>Choose a sample to calculate SMV</CardDescription>
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
              onClick={() =>
                selectedSampleId && handleSampleSelect(selectedSampleId)
              }
              disabled={!selectedSampleId}
              variant="outline"
              className="mt-8"
            >
              <Search className="mr-2 h-4 w-4" />
              Load
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sample Info (Auto-filled) */}
      {sampleInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Sample Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              <div className="grid gap-2">
                <Label>Sample ID</Label>
                <Input
                  value={sampleInfo.sample_id}
                  disabled
                  className="font-mono font-bold"
                />
              </div>
              <div className="grid gap-2">
                <Label>Buyer</Label>
                <Input value={sampleInfo.buyer_name} disabled />
              </div>
              <div className="grid gap-2">
                <Label>Style</Label>
                <Input value={sampleInfo.style_name} disabled />
              </div>
              <div className="grid gap-2">
                <Label>Category</Label>
                <Input value={sampleInfo.category} disabled />
              </div>
              <div className="grid gap-2">
                <Label>Gauge</Label>
                <Input value={sampleInfo.gauge} disabled />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Operations Table */}
      {sampleInfo && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Operations & SMV</CardTitle>
                <CardDescription>
                  Add operations and calculate time for each
                </CardDescription>
              </div>
              <Button onClick={addOperationRow} size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Operation
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Operation Type</TableHead>
                    <TableHead>Name of Operation</TableHead>
                    <TableHead>Number of Operations</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Duration (min)</TableHead>
                    <TableHead>Total Duration</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {operationRows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground"
                      >
                        No operations added. Click "Add Operation" to start.
                      </TableCell>
                    </TableRow>
                  ) : (
                    operationRows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <Select
                            value={row.operation_id}
                            onValueChange={(value) =>
                              updateOperationRow(row.id, "operation_id", value)
                            }
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              {operations.map((op) => (
                                <SelectItem key={op.id} value={op.id.toString()}>
                                  {op.operation_type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input value={row.operation_name} disabled />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={row.number_of_operations}
                            onChange={(e) =>
                              updateOperationRow(
                                row.id,
                                "number_of_operations",
                                e.target.value
                              )
                            }
                            className="w-24"
                            min="1"
                          />
                        </TableCell>
                        <TableCell>
                          {!customSizeRows.has(row.id) ? (
                            <div className="flex gap-1">
                              <Select
                                value={row.size || undefined}
                                onValueChange={(value) =>
                                  updateOperationRow(row.id, "size", value)
                                }
                              >
                                <SelectTrigger className="w-20">
                                  <SelectValue placeholder="Size" />
                                </SelectTrigger>
                                <SelectContent>
                                  {SIZE_OPTIONS.map((size) => (
                                    <SelectItem key={size} value={size}>
                                      {size}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() => {
                                  setCustomSizeRows(new Set(customSizeRows).add(row.id));
                                  updateOperationRow(row.id, "size", "");
                                }}
                                title="Add custom size"
                              >
                                <PlusCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-1">
                              <Input
                                value={row.size}
                                onChange={(e) =>
                                  updateOperationRow(row.id, "size", e.target.value)
                                }
                                className="w-20"
                                placeholder="Custom"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() => {
                                  const newSet = new Set(customSizeRows);
                                  newSet.delete(row.id);
                                  setCustomSizeRows(newSet);
                                  updateOperationRow(row.id, "size", "");
                                }}
                                title="Back to dropdown"
                              >
                                ✕
                              </Button>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            value={row.duration_input || "00:00:00"}
                            onChange={(e) =>
                              updateOperationRow(row.id, "duration_input", e.target.value)
                            }
                            className="w-32 font-mono"
                            placeholder="HH:MM:SS"
                            pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge variant="secondary" className="font-bold">
                              {row.total_duration.toFixed(2)} min
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              ({minutesToTime(row.total_duration)})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOperationRow(row.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  {operationRows.length > 0 && (
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell colSpan={5} className="text-right">
                        Total SMV:
                      </TableCell>
                      <TableCell>
                        <Badge className="text-lg px-4 py-2 bg-green-600">
                          {calculateTotalSMV().toFixed(2)} min
                        </Badge>
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {operationRows.length > 0 && (
              <div className="mt-4 flex gap-2">
                <Button onClick={handleSubmit}>
                  <Calculator className="mr-2 h-4 w-4" />
                  Save SMV Calculation
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Clear All
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* SMV Records */}
      <Card>
        <CardHeader>
          <CardTitle>SMV Calculation History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sample ID</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Style</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Total SMV</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {smvRecords.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground"
                    >
                      No SMV calculations found.
                    </TableCell>
                  </TableRow>
                ) : (
                  smvRecords.map((record, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono">
                        {record.sample_id}
                      </TableCell>
                      <TableCell>{record.buyer_name}</TableCell>
                      <TableCell>{record.style_name}</TableCell>
                      <TableCell>{record.category}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-600">
                          {record.total_smv} min
                        </Badge>
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
