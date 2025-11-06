import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Design Arena - Finance Document Generator',
  description: 'Professional invoice, quotation, and bill generator for Design Arena',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
