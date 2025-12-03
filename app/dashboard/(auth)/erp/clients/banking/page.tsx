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
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function BankingPage() {
  const [banking, setBanking] = useState<any[]>([]);
  const [filteredBanking, setFilteredBanking] = useState<any[]>([]);
  const [displayedBanking, setDisplayedBanking] = useState<any[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [rowLimit, setRowLimit] = useState<number | "all">(50);
  const [filters, setFilters] = useState({ search: "", country: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanking, setEditingBanking] = useState<any>(null);
  const [formData, setFormData] = useState({
    client_type: "buyer",
    client_id: "",
    client_name: "",
    country: "",
    bank_name: "",
    sort_code: "",
    account_number: "",
  });

  useEffect(() => {
    loadBanking();
    loadBuyers();
    loadSuppliers();
  }, []);

  const loadBanking = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/buyers/banking");
      if (response.ok) {
        const data = await response.json();
        setBanking(Array.isArray(data) ? data : []);
      } else {
        setBanking([]);
      }
    } catch (error) {
      console.error("Failed to load banking:", error);
      setBanking([]);
    }
  };

  const loadBuyers = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/buyers/");
      if (response.ok) {
        const data = await response.json();
        setBuyers(Array.isArray(data) ? data : []);
      } else {
        setBuyers([]);
      }
    } catch (error) {
      console.error("Failed to load buyers:", error);
      setBuyers([]);
    }
  };

  const loadSuppliers = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/suppliers/");
      if (response.ok) {
        const data = await response.json();
        setSuppliers(Array.isArray(data) ? data : []);
      } else {
        setSuppliers([]);
      }
    } catch (error) {
      console.error("Failed to load suppliers:", error);
      setSuppliers([]);
    }
  };

  const handleClientChange = (clientId: string) => {
    if (formData.client_type === "buyer") {
      const buyer = buyers.find((b) => b.id.toString() === clientId);
      if (buyer) {
        setFormData({
          ...formData,
          client_id: clientId,
          client_name: buyer.buyer_name || "",
        });
      }
    } else {
      const supplier = suppliers.find((s) => s.id.toString() === clientId);
      if (supplier) {
        setFormData({
          ...formData,
          client_id: clientId,
          client_name: supplier.supplier_name || "",
        });
      }
    }
  };

  // Apply filters
  useEffect(() => {
    let result = [...banking];
    if (filters.search && filters.search !== "all") {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((b: any) =>
        b.client_name?.toLowerCase().includes(searchLower) ||
        b.bank_name?.toLowerCase().includes(searchLower) ||
        b.country?.toLowerCase().includes(searchLower) ||
        b.account_number?.toLowerCase().includes(searchLower)
      );
    }
    if (filters.country && filters.country !== "all") {
      result = result.filter((b: any) => b.country === filters.country);
    }
    setFilteredBanking(result);
  }, [banking, filters]);

  // Apply row limit
  useEffect(() => {
    if (rowLimit === "all") {
      setDisplayedBanking(filteredBanking);
    } else {
      setDisplayedBanking(filteredBanking.slice(0, rowLimit));
    }
  }, [filteredBanking, rowLimit]);

  const clearFilters = () => setFilters({ search: "", country: "" });
  const uniqueCountries = [...new Set(banking.map((b: any) => b.country).filter(Boolean))].sort();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingBanking ? "PUT" : "POST";
      const url = editingBanking
        ? `http://localhost:8000/api/v1/buyers/banking/${editingBanking.id}`
        : "http://localhost:8000/api/v1/buyers/banking";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save banking info");
      }

      toast.success(
        editingBanking
          ? "Banking info updated successfully"
          : "Banking info created successfully"
      );
      setIsDialogOpen(false);
      resetForm();
      loadBanking();
    } catch (error) {
      toast.error("Failed to save banking info");
      console.error(error);
    }
  };

  const handleEdit = (bank: any) => {
    setEditingBanking(bank);
    setFormData(bank);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this banking info?")) {
      try {
        await fetch(`http://localhost:8000/api/v1/buyers/banking/${id}`, {
          method: "DELETE",
        });
        toast.success("Banking info deleted successfully");
        loadBanking();
      } catch (error) {
        toast.error("Failed to delete banking info");
        console.error(error);
      }
    }
  };

  const resetForm = () => {
    setEditingBanking(null);
    setFormData({
      client_type: "buyer",
      client_id: "",
      client_name: "",
      country: "",
      bank_name: "",
      sort_code: "",
      account_number: "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Banking Info</h1>
          <p className="text-muted-foreground">
            Manage client banking information
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Banking Info
        </Button>
      </div>

      {/* Filters */}
      <div className="rounded-md border p-4 bg-card">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search client, bank, account..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <Select
            value={filters.country}
            onValueChange={(value) => setFilters({ ...filters, country: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {uniqueCountries.map((country: string, idx) => (
                <SelectItem key={`country-${idx}`} value={country}>
                  {country}
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
            <span className="h-4 w-4">×</span>
          </Button>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          Showing {displayedBanking.length} of {filteredBanking.length} filtered ({banking.length} total)
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client Name</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Bank Name</TableHead>
              <TableHead>Account Number</TableHead>
              <TableHead>SORT Code</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedBanking.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  {banking.length === 0
                    ? "No banking info found. Add your first banking information to get started."
                    : "No banking info matches your filters. Try adjusting your search criteria."}
                </TableCell>
              </TableRow>
            ) : (
              displayedBanking.map((bank) => (
                <TableRow key={bank.id}>
                  <TableCell className="font-medium">{bank.client_name}</TableCell>
                  <TableCell>{bank.country}</TableCell>
                  <TableCell>{bank.bank_name}</TableCell>
                  <TableCell>{bank.account_number}</TableCell>
                  <TableCell>{bank.sort_code}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(bank)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(bank.id)}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingBanking ? "Edit Banking Info" : "Add New Banking Info"}
            </DialogTitle>
            <DialogDescription>
              {editingBanking
                ? "Update banking information"
                : "Enter banking details below"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="client_type">Client Type</Label>
                  <Select
                    value={formData.client_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, client_type: value, client_id: "", client_name: "" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buyer">Buyer</SelectItem>
                      <SelectItem value="supplier">Supplier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="client_id">Client</Label>
                  <Select
                    value={formData.client_id}
                    onValueChange={handleClientChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.client_type === "buyer"
                        ? buyers.map((buyer) => (
                          <SelectItem key={buyer.id} value={buyer.id.toString()}>
                            {buyer.buyer_name}
                          </SelectItem>
                        ))
                        : suppliers.map((supplier) => (
                          <SelectItem
                            key={supplier.id}
                            value={supplier.id.toString()}
                          >
                            {supplier.supplier_name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Client Name</Label>
                <Input value={formData.client_name} disabled />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sort_code">SORT Code</Label>
                  <Input
                    id="sort_code"
                    value={formData.sort_code}
                    onChange={(e) =>
                      setFormData({ ...formData, sort_code: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="bank_name">Bank Name</Label>
                  <Input
                    id="bank_name"
                    value={formData.bank_name}
                    onChange={(e) =>
                      setFormData({ ...formData, bank_name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="account_number">Account Number</Label>
                  <Input
                    id="account_number"
                    value={formData.account_number}
                    onChange={(e) =>
                      setFormData({ ...formData, account_number: e.target.value })
                    }
                    required
                  />
                </div>
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
                {editingBanking ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
