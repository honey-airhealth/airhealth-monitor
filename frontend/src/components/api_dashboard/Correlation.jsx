import { useState } from 'react'
import { useApi } from '../../hooks/useApi'
import { getCorrelation } from '../../api'
import { Loader, ErrorBox, SectionTitle } from './ui'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'

function CorrBar({ label, value }) {
  if (value == null) return null
  const abs = Math.abs(value)
  const color = abs > 0.5 ? '#E24B4A' : abs > 0.3 ? '#BA7517' : '#378ADD'
  const pct = abs * 100
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
        <span style={{ color: 'var(--t2)' }}>{label}</span>
        <span style={{ fontFamily: 'var(--mono)', fontWeight: 500, color }}>{value > 0 ? '+' : ''}{value.toFixed(3)}</span>
      </div>
      <div style={{ height: 6, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3 }} />
      </div>
    </div>
  )
}

export default function Correlation() {
  const [days, setDays] = useState(7)
  const { data, loading, error, refetch } = useApi(() => getCorrelation(days), [days])

  const radarData = data ? [
    { metric: 'PM2.5 vs headache',    value: Math.abs(data.pm25_vs_headache    || 0) },
    { metric: 'PM2.5 vs cough',       value: Math.abs(data.pm25_vs_cough       || 0) },
    { metric: 'CO vs breathing',      value: Math.abs(data.co_vs_breathing      || 0) },
    { metric: 'PM2.5 vs search',      value: Math.abs(data.pm25_vs_pm25_search || 0) },
  ] : []

  return (
    <div>
      <SectionTitle action={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <select value={days} onChange={e => setDays(Number(e.target.value))} style={{ fontSize: 11, padding: '3px 6px', border: '0.5px solid var(--border)', borderRadius: 6, background: 'var(--bg)', color: 'var(--t1)' }}>
            {[3,5,7,14,30].map(d => <option key={d} value={d}>{d}d</option>)}
          </select>
          <button className="refresh-btn" onClick={refetch}>↺</button>
        </div>
      }>Q2 · PM2.5 vs illness trends</SectionTitle>

      {loading && <Loader />}
      {error   && <ErrorBox msg={error} onRetry={refetch} />}
      {data    && (
        <>
          {radarData.some(d => d.value > 0) && (
            <div style={{ height: 180, marginBottom: 16 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: 'var(--t3)' }} />
                  <Radar dataKey="value" fill="#378ADD" fillOpacity={0.25} stroke="#378ADD" strokeWidth={1.5} dot={{ r: 3, fill: '#378ADD' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
          <CorrBar label="PM2.5 vs headache"   value={data.pm25_vs_headache} />
          <CorrBar label="PM2.5 vs cough"      value={data.pm25_vs_cough} />
          <CorrBar label="CO vs breathlessness" value={data.co_vs_breathing} />
          <CorrBar label="PM2.5 vs PM2.5 search" value={data.pm25_vs_pm25_search} />
          {data.interpretation && (
            <p style={{ fontSize: 12, color: 'var(--t2)', marginTop: 10, lineHeight: 1.6 }}>{data.interpretation}</p>
          )}
        </>
      )}
    </div>
  )
}
