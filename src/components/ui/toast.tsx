"use client"

import * as React from "react"
import { Toast as ToastPrimitive } from "@base-ui/react/toast"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
  XIcon,
  CheckCircle2,
  InfoIcon,
  AlertTriangle,
  AlertCircle,
  Loader2,
} from "lucide-react"

const rawToastManager = ToastPrimitive.createToastManager()

export type ToastType = "success" | "error" | "info" | "warning" | "loading"

export interface ToastOptions {
  title?: React.ReactNode
  description?: React.ReactNode
  type?: ToastType
  action?: React.ReactNode
  [key: string]: any
}

export interface ToastFunction {
  (titleOrOptions: string | ToastOptions, options?: ToastOptions): string
  success: (title: string, options?: Omit<ToastOptions, "type" | "title">) => string
  error: (title: string, options?: Omit<ToastOptions, "type" | "title">) => string
  info: (title: string, options?: Omit<ToastOptions, "type" | "title">) => string
  warning: (title: string, options?: Omit<ToastOptions, "type" | "title">) => string
  loading: (title: string, options?: Omit<ToastOptions, "type" | "title">) => string
  close: (id: string) => void
  update: (id: string, options: any) => void
  promise: <T>(promise: Promise<T>, options: any) => Promise<T>
  manager: typeof rawToastManager
}

export const toast: ToastFunction = Object.assign(
  function (titleOrOptions: string | ToastOptions, options?: ToastOptions): string {
    if (typeof titleOrOptions === "string") {
      return rawToastManager.add({
        title: titleOrOptions,
        description: options?.description,
        type: options?.type,
        ...options,
      })
    }
    return rawToastManager.add(titleOrOptions)
  },
  {
    success: (title: string, options?: Omit<ToastOptions, "type" | "title">) =>
      rawToastManager.add({ title, type: "success", ...options }),
    error: (title: string, options?: Omit<ToastOptions, "type" | "title">) =>
      rawToastManager.add({ title, type: "error", ...options }),
    info: (title: string, options?: Omit<ToastOptions, "type" | "title">) =>
      rawToastManager.add({ title, type: "info", ...options }),
    warning: (title: string, options?: Omit<ToastOptions, "type" | "title">) =>
      rawToastManager.add({ title, type: "warning", ...options }),
    loading: (title: string, options?: Omit<ToastOptions, "type" | "title">) =>
      rawToastManager.add({ title, type: "loading", ...options }),
    close: (id: string) => rawToastManager.close(id),
    update: (id: string, options: any) => rawToastManager.update(id, options),
    promise: <T,>(promise: Promise<T>, options: any) => rawToastManager.promise(promise, options),
    manager: rawToastManager,
  }
)

function ToastProvider({ ...props }: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider {...props} />
}

function ToastPortal({ ...props }: ToastPrimitive.Portal.Props) {
  return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />
}

function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        "pointer-events-none fixed top-4 inset-x-4 z-[9999] mx-auto flex max-w-sm flex-col gap-2.5 outline-none sm:top-5 sm:right-5 sm:left-auto sm:mx-0 sm:w-full",
        className
      )}
      {...props}
    />
  )
}

function Toast({ className, ...props }: ToastPrimitive.Root.Props) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      className={cn(
        "group/toast pointer-events-auto relative z-[calc(1000-var(--toast-index))] w-full origin-top rounded-2xl border border-slate-200/90 bg-white/95 p-0 text-slate-900 shadow-xl shadow-slate-900/10 backdrop-blur-md will-change-transform outline-none select-none focus-visible:ring-2 focus-visible:ring-sky-500",
        "[--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)+calc(var(--toast-index)*var(--gap))+var(--toast-swipe-movement-y))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.08)))] [--shrink:calc(1-var(--scale))]",
        "h-(--height) [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+(var(--toast-index)*var(--peek))+(var(--shrink)*var(--height))))_scale(var(--scale))] [transition:transform_400ms_cubic-bezier(0.22,1,0.36,1),opacity_300ms,height_150ms]",
        "after:absolute after:bottom-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
        "data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
        "data-limited:opacity-0 data-starting-style:[transform:translateY(-120%)]",
        "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(-120%)]",
        "data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+120%))]",
        "data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-120%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+120%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-120%))]",
        className
      )}
      {...props}
    />
  )
}

function ToastContent({ className, ...props }: ToastPrimitive.Content.Props) {
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      className={cn(
        "flex h-full items-center gap-3 overflow-hidden p-3.5 transition-opacity duration-200",
        className
      )}
      {...props}
    />
  )
}

function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn("text-xs font-bold text-slate-900 leading-snug sm:text-sm", className)}
      {...props}
    />
  )
}

function ToastDescription({
  className,
  ...props
}: ToastPrimitive.Description.Props) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn("text-xs text-slate-500 leading-relaxed", className)}
      {...props}
    />
  )
}

function ToastAction({
  className,
  render = <Button variant="outline" size="sm" />,
  ...props
}: ToastPrimitive.Action.Props) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      render={render}
      className={cn("shrink-0", className)}
      {...props}
    />
  )
}

function ToastClose({
  className,
  children,
  render = <button type="button" aria-label="Close" />,
  ...props
}: ToastPrimitive.Close.Props) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="Close toast"
      render={render}
      className={cn(
        "rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none transition-colors shrink-0",
        className
      )}
      {...props}
    >
      {children ?? <XIcon className="h-4 w-4" aria-hidden="true" />}
    </ToastPrimitive.Close>
  )
}

function ToastIcon({ type }: { type: string | undefined }) {
  if (type === "success") {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 shadow-2xs">
        <CheckCircle2 className="h-4.5 w-4.5" aria-hidden="true" />
      </span>
    )
  }

  if (type === "error") {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-200/60 shadow-2xs">
        <AlertCircle className="h-4.5 w-4.5" aria-hidden="true" />
      </span>
    )
  }

  if (type === "warning") {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 shadow-2xs">
        <AlertTriangle className="h-4.5 w-4.5" aria-hidden="true" />
      </span>
    )
  }

  if (type === "info") {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 border border-sky-200/60 shadow-2xs">
        <InfoIcon className="h-4.5 w-4.5" aria-hidden="true" />
      </span>
    )
  }

  if (type === "loading") {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600 border border-slate-200 shadow-2xs">
        <Loader2 className="h-4.5 w-4.5 animate-spin text-sky-600" aria-hidden="true" />
      </span>
    )
  }

  return null
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager()

  return toasts.map((toastItem) => (
    <Toast key={toastItem.id} toast={toastItem}>
      <ToastContent>
        <ToastIcon type={toastItem.type} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <ToastTitle />
          <ToastDescription />
        </div>
        <ToastAction />
        <ToastClose />
      </ToastContent>
    </Toast>
  ))
}

export function Toaster({
  children,
  toastManager = rawToastManager,
  timeout = 4000,
  limit = 4,
  ...props
}: ToastPrimitive.Provider.Props) {
  return (
    <ToastProvider toastManager={toastManager} timeout={timeout} limit={limit} {...props}>
      {children}
      <ToastPortal>
        <ToastViewport>
          <ToastList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  )
}

export const createToastManager = ToastPrimitive.createToastManager
export const useToastManager = ToastPrimitive.useToastManager

export {
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
}
