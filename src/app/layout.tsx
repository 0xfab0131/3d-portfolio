import type { Metadata } from 'next'
import './globals.css' // Import global styles

export const metadata: Metadata = {
  title: '3D Monitors Showcase', // Customize title
  description: 'Interactive 3D computer monitors display built with React Three Fiber' // Customize description
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
