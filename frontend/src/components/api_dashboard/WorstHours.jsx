import { useState } from 'react'
import { useApi } from '../../hooks/useApi'
import { getWorstHours } from '../../api'
import { Loader, ErrorBox, SectionTitle } from './ui'

const formatHour = (hour) => {
  const h = Number(hour) % 24
  const suffix = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12} ${suffix}`
}

// Interpolate green → yellow → red based on 0–1 ratio
function pmToColor(ratio) {
  if (ratio < 0.5) {
    const t = ratio * 2
    const r = Math.round(34 + (234 - 34) * t)
    const g = Math.round(197 + (179 - 197) * t)
    const b = Math.round(94 + (8 - 94) * t)
    return `rgb(${r},${g},${b})`
  } else {
    const t = (ratio - 0.5) * 2
    const r = Math.round(234 + (185 - 234) * t)
    const g = Math.round(179 + (28 - 179) * t)
    const b = Math.round(8 + (26 - 8) * t)
    return `rgb(${r},${g},${b})`
  }
}

function pmToBg(ratio) {
  if (ratio < 0.4) return 'rgba(34,197,94,0.10)'
  if (ratio < 0.7) return 'rgba(234,179,8,0.10)'
  return 'rgba(185,28,28,0.10)'
}

export default function WorstHours() {
  const [days, setDays] = useState(7)
  const { data, loading, error, refetch } = useApi(() => getWorstHours(days), [days])

  const minPm = data ? Math.min(...data.map(h => h.avg_pm25 || Infinity)) : 0
  const maxPm = data ? Math.max(...data.map(h => h.avg_pm25 || 0), 1) : 1
  const range = maxPm - minPm || 1

  const bestHour  = data?.reduce((a, b) => (a.avg_pm25 ?? Infinity) < (b.avg_pm25 ?? Infinity) ? a : b)
  const worstHour = data?.reduce((a, b) => (a.avg_pm25 ?? 0) > (b.avg_pm25 ?? 0) ? a : b)

  return (
    <div>
      <SectionTitle action={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <select value={days} onChange={e => setDays(Number(e.target.value))}
            style={{ fontSize: 11, padding: '3px 6px', border: '0.5px solid var(--border)', borderRadius: 6, background: 'var(--bg)', color: 'var(--t1)' }}>
            {[3, 5, 7, 14].map(d => <option key={d} value={d}>{d}d avg</option>)}
          </select>
          <button type="button" className="refresh-btn" onClick={refetch}>↺</button>
        </div>
      }>S2 · Worst hours of day</SectionTitle>

      {loading && <Loader />}
      {error   && <ErrorBox msg={error} onRetry={refetch} />}

      {data && (
        <>
          {/* Recommendation cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
            <div style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.30)', borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ fontSize: 10, color: '#15803d', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                ✓ Best for outdoor
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#15803d', fontFamily: 'var(--mono)' }}>
                {bestHour ? formatHour(bestHour.hour) : '—'}
              </div>
              <div style={{ fontSize: 11, color: '#166534', marginTop: 2 }}>
                PM2.5 avg {bestHour?.avg_pm25?.toFixed(1)} µg/m³
              </div>
            </div>

            <div style={{ background: 'rgba(185,28,28,0.08)', border: '1px solid rgba(185,28,28,0.25)', borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ fontSize: 10, color: '#b91c1c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                ✕ Avoid outdoor
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#b91c1c', fontFamily: 'var(--mono)' }}>
                {worstHour ? formatHour(worstHour.hour) : '—'}
              </div>
              <div style={{ fontSize: 11, color: '#991b1b', marginTop: 2 }}>
                PM2.5 avg {worstHour?.avg_pm25?.toFixed(1)} µg/m³
              </div>
            </div>
          </div>

          {/* Hourly bars — relative coloring */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(52px, 1fr))', gap: 4 }}>
            {data.map(h => {
              const ratio = ((h.avg_pm25 ?? minPm) - minPm) / range
              const color = pmToColor(ratio)
              const bg    = pmToBg(ratio)
              const barPct = 20 + ratio * 80
              const isBest  = h.hour === bestHour?.hour
              const isWorst = h.hour === worstHour?.hour

              return (
                <div key={h.hour}
                  title={`${formatHour(h.hour)} · PM2.5: ${h.avg_pm25} · CO: ${h.avg_co}`}
                  style={{
                    textAlign: 'center', padding: '6px 4px', borderRadius: 8,
                    background: bg, cursor: 'default',
                    outline: isBest ? '1.5px solid #22c55e' : isWorst ? '1.5px solid #ef4444' : 'none',
                  }}>
                  <div style={{ height: 30, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 4 }}>
                    <div style={{
                      width: 8, borderRadius: 2, background: color,
                      height: `${barPct}%`, transition: 'height 0.4s ease',
                    }} />
                  </div>
                  <div style={{ fontSize: 9, fontFamily: 'var(--mono)', color, fontWeight: 600 }}>
                    {formatHour(h.hour)}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--t3)' }}>
                    {h.avg_pm25?.toFixed(1)}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 12, marginTop: 10, fontSize: 10, color: 'var(--t3)', alignItems: 'center' }}>
            <span>Color = relative PM2.5 within the day</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ width: 24, height: 6, borderRadius: 2, background: 'linear-gradient(to right, rgb(34,197,94), rgb(234,179,8), rgb(185,28,28)', display: 'inline-block' }} />
              low → high
            </span>
          </div>
        </>
      )}
    </div>
  )
}
