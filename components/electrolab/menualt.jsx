<aside className={`${mobileMenuOpen ? 'fixed inset-y-0 left-0 z-40 flex' : 'hidden'} w-[250px] shrink-0 flex-col border-r border-[#E7EDF5] bg-white md:static md:flex`}>
          <div className="flex h-[76px] items-center gap-3 border-b border-[#E7EDF5] px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3478F6] text-white"><Icon name="circuit" size={23} /></div>
            <div><div className="text-[17px] font-bold tracking-tight">Proto<span className="text-[#3478F6]">Lab</span></div><div className="text-[10px] uppercase tracking-[.2em] text-[#718096]">Módulo de electrónica</div></div>
            <button type="button" onClick={() => setMobileMenuOpen(false)} className="ml-auto rounded-lg p-2 text-[#718096] hover:bg-[#F5F9FF] md:hidden" aria-label="Cerrar menú"><Icon name="close" /></button>
          </div>

          <div className="px-4 pt-7">
            <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#718096]">Espacio de trabajo</p>
            <nav className="space-y-1">
              {navigation.map((item) => {
                const active = activeNav === item.label;
                return <button key={item.label} type="button" onClick={() => { setActiveNav(item.label); setMobileMenuOpen(false); }} className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-[13px] transition ${active ? 'bg-[#EAF1FF] font-semibold text-[#8865D8]' : 'text-[#718096] hover:bg-[#F5F9FF] hover:text-[#24324A]'}`}><Icon name={item.icon} size={18} /><span>{item.label}</span>{active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#21B8A6]" />}</button>;
              })}
            </nav>
          </div>

          <div className="mx-4 mt-8 border-t border-[#E7EDF5] pt-6">
            <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#718096]">Preferencias</p>
            <button type="button" onClick={() => setActiveNav('Configuración')} className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-[13px] transition ${activeNav === 'Configuración' ? 'bg-[#EAF1FF] text-[#8865D8]' : 'text-[#718096] hover:bg-[#F5F9FF] hover:text-[#24324A]'}`}><Icon name="settings" size={18} />Configuración</button>
          </div>

          <div className="mt-auto p-4">
            <div className="rounded-xl border border-[#DCE9FF] bg-[#F0F7FF] p-4">
              <div className="mb-2 flex items-center gap-2 text-[#8865D8]"><Icon name="info" size={16} /><span className="text-xs font-semibold">Área de aprendizaje</span></div>
              <p className="text-[11px] leading-relaxed text-[#718096]">Experimenta con componentes y construye circuitos en un entorno seguro.</p>
            </div>
            <div className="mt-4 flex items-center gap-3 px-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#DCE9FF] text-xs font-bold text-[#8865D8]">ES</div>
              <div className="min-w-0"><p className="text-xs font-medium text-[#34445D]">Estudiante</p><p className="text-[10px] text-[#718096]">Cuenta de laboratorio</p></div>
              <span className="ml-auto h-2 w-2 rounded-full bg-emerald-400" />
            </div>
          </div>
        </aside> 
        
        
        
        {mobileMenuOpen && <button className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={() => setMobileMenuOpen(false)} aria-label="Cerrar menú" />}

    
          
          <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-[#E7EDF5] bg-white px-4 sm:px-7">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setMobileMenuOpen(true)} className="rounded-lg p-2 text-[#718096] hover:bg-[#F5F9FF] md:hidden" aria-label="Abrir menú"><Icon name="menu" /></button>
              <div><div className="flex items-center gap-2 text-[11px] text-[#718096]"><span>ElectroLab</span><Icon name="chevron" size={12}/><span className="text-[#526575]">Prácticas</span></div><h1 className="mt-1 text-[15px] font-semibold tracking-tight text-[#24324A] sm:text-base">Editor de circuitos</h1></div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden items-center gap-2 rounded-full border border-[rgb(24,109,220)] bg-[#F7FAFC] px-3 py-1.5 text-[11px] text-[#718096] lg:flex"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400"/> JSON local</span>
              <input ref={practiceFileInputRef} type="file" accept=".json,application/json" className="sr-only" onChange={handlePracticeFileChange} aria-label="Seleccionar archivo JSON de una práctica" />
              {!onApproved && (
                <button type="button" onClick={() => practiceFileInputRef.current?.click()} className="flex items-center gap-2 rounded-lg border border-[#C9BDF0] bg-[#F0EAFE] px-3 py-2 text-xs font-semibold text-[#7654C5] transition hover:bg-[#E9E1FC]"><Icon name="upload" size={15}/><span>Cargar JSON</span></button>
              )}
            </div>
          </header>
          