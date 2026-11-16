import { cache } from "react";
import { createClient } from "./supabase/server";
import { redirect } from "next/navigation";


export const usuarioAutenticado = cache(async () => {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        redirect('/')
    }

    if (!user) {
        redirect("/");
    }

    return user
})






