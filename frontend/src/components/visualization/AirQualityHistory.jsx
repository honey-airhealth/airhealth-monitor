import React, { useState, useEffect, useCallback } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { getHistory } from '../../api/index.js'

const TIME_OPTIONS = [
  { value: 24,  label: '24H' },
  { value: 72,  label: '3D'  },
  { value: 168, label: '1W'  },
  { value: 336, label: '2W'  },
]

const INTERVAL_OPTIONS = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily',  label: 'Daily'  },
]

const METRICS = [
  { key: 'pm25', dataKey: 'pm25', label: 'PM2.5 (µg/m³)', color: '#3b82f6' },
  { key: 'temp', dataKey: 'temp', label: 'Temp (°C)',      color: '#f97316' },
  { key: 'hum',  dataKey: 'hum',  label: 'Humidity (%)',   color: '#10b981' },
  { key: 'co',   dataKey: 'co',   label: 'MQ9 raw',        color: '#ef4444' },
]

function SegmentedControl({ options, value, onChange }) {
  return (
    <div style={{
      display: 'inline-flex', background: 'var(--bg3)', borderRadius: 8, padding: 3, gap: 2,
    }}>
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)} style={{
          padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
          fontSize: 12, fontWeight: 600, fontFamily: 'var(--mono)',
          background: value === o.value ? 'var(--bg2)' : 'transparent',
          color: value === o.value ? 'var(--t1)' : 'var(--t3)',
          boxShadow: value === o.value ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
          transition: 'all .15s',
        }}>{o.label}</button>
      ))}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const m = METRICS.find(m => m.dataKey === payload[0]?.dataKey) ?? METRICS[0]
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8,
      padding: '8px 12px', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,.1)',
    }}>
      <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--t2)' }}>{label}</div>
      <div style={{ color: m.color, fontFamily: 'var(--mono)', fontWeight: 600 }}>
        {payload[0]?.value} {m.label.match(/\((.+)\)/)?.[1] ?? ''}
      </div>
    </div>
  )
}

export default function AirQualityHistory() {
  const [hours, setHours]       = useState(168)
  const [interval, setInterval] = useState('hourly')
  const [metric, setMetric]     = useState('pm25')
  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    getHistory(hours, interval)
      .then(r => { setData(r.data); setLoading(false) })
      .catch(() => { setError('Load failed'); setLoading(false) })
  }, [hours, interval])

  useEffect(() => { load() }, [load])

  const activeMetric = METRICS.find(m => m.key === metric) ?? METRICS[0]

  const formatLabel = p => {
    if (!p) return '–'
    return interval === 'daily' ? p.slice(5, 10) : p.slice(5, 16)
  }

  const chartData = (data?.data ?? [])
    .map(d => ({
      t: formatLabel(d.period),
      pm25: d.avg_pm25,
      temp: d.avg_temperature,
      hum:  d.avg_humidity,
      co:   d.avg_mq9_raw,
    }))
    .filter(d => d[activeMetric.dataKey] != null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {METRICS.map(m => (
            <button key={m.key} onClick={() => setMetric(m.key)} style={{
              fontSize: 11, padding: '4px 12px', borderRadius: 999, cursor: 'pointer',
              fontFamily: 'var(--mono)', fontWeight: 600,
              border: metric === m.key ? `1.5px solid ${m.color}` : '1px solid var(--border)',
              background: metric === m.key ? m.color + '18' : 'var(--bg2)',
              color: metric === m.key ? m.color : 'var(--t3)',
              transition: 'all .15s',
            }}>{m.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <SegmentedControl options={TIME_OPTIONS} value={hours} onChange={v => setHours(v)} />
          <SegmentedControl options={INTERVAL_OPTIONS} value={interval} onChange={v => setInterval(v)} />
          <button onClick={load} style={{
            padding: '5px 10px', borderRadius: 7, border: '1px solid var(--border)',
            background: 'var(--bg2)', color: 'var(--t2)', cursor: 'pointer', fontSize: 13,
          }}>↻</button>
        </div>
      </div>

      {/* Chart */}
      <div style={{
        background: 'var(--bg2)', borderRadius: 12, border: '1px solid var(--border)', padding: '16px 8px',
      }}>
        {loading ? (
          <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t3)' }}>Loading…</div>
        ) : error ? (
          <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>{error}</div>
        ) : chartData.length === 0 ? (
          <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t3)' }}>No data for selected metric.</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="t" tick={{ fontSize: 10, fill: 'var(--t3)' }} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: 'var(--t3)' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey={activeMetric.dataKey} stroke={activeMetric.color}
                strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {data && (
        <div style={{ fontSize: 11, color: 'var(--t3)' }}>{data.count} data points</div>
      )}
    </div>
  )
}
