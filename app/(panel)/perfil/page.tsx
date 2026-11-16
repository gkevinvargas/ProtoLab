import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { usuarioAutenticado } from '@/lib/auth'
import { IconUser } from '@tabler/icons-react'
import { FormPerfil } from '@/components/perfil/form-perfil'

export const instant = false

export default async function PerfilPage() {
  const supabase = await createClient()
  const usuario = await usuarioAutenticado()

  const { data: perfil, error } = await supabase.from('perfiles')
    .select('*')
    .eq('id', usuario.id)
    .maybeSingle()

  if (error) throw new Error('No se pudo cargar el perfil.')

  return (

    <div className='mx-auto max-w-[1700px] p-2 sm:p-6 lg:p-7'>
      <header className='bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
        <div className='flex items-center gap-5'>
          <div className='w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center text-slate-600 text-2xl font-bold shadow-inner'>
            {perfil.nombre ? `${perfil.nombre.charAt(0) + perfil.apellido_paterno?.charAt(0)}` : <IconUser size={32} />}
          </div>

          <div>
            <div className='flex items-center gap-3'>
              <h1 className='text-2x1 font-bold text-slate-900'>
                {perfil.nombre ? `${perfil.nombre + ' ' + perfil.apellido_paterno + ' ' + perfil.apellido_materno}` : 'Bienveni@'}
              </h1>
            </div>
            <p className='text-sm text-slate-500 mt-1'>
              {usuario.email}
            </p>
          </div>
        </div>
      </header>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6'>
          <FormPerfil 
            nombre={perfil.nombre} 
            apellido_paterno={perfil.apellido_paterno} 
            apellido_materno={perfil.apellido_materno} 
            municipio={perfil.municipio}
            semestre={perfil.semestre}
            correo={usuario.email}
          />
        </div>
      </div>
    </div>

  )
}




