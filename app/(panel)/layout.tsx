import "../globals.css";
import React, { Children } from "react";
import { Header } from "@/components/ui/labs/Header";
import { Sidebar } from "@/components/ui/sidebar";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function AuthCheck({ children}: { children: React.ReactNode}) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/");
  }

  return <>{Children}</>
}

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (

    <div className="min-h-screen bg-[#F7FAFC] text-[#24324A]">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col">
          <Header nombreLaboratorio="ElectroLab" tipoContenido='Prácticas' tipoEditor='Editor de circuitos' />
          <div className="flex-1 overflow-auto">

            {/* CONTENIDO PRINCIPAL */}
            {children}

          </div>
        </main>

      </div>
    </div>
  );
}



