
// app/register/layout.tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = { title: "Créer un compte - DeskHub" }

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <section className={inter.className}>{children}</section>
}
