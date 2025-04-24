"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, src, ...props }, ref) => {
  // Use a base64 placeholder image for default avatar instead of relying on an external file
  const defaultAvatar = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjOTRBM0I4Ii8+CjxwYXRoIGQ9Ik0xMDAgMTI2QzExNy42NzMgMTI2IDEzMiAxMTEuNjczIDEzMiA5NEMxMzIgNzYuMzI3MSAxMTcuNjczIDYyIDEwMCA2MkM4Mi4zMjcxIDYyIDY4IDc2LjMyNzEgNjggOTRDNjggMTExLjY3MyA4Mi4zMjcxIDEyNiAxMDAgMTI2WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTEwMCAxNDJDNjYuODYyOCAxNDIgNDAgMTY4Ljg2MyA0MCAyMDJIMTYwQzE2MCAxNjguODYzIDEzMy4xMzcgMTQyIDEwMCAxNDJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4=";
  
  return (
    <AvatarPrimitive.Image
      ref={ref}
      className={cn("aspect-square h-full w-full", className)}
      src={src || defaultAvatar}
      {...props}
    />
  )
})
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-gray-200 text-gray-600",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }