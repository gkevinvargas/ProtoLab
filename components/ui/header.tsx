import { IconUserCircle } from "@tabler/icons-react";


function Header() {
    return (
        <header
        id= "inicio"
        className="mb-10 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#718096]">
              Plataforma de aprendizaje
            </p>
            <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font.bold"> Estudiante</p>
              <p className="text-xs text-[#718096]">
              Mi area de estudio
              </p>
            </div>

            <div className="flex h11 w-11 items-center justify-center rounded-full bg-[#DCE9FF] font-bold text-[#3478F6]">
              <IconUserCircle size={21} stroke={1.8}/>
            </div>
          </div>
        </header>
    )
}


export default Header


