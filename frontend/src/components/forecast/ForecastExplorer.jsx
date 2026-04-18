import { useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getForecast } from '../../api'
import { useApi } from '../../hooks/useApi'

const METRICS = [
  { key: 'pm25', label: 'PM2.5', unit: 'ug/m3', accent: '#2563eb', auxLabel: 'PM10' },
  { key: 'temperature', label: 'Temperature', unit: 'C', accent: '#f97316', auxLabel: 'Humidity' },
  { key: 'humidity', label: 'Humidity', unit: '%', accent: '#0f766e', auxLabel: 'Temperature' },
]

const BASE_HOUR_OPTIONS = [
  { label: '6H base', value: 6 },
  { label: '12H base', value: 12 },
  { label: '24H base', value: 24 },
]

function SegmentedControl({ options, value, onChange }) {
  return (
    <div style={{ display: 'inline-flex', gap: 2, padding: 3, background: 'var(--bg3)', borderRadius: 8 }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          style={{
            padding: '4px 10px',
            borderRadius: 6,
            border: 'none',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            background: value === opt.value ? 'var(--bg2)' : 'transparent',
            color: value === opt.value ? 'var(--t1)' : 'var(--t3)',
            boxShadow: value === opt.value ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function MetricTabs({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {METRICS.map((metric) => {
        const active = metric.key === value
        return (
          <button
            key={metric.key}
            type="button"
            onClick={() => onChange(metric.key)}
            style={{
              border: active ? `1px solid ${metric.accent}` : '1px solid rgba(213,224,231,0.9)',
              background: active ? `${metric.accent}16` : 'rgba(255,255,255,0.82)',
              color: active ? metric.accent : 'var(--t2)',
              borderRadius: 999,
              padding: '8px 14px',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {metric.label}
          </button>
        )
      })}
    </div>
  )
}

function StatBox({ label, value, unit, accent = '#2563eb', sub }) {
  return (
    <div style={{
      borderRadius: 12,
      border: `1px solid ${accent}26`,
      background: `linear-gradient(135deg, ${accent}12, rgba(255,255,255,0.98))`,
      padding: '12px 14px',
      minWidth: 120,
      flex: 1,
    }}>
      <div style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#58738a' }}>{label}</div>
      <div style={{ marginTop: 4, fontSize: 18, fontWeight: 800, fontFamily: 'var(--mono)', color: accent }}>
        {value ?? '—'}{unit ? <span style={{ fontSize: 11, marginLeft: 3, color: 'var(--t3)' }}>{unit}</span> : null}
      </div>
      {sub ? <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 2 }}>{sub}</div> : null}
    </div>
  )
}

function ForecastTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload
  return (
    <div style={{
      background: 'var(--bg2)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '8px 12px',
      fontSize: 11,
      boxShadow: '0 12px 28px rgba(15, 23, 42, 0.1)',
    }}>
      <div style={{ color: 'var(--t3)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: 'var(--mono)', fontWeight: 800, color: '#2563eb' }}>
        {row?.value != null ? `${row.value.toFixed(1)} ${unit}` : '—'}
      </div>
      {row?.detail ? <div style={{ marginTop: 4, color: 'var(--t2)', lineHeight: 1.5 }}>{row.detail}</div> : null}
    </div>
  )
}

export default function ForecastExplorer() {
  const [metric, setMetric] = useState('pm25')
  const [baseHours, setBaseHours] = useState(12)
  const metricMeta = METRICS.find((item) => item.key === metric) || METRICS[0]
  const { data, loading, error, refetch } = useApi(
    () => getForecast(metric, 12, baseHours),
    [metric, baseHours],
  )

  const chartData = data ? [
    {
      label: 'Now',
      value: data.current_value,
      detail: `${metricMeta.auxLabel} ${data.current_aux_value ?? '—'} ${metric === 'temperature' ? '%' : metric === 'humidity' ? 'C' : 'ug/m3'}`,
    },
    ...((data.points || []).map((point) => ({
      label: `+${point.hours_ahead}h`,
      value: point.predicted_value,
      detail: `Trend ${point.trend_delta >= 0 ? '+' : ''}${point.trend_delta}, weather ${point.weather_adjustment >= 0 ? '+' : ''}${point.weather_adjustment}`,
    }))),
  ] : []

  return (
    <section style={{
      border: '1px solid var(--border)',
      borderRadius: 16,
      background: 'radial-gradient(circle at 12% 0%, rgba(59,130,246,0.08), transparent 28%), linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,252,255,0.96))',
      padding: 18,
      boxShadow: '0 14px 34px rgba(15,23,42,0.06)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#58738a' }}>
            Forecast explorer
          </div>
          <div style={{ marginTop: 4, fontSize: 14, fontWeight: 900, color: 'var(--t1)' }}>
            Short-horizon outlook for air and comfort metrics
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <SegmentedControl options={BASE_HOUR_OPTIONS} value={baseHours} onChange={setBaseHours} />
          <button type="button" className="refresh-btn" onClick={refetch}>↺</button>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <MetricTabs value={metric} onChange={setMetric} />
      </div>

      {loading && chartData.length === 0 && <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t3)' }}>Loading…</div>}
      {error && chartData.length === 0 && <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>{error}</div>}

      {data && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <StatBox label="Current" value={data.current_value?.toFixed(1)} unit={data.unit} accent={metricMeta.accent} sub={`${metricMeta.auxLabel} ${data.current_aux_value?.toFixed?.(1) ?? data.current_aux_value ?? '—'}`} />
            <StatBox label="Trend" value={data.trend} accent="#7c3aed" sub={`Base ${data.based_on_hours}h`} />
            <StatBox label="Confidence" value={data.confidence} accent="#0f766e" sub={`Rain ${data.avg_precipitation ?? '—'} mm · Wind ${data.avg_wind_speed ?? '—'} km/h`} />
          </div>

          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 6, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metricMeta.accent} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={metricMeta.accent} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--t3)' }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--t3)' }} tickLine={false} axisLine={false} unit={` ${data.unit}`} width={60} />
                <Tooltip content={<ForecastTooltip unit={data.unit} />} />
                <Area type="monotone" dataKey="value" stroke={metricMeta.accent} strokeWidth={2.2} fill="url(#forecastGradient)" activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : null}

          <div style={{ marginTop: 14, borderRadius: 12, border: '1px solid rgba(203,213,225,0.92)', background: 'rgba(248,250,252,0.95)', padding: '12px 14px' }}>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#58738a', marginBottom: 6 }}>
              Forecast summary
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.7, color: 'var(--t2)' }}>{data.summary}</div>
          </div>

          <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
            {(data.points || []).map((point) => (
              <div key={point.hours_ahead} style={{ borderRadius: 12, border: '1px solid rgba(213,224,231,0.9)', background: 'rgba(255,255,255,0.82)', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--t1)' }}>+{point.hours_ahead}h forecast</div>
                  <div style={{ fontSize: 16, fontFamily: 'var(--mono)', fontWeight: 800, color: metricMeta.accent }}>
                    {point.predicted_value.toFixed(1)} {data.unit}
                  </div>
                </div>
                <div style={{ marginTop: 4, fontSize: 11, color: 'var(--t3)' }}>
                  Trend {point.trend_delta >= 0 ? '+' : ''}{point.trend_delta} · Weather {point.weather_adjustment >= 0 ? '+' : ''}{point.weather_adjustment}
                </div>
                <div style={{ marginTop: 6, fontSize: 12, lineHeight: 1.6, color: 'var(--t2)' }}>{point.outlook}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
