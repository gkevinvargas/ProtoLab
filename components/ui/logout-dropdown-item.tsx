"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { IconLogout } from "@tabler/icons-react";

export function DropdownMenuItemLogout() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <DropdownMenuItem 
      onClick={logout}
      className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-red-600 transition-colors focus:bg-red-50 focus:text-red-700"
    >
      <IconLogout size={16} stroke={2} />
      <span>Cerrar sesión</span>
    </DropdownMenuItem>
  )
}