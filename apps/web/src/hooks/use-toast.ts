import * as React from "react"
import { Toast } from "@base-ui/react/toast"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"



type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

function useToast() {
  const { toasts, add, close, update } = Toast.useToastManager()

  const toast = React.useCallback(({ title, description, action, ...props }: Omit<ToasterToast, "id">) => {
    const id = add({
      title,
      description,
      timeout: (props as any).duration,
      onClose: (props as any).onOpenChange ? () => (props as any).onOpenChange?.(false) : undefined,
      data: { action, ...props }
    })

    return {
      id,
      dismiss: () => close(id),
      update: (newProps: Partial<ToasterToast>) => update(id, {
        title: newProps.title,
        description: newProps.description,
        data: { ...newProps }
      }),
    }
  }, [add, close, update])

  return {
    toasts: toasts.map((t: any) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      action: (t.data as any)?.action,
      ... (t.data as any),
      toast: t,
    })),
    toast,
    dismiss: (toastId?: string) => {
      if (toastId) {
        close(toastId)
      } else {
        toasts.forEach((t: any) => close(t.id))
      }
    },
  }
}

export { useToast }
