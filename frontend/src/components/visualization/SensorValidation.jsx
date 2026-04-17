import React, { useState, useEffect, useCallback } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { getSensorValidation } from '../../api/index.js'

const TIME_RANGES = [
  { value: 7,  label: '1W' },
  { value: 14, label: '2W' },
  { value: 30, label: '1M' },
]

function SegmentedControl({ options, value, onChange }) {
  return (
    <div style={{
      display: 'inline-flex', background: 'var(--bg3)', borderRadius: 8,
      padding: 3, gap: 2,
    }}>
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          style={{
            padding: '4px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: 600, fontFamily: 'var(--mono)',
            background: value === o.value ? 'var(--bg2)' : 'transparent',
            color: value === o.value ? 'var(--t1)' : 'var(--t3)',
            boxShadow: value === o.value ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
            transition: 'all .15s',
          }}
        >{o.label}</button>
      ))}
    </div>
  )
}

function RmseBadge({ rmse }) {
  if (rmse == null) return <span style={{ color: 'var(--t3)', fontSize: 13 }}>N/A</span>
  const [color, label] =
    rmse < 10  ? ['#16a34a', 'Reliable']      :
    rmse < 20  ? ['#d97706', 'Acceptable']    :
                 ['#dc2626', 'High deviation']
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: color + '18', border: `1px solid ${color}40`,
      borderRadius: 8, padding: '3px 10px',
    }}>
      <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color, fontSize: 15 }}>
        RMSE {rmse}
      </span>
      <span style={{ fontSize: 11, color, fontWeight: 600 }}>µg/m³ · {label}</span>
    </span>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8,
      padding: '8px 12px', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,.1)',
    }}>
      <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--t2)' }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <span>{p.name}</span>
          <span style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>
            {p.value != null ? `${p.value} µg/m³` : '—'}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function SensorValidation() {
  const [days, setDays] = useState(14)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    getSensorValidation(days)
      .then(r => { setData(r.data); setLoading(false) })
      .catch(() => { setError('Load failed'); setLoading(false) })
  }, [days])

  useEffect(() => { load() }, [load])

  // Only show dates where both sources have data so both lines start together
  const chartData = (data?.data ?? [])
    .filter(d => d.sensor_pm25 != null && d.reference_pm25 != null)
    .map(d => ({
      period: d.period,
      'PMS7003': d.sensor_pm25,
      'Reference station': d.reference_pm25,
    }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <RmseBadge rmse={data?.rmse} />
          {data?.correlation != null && (
            <span style={{ fontSize: 12, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>
              r = {data.correlation}
            </span>
          )}
          {data?.station_name && data.station_name !== 'N/A' && (
            <span style={{
              fontSize: 11, color: 'var(--t3)', background: 'var(--bg3)',
              borderRadius: 6, padding: '2px 8px',
            }}>
              ref: {data.station_name}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <SegmentedControl options={TIME_RANGES} value={days} onChange={v => setDays(v)} />
          <button
            onClick={load}
            style={{
              padding: '5px 10px', borderRadius: 7, border: '1px solid var(--border)',
              background: 'var(--bg2)', color: 'var(--t2)', cursor: 'pointer', fontSize: 13,
            }}
          >↻</button>
        </div>
      </div>

      {/* Stats row */}
      {data && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Overlapping days', value: data.n_overlap ?? '—' },
            { label: 'RMSE', value: data.rmse != null ? `${data.rmse} µg/m³` : '—' },
            { label: 'Correlation (r)', value: data.correlation ?? '—' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--bg3)', borderRadius: 8, padding: '8px 14px', flex: 1, minWidth: 100,
            }}>
              <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 16, color: 'var(--t1)' }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      <div style={{
        background: 'var(--bg2)', borderRadius: 12, border: '1px solid var(--border)', padding: '16px 8px',
      }}>
        {loading ? (
          <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t3)' }}>
            Loading…
          </div>
        ) : error ? (
          <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
            {error}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: 'var(--t3)' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--t3)' }} tickLine={false} axisLine={false}
                label={{ value: 'µg/m³', angle: -90, position: 'insideLeft', fontSize: 10, fill: 'var(--t3)', dy: 30 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Line type="monotone" dataKey="PMS7003" stroke="#3b82f6" strokeWidth={2}
                dot={{ r: 3, fill: '#3b82f6' }} />
              <Line type="monotone" dataKey="Reference station" stroke="#f97316" strokeWidth={2}
                strokeDasharray="5 3" dot={{ r: 3, fill: '#f97316' }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Guide */}
      <div style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.6 }}>
        Blue line = PMS7003 sensor · Orange dashed = official reference station
        · If lines track closely and RMSE is low, the sensor is reliable.
      </div>
    </div>
  )
}
