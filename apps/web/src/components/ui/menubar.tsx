import * as React from "react"
import { Menu as MenubarPrimitive } from "@base-ui/react/menu"
import { IconCheck, IconChevronRight, IconCircle } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

function MenubarMenu({
  ...props
}: MenubarPrimitive.Root.Props) {
  return <MenubarPrimitive.Root data-slot="menubar-menu" {...props} />
}

function MenubarGroup({
  ...props
}: MenubarPrimitive.Group.Props) {
  return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />
}

function MenubarPortal({
  ...props
}: MenubarPrimitive.Portal.Props) {
  return <MenubarPrimitive.Portal data-slot="menubar-portal" {...props} />
}

function MenubarRadioGroup({
  ...props
}: MenubarPrimitive.RadioGroup.Props) {
  return <MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />
}

function MenubarSub({
  ...props
}: MenubarPrimitive.SubmenuRoot.Props) {
  return <MenubarPrimitive.SubmenuRoot data-slot="menubar-sub" {...props} />
}

const Menubar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-9 items-center space-x-1 border bg-background p-1 shadow-sm",
      className
    )}
    {...props}
  />
))
Menubar.displayName = "Menubar"

function MenubarTrigger({
  className,
  ...props
}: MenubarPrimitive.Trigger.Props) {
  return (
    <MenubarPrimitive.Trigger
      data-slot="menubar-trigger"
      className={cn(
        "flex cursor-default select-none items-center px-3 py-1 text-sm font-medium outline-none focus:bg-accent focus:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground",
        className
      )}
      {...props}
    />
  )
}
MenubarTrigger.displayName = "MenubarTrigger"

function MenubarSubTrigger({
  className,
  inset,
  children,
  ...props
}: MenubarPrimitive.SubmenuTrigger.Props & {
  inset?: boolean
}) {
  return (
    <MenubarPrimitive.SubmenuTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset}
      className={cn(
        "flex cursor-default select-none items-center px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground",
        inset && "pl-8",
        className
      )}
      {...props}
    >
      {children}
      <IconChevronRight className="ml-auto h-4 w-4" />
    </MenubarPrimitive.SubmenuTrigger>
  )
}
MenubarSubTrigger.displayName = "MenubarSubTrigger"

function MenubarSubContent({
  className,
  ...props
}: MenubarPrimitive.Popup.Props) {
  return (
    <MenubarPrimitive.Popup
      data-slot="menubar-sub-content"
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden border bg-popover p-1 text-popover-foreground shadow-lg data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95",
        className
      )}
      {...props}
    />
  )
}
MenubarSubContent.displayName = "MenubarSubContent"

function MenubarContent({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  ...props
}: MenubarPrimitive.Popup.Props &
  Pick<MenubarPrimitive.Positioner.Props, "align" | "alignOffset" | "sideOffset">) {
  return (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <MenubarPrimitive.Popup
          data-slot="menubar-content"
          className={cn(
            "z-50 min-w-[12rem] overflow-hidden border bg-popover p-1 text-popover-foreground shadow-md data-open:animate-in data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95",
            className
          )}
          {...props}
        />
      </MenubarPrimitive.Positioner>
    </MenubarPrimitive.Portal>
  )
}
MenubarContent.displayName = "MenubarContent"

function MenubarItem({
  className,
  inset,
  ...props
}: MenubarPrimitive.Item.Props & {
  inset?: boolean
}) {
  return (
    <MenubarPrimitive.Item
      data-slot="menubar-item"
      data-inset={inset}
      className={cn(
        "relative flex cursor-default select-none items-center px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        inset && "pl-8",
        className
      )}
      {...props}
    />
  )
}
MenubarItem.displayName = "MenubarItem"

function MenubarCheckboxItem({
  className,
  children,
  checked,
  ...props
}: MenubarPrimitive.CheckboxItem.Props) {
  return (
    <MenubarPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      className={cn(
        "relative flex cursor-default select-none items-center py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <MenubarPrimitive.CheckboxItemIndicator>
          <IconCheck className="h-4 w-4" />
        </MenubarPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  )
}
MenubarCheckboxItem.displayName = "MenubarCheckboxItem"

function MenubarRadioItem({
  className,
  children,
  ...props
}: MenubarPrimitive.RadioItem.Props) {
  return (
    <MenubarPrimitive.RadioItem
      data-slot="menubar-radio-item"
      className={cn(
        "relative flex cursor-default select-none items-center py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <MenubarPrimitive.RadioItemIndicator>
          <IconCircle className="h-4 w-4 fill-current" />
        </MenubarPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  )
}
MenubarRadioItem.displayName = "MenubarRadioItem"

function MenubarLabel({
  className,
  inset,
  ...props
}: MenubarPrimitive.GroupLabel.Props & {
  inset?: boolean
}) {
  return (
    <MenubarPrimitive.GroupLabel
      data-slot="menubar-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-sm font-semibold",
        inset && "pl-8",
        className
      )}
      {...props}
    />
  )
}
MenubarLabel.displayName = "MenubarLabel"

function MenubarSeparator({
  className,
  ...props
}: MenubarPrimitive.Separator.Props) {
  return (
    <MenubarPrimitive.Separator
      data-slot="menubar-separator"
      className={cn("-mx-1 my-1 h-px bg-muted", className)}
      {...props}
    />
  )
}
MenubarSeparator.displayName = "MenubarSeparator"

const MenubarShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}
MenubarShortcut.displayname = "MenubarShortcut"

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
}
