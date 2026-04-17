import { useState } from 'react'
import { getCorrelationMatrix } from '../../api'
import { useApi } from '../../hooks/useApi'
import { ErrorBox, Loader, SectionTitle } from '../api_dashboard/ui'

const TIME_RANGES = [
  { value: 14, label: '2W' },
  { value: 30, label: '1M' },
]

const ALL_KEYWORDS = [
  { key: 'illness_index', label: 'Illness idx' },
  { key: 'headache',      label: 'Headache' },
  { key: 'cough',         label: 'Cough' },
  { key: 'allergy',       label: 'Allergy' },
  { key: 'sore_throat',   label: 'Sore throat' },
  { key: 'chest_tight',   label: 'Chest tight' },
  { key: 'wheeze',        label: 'Wheeze' },
  { key: 'dizziness',     label: 'Dizziness' },
  { key: 'nausea',        label: 'Nausea' },
  { key: 'itchy_eyes',    label: 'Itchy eyes' },
]

function ControlButton({ active, children, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{
      border: active ? '1px solid rgba(55, 138, 221, 0.8)' : '1px solid rgba(213, 224, 231, 0.9)',
      background: active ? 'rgba(230, 243, 255, 0.98)' : 'rgba(255, 255, 255, 0.78)',
      color: active ? '#185D9D' : '#516879',
      borderRadius: 999, padding: '6px 11px', minHeight: 32,
      fontSize: 11, fontWeight: 800, lineHeight: 1, cursor: 'pointer',
    }}>{children}</button>
  )
}

function SegmentedControl({ options, value, onChange }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, borderRadius: 999, border: '1px solid rgba(213, 224, 231, 0.75)', background: 'rgba(241, 247, 250, 0.82)', padding: 4 }}>
      {options.map(o => (
        <ControlButton key={o.value} active={value === o.value} onClick={() => onChange(o.value)}>
          {o.label}
        </ControlButton>
      ))}
    </div>
  )
}

// r value → purple (positive) / pink-red (negative) / light grey (near zero / null)
function rToStyle(r, isDiag) {
  if (isDiag) return { bg: 'rgba(99,88,188,0.18)', text: '#4338ca', bold: true }
  if (r == null) return { bg: 'var(--bg3)', text: 'var(--t3)', bold: false }
  const abs = Math.abs(r)
  if (r >= 0) {
    const a = (abs * 0.72 + 0.06).toFixed(2)
    return { bg: `rgba(99,88,188,${a})`, text: abs > 0.55 ? '#fff' : '#3730a3', bold: abs >= 0.5 }
  } else {
    const a = (abs * 0.65 + 0.06).toFixed(2)
    return { bg: `rgba(226,75,74,${a})`, text: abs > 0.55 ? '#fff' : '#991b1b', bold: abs >= 0.5 }
  }
}

function CellTooltip({ item, x, y }) {
  if (!item) return null
  const { cell, rowLabel, colLabel } = item
  return (
    <div style={{
      position: 'fixed', top: y + 14, left: x + 14,
      background: '#13222c', color: '#fff', borderRadius: 7,
      padding: '8px 12px', fontSize: 11, pointerEvents: 'none',
      zIndex: 200, whiteSpace: 'nowrap', boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{rowLabel} × {colLabel}</div>
      <div style={{ fontFamily: 'var(--mono)', lineHeight: 1.7 }}>
        <div>r = {cell.r != null ? (cell.r > 0 ? '+' : '') + cell.r.toFixed(3) : '–'}</div>
        <div>p = {cell.p_value != null ? cell.p_value.toFixed(5) : '–'}</div>
        <div>n = {cell.n} days</div>
      </div>
      {cell.significant && (
        <div style={{ marginTop: 4, fontSize: 10, color: '#6ee7b7', fontWeight: 600 }}>★ significant (p&lt;0.05, |r|≥0.5)</div>
      )}
    </div>
  )
}

export default function CorrelationMatrix() {
  const [days, setDays] = useState(14)
  const [selectedKws, setSelectedKws] = useState(ALL_KEYWORDS.map(k => k.key))
  const [tooltip, setTooltip] = useState(null)

  const kwParam = selectedKws.join(',')
  const { data, loading, error, refetch } = useApi(
    () => getCorrelationMatrix(days, kwParam || 'headache'),
    [days, kwParam]
  )

  const toggleKw = key => setSelectedKws(prev =>
    prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
  )

  const vars = data?.variables ?? []
  const cellMap = {}
  for (const cell of data?.cells ?? []) {
    cellMap[`${cell.row}__${cell.col}`] = cell
  }

  return (
    <div>
      <SectionTitle action={
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <SegmentedControl options={TIME_RANGES} value={days} onChange={setDays} />
          <button type="button" onClick={refetch}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', fontSize: 15, padding: '0 4px' }}
          >↺</button>
        </div>
      }>V5 · Correlation matrix</SectionTitle>

      {/* Keyword selector */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
        <span style={{ fontSize: 10, color: 'var(--t3)', alignSelf: 'center', marginRight: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Keywords</span>
        {ALL_KEYWORDS.map(kw => {
          const on = selectedKws.includes(kw.key)
          return (
            <button key={kw.key} type="button" onClick={() => toggleKw(kw.key)} style={{
              border: on ? '1px solid rgba(99,88,188,0.7)' : '1px solid rgba(213,224,231,0.9)',
              background: on ? 'rgba(99,88,188,0.12)' : 'rgba(255,255,255,0.78)',
              color: on ? '#3730a3' : '#516879',
              borderRadius: 999, padding: '5px 10px', fontSize: 10,
              fontWeight: 700, lineHeight: 1, cursor: 'pointer',
            }}>{kw.label}</button>
          )
        })}
      </div>

      {loading && !data && <Loader />}
      {error && !data && <ErrorBox msg={error} onRetry={refetch} />}

      {data && vars.length > 0 && (
        <div style={{ background: 'var(--bg2)', borderRadius: 8, padding: '14px 10px', overflowX: 'auto', position: 'relative' }}>
          {loading && (
            <div style={{ position: 'absolute', right: 14, top: 10, zIndex: 2, borderRadius: 999, border: '1px solid rgba(213,224,231,0.9)', background: 'rgba(255,255,255,0.88)', color: 'var(--t2)', padding: '5px 9px', fontSize: 10, fontWeight: 800 }}>
              updating
            </div>
          )}

          <div style={{ minWidth: 380 }}>
            {/* Column headers */}
            <div style={{ display: 'grid', gridTemplateColumns: `72px repeat(${vars.length}, 1fr)`, gap: 3, marginBottom: 3 }}>
              <div />
              {vars.map(v => (
                <div key={v.key} style={{
                  fontSize: 8, color: v.group === 'sensor' ? 'var(--t2)' : 'var(--t3)',
                  fontFamily: 'var(--mono)', fontWeight: 700, textAlign: 'center',
                  writingMode: 'vertical-rl', transform: 'rotate(180deg)',
                  height: 58, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {v.label}
                </div>
              ))}
            </div>

            {/* Rows */}
            {vars.map(rowVar => (
              <div key={rowVar.key} style={{ display: 'grid', gridTemplateColumns: `72px repeat(${vars.length}, 1fr)`, gap: 3, marginBottom: 3 }}>
                <div style={{
                  fontSize: 9, color: rowVar.group === 'sensor' ? 'var(--t2)' : 'var(--t3)',
                  fontFamily: 'var(--mono)', fontWeight: 700,
                  display: 'flex', alignItems: 'center',
                }}>
                  {rowVar.label}
                </div>
                {vars.map(colVar => {
                  const cell = cellMap[`${rowVar.key}__${colVar.key}`]
                  const isDiag = rowVar.key === colVar.key
                  const { bg, text, bold } = rToStyle(cell?.r ?? null, isDiag)
                  return (
                    <div key={colVar.key}
                      style={{
                        height: 34, borderRadius: 4, background: bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, fontFamily: 'var(--mono)',
                        fontWeight: bold ? 800 : 500, color: text,
                        cursor: !isDiag && cell?.r != null ? 'crosshair' : 'default',
                        outline: cell?.significant && !isDiag ? `1.5px solid ${text}` : 'none',
                        outlineOffset: -2,
                      }}
                      onMouseEnter={e => !isDiag && cell && setTooltip({ cell, rowLabel: rowVar.label, colLabel: colVar.label, x: e.clientX, y: e.clientY })}
                      onMouseMove={e => setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : t)}
                      onMouseLeave={() => setTooltip(null)}
                    >
                      {cell?.r != null ? (cell.r > 0 && !isDiag ? '+' : '') + cell.r.toFixed(2) : '–'}
                    </div>
                  )
                })}
              </div>
            ))}

            {/* Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, justifyContent: 'center', fontSize: 10, color: 'var(--t3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 12, height: 12, borderRadius: 2, background: 'rgba(226,75,74,0.8)' }} /> negative
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--bg3)' }} /> ~zero
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 12, height: 12, borderRadius: 2, background: 'rgba(99,88,188,0.8)' }} /> positive
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 12, height: 12, borderRadius: 2, border: '1.5px solid #3730a3', background: 'rgba(99,88,188,0.8)' }} /> significant
              </div>
            </div>
          </div>
        </div>
      )}

      {tooltip && <CellTooltip item={tooltip} x={tooltip.x} y={tooltip.y} />}
    </div>
  )
}
