import { useState } from 'react'
import { getHourlyHeatmap } from '../../api'
import { useApi } from '../../hooks/useApi'
import { ErrorBox, Loader, MetricCard, SectionTitle } from '../api_dashboard/ui'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

function pm25ToColor(val, min, max) {
  if (val == null) return 'var(--bg3)'
  // WHO thresholds: 0–12 good, 12–35 moderate, 35–55 unhealthy, 55+ hazardous
  if (val <= 12) {
    const t = val / 12
    return interpolateColor('#e8f5e9', '#a5d6a7', t)
  } else if (val <= 35) {
    const t = (val - 12) / 23
    return interpolateColor('#fff9c4', '#f9a825', t)
  } else if (val <= 55) {
    const t = (val - 35) / 20
    return interpolateColor('#ffe0b2', '#e64a19', t)
  } else {
    const t = Math.min((val - 55) / 45, 1)
    return interpolateColor('#b71c1c', '#4a0000', t)
  }
}

function interpolateColor(hex1, hex2, t) {
  const parse = h => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ]
  const [r1, g1, b1] = parse(hex1)
  const [r2, g2, b2] = parse(hex2)
  const r = Math.round(r1 + (r2 - r1) * t)
  const g = Math.round(g1 + (g2 - g1) * t)
  const b = Math.round(b1 + (b2 - b1) * t)
  return `rgb(${r},${g},${b})`
}

function HeatmapTooltip({ cell }) {
  if (!cell) return null
  return (
    <div style={{
      position: 'fixed',
      top: cell.y + 12,
      left: cell.x + 12,
      background: '#13222c',
      color: '#fff',
      borderRadius: 6,
      padding: '6px 10px',
      fontSize: 11,
      pointerEvents: 'none',
      zIndex: 100,
      whiteSpace: 'nowrap',
      boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
    }}>
      <div style={{ fontWeight: 700 }}>{DAYS[cell.day]} {cell.hour}:00–{cell.hour + 1}:00</div>
      <div style={{ marginTop: 2, fontFamily: 'var(--mono)' }}>
        {cell.avg_pm25 != null ? `PM2.5 ${cell.avg_pm25.toFixed(1)} µg/m³` : 'no data'}
      </div>
      {cell.count > 0 && <div style={{ opacity: 0.65, fontSize: 10, marginTop: 1 }}>{cell.count} readings</div>}
    </div>
  )
}

export default function HourlyHeatmap() {
  const [tooltip, setTooltip] = useState(null)

  const { data, loading, error, refetch } = useApi(() => getHourlyHeatmap(30), [])

  // Build lookup: cellMap[day][hour] = cell
  const cellMap = {}
  for (const cell of data?.cells ?? []) {
    if (!cellMap[cell.day]) cellMap[cell.day] = {}
    cellMap[cell.day][cell.hour] = cell
  }

  const peakHourLabel = data?.peak_hour != null
    ? `${data.peak_hour}:00`
    : '–'

  const worstDayLabel = data?.worst_day != null
    ? DAYS[data.worst_day]
    : '–'

  return (
    <div>
      <SectionTitle action={
        <button
          type="button"
          onClick={refetch}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', fontSize: 15, padding: '0 4px' }}
        >↺</button>
      }>V3 · Hourly heatmap</SectionTitle>

      {loading && !data && <Loader />}
      {error && !data && <ErrorBox msg={error} onRetry={refetch} />}

      {data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 16 }}>
            <MetricCard label="Overall avg PM2.5" value={data.overall_avg?.toFixed(1) ?? '–'} unit="µg/m³" color="var(--t1)" />
            <MetricCard label="Peak hour" value={peakHourLabel} color="#BA7517" />
            <MetricCard label="Worst day" value={worstDayLabel} color="#A32D2D" />
            <MetricCard label="Period" value={data.period_days} unit="days" color="var(--t1)" />
          </div>

          <div style={{ background: 'var(--bg2)', borderRadius: 8, padding: '14px 10px', overflowX: 'auto', position: 'relative' }}>
            {loading && (
              <div style={{ position: 'absolute', right: 14, top: 10, zIndex: 2, borderRadius: 999, border: '1px solid rgba(213,224,231,0.9)', background: 'rgba(255,255,255,0.88)', color: 'var(--t2)', padding: '5px 9px', fontSize: 10, fontWeight: 800 }}>
                updating
              </div>
            )}

            <div style={{ minWidth: 560 }}>
              {/* Hour labels */}
              <div style={{ display: 'grid', gridTemplateColumns: '36px repeat(24, 1fr)', gap: 2, marginBottom: 2 }}>
                <div />
                {HOURS.map(h => (
                  <div key={h} style={{ textAlign: 'center', fontSize: 9, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>
                    {h % 3 === 0 ? h : ''}
                  </div>
                ))}
              </div>

              {/* Heatmap rows */}
              {DAYS.map((dayLabel, d) => (
                <div key={d} style={{ display: 'grid', gridTemplateColumns: '36px repeat(24, 1fr)', gap: 2, marginBottom: 2 }}>
                  <div style={{ fontSize: 9, color: 'var(--t3)', display: 'flex', alignItems: 'center', fontFamily: 'var(--mono)', fontWeight: 600 }}>
                    {dayLabel}
                  </div>
                  {HOURS.map(h => {
                    const cell = cellMap[d]?.[h]
                    const val = cell?.avg_pm25 ?? null
                    return (
                      <div
                        key={h}
                        style={{
                          height: 22,
                          borderRadius: 3,
                          background: pm25ToColor(val),
                          cursor: val != null ? 'crosshair' : 'default',
                          transition: 'opacity 0.1s',
                        }}
                        onMouseEnter={e => setTooltip({ day: d, hour: h, avg_pm25: val, count: cell?.count ?? 0, x: e.clientX, y: e.clientY })}
                        onMouseMove={e => setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : t)}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    )
                  })}
                </div>
              ))}

              {/* Legend */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, justifyContent: 'center' }}>
                <span style={{ fontSize: 9, color: 'var(--t3)' }}>Good</span>
                {['#a5d6a7', '#f9a825', '#e64a19', '#b71c1c'].map((c, i) => (
                  <div key={i} style={{ width: 24, height: 10, borderRadius: 2, background: c }} />
                ))}
                <span style={{ fontSize: 9, color: 'var(--t3)' }}>Hazardous</span>
                <span style={{ fontSize: 9, color: 'var(--bg3)', marginLeft: 8, background: 'var(--bg3)', borderRadius: 2, padding: '1px 4px' }}>no data</span>
              </div>
            </div>
          </div>
        </>
      )}

      {tooltip && <HeatmapTooltip cell={tooltip} />}
    </div>
  )
}
