import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"

import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------- */
/*                                    Root                                    */
/* -------------------------------------------------------------------------- */

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal

/* -------------------------------------------------------------------------- */
/*                                  Overlay                                   */
/* -------------------------------------------------------------------------- */

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    {...props}
    className={cn(
      "modal-overlay fixed inset-0 z-50 bg-black/50",
      className
    )}
  />
))

DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

/* -------------------------------------------------------------------------- */
/*                                  Content                                   */
/* -------------------------------------------------------------------------- */

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      {...props}
      className={cn(
        "modal-content fixed  top-1/2 left-1/2 z-50 w-full max-w-[640px]",
        "-translate-x-1/2 -translate-y-1/2",
        "rounded-3xl border border-slate-200 bg-white px-6 py-6",
        "shadow-[0_25px_45px_rgba(15,15,15,0.15)]",
        "will-change-[transform,opacity]",
        className
      )}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
))

DialogContent.displayName = DialogPrimitive.Content.displayName

/* -------------------------------------------------------------------------- */
/*                                   Header                                   */
/* -------------------------------------------------------------------------- */

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col gap-1 text-left", className)}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

/* -------------------------------------------------------------------------- */
/*                                    Title                                   */
/* -------------------------------------------------------------------------- */

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    {...props}
    className={cn("text-lg font-semibold leading-none", className)}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

/* -------------------------------------------------------------------------- */
/*                                Description                                 */
/* -------------------------------------------------------------------------- */

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    {...props}
    className={cn("text-sm text-slate-500", className)}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

/* -------------------------------------------------------------------------- */
/*                                   Footer                                   */
/* -------------------------------------------------------------------------- */

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "mt-6 flex flex-wrap items-center justify-end gap-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

/* -------------------------------------------------------------------------- */
/*                                   Close                                    */
/* -------------------------------------------------------------------------- */

const DialogClose = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Close
    ref={ref}
    {...props}
    className={cn(
      "absolute right-4 top-4 rounded-full p-1 text-slate-500",
      "transition hover:text-slate-900",
      className
    )}
  />
))
DialogClose.displayName = DialogPrimitive.Close.displayName

/* -------------------------------------------------------------------------- */
/*                                   Exports                                  */
/* -------------------------------------------------------------------------- */

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
}
