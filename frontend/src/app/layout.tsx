import type { Metadata } from "next"
import { Syne, JetBrains_Mono } from "next/font/google"
import "./globals.css"
const syne = Syne({ subsets:["latin"], variable:"--font-syne", weight:["400","600","700","800"] })
const mono = JetBrains_Mono({ subsets:["latin"], variable:"--font-mono", weight:["300","400","500"] })
export const metadata: Metadata = {
  title: "AgentScout — Répertoire mondial des agents IA open source",
  description: "Découvrez +10 000 agents IA open source scannés depuis GitHub, HuggingFace, PyPI et plus.",
}
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${syne.variable} ${mono.variable}`}>
      <body style={{ background:"#05060a", color:"#dde0f5", fontFamily:"var(--font-syne),sans-serif" }}>
        {children}
      </body>
    </html>
  )
}
