import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"


import "./globals.css" // Assurez-vous que ce chemin est correct pour votre fichier CSS global

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DeskHub - Centre de Support Intelligent",
  description: "Votre plateforme de support technique avancée pour la gestion des incidents et du matériel.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
