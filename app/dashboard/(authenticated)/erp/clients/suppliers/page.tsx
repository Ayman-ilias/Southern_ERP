"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusIcon, Pencil, Trash2, Search, X } from "lucide-react";
import { ExportButton } from "@/components/export-button";
import type { ExportColumn } from "@/lib/export-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { countries } from "@/lib/countries";

// Helper function to format timestamps
const formatDateTime = (dateString: string | null | undefined) => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return "-";
  }
};

interface Supplier {
  id?: number;
  supplier_name: string;
  company_name: string;
  supplier_type: string;
  contact_person: string;
  email: string;
  phone: string;
  country: string;
  rating?: number;
  created_at?: string;
  updated_at?: string;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [displayedSuppliers, setDisplayedSuppliers] = useState<Supplier[]>([]);
  const [rowLimit, setRowLimit] = useState<number | "all">(50);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    country: "",
    rating: "",
  });

  const [formData, setFormData] = useState<Supplier>({
    supplier_name: "",
    company_name: "",
    supplier_type: "Fabric",
    contact_person: "",
    email: "",
    phone: "",
    country: "",
    rating: 0,
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      // Use Next.js proxy (configured in next.config.ts) or environment variable
      const API_BASE = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1` : '/api/v1';
      const response = await fetch(`${API_BASE}/suppliers/`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch suppliers: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      const suppliersArray = Array.isArray(data) ? data : [];
      setSuppliers(suppliersArray);
      setFilteredSuppliers(suppliersArray);
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
      toast.error("Failed to fetch suppliers. Please try again.");
      setSuppliers([]);
      setFilteredSuppliers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let result = [...suppliers];
    if (filters.search && filters.search !== "all") {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (s: Supplier) =>
          s.supplier_name?.toLowerCase().includes(searchLower) ||
          s.company_name?.toLowerCase().includes(searchLower) ||
          s.contact_person?.toLowerCase().includes(searchLower) ||
          s.email?.toLowerCase().includes(searchLower)
      );
    }
    if (filters.type) result = result.filter((s: Supplier) => s.supplier_type === filters.type);
    if (filters.country) result = result.filter((s: Supplier) => s.country === filters.country);
    if (filters.rating && filters.rating !== "all") {
      const ratingValue = parseFloat(filters.rating);
      result = result.filter((s: Supplier) => (s.rating || 0) >= ratingValue);
    }
    setFilteredSuppliers(result);
  }, [suppliers, filters]);

  // Apply row limit
  useEffect(() => {
    if (rowLimit === "all") {
      setDisplayedSuppliers(filteredSuppliers);
    } else {
      setDisplayedSuppliers(filteredSuppliers.slice(0, rowLimit));
    }
  }, [filteredSuppliers, rowLimit]);

  const clearFilters = () => setFilters({ search: "", type: "", country: "", rating: "" });
  const uniqueTypes = [...new Set(suppliers.map((s) => s.supplier_type))].sort();
  const uniqueCountries = [...new Set(suppliers.map((s) => s.country).filter(Boolean))].sort();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1` : '/api/v1';
      const url = editingSupplier
        ? `${API_BASE}/suppliers/${editingSupplier.id}`
        : `${API_BASE}/suppliers/`;

      const response = await fetch(url, {
        method: editingSupplier ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(
          editingSupplier ? "Supplier updated successfully" : "Supplier created successfully"
        );
        fetchSuppliers();
        handleCloseDialog();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.detail || "Failed to save supplier");
      }
    } catch (error) {
      console.error("Error saving supplier:", error);
      toast.error("An error occurred while saving");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this supplier?")) return;

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1` : '/api/v1';
      const response = await fetch(`${API_BASE}/suppliers/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        toast.success("Supplier deleted successfully");
        fetchSuppliers();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.detail || "Failed to delete supplier");
      }
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast.error("An error occurred while deleting");
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData(supplier);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSupplier(null);
    setFormData({
      supplier_name: "",
      company_name: "",
      supplier_type: "Fabric",
      contact_person: "",
      email: "",
      phone: "",
      country: "",
      rating: 0,
    });
  };

  // Export columns configuration
  const exportColumns: ExportColumn[] = [
    { key: "supplier_name", header: "Supplier Name" },
    { key: "company_name", header: "Company Name" },
    { key: "supplier_type", header: "Type" },
    { key: "contact_person", header: "Contact Person" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    { key: "country", header: "Country" },
    { key: "rating", header: "Rating", transform: (value) => value?.toFixed(1) || "N/A" },
    { key: "created_at", header: "Created At", transform: (value) => formatDateTime(value) },
    { key: "updated_at", header: "Updated At", transform: (value) => formatDateTime(value) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Supplier Info</h1>
          <p className="text-muted-foreground mt-2">
            Manage your fabric, trim, and accessory suppliers
          </p>
        </div>
        <div className="flex gap-2">
          <ExportButton
            data={filteredSuppliers}
            columns={exportColumns}
            filename="suppliers"
            sheetName="Suppliers"
          />
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search suppliers..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="pl-9" />
            </div>
          </div>
          <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {uniqueTypes.map((t, index) => (
                <SelectItem key={`type-${t}-${index}`} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.country} onValueChange={(value) => setFilters({ ...filters, country: value })}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.rating} onValueChange={(value) => setFilters({ ...filters, rating: value })}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="4">4+ Stars</SelectItem>
              <SelectItem value="3">3+ Stars</SelectItem>
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
          <Button variant="outline" size="icon" onClick={clearFilters} title="Clear filters"><X className="h-4 w-4" /></Button>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">Showing {displayedSuppliers.length} of {filteredSuppliers.length} filtered ({suppliers.length} total) suppliers</div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Suppliers</CardTitle>
          <CardDescription>
            A list of all suppliers including fabric, trims, and accessories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Updated At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && suppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="h-24 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      Loading suppliers...
                    </div>
                  </TableCell>
                </TableRow>
              ) : displayedSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="h-24 text-center">
                    {suppliers.length === 0 ? "No suppliers found." : "No suppliers match your filters."}
                  </TableCell>
                </TableRow>
              ) : (
                displayedSuppliers.map((supplier) => (
                  <TableRow 
                    key={supplier.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      setSelectedSupplier(supplier);
                      setIsDetailDialogOpen(true);
                    }}
                  >
                    <TableCell className="font-medium">{supplier.supplier_name}</TableCell>
                    <TableCell>{supplier.company_name}</TableCell>
                    <TableCell>{supplier.supplier_type}</TableCell>
                    <TableCell>{supplier.contact_person}</TableCell>
                    <TableCell>{supplier.email}</TableCell>
                    <TableCell>{supplier.phone}</TableCell>
                    <TableCell>{supplier.country}</TableCell>
                    <TableCell>{supplier.rating?.toFixed(1) || "N/A"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDateTime(supplier.created_at)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDateTime(supplier.updated_at)}</TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(supplier)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(supplier.id!)}
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
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSupplier ? "Edit Supplier" : "Add New Supplier"}
            </DialogTitle>
            <DialogDescription>
              Fill in the supplier details below
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier_name">Supplier Name *</Label>
                <Input
                  id="supplier_name"
                  value={formData.supplier_name}
                  onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier_type">Supplier Type *</Label>
                <select
                  id="supplier_type"
                  value={formData.supplier_type}
                  onChange={(e) => setFormData({ ...formData, supplier_type: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="Fabric">Fabric</option>
                  <option value="Trims">Trims</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Packaging">Packaging</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_person">Contact Person *</Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => setFormData({ ...formData, country: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating">Rating (0-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating || ""}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value ? parseFloat(e.target.value) : 0 })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : editingSupplier ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail View Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Supplier Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedSupplier?.supplier_name}
            </DialogDescription>
          </DialogHeader>
          {selectedSupplier && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Supplier Name</Label>
                  <p className="text-base font-medium">{selectedSupplier.supplier_name}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Company Name</Label>
                  <p className="text-base">{selectedSupplier.company_name}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Supplier Type</Label>
                  <p className="text-base">{selectedSupplier.supplier_type}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Contact Person</Label>
                  <p className="text-base">{selectedSupplier.contact_person}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Email</Label>
                  <p className="text-base">{selectedSupplier.email ? (
                    <a href={`mailto:${selectedSupplier.email}`} className="text-blue-600 hover:underline">
                      {selectedSupplier.email}
                    </a>
                  ) : "-"}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Phone</Label>
                  <p className="text-base">{selectedSupplier.phone ? (
                    <a href={`tel:${selectedSupplier.phone}`} className="text-blue-600 hover:underline">
                      {selectedSupplier.phone}
                    </a>
                  ) : "-"}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Country</Label>
                  <p className="text-base">{selectedSupplier.country}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Rating</Label>
                  <p className="text-base">{selectedSupplier.rating ? `${selectedSupplier.rating.toFixed(1)}/5.0` : "N/A"}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Created At</Label>
                  <p className="text-base">{formatDateTime(selectedSupplier.created_at)}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Updated At</Label>
                  <p className="text-base">{formatDateTime(selectedSupplier.updated_at)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDetailDialogOpen(false);
                if (selectedSupplier) {
                  handleEdit(selectedSupplier);
                }
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button onClick={() => setIsDetailDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
