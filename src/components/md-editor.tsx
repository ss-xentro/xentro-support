"use client"

import dynamic from "next/dynamic"
import { useTheme } from "next-themes"
import "@uiw/react-md-editor/markdown-editor.css"
import "@uiw/react-markdown-preview/markdown.css"

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor"),
  { ssr: false }
)

export function MarkdownEditor({
  value,
  onChange
}: {
  value: string
  onChange: (val: string) => void
}) {
  const { theme } = useTheme()
  return (
    <div data-color-mode={theme === 'dark' ? 'dark' : 'light'}>
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || "")}
        height={500}
        className="w-full"
      />
    </div>
  )
}
