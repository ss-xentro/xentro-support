"use client"

import * as React from "react"

type Theme = "dark" | "light" | "system"

const ThemeContext = React.createContext<{ theme: Theme, setTheme: (theme: Theme) => void }>({
  theme: "system",
  setTheme: () => null
})

export function ThemeProvider({ children }: { children: React.ReactNode, attribute?: string, defaultTheme?: string, enableSystem?: boolean, disableTransitionOnChange?: boolean }) {
  const [theme, setThemeState] = React.useState<Theme>("system")

  React.useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme | null
    if (saved) setThemeState(saved)
  }, [])

  const setTheme = React.useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem("theme", newTheme)
    
    const root = document.documentElement
    if (newTheme === "dark" || (newTheme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      root.classList.add("dark")
      root.classList.remove("light")
      root.style.colorScheme = "dark"
    } else {
      root.classList.remove("dark")
      root.classList.add("light")
      root.style.colorScheme = "light"
    }
  }, [])

  React.useEffect(() => {
    setTheme(theme)
  }, [theme, setTheme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => React.useContext(ThemeContext)
