import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css";
import React from "react";
import { Header } from "@/components/ui/labs/Header";
import { Sidebar } from "@/components/ui/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],

});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  //Te dedico este archivo Ximena <3
  title: "Protolab | Aprende creando",
  description:
    "Plataforma educativa interactiva de programacion, robotica, analisis de datos y electronica."

}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen">

        {/* CONTENIDO PRINCIPAL */}
        {children}

      </body>
    </html>
  )
}