"use client"

import dynamic from "next/dynamic"
import { useTheme } from "next-themes"
import "@uiw/react-markdown-preview/markdown.css"

const MarkdownPreview = dynamic(
  () => import("@uiw/react-markdown-preview").then((mod) => mod.default),
  { ssr: false }
)

export function MarkdownViewer({ source }: { source: string }) {
  const { theme } = useTheme()
  return (
    <div data-color-mode={theme === 'dark' ? 'dark' : 'light'} className="bg-transparent">
      <MarkdownPreview source={source} style={{ backgroundColor: 'transparent' }} />
    </div>
  )
}
