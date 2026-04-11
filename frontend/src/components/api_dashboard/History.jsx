import { useState } from 'react'
import { useApi } from '../../hooks/useApi'
import { getHistory } from '../../api'
import { Loader, ErrorBox, SectionTitle } from './ui'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg)', border: '0.5px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 11 }}>
      <div style={{ color: 'var(--t3)', marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  )
}

export default function History() {
  const [hours, setHours]       = useState(168)
  const [interval, setInterval] = useState('hourly')
  const [metric, setMetric]     = useState('pm25')
  const { data, loading, error, refetch } = useApi(() => getHistory(hours, interval), [hours, interval])

  const metrics = {
    pm25: { key: 'pm25', name: 'PM2.5 (µg/m³)', color: '#378ADD' },
    temp: { key: 'temp', name: 'Temp (°C)',       color: '#EF9F27' },
    hum:  { key: 'hum',  name: 'Humidity (%)',    color: '#1D9E75' },
    co:   { key: 'co',   name: 'MQ9 raw',         color: '#E24B4A' },
  }

  const formatPeriodLabel = (period) => {
    if (!period) return '–'
    if (interval === 'daily') return period.slice(5, 10)
    return period.slice(5, 16)
  }

  const chartData = (data?.data || [])
    .map(d => ({
      period: d.period,
      t: formatPeriodLabel(d.period),
      pm25: d.avg_pm25,
      temp: d.avg_temperature,
      hum:  d.avg_humidity,
      co:   d.avg_mq9_raw,
    }))
    .filter(d => d[metrics[metric].key] != null)

  return (
    <div>
      <SectionTitle action={
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={hours} onChange={e => setHours(Number(e.target.value))} style={{ fontSize: 11, padding: '3px 6px', border: '0.5px solid var(--border)', borderRadius: 6, background: 'var(--bg)', color: 'var(--t1)' }}>
            <option value={24}>24h</option>
            <option value={72}>3d</option>
            <option value={168}>7d</option>
            <option value={336}>14d</option>
          </select>
          <select value={interval} onChange={e => setInterval(e.target.value)} style={{ fontSize: 11, padding: '3px 6px', border: '0.5px solid var(--border)', borderRadius: 6, background: 'var(--bg)', color: 'var(--t1)' }}>
            <option value="hourly">hourly</option>
            <option value="daily">daily</option>
          </select>
          <button className="refresh-btn" onClick={refetch}>↺</button>
        </div>
      }>Q6 · Air quality history</SectionTitle>

      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {Object.entries(metrics).map(([k, m]) => (
          <button key={k} onClick={() => setMetric(k)} style={{
            fontSize: 10, padding: '3px 10px', borderRadius: 999, cursor: 'pointer', fontFamily: 'var(--mono)',
            border: metric === k ? `1.5px solid ${m.color}` : '0.5px solid var(--border)',
            background: metric === k ? m.color + '22' : 'transparent',
            color: metric === k ? m.color : 'var(--t2)',
          }}>{m.name}</button>
        ))}
      </div>

      {loading && <Loader />}
      {error   && <ErrorBox msg={error} onRetry={refetch} />}
      {chartData.length > 0 && (
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <XAxis dataKey="t" tick={{ fontSize: 9, fill: 'var(--t3)' }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 9, fill: 'var(--t3)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey={metrics[metric].key} name={metrics[metric].name}
                stroke={metrics[metric].color} strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      {!loading && !error && chartData.length === 0 && (
        <div style={{ fontSize: 12, color: 'var(--t3)', padding: '8px 0' }}>
          No history data available for the selected metric.
        </div>
      )}
      {data && <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 6 }}>{data.count} data points</div>}
    </div>
  )
}
