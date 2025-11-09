import React from "react"

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger"
}

export default function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center px-4 py-2 rounded-md font-medium transition-transform transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"

  const variants: Record<string, string> = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-sm hover:shadow-md focus:ring-blue-500",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200 active:scale-95 shadow-sm hover:shadow-md focus:ring-gray-300",
    danger: "bg-red-500 text-white hover:bg-red-600 active:scale-95 shadow-sm hover:shadow-md focus:ring-red-400",
  }

  return (
    <button
      {...props}
      className={`${base} ${variants[variant]} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
    />
  )
}
