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
} from "@/components/ui/dialog";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2, Search, X } from "lucide-react";
import { toast } from "sonner";

const OPERATION_TYPES = [
  "Knitting",
  "Linking",
  "Trimming",
  "Mending",
  "Washing",
  "Finishing",
  "Inspection",
  "Packing",
];

const OPERATION_NAMES = {
  Knitting: [
    "Front Part",
    "Back Part",
    "Sleeve",
    "Sleeve Cuffs",
    "Neck",
    "Neck Rib",
    "Bottom Rib",
  ],
  Linking: [
    "Shoulder Join",
    "Neck / Collar Join",
    "Sleeve Join / Armhole Join",
    "Side Seam",
    "Cuff Join",
    "Bottom Join",
    "Label Attach",
  ],
  Trimming: ["Thread Cutting", "Loose End Removal", "Quality Check"],
  Mending: ["Hole Repair", "Stitch Repair", "Yarn Replacement"],
  Washing: ["Pre-wash", "Main Wash", "Softener Application"],
  Finishing: ["Ironing", "Folding", "Quality Inspection"],
  Inspection: ["Size Check", "Color Check", "Measurement Check"],
  Packing: ["Individual Packing", "Carton Packing", "Labeling"],
};

export default function OperationsPage() {
  const [operations, setOperations] = useState<any[]>([]);
  const [filteredOperations, setFilteredOperations] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOperation, setEditingOperation] = useState<any>(null);
  const [showCustomTypeInput, setShowCustomTypeInput] = useState(false);
  const [showCustomNameInput, setShowCustomNameInput] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    type: "",
  });
  const [formData, setFormData] = useState({
    operation_type: "",
    operation_name: "",
  });

  // Combine static operation types with custom types from database
  const allOperationTypes = React.useMemo(() => {
    const dbTypes = operations
      .map(op => op.operation_type)
      .filter(type => type && type.trim() !== ''); // Filter out empty values
    const uniqueTypes = [...new Set([...OPERATION_TYPES, ...dbTypes])];
    return uniqueTypes.sort();
  }, [operations]);

  // Get unique operation names for selected type
  const getOperationNamesForType = (type: string) => {
    const predefinedNames = OPERATION_NAMES[type as keyof typeof OPERATION_NAMES] || [];
    const dbNames = operations
      .filter(op => op.operation_type === type)
      .map(op => op.operation_name)
      .filter(name => name && name.trim() !== ''); // Filter out empty values
    const uniqueNames = [...new Set([...predefinedNames, ...dbNames])];
    return uniqueNames.sort();
  };

  useEffect(() => {
    loadOperations();
  }, []);

  const loadOperations = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/samples/operations-master"
      );
      if (response.ok) {
        const data = await response.json();
        setOperations(Array.isArray(data) ? data : []);
        setFilteredOperations(Array.isArray(data) ? data : []);
      } else {
        setOperations([]);
        setFilteredOperations([]);
      }
    } catch (error) {
      console.error("Failed to load operations:", error);
      setOperations([]);
      setFilteredOperations([]);
    }
  };

  // Apply filters
  useEffect(() => {
    let result = [...operations];

    // Search filter (type and name)
    if (filters.search && filters.search !== "all") {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (op: any) =>
          op.operation_type?.toLowerCase().includes(searchLower) ||
          op.operation_name?.toLowerCase().includes(searchLower)
      );
    }

    // Type filter
    if (filters.type && filters.type !== "all") {
      result = result.filter((op: any) => op.operation_type === filters.type);
    }

    setFilteredOperations(result);
  }, [operations, filters]);

  const clearFilters = () => {
    setFilters({ search: "", type: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingOperation ? "PUT" : "POST";
      const url = editingOperation
        ? `http://localhost:8000/api/v1/samples/operations-master/${editingOperation.id}`
        : "http://localhost:8000/api/v1/samples/operations-master";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.success(
        editingOperation
          ? "Operation updated successfully"
          : "Operation created successfully"
      );
      setIsDialogOpen(false);
      resetForm();
      loadOperations();
    } catch (error: any) {
      toast.error(error.message || "Failed to save operation");
      console.error(error);
    }
  };

  const handleEdit = (operation: any) => {
    setEditingOperation(operation);
    setFormData(operation);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this operation?")) {
      try {
        await fetch(`http://localhost:8000/api/v1/samples/operations-master/${id}`, {
          method: "DELETE",
        });
        toast.success("Operation deleted successfully");
        loadOperations();
      } catch (error) {
        toast.error("Failed to delete operation");
        console.error(error);
      }
    }
  };

  const resetForm = () => {
    setEditingOperation(null);
    setShowCustomTypeInput(false);
    setShowCustomNameInput(false);
    setFormData({
      operation_type: "",
      operation_name: "",
    });
  };

  // Group operations by type (using filtered operations)
  const groupedOperations = filteredOperations.reduce((acc: any, op) => {
    if (!acc[op.operation_type]) {
      acc[op.operation_type] = [];
    }
    acc[op.operation_type].push(op);
    return acc;
  }, {});

  // Get unique operation types for filter
  const uniqueOperationTypes = [...new Set(operations.map((op: any) => op.operation_type).filter(Boolean))].sort();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Add New Operation</h1>
          <p className="text-muted-foreground">
            Define operation types and names for sample making process
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Operation
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search operation type or name..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>
          <Select
            value={filters.type}
            onValueChange={(value) => setFilters({ ...filters, type: value })}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {uniqueOperationTypes.map((type: string) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={clearFilters} title="Clear filters">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          Showing {filteredOperations.length} of {operations.length} operations
        </div>
      </Card>

      {/* Operations grouped by type */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.keys(groupedOperations).length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No operations defined. Add your first operation to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedOperations).map(([type, ops]: [string, any]) => (
            <Card key={type}>
              <CardHeader>
                <CardTitle className="text-lg">{type}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {ops.map((op: any) => (
                    <div
                      key={op.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                    >
                      <span className="text-sm">{op.operation_name}</span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(op)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(op.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* All Operations Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Operation Type</TableHead>
                  <TableHead>Operation Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOperations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      {operations.length === 0
                        ? "No operations found."
                        : "No operations match your filters. Try adjusting your search criteria."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOperations.map((op) => (
                    <TableRow key={op.id}>
                      <TableCell className="font-medium">{op.operation_type}</TableCell>
                      <TableCell>{op.operation_name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(op)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(op.id)}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingOperation ? "Edit Operation" : "Add New Operation"}
            </DialogTitle>
            <DialogDescription>
              Define the operation type and specific operation name
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="operation_type">Operation Type</Label>
                {!showCustomTypeInput ? (
                  <div className="flex gap-2">
                    <Select
                      value={formData.operation_type || undefined}
                      onValueChange={(value) => {
                        setFormData({ ...formData, operation_type: value, operation_name: "" });
                        setShowCustomNameInput(false);
                      }}
                      required
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select operation type" />
                      </SelectTrigger>
                      <SelectContent>
                        {allOperationTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setShowCustomTypeInput(true);
                        setFormData({ ...formData, operation_type: "", operation_name: "" });
                      }}
                      title="Add custom operation type"
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={formData.operation_type}
                      onChange={(e) =>
                        setFormData({ ...formData, operation_type: e.target.value })
                      }
                      placeholder="Enter custom operation type"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setShowCustomTypeInput(false);
                        setFormData({ ...formData, operation_type: "" });
                      }}
                      title="Back to dropdown"
                    >
                      ✕
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="operation_name">Name of Operation</Label>
                {!showCustomNameInput ? (
                  <div className="flex gap-2">
                    <Select
                      value={formData.operation_name || undefined}
                      onValueChange={(value) =>
                        setFormData({ ...formData, operation_name: value })
                      }
                      required
                      disabled={!formData.operation_type}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select operation name" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.operation_type &&
                          getOperationNamesForType(formData.operation_type).map((name) => (
                            <SelectItem key={name} value={name}>
                              {name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setShowCustomNameInput(true);
                        setFormData({ ...formData, operation_name: "" });
                      }}
                      disabled={!formData.operation_type}
                      title="Add custom operation name"
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={formData.operation_name}
                      onChange={(e) =>
                        setFormData({ ...formData, operation_name: e.target.value })
                      }
                      placeholder="Enter custom operation name"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setShowCustomNameInput(false);
                        setFormData({ ...formData, operation_name: "" });
                      }}
                      title="Back to dropdown"
                    >
                      ✕
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  {!formData.operation_type
                    ? "Select an operation type first"
                    : showCustomNameInput
                    ? "Enter your custom operation name"
                    : "Select from dropdown or click + to add custom"}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingOperation ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
