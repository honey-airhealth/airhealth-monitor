import { useState } from 'react'
import { useApi } from '../../hooks/useApi'
import { getWorstHours } from '../../api'
import { Loader, ErrorBox, SectionTitle, getRiskColor, getRiskBg } from './ui'

export default function WorstHours() {
  const [days, setDays] = useState(7)
  const { data, loading, error, refetch } = useApi(() => getWorstHours(days), [days])

  const maxPm = data ? Math.max(...data.map(h => h.avg_pm25 || 0), 1) : 1
  const formatHour = (hour) => {
    const normalized = Number(hour) % 24
    const suffix = normalized >= 12 ? 'PM' : 'AM'
    const hour12 = normalized % 12 || 12
    return `${hour12} ${suffix}`
  }

  return (
    <div>
      <SectionTitle action={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <select value={days} onChange={e => setDays(Number(e.target.value))} style={{ fontSize: 11, padding: '3px 6px', border: '0.5px solid var(--border)', borderRadius: 6, background: 'var(--bg)', color: 'var(--t1)' }}>
            {[3,5,7,14].map(d => <option key={d} value={d}>{d}d avg</option>)}
          </select>
          <button className="refresh-btn" onClick={refetch}>↺</button>
        </div>
      }>Q2 · Worst hours of day</SectionTitle>

      {loading && <Loader />}
      {error   && <ErrorBox msg={error} onRetry={refetch} />}
      {data    && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(54px, 1fr))', gap: 4 }}>
          {data.map(h => {
            const pct = (h.avg_pm25 / maxPm) * 100
            const displayHour = formatHour(h.hour)
            return (
              <div key={h.hour} title={`${displayHour} · PM2.5: ${h.avg_pm25} · CO: ${h.avg_co} · ${h.risk_level}`}
                style={{ textAlign: 'center', padding: '6px 4px', borderRadius: 6, background: getRiskBg(h.risk_level), cursor: 'default' }}>
                <div style={{ height: 30, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 4 }}>
                  <div style={{ width: 8, borderRadius: 2, background: getRiskColor(h.risk_level), height: `${Math.max(pct, 8)}%`, transition: 'height 0.4s ease' }} />
                </div>
                <div style={{ fontSize: 9, fontFamily: 'var(--mono)', color: getRiskColor(h.risk_level), fontWeight: 500 }}>
                  {displayHour}
                </div>
                <div style={{ fontSize: 9, color: 'var(--t3)' }}>{h.avg_pm25?.toFixed(1)}</div>
              </div>
            )
          })}
        </div>
      )}
      <div style={{ display: 'flex', gap: 12, marginTop: 10, fontSize: 10, color: 'var(--t3)' }}>
        {[['safe','#E1F5EE','#0F6E56'],['moderate','#FAEEDA','#854F0B'],['unhealthy','#FCEBEB','#A32D2D']].map(([l,bg,c]) => (
          <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: bg, border: `1px solid ${c}`, display: 'inline-block' }} />{l}
          </span>
        ))}
      </div>
    </div>
  )
}
