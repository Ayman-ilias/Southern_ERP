"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar
} from "@/components/ui/sidebar";
import {
  ArchiveRestoreIcon,
  Building2Icon,
  CalendarIcon,
  ChartPieIcon,
  ChevronRight,
  ClipboardCheckIcon,
  FolderDotIcon,
  SettingsIcon,
  ShoppingBagIcon,
  UsersIcon,
  ContactIcon,
  ShipIcon,
  LandmarkIcon,
  FlaskConicalIcon,
  CalculatorIcon,
  PackageIcon,
  PaletteIcon,
  BoxIcon,
  FileTextIcon,
  ShieldIcon,
  type LucideIcon
} from "lucide-react";
import Link from "next/link";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";

type NavGroup = {
  title: string;
  items: NavItem;
};

type NavItem = {
  title: string;
  href: string;
  icon?: LucideIcon;
  isComing?: boolean;
  isDataBadge?: string;
  isNew?: boolean;
  newTab?: boolean;
  isAdminOnly?: boolean;
  items?: NavItem;
}[];

export const navItems: NavGroup[] = [
  {
    title: "Main Menu",
    items: [
      {
        title: "Client Info",
        href: "#",
        icon: UsersIcon,
        items: [
          {
            title: "Buyer Info",
            href: "/dashboard/erp/clients/buyers",
            icon: UsersIcon
          },
          {
            title: "Supplier Info",
            href: "/dashboard/erp/clients/suppliers",
            icon: Building2Icon
          },
          {
            title: "Contact Info",
            href: "/dashboard/erp/clients/contacts",
            icon: ContactIcon
          },
          {
            title: "Shipping Info",
            href: "/dashboard/erp/clients/shipping",
            icon: ShipIcon
          },
          {
            title: "Banking Info",
            href: "/dashboard/erp/clients/banking",
            icon: LandmarkIcon
          }
        ]
      },
      {
        title: "Sample Department",
        href: "#",
        icon: ClipboardCheckIcon,
        items: [
          {
            title: "Style Summary",
            href: "/dashboard/erp/samples/style-summary",
            icon: FileTextIcon
          },
          {
            title: "Style Variants",
            href: "/dashboard/erp/samples/style-variants",
            icon: PaletteIcon
          },
          {
            title: "Add Material",
            href: "/dashboard/erp/samples/add-material",
            icon: PackageIcon
          },
          {
            title: "Required Materials",
            href: "/dashboard/erp/samples/required-materials",
            icon: BoxIcon
          },
          {
            title: "Sample Primary Info",
            href: "/dashboard/erp/samples/primary",
            icon: ClipboardCheckIcon
          },
          {
            title: "Sample TNA",
            href: "/dashboard/erp/samples/tna",
            icon: CalendarIcon
          },
          {
            title: "Sample Plan",
            href: "/dashboard/erp/samples/plan",
            icon: ShoppingBagIcon
          },
          {
            title: "Add New Operation",
            href: "/dashboard/erp/samples/operations",
            icon: SettingsIcon
          },
          {
            title: "SMV Calculation",
            href: "/dashboard/erp/samples/smv",
            icon: CalculatorIcon
          },
          {
            title: "Material Requirement",
            href: "/dashboard/erp/samples/mrp",
            icon: PackageIcon
          }
        ]
      },
      {
        title: "Order Info",
        href: "#",
        icon: FolderDotIcon,
        items: [
          {
            title: "Orders",
            href: "/dashboard/erp/orders",
            icon: FolderDotIcon
          },
          {
            title: "Production Planning",
            href: "/dashboard/erp/production",
            icon: CalendarIcon
          },
          {
            title: "Store & Inventory",
            href: "/dashboard/erp/inventory",
            icon: ArchiveRestoreIcon
          },
          {
            title: "Reports",
            href: "/dashboard/erp/reports",
            icon: ChartPieIcon
          }
        ]
      },
      {
        title: "User Management",
        href: "/dashboard/erp/users",
        icon: ShieldIcon,
        isAdminOnly: true
      }
    ]
  }
];

export function NavMain() {
  const pathname = usePathname();
  const { isMobile } = useSidebar();
  const { user } = useAuth();

  // Check if user has access to a department
  const hasAccess = (departmentId: string): boolean => {
    if (!user) return false;
    // Superusers have access to everything
    if (user.is_superuser) return true;
    // Check if user has this department in their access list
    return user.department_access?.includes(departmentId) || false;
  };

  // Filter nav items based on user permissions
  const getFilteredNavItems = () => {
    if (!user) return [];
    
    return navItems.map((nav) => ({
      ...nav,
      items: nav.items
        .map((item) => {
          // Map department IDs to menu items
          const departmentMap: Record<string, string> = {
            "Client Info": "client_info",
            "Sample Department": "sample_department",
            "Order Info": "orders",
          };

          const deptId = departmentMap[item.title];
          
          // If item has a department ID, check access
          if (deptId && !hasAccess(deptId)) {
            return null; // Filter out items user doesn't have access to
          }

          // If item has sub-items, filter those too
          if (item.items && Array.isArray(item.items)) {
            return {
              ...item,
              items: item.items.filter((subItem) => {
                // All sub-items inherit parent department access
                return true;
              }),
            };
          }

          return item;
        })
        .filter((item) => item !== null),
    }));
  };

  const filteredNavItems = getFilteredNavItems();

  return (
    <>
      {filteredNavItems.map((nav) => (
        <SidebarGroup key={nav.title}>
          <SidebarGroupLabel>{nav.title}</SidebarGroupLabel>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              {nav.items.map((item) => {
                // Hide admin-only items from non-admins
                if (item.isAdminOnly && !user?.is_superuser) {
                  return null;
                }

                return (
                <SidebarMenuItem key={item.title}>
                  {Array.isArray(item.items) && item.items.length > 0 ? (
                    <>
                      <div className="hidden group-data-[collapsible=icon]:block">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <SidebarMenuButton tooltip={item.title}>
                              {item.icon && <item.icon />}
                              <span>{item.title}</span>
                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            side={isMobile ? "bottom" : "right"}
                            align={isMobile ? "end" : "start"}
                            className="min-w-48 rounded-lg">
                            <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
                            {item.items?.map((item) => (
                              <DropdownMenuItem
                                className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10! active:bg-[var(--primary)]/10!"
                                asChild
                                key={item.title}>
                                <a href={item.href}>{item.title}</a>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <Collapsible className="group/collapsible block group-data-[collapsible=icon]:hidden">
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                            tooltip={item.title}>
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item?.items?.map((subItem, key) => (
                              <SidebarMenuSubItem key={key}>
                                <SidebarMenuSubButton
                                  className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                                  isActive={pathname === subItem.href}
                                  asChild>
                                  <Link href={subItem.href} target={subItem.newTab ? "_blank" : ""}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    </>
                  ) : (
                    <SidebarMenuButton
                      className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
                      isActive={pathname === item.href}
                      tooltip={item.title}
                      asChild>
                      <Link href={item.href} target={item.newTab ? "_blank" : ""}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                  {!!item.isComing && (
                    <SidebarMenuBadge className="peer-hover/menu-button:text-foreground opacity-50">
                      Coming
                    </SidebarMenuBadge>
                  )}
                  {!!item.isNew && (
                    <SidebarMenuBadge className="border border-green-400 text-green-600 peer-hover/menu-button:text-green-600">
                      New
                    </SidebarMenuBadge>
                  )}
                  {!!item.isDataBadge && (
                    <SidebarMenuBadge className="peer-hover/menu-button:text-foreground">
                      {item.isDataBadge}
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
