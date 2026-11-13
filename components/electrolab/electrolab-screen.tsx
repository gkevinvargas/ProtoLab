'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type PointerEvent, type ReactNode, type RefObject } from 'react';
import ledPracticeJson from '@/lib/electrolab/examples/led-basico.json';
import rcChargePracticeJson from '@/lib/electrolab/examples/rc-carga.json';
import rcDischargePracticeJson from '@/lib/electrolab/examples/rc-descarga.json';
import { evaluatePractice, loadPracticeIntoEditor, simulateCircuit, simulateRCTransient } from '@/lib/electrolab';
import type { ElectroLabPractice, EditorCircuitState, SimulationResult, RCTransientMode, RCTransientResult, PracticeEvaluationResult } from '@/lib/electrolab';
import { Sidebar } from '../ui/sidebar';

type ComponentKind = 'bateria' | 'resistencia' | 'led' | 'capacitor' | 'interruptor';
type LabComponent = {
  id: string;
  kind: ComponentKind;
  reference: string;
  value: string;
  unit: string;
  x: number;
  y: number;
};
type TerminalRef = { componentId: string; side: 'left' | 'right' };
type CircuitConnection = { id: string; from: TerminalRef; to: TerminalRef };
type EditorSnapshot = { components: LabComponent[]; connections: CircuitConnection[] };

type IconName =
  | 'grid' | 'circuit' | 'box' | 'book' | 'settings' | 'chevron' | 'plus'
  | 'battery' | 'resistor' | 'led' | 'capacitor' | 'switch' | 'play'
  | 'terminal' | 'trash' | 'save' | 'search' | 'sliders' | 'info'
  | 'activity' | 'check' | 'menu' | 'close' | 'upload';

function Icon({ name, size = 18, className = '' }: { name: IconName; size?: number; className?: string }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true as const,
  };

  const drawings: Record<IconName, ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    circuit: <><path d="M4 7h5l3 5h8"/><path d="M4 17h5l3-5"/><circle cx="4" cy="7" r="1.5"/><circle cx="20" cy="12" r="1.5"/><circle cx="4" cy="17" r="1.5"/><path d="M12 4v3m0 10v3"/></>,
    box: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22V5.5Z"/><path d="M4 17a2.5 2.5 0 0 1 2.5-2.5H20M8 7h8"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.2 2.1-2 2-2.1-1.2-.2.1a8 8 0 0 1-1.8.7l-.6 2.2h-2.8l-.6-2.2a8 8 0 0 1-1.8-.7l-2.1 1.2-2-2 1.2-2.1-.1-.2a8 8 0 0 1-.7-1.8L1.8 12.6V9.8L4 9.2a8 8 0 0 1 .7-1.8l-.1-.2-1.2-2.1 2-2 2.1 1.2.2-.1a8 8 0 0 1 1.8-.7l.6-2.2h2.8l.6 2.2a8 8 0 0 1 1.8.7l2.1-1.2 2 2-1.2 2.1.1.2a8 8 0 0 1 .7 1.8l2.2.6v2.8l-2.2.6a8 8 0 0 1-.7 1.8Z" transform="translate(1 1) scale(.92)"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    battery: <><rect x="3" y="7" width="17" height="10" rx="2"/><path d="M22 10v4M8 10v4m4-2h4"/></>,
    resistor: <><path d="M2 12h3l2-5 4 10 4-10 4 10 2-5h3"/></>,
    led: <><path d="M3 12h5m8 0h5"/><path d="M8 7v10l8-5-8-5Z"/><path d="m14 5 3-3m-1 7 4-1"/></>,
    capacitor: <><path d="M2 12h7m6 0h7M9 5v14m6-14v14"/></>,
    switch: <><path d="M3 12h5m8 0h5M8 12l6-7"/><circle cx="8" cy="12" r="1.5"/><circle cx="16" cy="12" r="1.5"/></>,
    play: <path d="m8 5 11 7-11 7V5Z"/>,
    terminal: <><path d="m7 8-4 4 4 4m10-8 4 4-4 4M14 5l-4 14"/></>,
    trash: <><path d="M4 7h16M10 11v6m4-6v6M5 7l1 14h12l1-14M9 7V4h6v3"/></>,
    save: <><path d="M5 3h12l4 4v14H3V3h2Z"/><path d="M7 3v6h10V3M7 21v-8h10v8"/></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></>,
    sliders: <><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2" fill="#FFFFFF"/><circle cx="15" cy="12" r="2" fill="#FFFFFF"/><circle cx="8" cy="18" r="2" fill="#FFFFFF"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/></>,
    activity: <path d="M3 12h4l3-8 4 16 3-8h4"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    upload: <><path d="M12 16V4m-5 5 5-5 5 5"/><path d="M4 16v4h16v-4"/></>,
  };

  return <svg {...common}>{drawings[name]}</svg>;
}

const componentDefaults: Record<ComponentKind, { label: string; value: string; unit: string; icon: IconName; description: string }> = {
  bateria: { label: 'Fuente DC', value: '9', unit: 'V', icon: 'battery', description: 'Fuente de alimentación continua' },
  resistencia: { label: 'Resistencia', value: '220', unit: 'Ω', icon: 'resistor', description: 'Resistencia eléctrica' },
  led: { label: 'LED rojo', value: '2', unit: 'V', icon: 'led', description: 'Diodo emisor de luz' },
  capacitor: { label: 'Capacitor', value: '100', unit: 'µF', icon: 'capacitor', description: 'Capacitor cerámico o electrolítico' },
  interruptor: { label: 'Interruptor', value: 'Cerrado', unit: '', icon: 'switch', description: 'Interruptor de una posición' },
};

const initialComponents: LabComponent[] = [
  { id: 'bat-1', kind: 'bateria', reference: 'V1', value: '9', unit: 'V', x: 15, y: 190 },
  { id: 'res-1', kind: 'resistencia', reference: 'R1', value: '220', unit: 'Ω', x: 50, y: 190 },
  { id: 'led-1', kind: 'led', reference: 'D1', value: '2', unit: 'V', x: 84, y: 190 },
];

const defaultPracticeLoad = loadPracticeIntoEditor(ledPracticeJson as unknown);
const defaultPractice: ElectroLabPractice | null = defaultPracticeLoad.ok ? defaultPracticeLoad.practice : null;
const defaultEditorState: EditorCircuitState = defaultPracticeLoad.ok
  ? defaultPracticeLoad.editorState
  : { components: initialComponents, connections: [] };

function ComponentSymbol({ kind }: { kind: ComponentKind }) {
  const common = 'h-12 w-full max-w-[150px]';
  if (kind === 'bateria') return (
    <svg viewBox="0 0 150 48" className={common} aria-hidden="true">
      <path d="M3 24H53M97 24h50" stroke="#64748B" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M63 8v32M87 15v18" stroke="#8865D8" strokeWidth="3.2" strokeLinecap="round" />
      <text x="58" y="8" fill="#8865D8" fontSize="8" fontWeight="700">+</text>
      <text x="91" y="13" fill="#718096" fontSize="9" fontWeight="700">−</text>
    </svg>
  );
  if (kind === 'resistencia') return (
    <svg viewBox="0 0 170 48" className="h-12 w-full max-w-[170px]" aria-hidden="true">
      <path d="M2 24h25m116 0h25" stroke="#64748B" strokeWidth="2.4" strokeLinecap="round" />
      <rect x="27" y="12" width="114" height="24" rx="5" fill="#F4D7A1" stroke="#C58A3A" strokeWidth="1.8" />
      <path d="M48 13v22m18-22v22m18-22v22m18-22v22" stroke="#A45A36" strokeWidth="5" opacity=".9" />
      <path d="M48 13v22m18-22v22m18-22v22m18-22v22" stroke="#F8E8C8" strokeWidth="1.2" />
    </svg>
  );
  if (kind === 'led') return (
    <svg viewBox="0 0 150 48" className={common} aria-hidden="true">
      <path d="M2 24h35m42 0h69" stroke="#64748B" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M37 10v28l39-14-39-14Z" fill="#FCE7E7" stroke="#D65B66" strokeWidth="2" strokeLinejoin="round" />
      <path d="M78 9v30" stroke="#D65B66" strokeWidth="2.5" strokeLinecap="round" />
      <path d="m53 7 8-7m-2 15 8-7" stroke="#D65B66" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m60 1 1 5-5-1m12 1 1 5-5-1" fill="none" stroke="#D65B66" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  if (kind === 'capacitor') return (
    <svg viewBox="0 0 150 48" className={common} aria-hidden="true">
      <path d="M2 24h57m32 0h57" stroke="#64748B" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M59 7v34m32-34v34" stroke="#3478F6" strokeWidth="3.2" strokeLinecap="round" />
      <text x="66" y="8" fill="#3478F6" fontSize="8" fontWeight="700">+</text>
    </svg>
  );
  return (
    <svg viewBox="0 0 150 48" className={common} aria-hidden="true">
      <path d="M2 24h35m76 0h35" stroke="#64748B" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="37" cy="24" r="4" fill="#FFFFFF" stroke="#64748B" strokeWidth="2" />
      <circle cx="113" cy="24" r="4" fill="#FFFFFF" stroke="#64748B" strokeWidth="2" />
      <path d="M41 22 100 7" stroke="#21B8A6" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M96 7h8" stroke="#21B8A6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CircuitNode({
  component,
  selected,
  onSelect,
  onDragStart,
  onTerminalClick,
  pendingTerminal,
}: {
  component: LabComponent;
  selected: boolean;
  onSelect: () => void;
  onDragStart: (event: PointerEvent<HTMLDivElement>, id: string) => void;
  onTerminalClick: (componentId: string, side: 'left' | 'right') => void;
  pendingTerminal: TerminalRef | null;
}) {
  const definition = componentDefaults[component.kind];
  const terminalNames = component.kind === 'led' ? ['A', 'K'] : component.kind === 'bateria' ? ['+', '−'] : ['1', '2'];
  const width = component.kind === 'resistencia' ? 190 : 164;
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(); } }}
      onPointerDown={(event) => onDragStart(event, component.id)}
      aria-pressed={selected}
      aria-label={`${component.reference}, ${definition.label}, ${component.value} ${component.unit}. Arrastra para mover.`}
      className={`group pointer-events-auto absolute z-10 flex -translate-x-1/2 touch-none flex-col items-center rounded-xl border px-3 pb-3 pt-2.5 text-center transition duration-150 focus:outline-none focus:ring-2 focus:ring-[#A78BFA] ${selected ? 'border-[#8865D8] bg-white shadow-[0_0_0_3px_rgba(136,101,216,.14),0_8px_22px_rgba(36,50,74,.10)]' : 'border-[#DCE5F0] bg-white shadow-[0_5px_16px_rgba(36,50,74,.07)] hover:border-[#AFA0E8] hover:shadow-[0_8px_20px_rgba(36,50,74,.10)]'}`}
      style={{ left: `${component.x}%`, top: `${component.y}px`, width, cursor: 'grab' }}
    >
      <span className="flex w-full items-center justify-between gap-3">
        <span className="rounded-md bg-[#F0EAFE] px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-[#7654C5]">{component.reference}</span>
        <span className={`h-2 w-2 rounded-full ${selected ? 'bg-[#21B8A6] ring-2 ring-[#D8F5F0]' : 'bg-[#CBD5E1]'}`} />
      </span>
      <div className="relative mt-2 flex w-full items-center justify-center rounded-lg bg-[#F8FAFD] px-1 py-1.5">
        <ComponentSymbol kind={component.kind} />
        <button type="button" aria-label={`Terminal ${terminalNames[0]} de ${component.reference}`} title={`Terminal ${terminalNames[0]}`} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); onTerminalClick(component.id, 'left'); }} className={`absolute -left-3 top-1/2 z-20 h-4 w-4 -translate-y-1/2 rounded-full border-[3px] bg-white shadow-sm transition hover:scale-125 ${pendingTerminal?.componentId === component.id && pendingTerminal.side === 'left' ? 'border-[#21B8A6] ring-4 ring-[#D8F5F0]' : 'border-[#8865D8]'}`} />
        <button type="button" aria-label={`Terminal ${terminalNames[1]} de ${component.reference}`} title={`Terminal ${terminalNames[1]}`} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); onTerminalClick(component.id, 'right'); }} className={`absolute -right-3 top-1/2 z-20 h-4 w-4 -translate-y-1/2 rounded-full border-[3px] bg-white shadow-sm transition hover:scale-125 ${pendingTerminal?.componentId === component.id && pendingTerminal.side === 'right' ? 'border-[#21B8A6] ring-4 ring-[#D8F5F0]' : 'border-[#8865D8]'}`} />
      </div>
      <span className="mt-2 text-[11px] font-semibold text-[#34445D]">{definition.label}</span>
      <span className="mt-0.5 rounded-full bg-[#F0F7FF] px-2 py-0.5 text-[10px] font-medium tabular-nums text-[#526575]">{component.value} {component.unit}</span>
      <span className="mt-1.5 flex w-full justify-between px-1 text-[8px] font-semibold uppercase tracking-wider text-[#A0AEC0]">
        <span>{terminalNames[0]}</span><span>{terminalNames[1]}</span>
      </span>
    </div>
  );
}

function PropertiesFields({
  component,
  onSaveHistory,
  onUpdate,
}: {
  component: LabComponent | null;
  onSaveHistory: () => void;
  onUpdate: (changes: Partial<LabComponent>) => void;
}) {
  if (!component) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center px-6 py-8 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F0F7FF] text-[#718096]"><Icon name="sliders" size={21}/></div>
        <p className="text-xs font-medium text-[#526575]">Sin selección</p>
        <p className="mt-1 max-w-[220px] text-[10px] leading-relaxed text-[#718096]">Selecciona un componente del lienzo para consultar y modificar sus propiedades.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#E7EDF5] bg-[#F7FAFC] p-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F0EAFE] text-[#8865D8]"><Icon name={componentDefaults[component.kind].icon} size={21}/></div>
        <div className="min-w-0"><p className="truncate text-xs font-semibold text-[#24324A]">{componentDefaults[component.kind].label}</p><p className="mt-0.5 text-[10px] text-[#718096]">{componentDefaults[component.kind].description}</p></div>
      </div>
      <div className="space-y-3.5">
        <label className="block"><span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[.12em] text-[#718096]">Referencia</span><input value={component.reference} onFocus={onSaveHistory} onChange={(event) => onUpdate({ reference: event.target.value })} className="min-h-11 w-full rounded-lg border border-[#E7EDF5] bg-[#F7FAFC] px-3 py-2.5 text-sm text-[#34445D] outline-none transition focus:border-[#8865D8] focus:ring-2 focus:ring-[#8865D8]/15" /></label>
        <label className="block"><span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[.12em] text-[#718096]">Valor</span><div className="flex min-h-11 overflow-hidden rounded-lg border border-[#E7EDF5] bg-[#F7FAFC] focus-within:border-[#8865D8] focus-within:ring-2 focus-within:ring-[#8865D8]/15"><input value={component.value} onFocus={onSaveHistory} onChange={(event) => onUpdate({ value: event.target.value })} className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-[#34445D] outline-none"/><span className="flex min-w-12 items-center justify-center border-l border-[#E7EDF5] bg-[#F0F7FF] px-2 text-xs text-[#718096]">{component.unit || '—'}</span></div></label>
        <div><span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[.12em] text-[#718096]">Tipo de componente</span><div className="flex min-h-11 items-center rounded-lg border border-[#E7EDF5] bg-[#F0F7FF] px-3 py-2.5 text-sm text-[#526575]">{componentDefaults[component.kind].label}</div></div>
      </div>
      <div className="my-4 border-t border-[#E7EDF5]"/>
      <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.12em] text-[#718096]"><Icon name="terminal" size={13}/>Información</div>
      <div className="space-y-2 rounded-lg bg-[#F7FAFC] p-3 text-[10px]">
        <div className="flex justify-between gap-2"><span className="text-[#718096]">Identificador</span><span className="max-w-[150px] truncate font-mono text-[#526575]">{component.id}</span></div>
      </div>
      <p className="mt-4 text-[10px] leading-relaxed text-[#A0AEC0]">Puedes mover el componente en el área de trabajo y crear conexiones desde sus terminales. Los cambios siguen siendo locales y todavía no se guardan en una práctica JSON.</p>
    </div>
  );
}

function getTerminalPoint(component: LabComponent, side: 'left' | 'right') {
  const width = component.kind === 'resistencia' ? 190 : 164;
  return { x: component.x * 16 + (side === 'left' ? -width / 2 : width / 2), y: component.y + 64 };
}

function chartPolyline(
  samples: RCTransientResult['samples'],
  readValue: (sample: RCTransientResult['samples'][number]) => number,
  width = 680,
  height = 160,
) {
  if (samples.length < 2) return '';
  const values = samples.map(readValue);
  let min = Math.min(0, ...values);
  let max = Math.max(0, ...values);
  if (Math.abs(max - min) < 1e-12) { max += 1; min -= 1; }
  const paddingX = 34;
  const paddingY = 14;
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;
  return values.map((value, index) => {
    const x = paddingX + (index / (values.length - 1)) * innerWidth;
    const y = paddingY + ((max - value) / (max - min)) * innerHeight;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');
}

function TransientResults({ result }: { result: RCTransientResult }) {
  const voltagePoints = chartPolyline(result.samples, (sample) => sample.capacitorVoltageV);
  const currentPoints = chartPolyline(result.samples, (sample) => Math.abs(sample.capacitorCurrentA * 1000));
  const last = result.samples[result.samples.length - 1];
  const formatTime = (value: number) => value >= 1 ? `${value.toFixed(3)} s` : `${(value * 1000).toFixed(2)} ms`;
  const formatResistance = (value: number) => value >= 1_000_000 ? `${(value / 1_000_000).toFixed(3)} MΩ` : value >= 1_000 ? `${(value / 1_000).toFixed(3)} kΩ` : `${value.toFixed(2)} Ω`;
  const statusClasses = result.status === 'error'
    ? 'border-rose-200 bg-rose-50 text-rose-700'
    : result.status === 'warning'
      ? 'border-amber-200 bg-amber-50 text-amber-800'
      : 'border-emerald-200 bg-emerald-50 text-emerald-700';

  return (
    <div className="space-y-3">
      <div className={`rounded-lg border px-3 py-2.5 ${statusClasses}`}>
        <p className="text-[11px] font-semibold">{result.summary}</p>
        <p className="mt-1 text-[9px] text-[#718096]">Método numérico: Backward Euler · {result.sampleCount} muestras · {result.mode === 'charge' ? 'Carga' : 'Descarga'} RC</p>
      </div>

      {result.status !== 'error' && result.samples.length > 1 && (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-lg border border-[#E7EDF5] bg-white p-3"><p className="text-[9px] text-[#718096]">Constante τ</p><p className="mt-1 text-sm font-semibold tabular-nums text-[#34445D]">{formatTime(result.timeConstantSeconds ?? 0)}</p></div>
            <div className="rounded-lg border border-[#E7EDF5] bg-white p-3"><p className="text-[9px] text-[#718096]">R equivalente</p><p className="mt-1 text-sm font-semibold tabular-nums text-[#34445D]">{formatResistance(result.equivalentResistanceOhms ?? 0)}</p></div>
            <div className="rounded-lg border border-[#E7EDF5] bg-white p-3"><p className="text-[9px] text-[#718096]">Voltaje inicial</p><p className="mt-1 text-sm font-semibold tabular-nums text-[#34445D]">{result.initialVoltageV.toFixed(3)} V</p></div>
            <div className="rounded-lg border border-[#E7EDF5] bg-white p-3"><p className="text-[9px] text-[#718096]">Voltaje final</p><p className="mt-1 text-sm font-semibold tabular-nums text-[#34445D]">{(result.finalVoltageV ?? 0).toFixed(3)} V</p></div>
          </div>

          <div className="rounded-xl border border-[#E7EDF5] bg-white p-3 sm:p-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><div><p className="text-[11px] font-semibold text-[#34445D]">Voltaje del capacitor</p><p className="text-[9px] text-[#718096]">{result.capacitorReference} · Vc(t)</p></div><span className="rounded-md bg-[#F0EAFE] px-2 py-1 text-[9px] font-semibold text-[#7654C5]">Voltios</span></div>
            <svg viewBox="0 0 680 160" className="h-auto w-full" role="img" aria-label="Gráfica del voltaje del capacitor a través del tiempo">
              <title>Voltaje del capacitor en función del tiempo</title>
              {[0, 1, 2, 3, 4].map((line) => <line key={line} x1="34" x2="646" y1={14 + line * 33} y2={14 + line * 33} stroke="#E7EDF5" strokeDasharray="3 4"/>)}
              <line x1="34" x2="646" y1="146" y2="146" stroke="#CBD5E1"/>
              <polyline points={voltagePoints} fill="none" stroke="#8865D8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <text x="34" y="158" fontSize="9" fill="#718096">0 s</text><text x="646" y="158" fontSize="9" textAnchor="end" fill="#718096">{formatTime(result.durationSeconds)}</text>
            </svg>
          </div>

          <div className="rounded-xl border border-[#E7EDF5] bg-white p-3 sm:p-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><div><p className="text-[11px] font-semibold text-[#34445D]">Magnitud de la corriente del capacitor</p><p className="text-[9px] text-[#718096]">|Ic(t)| · miliamperios (mA)</p></div><span className="rounded-md bg-[#E8F8F5] px-2 py-1 text-[9px] font-semibold text-[#168F80]">mA</span></div>
            <svg viewBox="0 0 680 160" className="h-auto w-full" role="img" aria-label="Gráfica de la magnitud de la corriente del capacitor a través del tiempo">
              <title>Magnitud de la corriente del capacitor en función del tiempo</title>
              {[0, 1, 2, 3, 4].map((line) => <line key={line} x1="34" x2="646" y1={14 + line * 33} y2={14 + line * 33} stroke="#E7EDF5" strokeDasharray="3 4"/>)}
              <line x1="34" x2="646" y1="146" y2="146" stroke="#CBD5E1"/>
              <polyline points={currentPoints} fill="none" stroke="#21B8A6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <text x="34" y="158" fontSize="9" fill="#718096">0 s</text><text x="646" y="158" fontSize="9" textAnchor="end" fill="#718096">{formatTime(result.durationSeconds)}</text>
            </svg>
          </div>

          {last && <div className="rounded-lg border border-[#E7EDF5] bg-[#F8FAFD] px-3 py-2 text-[10px] text-[#526575]">En <strong>{formatTime(last.timeSeconds)}</strong>, el capacitor {result.mode === 'charge' ? 'alcanzó' : 'terminó con'} <strong>{last.capacitorVoltageV.toFixed(4)} V</strong>; la corriente final fue <strong>{(last.capacitorCurrentA * 1000).toFixed(4)} mA</strong>.</div>}
        </>
      )}

      {result.issues.length > 0 && <div className="space-y-1.5"><p className="text-[10px] font-semibold uppercase tracking-wide text-[#718096]">Advertencias y errores</p>{result.issues.map((item, index) => <div key={`${item.code}-${index}`} className={`rounded-md border px-3 py-2 text-[10px] leading-relaxed ${item.severity === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>{item.message}</div>)}</div>}

      <p className="text-[9px] leading-relaxed text-[#A0AEC0]">Modelo RC lineal de primer orden con una capacitancia. Se calcula R equivalente desde los terminales del capacitor y se integra con Backward Euler. Los LEDs y los circuitos con varios capacitores no están incluidos en este análisis.</p>
    </div>
  );
}


function DCResults({ result }: { result: SimulationResult }) {
  const statusClasses = result.status === 'error'
    ? 'border-rose-200 bg-rose-50 text-rose-700'
    : result.status === 'warning'
      ? 'border-amber-200 bg-amber-50 text-amber-800'
      : 'border-emerald-200 bg-emerald-50 text-emerald-700';

  return (
    <div className="space-y-3">
      <div className={`rounded-lg border px-3 py-2.5 ${statusClasses}`}>
        <p className="text-[11px] font-semibold">{result.summary}</p>
        <p className="mt-1 text-[9px] text-[#718096]">Análisis de estado estable DC · {result.iterations} iteración(es)</p>
      </div>

      {result.measurements.length > 0 ? (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#718096]">Mediciones por componente</p>
          {result.measurements.map((measurement) => (
            <article key={measurement.componentId} className="rounded-xl border border-[#E7EDF5] bg-white p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-semibold text-[#34445D]">{measurement.reference}</p>
                  <p className="text-[9px] capitalize text-[#A0AEC0]">{measurement.type}</p>
                </div>
                <span className="shrink-0 rounded-md bg-[#F0F7FF] px-2 py-1 text-[9px] font-medium text-[#526575]">{measurement.state ?? 'Calculado'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <div className="rounded-lg bg-[#F8FAFD] px-2 py-1.5">
                  <p className="text-[9px] text-[#718096]">Voltaje</p>
                  <p className="mt-0.5 text-[11px] font-semibold tabular-nums text-[#34445D]">{measurement.voltageV === null ? '—' : `${measurement.voltageV.toFixed(3)} V`}</p>
                </div>
                <div className="rounded-lg bg-[#F8FAFD] px-2 py-1.5">
                  <p className="text-[9px] text-[#718096]">Corriente</p>
                  <p className="mt-0.5 text-[11px] font-semibold tabular-nums text-[#34445D]">{measurement.currentA === null ? '—' : `${(measurement.currentA * 1000).toFixed(2)} mA`}</p>
                </div>
                <div className="col-span-2 rounded-lg bg-[#F8FAFD] px-2 py-1.5 sm:col-span-1">
                  <p className="text-[9px] text-[#718096]">Potencia</p>
                  <p className="mt-0.5 text-[11px] font-semibold tabular-nums text-[#34445D]">{measurement.powerW === null ? '—' : `${(measurement.powerW * 1000).toFixed(2)} mW`}</p>
                </div>
              </div>
              {measurement.note && <p className="mt-2 text-[9px] leading-relaxed text-[#718096]">{measurement.note}</p>}
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-[#E7EDF5] bg-[#F8FAFD] p-3 text-[10px] text-[#718096]">No hay mediciones individuales disponibles para este circuito.</p>
      )}

      {result.issues.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#718096]">Advertencias y errores</p>
          {result.issues.map((item, index) => (
            <div key={`${item.code}-${index}`} className={`rounded-md border px-3 py-2 text-[10px] leading-relaxed ${item.severity === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>{item.message}</div>
          ))}
        </div>
      )}

      <div className="rounded-lg bg-[#F8FAFD] px-3 py-2 text-[9px] leading-relaxed text-[#718096]">
        Corriente positiva de izquierda a derecha. En la batería, corriente negativa significa que suministra energía. El capacitor se considera circuito abierto en estado estable DC.
      </div>
    </div>
  );
}

function EvaluationModal({
  result,
  dialogRef,
  onClose,
  onReviewResults,
}: {
  result: PracticeEvaluationResult;
  dialogRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onReviewResults: () => void;
}) {
  const passed = result.passed;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#18253B]/55 px-3 py-5 backdrop-blur-[3px] sm:px-6"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="evaluation-modal-title"
        aria-describedby="evaluation-modal-summary"
        tabIndex={-1}
        className="my-auto flex max-h-[min(92dvh,900px)] w-full max-w-[680px] flex-col overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_24px_80px_rgba(13,28,52,.28)] outline-none focus-visible:ring-2 focus-visible:ring-[#8865D8]"
      >
        <div className={`relative overflow-hidden px-5 pb-5 pt-5 sm:px-7 sm:pb-6 ${passed ? 'bg-gradient-to-br from-[#ECFDF5] via-white to-[#F0F7FF]' : 'bg-gradient-to-br from-[#FFF1F2] via-white to-[#FFF7ED]'}`}>
          <button type="button" onClick={onClose} aria-label="Cerrar evaluación" className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg border border-[#E7EDF5] bg-white/90 text-[#718096] transition hover:bg-white hover:text-[#24324A] focus:outline-none focus:ring-2 focus:ring-[#8865D8]"><Icon name="close" size={17}/></button>
          <div className="flex items-center gap-2">
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${passed ? 'bg-[#D1FAE5] text-[#15803D]' : 'bg-[#FFE4E6] text-[#BE123C]'}`}><Icon name={passed ? 'check' : 'info'} size={19}/></span>
            <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] ${passed ? 'bg-[#D1FAE5] text-[#166534]' : 'bg-[#FFE4E6] text-[#9F1239]'}`}>{passed ? 'Práctica aprobada' : 'Práctica no aprobada'}</span>
          </div>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0 pr-5">
              <h2 id="evaluation-modal-title" className="text-xl font-semibold tracking-tight text-[#24324A] sm:text-2xl">Resultado de la evaluación</h2>
              <p className="mt-1 line-clamp-2 text-xs text-[#718096]">{result.practiceTitle}</p>
            </div>
            <div className="shrink-0 sm:text-right">
              <p className={`text-4xl font-bold tracking-tight tabular-nums ${passed ? 'text-[#15803D]' : 'text-[#BE123C]'}`}>{result.score}<span className="text-lg font-semibold text-[#718096]">/100</span></p>
              <p className="text-[10px] text-[#718096]">Mínimo para aprobar: {result.passingScore}/100</p>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#E7EDF5]"><div className={`h-full rounded-full transition-all ${passed ? 'bg-[#16A34A]' : 'bg-[#F4728B]'}`} style={{ width: `${result.score}%` }}/></div>
          <p id="evaluation-modal-summary" className="mt-3 text-xs leading-relaxed text-[#526575]">{passed ? '¡Buen trabajo! Cumpliste con la calificación mínima de esta práctica.' : `Necesitas ${result.passingScore} puntos para aprobar. Revisa los criterios que no alcanzaste y corrige tu circuito.`}</p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-[.12em] text-[#526575]">Desglose de resultados</h3>
            <span className="text-[10px] font-medium tabular-nums text-[#718096]">{result.pointsEarned} de {result.pointsPossible} puntos</span>
          </div>
          <div className="space-y-2.5">
            {result.criteria.map((criterion) => (
              <div key={criterion.id} className={`rounded-xl border px-3.5 py-3 ${criterion.passed ? 'border-[#D8F0E3] bg-[#FBFEFC]' : 'border-[#F5E1D8] bg-[#FFFCFA]'}`}>
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${criterion.passed ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#FFE4E6] text-[#BE123C]'}`}><Icon name={criterion.passed ? 'check' : 'close'} size={13}/></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                      <p className="text-xs font-semibold text-[#34445D]">{criterion.title}</p>
                      <span className={`text-[10px] font-bold tabular-nums ${criterion.passed ? 'text-[#15803D]' : 'text-[#BE123C]'}`}>{criterion.pointsEarned}/{criterion.pointsPossible} pts</span>
                    </div>
                    <p className="mt-1 text-[10px] leading-relaxed text-[#718096]">{criterion.feedback}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-[#E7EDF5] bg-[#F7FAFC] px-3.5 py-3">
            <p className="text-[10px] font-semibold text-[#526575]">Retroalimentación</p>
            <p className="mt-1 text-[10px] leading-relaxed text-[#718096]">{passed ? 'Tu circuito cumple los criterios establecidos. Conserva este procedimiento y utiliza las mediciones para explicar el comportamiento eléctrico observado.' : 'Los criterios no cumplidos aparecen señalados arriba. Vuelve al circuito, realiza los ajustes necesarios y ejecuta nuevamente el análisis antes de evaluar otra vez.'}</p>
          </div>
          <p className="mt-3 text-[9px] leading-relaxed text-[#A0AEC0]">Este resultado es local y corresponde a esta sesión. Todavía no se guarda como calificación en una cuenta o plataforma académica.</p>
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-[#E7EDF5] bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
          <button type="button" onClick={onReviewResults} className="flex min-h-10 items-center justify-center rounded-lg border border-[#DCE5F0] px-4 py-2 text-xs font-semibold text-[#526575] transition hover:bg-[#F7FAFC] focus:outline-none focus:ring-2 focus:ring-[#8865D8]">Revisar resultados</button>
          <button type="button" onClick={onClose} className="flex min-h-10 items-center justify-center rounded-lg bg-[#3478F6] px-5 py-2 text-xs font-semibold text-white transition hover:bg-[#2868DD] focus:outline-none focus:ring-2 focus:ring-[#3478F6] focus:ring-offset-2">Cerrar evaluación</button>
        </div>
      </div>
    </div>
  );
}

function ResultsContent({
  simulationResult,
  transientResult,
}: {
  simulationResult: SimulationResult | null;
  transientResult: RCTransientResult | null;
}) {
  if (transientResult) return <TransientResults result={transientResult} />;
  if (simulationResult) return <DCResults result={simulationResult} />;

  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center px-4 py-8 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F0EAFE] text-[#8865D8]"><Icon name="activity" size={22}/></div>
      <p className="text-[11px] font-semibold text-[#34445D]">Todavía no hay resultados</p>
      <p className="mt-1 max-w-[240px] text-[10px] leading-relaxed text-[#718096]">Ejecuta Simular DC o Analizar RC. Los resultados se mostrarán aquí, sin duplicar paneles en la parte inferior.</p>
    </div>
  );
}

export default function ElectroLabScreen() {
  const [currentPractice, setCurrentPractice] = useState<ElectroLabPractice | null>(defaultPractice);
  const [practiceFileName, setPracticeFileName] = useState('led-basico.json');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [transientResult, setTransientResult] = useState<RCTransientResult | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<PracticeEvaluationResult | null>(null);
  const [evaluationModalOpen, setEvaluationModalOpen] = useState(false);
  const [transientMode, setTransientMode] = useState<RCTransientMode>('charge');
  const [transientInitialVoltage, setTransientInitialVoltage] = useState('0');
  const [components, setComponents] = useState<LabComponent[]>(defaultEditorState.components);
  const [selectedId, setSelectedId] = useState<string | null>(defaultEditorState.components[1]?.id ?? defaultEditorState.components[0]?.id ?? null);
  const [connections, setConnections] = useState<CircuitConnection[]>(defaultEditorState.connections);
  const [pendingTerminal, setPendingTerminal] = useState<TerminalRef | null>(null);
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [activeNav, setActiveNav] = useState('Editor de circuitos');
  const [inspectorTab, setInspectorTab] = useState<'propiedades' | 'resultados'>('propiedades');
  const [notice, setNotice] = useState('ElectroLab listo. Puedes editar el circuito y ejecutar un análisis de corriente continua.');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const propertiesReturnFocusRef = useRef<HTMLElement | null>(null);
  const practiceFileInputRef = useRef<HTMLInputElement | null>(null);
  const evaluationButtonRef = useRef<HTMLButtonElement | null>(null);
  const evaluationDialogRef = useRef<HTMLDivElement | null>(null);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [zoom, setZoom] = useState(1);
  const undoStack = useRef<EditorSnapshot[]>([]);
  const redoStack = useRef<EditorSnapshot[]>([]);

  function saveHistory() {
    undoStack.current = [...undoStack.current.slice(-49), { components: structuredClone(components), connections: structuredClone(connections) }];
    redoStack.current = [];
  }

  function undo() {
    const previous = undoStack.current.pop();
    if (!previous) return;
    redoStack.current.push({ components: structuredClone(components), connections: structuredClone(connections) });
    setComponents(previous.components);
    setConnections(previous.connections);
    setSelectedConnectionId(null);
    setNotice('Se deshizo la última acción del editor.');
  }

  function redo() {
    const next = redoStack.current.pop();
    if (!next) return;
    undoStack.current.push({ components: structuredClone(components), connections: structuredClone(connections) });
    setComponents(next.components);
    setConnections(next.connections);
    setSelectedConnectionId(null);
    setNotice('Se rehizo la acción.');
  }

  const selectedComponent = useMemo(
    () => components.find((component) => component.id === selectedId) ?? null,
    [components, selectedId],
  );
  const requiredAnalysis = currentPractice?.practice.evaluation?.requiredAnalysis ?? null;
  const canEvaluate = !!currentPractice?.practice.evaluation && (
    requiredAnalysis === 'dc' ? !!simulationResult
      : requiredAnalysis === 'rc' ? !!transientResult && transientInitialVoltage.trim() !== '' && Number.isFinite(Number(transientInitialVoltage)) && transientResult.mode === transientMode && transientResult.initialVoltageV === Number(transientInitialVoltage)
        : false
  );
  const editorHasMounted = useRef(false);
  const previousPracticeIdRef = useRef(currentPractice?.practice.id ?? null);
  useEffect(() => {
    setSimulationResult(null);
    setTransientResult(null);
    setEvaluationResult(null);
    setEvaluationModalOpen(false);
    const currentPracticeId = currentPractice?.practice.id ?? null;
    if (editorHasMounted.current && previousPracticeIdRef.current === currentPracticeId) {
      setNotice('El circuito cambió. Ejecuta una nueva simulación para actualizar los resultados.');
    }
    previousPracticeIdRef.current = currentPracticeId;
    editorHasMounted.current = true;
  }, [components, connections, currentPractice]);

  function runSimulation() {
    if (!currentPractice) {
      setNotice('Carga una práctica JSON válida antes de iniciar el análisis.');
      return;
    }

    const result = simulateCircuit(currentPractice, { components, connections });
    setEvaluationResult(null);
    setTransientResult(null);
    setSimulationResult(result);
    openResults();
    setNotice(result.summary);
  }

  function runRCAnalysis() {
    if (!currentPractice) {
      setNotice('Carga una práctica JSON válida antes de iniciar el análisis RC.');
      return;
    }
    const initialVoltageV = Number(transientInitialVoltage);
    if (transientInitialVoltage.trim() === '' || !Number.isFinite(initialVoltageV)) {
      setNotice('El voltaje inicial del capacitor debe ser un número válido.');
      return;
    }
    const result = simulateRCTransient(
      currentPractice,
      { components, connections },
      { mode: transientMode, initialVoltageV, durationTimeConstants: 5, sampleCount: 401 },
    );
    setEvaluationResult(null);
    setSimulationResult(null);
    setTransientResult(result);
    openResults();
    setNotice(result.summary);
  }

  function runEvaluation() {
    if (!currentPractice?.practice.evaluation) {
      setNotice('Esta práctica no incluye una rúbrica de evaluación.');
      return;
    }

    try {
      const mode = currentPractice.practice.evaluation.requiredAnalysis;
      const evaluated = mode === 'dc'
        ? simulationResult
          ? evaluatePractice(currentPractice, { components, connections }, { mode: 'dc', result: simulationResult })
          : null
        : transientResult
          ? evaluatePractice(currentPractice, { components, connections }, { mode: 'rc', result: transientResult })
          : null;

      if (!evaluated) {
        setNotice(`Primero ejecuta el análisis ${mode.toUpperCase()} requerido por esta práctica.`);
        return;
      }

      setEvaluationResult(evaluated);
      setEvaluationModalOpen(true);
      setNotice(evaluated.summary);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'No fue posible evaluar esta práctica.');
    }
  }

  function loadEmbeddedPractice(document: unknown, fileName: string) {
    const result = loadPracticeIntoEditor(document);
    if (!result.ok) {
      const messages = result.issues.map((issue) => `${issue.path}: ${issue.message}`);
      setValidationErrors(messages);
      setNotice(`No se pudo cargar el ejemplo ${fileName}: contiene ${messages.length} problema(s).`);
      return;
    }

    undoStack.current = [];
    redoStack.current = [];
    setCurrentPractice(result.practice);
    setSimulationResult(null);
    setTransientResult(null);
    setInspectorTab('propiedades');
    setPracticeFileName(fileName);
    setComponents(result.editorState.components);
    setConnections(result.editorState.connections);
    setSelectedId(result.editorState.components[0]?.id ?? null);
    setSelectedConnectionId(null);
    setPendingTerminal(null);
    setDragging(null);
    setPropertiesOpen(false);
    setZoom(1);
    const isDischarge = fileName.includes('descarga');
    setTransientMode(isDischarge ? 'discharge' : 'charge');
    setTransientInitialVoltage(isDischarge ? '5' : '0');
    setValidationErrors([]);
    setNotice(`Ejemplo "${result.practice.practice.title}" cargado correctamente.`);
  }

  async function handlePracticeFileChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    setValidationErrors([]);
    try {
      const fileText = await file.text();
      const parsedDocument: unknown = JSON.parse(fileText);
      const result = loadPracticeIntoEditor(parsedDocument);

      if (!result.ok) {
        const messages = result.issues.map((issue) => `${issue.path}: ${issue.message}`);
        setValidationErrors(messages);
        setNotice(`No se cargó "${file.name}" porque contiene ${messages.length} problema(s).`);
        return;
      }

      // Una práctica nueva reemplaza el circuito actual; el historial anterior se limpia
      // para evitar deshacer hacia un circuito que pertenece a otro documento.
      undoStack.current = [];
      redoStack.current = [];
      setCurrentPractice(result.practice);
      setSimulationResult(null);
      setTransientResult(null);
      setInspectorTab('propiedades');
      setPracticeFileName(file.name);
      setComponents(result.editorState.components);
      setConnections(result.editorState.connections);
      setSelectedId(result.editorState.components[0]?.id ?? null);
      setSelectedConnectionId(null);
      setPendingTerminal(null);
      setDragging(null);
      setPropertiesOpen(false);
      setZoom(1);
      setNotice(`Práctica "${result.practice.practice.title}" cargada correctamente desde ${file.name}.`);
    } catch (error) {
      const message = error instanceof SyntaxError
        ? 'El archivo no contiene un JSON válido. Revisa las comas, comillas y llaves.'
        : 'No fue posible leer el archivo seleccionado.';
      setValidationErrors([message]);
      setNotice(`No se pudo cargar "${file.name}".`);
    } finally {
      // Permite volver a seleccionar el mismo archivo después de corregirlo.
      input.value = '';
    }
  }

  function addComponent(kind: ComponentKind) {
    if (currentPractice && !currentPractice.practice.allowedComponentTypes.includes(kind)) {
      setNotice(`El componente ${componentDefaults[kind].label} no está permitido en esta práctica.`);
      return;
    }
    saveHistory();
    const definition = componentDefaults[kind];
    const count = components.filter((component) => component.kind === kind).length + 1;
    const item: LabComponent = {
      id: `${kind}-${Date.now()}`,
      kind,
      reference: `${kind === 'bateria' ? 'V' : kind === 'resistencia' ? 'R' : kind === 'led' ? 'D' : kind === 'capacitor' ? 'C' : 'S'}${count}`,
      value: definition.value,
      unit: definition.unit,
      x: 18 + ((components.length * 13) % 66),
      y: 330 + ((components.length % 2) * 24),
    };
    setComponents((current) => [...current, item]);
    setSelectedConnectionId(null);
    setSelectedId(item.id);
    openProperties();
    setNotice(`${definition.label} agregado al área de trabajo.`);
  }

  function updateSelected(changes: Partial<LabComponent>) {
    if (!selectedId) return;
    setComponents((current) => current.map((component) => component.id === selectedId ? { ...component, ...changes } : component));
  }

  function openProperties() {
    setInspectorTab('propiedades');
    if (window.matchMedia('(min-width: 1280px)').matches) return;
    propertiesReturnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setPropertiesOpen(true);
  }

  function openResults() {
    setInspectorTab('resultados');
    if (window.matchMedia('(min-width: 1280px)').matches) return;
    propertiesReturnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setPropertiesOpen(true);
  }

  function removeSelected() {
    if (!selectedId && !selectedConnectionId) return;
    saveHistory();

    if (selectedConnectionId) {
      setConnections((items) => items.filter((wire) => wire.id !== selectedConnectionId));
      setSelectedConnectionId(null);
      setNotice('Cable eliminado del circuito.');
      return;
    }

    const current = components.find((component) => component.id === selectedId);
    setComponents((items) => items.filter((component) => component.id !== selectedId));
    setConnections((items) => items.filter((connection) => connection.from.componentId !== selectedId && connection.to.componentId !== selectedId));
    setPendingTerminal(null);
    setSelectedConnectionId(null);
    setSelectedId(null);
    setNotice(current ? `${current.reference} se quitó del área de trabajo junto con sus conexiones.` : 'Componente eliminado.');
  }

  useEffect(() => {
    if (!propertiesOpen) {
      const previous = propertiesReturnFocusRef.current;
      if (previous?.isConnected) previous.focus();
      propertiesReturnFocusRef.current = null;
      return;
    }
    if (window.matchMedia('(min-width: 1280px)').matches) return;
    const dialog = document.getElementById('responsive-properties-dialog');
    if (!dialog) return;

    const getFocusable = () => Array.from(dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter((element) => element.offsetParent !== null);

    getFocusable()[0]?.focus();
    function trapFocus(event: KeyboardEvent) {
      if (event.key !== 'Tab') return;
      const focusable = getFocusable();
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    window.addEventListener('keydown', trapFocus);
    return () => window.removeEventListener('keydown', trapFocus);
  }, [propertiesOpen]);

  useEffect(() => {
    function handleDeleteKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (event.key === 'Escape' && evaluationModalOpen) {
        setEvaluationModalOpen(false);
        return;
      }
      if (event.key === 'Escape' && propertiesOpen) {
        setPropertiesOpen(false);
        return;
      }
      const isEditing = !!target?.closest('input, textarea, select, [contenteditable="true"]');
      if (event.key !== 'Delete' || isEditing) return;
      if (!selectedId && !selectedConnectionId) return;
      event.preventDefault();
      removeSelected();
    }

    window.addEventListener('keydown', handleDeleteKey);
    return () => window.removeEventListener('keydown', handleDeleteKey);
  }, [selectedId, selectedConnectionId, components, connections, propertiesOpen, evaluationModalOpen, removeSelected]);

  useEffect(() => {
    if (!evaluationModalOpen) return;
    const dialog = evaluationDialogRef.current;
    if (!dialog) return;

    const getFocusable = () => Array.from(dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter((element) => element.offsetParent !== null);

    dialog.focus();
    document.body.style.overflow = 'hidden';
    function trapEvaluationFocus(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setEvaluationModalOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = getFocusable();
      if (event.shiftKey && document.activeElement === dialog && focusable.length > 0) {
        event.preventDefault();
        focusable[focusable.length - 1].focus();
        return;
      }
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    window.addEventListener('keydown', trapEvaluationFocus);
    return () => {
      window.removeEventListener('keydown', trapEvaluationFocus);
      document.body.style.overflow = '';
      evaluationButtonRef.current?.focus();
    };
  }, [evaluationModalOpen]);

  function handleTerminalClick(componentId: string, side: 'left' | 'right') {
    const clicked = { componentId, side } as TerminalRef;
    if (!pendingTerminal) {
      setPendingTerminal(clicked);
      setNotice('Terminal inicial seleccionado. Ahora elige otro terminal para completar el cable.');
      return;
    }
    if (pendingTerminal.componentId === clicked.componentId && pendingTerminal.side === clicked.side) {
      setPendingTerminal(null);
      setNotice('Selección de terminal cancelada.');
      return;
    }
    if (pendingTerminal.componentId === clicked.componentId) {
      setNotice('Conecta terminales de componentes distintos.');
      return;
    }
    const exists = connections.some((connection) =>
      (connection.from.componentId === pendingTerminal.componentId && connection.from.side === pendingTerminal.side && connection.to.componentId === clicked.componentId && connection.to.side === clicked.side) ||
      (connection.to.componentId === pendingTerminal.componentId && connection.to.side === pendingTerminal.side && connection.from.componentId === clicked.componentId && connection.from.side === clicked.side)
    );
    if (exists) {
      setNotice('Esos terminales ya están conectados.');
    } else {
      saveHistory();
      setConnections((items) => [...items, { id: `wire-${Date.now()}`, from: pendingTerminal, to: clicked }]);
      setNotice('Conexión agregada al circuito.');
    }
    setPendingTerminal(null);
  }

  function handleDragStart(event: PointerEvent<HTMLDivElement>, id: string) {
    if ((event.target as HTMLElement).closest('button')) return;
    const canvas = event.currentTarget.parentElement;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const component = components.find((item) => item.id === id);
    if (!component) return;
    const currentX = ((event.clientX - rect.left) / rect.width) * 100;
    const currentY = (event.clientY - rect.top) / zoom;
    saveHistory();
    setSelectedConnectionId(null);
    setSelectedId(id);
    setDragging({ id, offsetX: currentX - component.x, offsetY: currentY - component.y });
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleCanvasPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100 - dragging.offsetX;
    const y = (event.clientY - rect.top) / zoom - dragging.offsetY;
    const snappedX = snapEnabled ? Math.round((x * 16) / 22) * 22 / 16 : x;
    const snappedY = snapEnabled ? Math.round(y / 22) * 22 : y;
    setComponents((items) => items.map((item) => item.id === dragging.id ? { ...item, x: Math.max(7, Math.min(93, snappedX)), y: Math.max(145, Math.min(850, snappedY)) } : item));
  }

  function resetCircuit() {
    if (currentPractice) {
      const result = loadPracticeIntoEditor(currentPractice);
      if (result.ok) {
        saveHistory();
        setComponents(result.editorState.components);
        setConnections(result.editorState.connections);
        setPendingTerminal(null);
        setSelectedConnectionId(null);
        setSelectedId(result.editorState.components[0]?.id ?? null);
        setNotice(`Se restauró la práctica "${currentPractice.practice.title}" a su estado original.`);
        return;
      }
    }
    saveHistory();
    setComponents(initialComponents);
    setConnections([]);
    setPendingTerminal(null);
    setSelectedConnectionId(null);
    setSelectedId('res-1');
    setNotice('Se restauró el circuito de ejemplo.');
  }

  const navigation = [
    { label: 'Inicio', icon: 'grid' as IconName },
    { label: 'Editor de circuitos', icon: 'circuit' as IconName },
    { label: 'Componentes', icon: 'box' as IconName },
    { label: 'Mis prácticas', icon: 'book' as IconName },
  ];

  return (
    <div className="min-h-screen bg-[#F7FAFC] text-[#24324A]">
      <div className="flex min-h-screen">
        
        {/*
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
        */}
        
        
        <Sidebar />
        

        {mobileMenuOpen && <button className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={() => setMobileMenuOpen(false)} aria-label="Cerrar menú" />}

        <main className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-[#E7EDF5] bg-white px-4 sm:px-7">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setMobileMenuOpen(true)} className="rounded-lg p-2 text-[#718096] hover:bg-[#F5F9FF] md:hidden" aria-label="Abrir menú"><Icon name="menu" /></button>
              <div><div className="flex items-center gap-2 text-[11px] text-[#718096]"><span>ElectroLab</span><Icon name="chevron" size={12}/><span className="text-[#526575]">Prácticas</span></div><h1 className="mt-1 text-[15px] font-semibold tracking-tight text-[#24324A] sm:text-base">Editor de circuitos</h1></div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden items-center gap-2 rounded-full border border-[#E7EDF5] bg-[#F7FAFC] px-3 py-1.5 text-[11px] text-[#718096] lg:flex"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400"/> JSON local</span>
              <input ref={practiceFileInputRef} type="file" accept=".json,application/json" className="sr-only" onChange={handlePracticeFileChange} aria-label="Seleccionar archivo JSON de una práctica" />
              <button type="button" onClick={() => practiceFileInputRef.current?.click()} className="flex items-center gap-2 rounded-lg border border-[#C9BDF0] bg-[#F0EAFE] px-3 py-2 text-xs font-semibold text-[#7654C5] transition hover:bg-[#E9E1FC]"><Icon name="upload" size={15}/><span>Cargar JSON</span></button>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            <div className="mx-auto max-w-[1700px] p-4 sm:p-6 lg:p-7">
              <div className="mb-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="max-w-[260px] truncate rounded-md bg-[#F0EAFE] px-2 py-1 text-[9px] font-bold uppercase tracking-[.16em] text-[#8865D8]">{currentPractice ? currentPractice.practice.id : 'Práctica libre'}</span>
                  <span className="text-[10px] text-[#718096]">•</span>
                  <span className="text-[11px] capitalize text-[#718096]">{currentPractice?.practice.difficulty ?? 'sin nivel'}</span>
                  {currentPractice && <><span className="text-[10px] text-[#718096]">•</span><span className="text-[11px] text-[#718096]">{currentPractice.practice.estimatedDurationMinutes} min</span></>}
                </div>
                <h2 className="text-xl font-semibold tracking-tight text-[#24324A] sm:text-2xl">{currentPractice?.practice.title ?? 'Circuito libre'}</h2>
                <p className="mt-1 max-w-3xl text-xs leading-relaxed text-[#718096] sm:text-sm">{currentPractice?.practice.description ?? 'Construye un circuito agregando componentes al área de trabajo.'}</p>
                <p className="mt-1 text-[10px] text-[#A0AEC0]">{practiceFileName}</p>
              </div>

              <details open aria-labelledby="practice-instructions-heading" className="group mb-5 rounded-2xl border border-[#DCE9FF] bg-white shadow-sm">
                <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 rounded-t-2xl border-b border-[#E7EDF5] bg-[#F4F8FF] px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8865D8] sm:px-5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF1FF] text-[#3478F6]"><Icon name="book" size={17}/></span>
                    <div>
                      <h3 id="practice-instructions-heading" className="text-xs font-semibold text-[#24324A]">Instrucciones de la práctica</h3>
                      <p className="mt-0.5 text-[10px] text-[#718096]">Revisa estos pasos antes de construir o simular el circuito.</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-2">
                    {currentPractice && <span className="rounded-full border border-[#DCE9FF] bg-white px-2.5 py-1 text-[9px] font-medium text-[#526575]">{currentPractice.practice.instructions.length} pasos</span>}
                    <span aria-hidden="true" className="text-base text-[#718096] transition-transform group-open:rotate-180">⌄</span>
                  </span>
                </summary>
                <div className="space-y-4 px-4 py-4 sm:px-5">
                  {currentPractice ? <>
                    <ol className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                      {currentPractice.practice.instructions.map((instruction) => <li key={instruction.step} className="flex items-start gap-2.5 rounded-xl border border-[#E7EDF5] bg-[#FBFCFE] p-3 text-[11px] leading-relaxed text-[#526575]">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F0EAFE] text-[10px] font-bold text-[#7654C5]">{instruction.step}</span>
                        <span>{instruction.text}</span>
                      </li>)}
                    </ol>
                    {currentPractice.practice.learningObjectives.length > 0 && <div className="flex flex-col gap-2 border-t border-[#E7EDF5] pt-3 sm:flex-row sm:items-start">
                      <p className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-[#718096]">Objetivos de aprendizaje</p>
                      <ul className="flex flex-wrap gap-x-5 gap-y-1 text-[10px] leading-relaxed text-[#718096]">
                        {currentPractice.practice.learningObjectives.map((objective, index) => <li key={`${index}-${objective}`} className="list-inside list-disc">{objective}</li>)}
                      </ul>
                    </div>}
                  </> : <p className="text-[11px] leading-relaxed text-[#718096]">No hay una práctica JSON cargada. Puedes construir un circuito libre o cargar una práctica desde un archivo JSON.</p>}
                  <p className="border-t border-[#E7EDF5] pt-3 text-[10px] leading-relaxed text-[#718096]">Uso del editor: arrastra los componentes para moverlos, selecciona dos terminales para crear un cable y usa Eliminar o la tecla Suprimir para quitar el elemento seleccionado.</p>
                </div>
              </details>

              <section aria-label="Controles de la práctica" className="mb-4 rounded-2xl border border-[#E7EDF5] bg-white p-3 shadow-sm sm:p-4">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
                    <label className="flex w-full min-w-0 flex-col gap-1 text-[9px] font-medium text-[#718096] sm:max-w-[380px]">Práctica de ejemplo
                      <select aria-label="Cargar una práctica de ejemplo" defaultValue="" onChange={(event) => { const selected = event.target.value; if (selected === 'led') loadEmbeddedPractice(ledPracticeJson as unknown, 'led-basico.json'); if (selected === 'rc-charge') loadEmbeddedPractice(rcChargePracticeJson as unknown, 'rc-carga.json'); if (selected === 'rc-discharge') loadEmbeddedPractice(rcDischargePracticeJson as unknown, 'rc-descarga.json'); event.currentTarget.value = ''; }} className="h-11 w-full min-w-0 rounded-lg border border-[#E7EDF5] bg-white px-3 text-xs text-[#34445D] outline-none focus:border-[#8865D8] focus:ring-2 focus:ring-[#8865D8]/15">
                        <option value="">Seleccionar ejemplo…</option><option value="led">LED básico</option><option value="rc-charge">Carga RC</option><option value="rc-discharge">Descarga RC</option>
                      </select>
                    </label>
                    <button type="button" onClick={runSimulation} disabled={!currentPractice || components.length === 0} title="Calcular el punto de operación de corriente continua" className="flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#3478F6] px-4 text-xs font-semibold text-white transition hover:bg-[#2868DD] disabled:cursor-not-allowed disabled:opacity-45"><Icon name="play" size={15}/>Simular DC</button>
                    <button ref={evaluationButtonRef} type="button" onClick={runEvaluation} disabled={!canEvaluate} title={!currentPractice?.practice.evaluation ? 'Esta práctica no tiene criterios de evaluación' : !canEvaluate ? `Ejecuta primero el análisis ${requiredAnalysis?.toUpperCase() ?? 'requerido'}` : 'Evaluar el circuito con la rúbrica de la práctica'} className="flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[#BFE7D3] bg-[#ECFDF5] px-4 text-xs font-semibold text-[#16804A] transition hover:bg-[#DDF8E9] disabled:cursor-not-allowed disabled:border-[#E7EDF5] disabled:bg-[#F7FAFC] disabled:text-[#A0AEC0]"><Icon name="check" size={15}/>Evaluar práctica</button>
                  </div>
                  {currentPractice?.practice.evaluation && !canEvaluate && <p className="text-[9px] leading-relaxed text-[#8A98A9]">Para habilitar la evaluación, ejecuta primero el análisis {requiredAnalysis?.toUpperCase()} requerido por esta práctica.</p>}
                  {currentPractice && !currentPractice.practice.evaluation && <p className="text-[9px] leading-relaxed text-[#8A98A9]">Este archivo JSON no incluye una rúbrica; puedes simular el circuito, pero no obtener una calificación automática.</p>}

                  {components.some((component) => component.kind === 'capacitor') && <div className="grid max-w-[560px] grid-cols-2 items-end gap-2 border-t border-[#E7EDF5] pt-3 sm:grid-cols-[minmax(0,1fr)_minmax(120px,.65fr)_auto]">
                    <label className="flex min-w-0 flex-col gap-1 text-[9px] font-medium text-[#718096]">Análisis RC
                      <select value={transientMode} onChange={(event) => { const mode = event.target.value as RCTransientMode; setTransientMode(mode); setTransientInitialVoltage(mode === 'charge' ? '0' : '5'); }} className="h-11 w-full min-w-0 rounded-lg border border-[#E7EDF5] bg-white px-3 text-xs text-[#34445D] outline-none focus:border-[#8865D8] focus:ring-2 focus:ring-[#8865D8]/15">
                        <option value="charge">Carga</option><option value="discharge">Descarga</option>
                      </select>
                    </label>
                    <label className="flex min-w-0 flex-col gap-1 text-[9px] font-medium text-[#718096]">V inicial (V)
                      <input type="number" step="any" value={transientInitialVoltage} onChange={(event) => setTransientInitialVoltage(event.target.value)} className="h-11 w-full min-w-0 rounded-lg border border-[#E7EDF5] bg-white px-3 text-xs text-[#34445D] outline-none focus:border-[#8865D8] focus:ring-2 focus:ring-[#8865D8]/15" aria-label="Voltaje inicial del capacitor en voltios" />
                    </label>
                    <button type="button" onClick={runRCAnalysis} disabled={!currentPractice || components.length === 0} title="Calcular la carga o descarga del capacitor a través del tiempo" className="col-span-2 flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[#C9BDF0] bg-[#F0EAFE] px-4 text-xs font-semibold text-[#7654C5] transition hover:bg-[#E9E1FC] disabled:cursor-not-allowed disabled:opacity-45 sm:col-span-1"><Icon name="activity" size={15}/>Analizar RC</button>
                  </div>}
                </div>
              </section>

              {!(simulationResult || transientResult) && <div role="status" aria-live="polite" aria-atomic="true" className="mb-3 flex items-start gap-2 rounded-lg border border-[#E7EDF5] bg-[#F8FAFD] px-3 py-2.5 text-[10px] leading-relaxed text-[#718096]">
                <Icon name="info" size={14} className="mt-0.5 shrink-0 text-[#8865D8]"/>
                <span>{notice}</span>
              </div>}
              {validationErrors.length > 0 && <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700"><p className="font-semibold">No se pudo cargar la práctica</p><ul className="mt-1 list-inside list-disc space-y-1">{validationErrors.slice(0, 6).map((message, index) => <li key={`${index}-${message}`}>{message}</li>)}</ul>{validationErrors.length > 6 && <p className="mt-1 text-[10px]">Se omitieron {validationErrors.length - 6} errores adicionales.</p>}</div>}

              <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
                <section className="min-w-0 overflow-hidden rounded-2xl border border-[#E7EDF5] bg-white shadow-2xl shadow-black/10">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E7EDF5] px-4 py-3 sm:px-5">
                    <div className="flex items-center gap-2"><div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F0EAFE] text-[#8865D8]"><Icon name="circuit" size={15}/></div><div><p className="text-xs font-semibold text-[#34445D]">Área de trabajo</p><p className="text-[10px] text-[#718096]">Lienzo de construcción</p></div></div>
                    <div className="flex flex-wrap items-center gap-1.5"><button type="button" onClick={undo} disabled={undoStack.current.length === 0} className="rounded-md border border-[#E7EDF5] px-2.5 py-1.5 text-[10px] text-[#718096] hover:bg-[#F5F9FF] disabled:opacity-35" title="Deshacer">↶</button><button type="button" onClick={redo} disabled={redoStack.current.length === 0} className="rounded-md border border-[#E7EDF5] px-2.5 py-1.5 text-[10px] text-[#718096] hover:bg-[#F5F9FF] disabled:opacity-35" title="Rehacer">↷</button><button type="button" onClick={() => setSnapEnabled((value) => !value)} className={`rounded-md border px-2.5 py-1.5 text-[10px] ${snapEnabled ? 'border-[#C9BDF0] bg-[#F0EAFE] text-[#7654C5]' : 'border-[#E7EDF5] text-[#718096]'}`}>Ajuste: {snapEnabled ? 'ON' : 'OFF'}</button><button type="button" onClick={() => setZoom((value) => Math.max(.6, Math.round((value - .1) * 10) / 10))} disabled={zoom <= .6} className="rounded-md border border-[#E7EDF5] px-2 py-1.5 text-[10px] text-[#718096] disabled:opacity-35">−</button><span className="min-w-[38px] text-center text-[10px] tabular-nums text-[#718096]">{Math.round(zoom * 100)}%</span><button type="button" onClick={() => setZoom((value) => Math.min(1.6, Math.round((value + .1) * 10) / 10))} disabled={zoom >= 1.6} className="rounded-md border border-[#E7EDF5] px-2 py-1.5 text-[10px] text-[#718096] disabled:opacity-35">+</button><button type="button" onClick={() => setZoom(1)} className="rounded-md border border-[#E7EDF5] px-2.5 py-1.5 text-[10px] text-[#718096]">100%</button><button type="button" onClick={resetCircuit} className="rounded-md border border-[#E7EDF5] px-2.5 py-1.5 text-[10px] text-[#718096] hover:text-[#34445D]">Restablecer</button><button type="button" onClick={openProperties} disabled={!selectedComponent} className="flex items-center gap-1.5 rounded-md border border-[#C9BDF0] bg-[#F0EAFE] px-2.5 py-1.5 text-[10px] font-medium text-[#7654C5] hover:bg-[#E9E1FC] disabled:cursor-not-allowed disabled:opacity-40 xl:hidden" aria-label="Abrir propiedades del componente seleccionado"><Icon name="sliders" size={13}/>Propiedades</button><button type="button" onClick={openResults} className="flex items-center gap-1.5 rounded-md border border-[#DCE9FF] bg-[#F0F7FF] px-2.5 py-1.5 text-[10px] font-medium text-[#3478F6] hover:bg-[#EAF1FF] xl:hidden" aria-label="Abrir resultados de la simulación"><Icon name="activity" size={13}/>Resultados</button><button type="button" onClick={removeSelected} disabled={!selectedComponent && !selectedConnectionId} title="Eliminar selección (Suprimir)" className="flex items-center gap-1.5 rounded-md border border-[#E7EDF5] px-2.5 py-1.5 text-[10px] text-[#718096] hover:border-rose-300 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-40"><Icon name="trash" size={13}/>Eliminar</button></div>
                  </div>

                  <div className="border-b border-[#E7EDF5] bg-[#F8FAFD] px-4 py-3 sm:px-5">
                    <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#718096]">Añadir componentes</p><p className="mt-0.5 text-[10px] text-[#A0AEC0]">Componentes disponibles para esta práctica</p></div><span className="hidden text-[10px] text-[#718096] sm:inline">{components.length} elementos</span></div>
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                      {(Object.keys(componentDefaults) as ComponentKind[]).filter((kind) => !currentPractice || currentPractice.practice.allowedComponentTypes.includes(kind)).map((kind) => <button key={kind} type="button" onClick={() => addComponent(kind)} className="flex shrink-0 items-center gap-2 rounded-lg border border-[#E7EDF5] bg-white px-3 py-2 text-[11px] font-medium text-[#526575] transition hover:border-[#A78BFA] hover:bg-[#F0F7FF] hover:text-[#8865D8]"><Icon name={componentDefaults[kind].icon} size={15}/>{componentDefaults[kind].label}<Icon name="plus" size={12} className="text-[#718096]"/></button>)}
                    </div>
                    {currentPractice?.practice.allowedComponentTypes.length === 0 && <p className="mt-2 text-[10px] text-[#A0AEC0]">Esta práctica no permite agregar componentes adicionales.</p>}
                  </div>

                  <div className="overflow-auto bg-[#F7FAFC]">
                    <div
                      className="relative"
                      style={{
                        width: `${1600 * zoom}px`,
                        height: `${1000 * zoom}px`,
                        minWidth: `${1600 * zoom}px`,
                        backgroundImage: 'radial-gradient(rgba(113,128,150,.16) 1px, transparent 1px)',
                        backgroundSize: '22px 22px',
                      }}
                    >
                      {/* Elementos fijos del lienzo: no cambian con el zoom. */}
                      <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(247,250,252,.45),transparent_18%,transparent_82%,rgba(247,250,252,.45))]" />
                        <div className="absolute left-5 top-5 rounded-md border border-[#E7EDF5] bg-[#F0F7FF]/90 px-2.5 py-1.5 text-[9px] font-medium uppercase tracking-[.14em] text-[#718096]">Esquema · vista de diseño</div>
                        <div className="absolute right-5 top-5 flex items-center gap-2 rounded-md border border-[#E7EDF5] bg-[#F0F7FF]/90 px-2.5 py-1.5 text-[9px] text-[#718096]"><span className="h-1.5 w-1.5 rounded-full bg-[#21B8A6]"/> Selección activa</div>
                        <div className="absolute left-1/2 top-[118px] -translate-x-1/2 rounded-full border border-dashed border-[#D6E0EC] bg-white/70 px-4 py-1.5 text-[9px] font-medium uppercase tracking-[.16em] text-[#9AA9BA]">Zona de diseño del circuito</div>
                        {components.length === 0 && <div className="absolute inset-0 flex flex-col items-center justify-center text-center"><div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-[#CBD5E1] bg-white text-[#8865D8]"><Icon name="plus" size={25}/></div><p className="text-sm font-medium text-[#526575]">El lienzo está vacío</p><p className="mt-1 text-xs text-[#718096]">Añade componentes desde la barra superior.</p></div>}
                        <div className="absolute bottom-4 left-5 flex items-center gap-3 text-[9px] text-[#A0AEC0]"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full border-2 border-[#8865D8] bg-white"/>Terminales</span><span>•</span><span>{connections.length} conexiones</span><span>•</span><span>Ajuste {snapEnabled ? 'activo' : 'libre'}</span></div>
                        <div className="absolute bottom-4 right-5 rounded-md border border-[#E7EDF5] bg-[#F0F7FF] px-2 py-1 text-[9px] text-[#718096]">{components.length} componentes · {connections.length} cables · {Math.round(zoom * 100)}%</div>
                      </div>

                      {/* Solo los componentes y los cables reciben la transformación de zoom. */}
                      <div
                        className="absolute left-0 top-0 h-[1000px] w-[1600px]"
                        style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
                      >
                        <svg className="absolute inset-0 z-[1] h-full w-full" viewBox="0 0 1600 1000" preserveAspectRatio="none" aria-label="Conexiones del circuito">
                          {connections.map((connection) => {
                            const fromComponent = components.find((item) => item.id === connection.from.componentId);
                            const toComponent = components.find((item) => item.id === connection.to.componentId);
                            if (!fromComponent || !toComponent) return null;
                            const from = getTerminalPoint(fromComponent, connection.from.side);
                            const to = getTerminalPoint(toComponent, connection.to.side);
                            const middle = (from.x + to.x) / 2;
                            const active = selectedConnectionId === connection.id;
                            return <g key={connection.id}><path d={`M ${from.x} ${from.y} H ${middle} V ${to.y} H ${to.x}`} fill="none" stroke={active ? '#8865D8' : '#21B8A6'} strokeWidth={active ? 5 : 3} strokeLinecap="round" strokeLinejoin="round" pointerEvents="stroke" className="cursor-pointer" onClick={(event) => { event.stopPropagation(); setSelectedConnectionId(connection.id); setSelectedId(null); setPropertiesOpen(false); setNotice('Cable seleccionado. Puedes eliminarlo con el botón Eliminar o la tecla Suprimir.'); }}/><circle cx={from.x} cy={from.y} r="3.5" fill={active ? '#8865D8' : '#21B8A6'} pointerEvents="none"/><circle cx={to.x} cy={to.y} r="3.5" fill={active ? '#8865D8' : '#21B8A6'} pointerEvents="none"/></g>;
                          })}
                        </svg>
                        <div className="pointer-events-none absolute inset-0 z-[2]" onPointerMove={handleCanvasPointerMove} onPointerUp={() => setDragging(null)} onPointerCancel={() => setDragging(null)} onPointerLeave={() => setDragging(null)}>
                          {components.map((component) => <CircuitNode key={component.id} component={component} selected={selectedId === component.id} onSelect={() => { setSelectedConnectionId(null); setSelectedId(component.id); openProperties(); setNotice(`${component.reference} seleccionado.`); }} onDragStart={handleDragStart} onTerminalClick={handleTerminalClick} pendingTerminal={pendingTerminal} />)}
                        </div>
                      </div>
                    </div>
                  </div>

                </section>

                <aside className="sticky top-4 hidden max-h-[calc(100dvh-112px)] min-h-[420px] self-start overflow-hidden rounded-2xl border border-[#E7EDF5] bg-white shadow-xl shadow-black/10 xl:flex xl:flex-col">
                  <div className="flex shrink-0 items-center justify-between border-b border-[#E7EDF5] px-4 py-3.5">
                    <div><p className="text-xs font-semibold text-[#34445D]">Panel del editor</p><p className="mt-0.5 text-[10px] text-[#718096]">Propiedades y resultados</p></div>
                    <Icon name={inspectorTab === 'resultados' ? 'activity' : 'sliders'} size={17} className="text-[#718096]"/>
                  </div>
                  <div className="grid shrink-0 grid-cols-2 border-b border-[#E7EDF5] px-2 pt-1">
                    <button type="button" onClick={() => setInspectorTab('propiedades')} aria-pressed={inspectorTab === 'propiedades'} className={`border-b-2 px-2 py-2.5 text-[10px] font-semibold transition ${inspectorTab === 'propiedades' ? 'border-[#21B8A6] text-[#7654C5]' : 'border-transparent text-[#718096] hover:text-[#34445D]'}`}>Propiedades</button>
                    <button type="button" onClick={() => setInspectorTab('resultados')} aria-pressed={inspectorTab === 'resultados'} className={`border-b-2 px-2 py-2.5 text-[10px] font-semibold transition ${inspectorTab === 'resultados' ? 'border-[#21B8A6] text-[#7654C5]' : 'border-transparent text-[#718096] hover:text-[#34445D]'}`}>Resultados{(simulationResult || transientResult) && <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#21B8A6]"/>}</button>
                  </div>
                  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
                    {inspectorTab === 'propiedades'
                      ? <PropertiesFields component={selectedComponent} onSaveHistory={saveHistory} onUpdate={updateSelected}/>
                      : <ResultsContent simulationResult={simulationResult} transientResult={transientResult}/>}
                  </div>
                </aside>
              </div>

              {propertiesOpen && (
                <div className="xl:hidden">
                  <button type="button" onClick={() => setPropertiesOpen(false)} className="fixed inset-0 z-[60] bg-[#24324A]/25 backdrop-blur-[1px]" aria-label="Cerrar panel del editor" />
                  <aside id="responsive-properties-dialog" role="dialog" aria-modal="true" aria-labelledby="responsive-properties-title" className={`fixed inset-x-0 bottom-0 z-[70] flex flex-col overflow-hidden rounded-t-2xl border border-[#E7EDF5] bg-white shadow-[0_-12px_40px_rgba(36,50,74,.18)] ${inspectorTab === 'resultados' ? 'max-h-[88dvh]' : 'max-h-[78dvh]'} md:bottom-4 md:left-auto md:right-4 md:top-[92px] md:max-h-none md:w-[min(420px,calc(100vw-2rem))] md:rounded-2xl`}>
                    <div className="relative flex shrink-0 items-center justify-between border-b border-[#E7EDF5] px-4 py-3.5 sm:px-5">
                      <div className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-[#DCE5F0] md:hidden" />
                      <div><p id="responsive-properties-title" className="text-xs font-semibold text-[#34445D]">Panel del editor</p><p className="mt-0.5 text-[10px] text-[#718096]">{inspectorTab === 'resultados' ? 'Resultados de la simulación' : selectedComponent ? `Editando ${selectedComponent.reference}` : 'Configuración del elemento'}</p></div>
                      <button type="button" onClick={() => setPropertiesOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-lg text-[#718096] transition hover:bg-[#F5F9FF] hover:text-[#24324A] focus:outline-none focus:ring-2 focus:ring-[#8865D8]" aria-label="Cerrar panel"><Icon name="close" size={19}/></button>
                    </div>
                    <div className="grid shrink-0 grid-cols-2 border-b border-[#E7EDF5] px-3 pt-1">
                      <button type="button" onClick={() => setInspectorTab('propiedades')} aria-pressed={inspectorTab === 'propiedades'} className={`border-b-2 px-2 py-3 text-[11px] font-semibold transition ${inspectorTab === 'propiedades' ? 'border-[#21B8A6] text-[#7654C5]' : 'border-transparent text-[#718096]'}`}>Propiedades</button>
                      <button type="button" onClick={() => setInspectorTab('resultados')} aria-pressed={inspectorTab === 'resultados'} className={`border-b-2 px-2 py-3 text-[11px] font-semibold transition ${inspectorTab === 'resultados' ? 'border-[#21B8A6] text-[#7654C5]' : 'border-transparent text-[#718096]'}`}>Resultados{(simulationResult || transientResult) && <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#21B8A6]"/>}</button>
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
                      {inspectorTab === 'propiedades'
                        ? <PropertiesFields component={selectedComponent} onSaveHistory={saveHistory} onUpdate={updateSelected}/>
                        : <ResultsContent simulationResult={simulationResult} transientResult={transientResult}/>}
                    </div>
                  </aside>
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 px-1 text-[10px] text-[#A0AEC0]"><span>ElectroLab · Entorno de prácticas de electrónica</span><span className="flex items-center gap-1.5"><Icon name="check" size={12} className="text-[#21B8A6]"/>Motores de simulación DC y RC disponibles</span></div>
              {evaluationModalOpen && evaluationResult && <EvaluationModal result={evaluationResult} dialogRef={evaluationDialogRef} onClose={() => setEvaluationModalOpen(false)} onReviewResults={() => { setEvaluationModalOpen(false); openResults(); }}/>} 
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}




