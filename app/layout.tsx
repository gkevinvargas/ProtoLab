import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css";
import "../components/learning/learning-activities.css";
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
      <body className="min-h-screen bg-slate-50 text-slate-900">
        {/*CONTENEDOR RESPONSIVO*/}
        <div className="min-h-screen flex flex-col lg:flex-row">
          <aside className="w-full lg:w-64 bg-white border-b lg:border-r border-slate-200 flex-shrink-0">
            <Sidebar/>
            </aside>
            <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
              <div className="max-w-7xl mx-auto w-full flex flex-col gap-6">
                {children}
                </div>
                </main>
                </div>

              
              </body>
            
       

       
    
    </html>
  )
}