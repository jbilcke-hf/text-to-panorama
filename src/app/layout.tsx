import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  // alternative title: Panomania? Teleportal? Panoportal
  title: 'Panoremix: generate panoramas from text! Powered by Hugging Face 🤗',
  description: 'Generate panoramas from text! Powered by Hugging Face 🤗',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
