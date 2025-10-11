import { DynamicBreadcrumb } from "@/components/DynamicBreadcrumb"
import React from 'react'
import { AppSidebar } from "@/components/app-sidebar"

import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import ProtectedPage from '@/components/ProtectedPage'
import { Toaster } from '@/components/ui/toaster'

type Props = {
  children: React.ReactNode
}

const Layout = ({ children }: Props) => {
  return (
  <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <DynamicBreadcrumb />
          </div>
        </header>
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      
        <ProtectedPage>{children}</ProtectedPage>
    </div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
}

export default Layout
