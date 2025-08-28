"use client"

import * as React from "react"
import {
  LayoutDashboard,
  DoorOpen,
  CalendarCheck,
  Users,
  Settings,
  LifeBuoy,
  Send,
  Building,
  Hotel,
  Bed,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Admin",
    email: "admin@example.com",
    avatar: "/avatars/admin.png",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Rooms",
      url: "/dashboard/rooms",
      icon: DoorOpen,
      items: [
        {
          title: "All Rooms",
          url: "/dashboard/rooms",
        },
        {
          title: "Add New",
          url: "/dashboard/rooms/new",
        },
        {
          title: "Room Types",
          url: "/dashboard/rooms/types",
        },
      ],
    },
    {
      title: "Bills",
      url: "/dashboard/bills",
      icon: CalendarCheck,
      items: [
        {
          title: "All Bookings",
          url: "/dashboard/bookings",
        },
        {
          title: "Add New",
          url: "/dashboard/bookings/new",
        },
        {
          title: "Calendar",
          url: "/dashboard/bookings/calendar",
        },
      ],
    },
    {
      title: "Reports",
      url: "/dashboard/reports",
      icon: Users,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "Main Hotel",
      url: "#",
      icon: Hotel,
    },
    {
      name: "Guest House",
      url: "#",
      icon: Building,
    },
    {
      name: "Dormitory",
      url: "#",
      icon: Bed,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Hotel className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Room Management</span>
                  <span className="truncate text-xs">Main Hotel</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
