import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LLM AI Chat',
  description: 'LLM AI Chat Interface',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
