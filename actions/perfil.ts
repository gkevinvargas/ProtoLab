"use server"

import { usuarioAutenticado } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"


export async function actualizarPerfil(formData: FormData) {

    const supabase = await createClient()
    const usuario = await usuarioAutenticado()

    const nombre = formData.get('nombre') as string
    const apellido_paterno = formData.get('apellidoPaterno') as string
    const apellido_materno = formData.get('apellidoMaterno') as string
    const municipio = formData.get('municipio') as string
    const semestre = formData.get('semestre') as string

    const { error } = await supabase.from('perfiles')
                                    .update({nombre, apellido_paterno, apellido_materno, municipio, semestre})
                                    .eq('id', usuario.id)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/perfil')
}




