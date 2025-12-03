"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UsersIcon,
  ClipboardCheckIcon,
  Building2Icon,
  ShoppingBagIcon,
  SettingsIcon,
  FolderDotIcon,
  CalendarIcon,
  ArchiveRestoreIcon,
  ChartPieIcon
} from "lucide-react";
import Link from "next/link";

const modules = [
  {
    title: "Buyer Info",
    description: "Manage buyers, contacts, and shipping information",
    icon: UsersIcon,
    href: "/dashboard/erp/buyers",
    status: "active",
    color: "text-blue-600",
    bgColor: "bg-blue-100"
  },
  {
    title: "Sample Department",
    description: "6-part sample workflow from creation to operations",
    icon: ClipboardCheckIcon,
    href: "/dashboard/erp/samples",
    status: "active",
    color: "text-green-600",
    bgColor: "bg-green-100"
  },
  {
    title: "Supplier Info",
    description: "Manage suppliers and material vendors",
    icon: Building2Icon,
    href: "/dashboard/erp/suppliers",
    status: "active",
    color: "text-purple-600",
    bgColor: "bg-purple-100"
  },
  {
    title: "Style Info",
    description: "Manage garment styles, variants, and materials",
    icon: ShoppingBagIcon,
    href: "/dashboard/erp/styles",
    status: "active",
    color: "text-pink-600",
    bgColor: "bg-pink-100"
  },
  {
    title: "Operations & SMV",
    description: "Define operations and calculate SMV values",
    icon: SettingsIcon,
    href: "/dashboard/erp/operations",
    status: "active",
    color: "text-orange-600",
    bgColor: "bg-orange-100"
  },
  {
    title: "Order Info",
    description: "Track orders from creation to shipment",
    icon: FolderDotIcon,
    href: "/dashboard/erp/orders",
    status: "active",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100"
  },
  {
    title: "Production Planning",
    description: "Plan and schedule production activities",
    icon: CalendarIcon,
    href: "/dashboard/erp/production",
    status: "active",
    color: "text-cyan-600",
    bgColor: "bg-cyan-100"
  },
  {
    title: "Store & Inventory",
    description: "Manage materials, stock, and inventory",
    icon: ArchiveRestoreIcon,
    href: "/dashboard/erp/inventory",
    status: "active",
    color: "text-teal-600",
    bgColor: "bg-teal-100"
  },
  {
    title: "Reports",
    description: "Generate and view various ERP reports",
    icon: ChartPieIcon,
    href: "/dashboard/erp/reports",
    status: "active",
    color: "text-red-600",
    bgColor: "bg-red-100"
  }
];

export default function ERPDashboard() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">RMG ERP System</h1>
        <p className="text-muted-foreground mt-2">
          Complete enterprise resource planning for ready-made garment manufacturing
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon;
          const isActive = module.status === "active";

          return (
            <Link
              key={module.title}
              href={isActive ? module.href : "#"}
              className={`block ${!isActive && "pointer-events-none opacity-60"}`}
            >
              <Card className={`hover:shadow-lg transition-shadow ${isActive ? "cursor-pointer" : "cursor-not-allowed"}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${module.bgColor}`}>
                      <Icon className={`h-6 w-6 ${module.color}`} />
                    </div>
                    {!isActive && (
                      <span className="text-xs font-medium px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <CardTitle className="mt-4">{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
          <CardDescription>Overview of your RMG operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Active Buyers</p>
              <p className="text-2xl font-bold">3</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Samples</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Orders</p>
              <p className="text-2xl font-bold">-</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Production Lines</p>
              <p className="text-2xl font-bold">-</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
