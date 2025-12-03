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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function BuyersPage() {
  const [buyers, setBuyers] = useState([]);
  const [filteredBuyers, setFilteredBuyers] = useState([]);
  const [displayedBuyers, setDisplayedBuyers] = useState([]);
  const [rowLimit, setRowLimit] = useState<number | "all">(50);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState<any>(null);
  const [filters, setFilters] = useState({
    search: "",
    country: "",
    rating: "",
  });
  const [formData, setFormData] = useState({
    buyer_name: "",
    brand_name: "",
    company_name: "",
    head_office_country: "",
    email: "",
    phone: "",
    website: "",
    tax_id: "",
    rating: 0,
  });

  useEffect(() => {
    loadBuyers();
  }, []);

  const loadBuyers = async () => {
    try {
      console.log("Fetching buyers...");
      const data = await api.buyers.getAll();
      console.log("Buyers data received:", data);
      if (Array.isArray(data)) {
        console.log("Buyers count:", data.length);
        setBuyers(data);
        setFilteredBuyers(data);
      } else {
        console.error("Buyers data is not an array:", data);
        setBuyers([]);
        setFilteredBuyers([]);
      }
    } catch (error) {
      console.error("Error loading buyers:", error);
      toast.error("Failed to load buyers");
    }
  };

  // Apply filters
  useEffect(() => {
    let result = [...buyers];

    // Search filter (buyer name, brand, company, email)
    if (filters.search && filters.search !== "all") {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (buyer: any) =>
          buyer.buyer_name?.toLowerCase().includes(searchLower) ||
          buyer.brand_name?.toLowerCase().includes(searchLower) ||
          buyer.company_name?.toLowerCase().includes(searchLower) ||
          buyer.email?.toLowerCase().includes(searchLower)
      );
    }

    // Country filter
    if (filters.country && filters.country !== "all") {
      result = result.filter((buyer: any) => buyer.head_office_country === filters.country);
    }

    // Rating filter
    if (filters.rating && filters.rating !== "all") {
      const ratingValue = parseFloat(filters.rating);
      result = result.filter((buyer: any) => buyer.rating >= ratingValue);
    }

    setFilteredBuyers(result);
  }, [buyers, filters]);

  // Apply row limit
  useEffect(() => {
    if (rowLimit === "all") {
      setDisplayedBuyers(filteredBuyers);
    } else {
      setDisplayedBuyers(filteredBuyers.slice(0, rowLimit));
    }
  }, [filteredBuyers, rowLimit]);

  const clearFilters = () => {
    setFilters({
      search: "",
      country: "",
      rating: "",
    });
  };

  // Get unique countries for filter dropdown
  const uniqueCountries = [...new Set(buyers.map((b: any) => b.head_office_country).filter(Boolean))].sort();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBuyer) {
        await api.buyers.update(editingBuyer.id, formData);
        toast.success("Buyer updated successfully");
      } else {
        await api.buyers.create(formData);
        toast.success("Buyer created successfully");
      }
      setIsDialogOpen(false);
      resetForm();
      loadBuyers();
    } catch (error) {
      toast.error("Failed to save buyer");
      console.error(error);
    }
  };

  const handleEdit = (buyer: any) => {
    setEditingBuyer(buyer);
    setFormData(buyer);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this buyer?")) {
      try {
        await api.buyers.delete(id);
        toast.success("Buyer deleted successfully");
        loadBuyers();
      } catch (error) {
        toast.error("Failed to delete buyer");
        console.error(error);
      }
    }
  };

  const resetForm = () => {
    setEditingBuyer(null);
    setFormData({
      buyer_name: "",
      brand_name: "",
      company_name: "",
      head_office_country: "",
      email: "",
      phone: "",
      website: "",
      tax_id: "",
      rating: 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Buyer Info</h1>
          <p className="text-muted-foreground">Manage your buyers and their information</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Buyer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBuyer ? "Edit Buyer" : "Add New Buyer"}</DialogTitle>
              <DialogDescription>
                {editingBuyer ? "Update buyer information" : "Enter buyer details to add to the system"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="buyer_name">Buyer Name *</Label>
                    <Input
                      id="buyer_name"
                      required
                      value={formData.buyer_name}
                      onChange={(e) => setFormData({ ...formData, buyer_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand_name">Brand Name</Label>
                    <Input
                      id="brand_name"
                      value={formData.brand_name}
                      onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    required
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="head_office_country">Country</Label>
                    <Input
                      id="head_office_country"
                      value={formData.head_office_country}
                      onChange={(e) => setFormData({ ...formData, head_office_country: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tax_id">TAX ID</Label>
                    <Input
                      id="tax_id"
                      value={formData.tax_id}
                      onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                    />
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
              </div>
              <DialogFooter>
                <Button type="submit">{editingBuyer ? "Update" : "Create"} Buyer</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search buyers, brands, companies, emails..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>
          <Select
            value={filters.country}
            onValueChange={(value) => setFilters({ ...filters, country: value })}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {uniqueCountries.map((country: string) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.rating}
            onValueChange={(value) => setFilters({ ...filters, rating: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="4">4+ Stars</SelectItem>
              <SelectItem value="3">3+ Stars</SelectItem>
              <SelectItem value="2">2+ Stars</SelectItem>
              <SelectItem value="1">1+ Stars</SelectItem>
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
          Showing {displayedBuyers.length} of {filteredBuyers.length} filtered ({buyers.length} total) buyers
        </div>
      </Card>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Buyer Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedBuyers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  {buyers.length === 0
                    ? "No buyers found. Add your first buyer to get started."
                    : "No buyers match your filters. Try adjusting your search criteria."}
                </TableCell>
              </TableRow>
            ) : (
              displayedBuyers.map((buyer: any) => (
                <TableRow key={buyer.id}>
                  <TableCell className="font-medium">{buyer.buyer_name}</TableCell>
                  <TableCell>{buyer.brand_name || "-"}</TableCell>
                  <TableCell>{buyer.company_name}</TableCell>
                  <TableCell>{buyer.head_office_country || "-"}</TableCell>
                  <TableCell>{buyer.email || "-"}</TableCell>
                  <TableCell>{buyer.phone || "-"}</TableCell>
                  <TableCell>{buyer.rating || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(buyer)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(buyer.id)}>
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
