import Toast from "./Toast"

interface ToastContainerProps {
  toasts: Array<{ id: number; message: string; type: "success" | "error" | "info" }>
  removeToast: (id: number) => void
}

export default function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}
