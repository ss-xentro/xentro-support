"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

export function ThemeManager() {
  const pathname = usePathname()

  useEffect(() => {
    // Check if the current route is an admin route
    if (pathname.startsWith("/admin")) {
      document.documentElement.classList.add("dark")
      document.documentElement.classList.remove("light")
      document.documentElement.style.colorScheme = "dark"
    } else {
      document.documentElement.classList.add("light")
      document.documentElement.classList.remove("dark")
      document.documentElement.style.colorScheme = "light"
    }
  }, [pathname])

  return null
}
