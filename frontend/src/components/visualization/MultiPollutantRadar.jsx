import { useMemo, useState } from 'react'
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { getRadarPollutant } from '../../api'
import { useApi } from '../../hooks/useApi'
import { ErrorBox, Loader, MetricCard, SectionTitle } from '../api_dashboard/ui'

const TODAY_COLOR  = '#378ADD'
const WEEKLY_COLOR = '#94a3b8'
const RADAR_DATE_OPTIONS = Array.from({ length: 17 }, (_, index) => {
  const day = index + 2
  const value = `2026-04-${String(day).padStart(2, '0')}`
  return { value, day, weekday: new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short' }) }
})
const DEFAULT_RADAR_DATE = RADAR_DATE_OPTIONS[RADAR_DATE_OPTIONS.length - 1].value

function formatDisplayDate(value) {
  if (!value) return 'Selected day'
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return 'Selected day'
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

function DatePickerSelect({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const selected = RADAR_DATE_OPTIONS.find((option) => option.value === value) || RADAR_DATE_OPTIONS[0]

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        height: 38,
        padding: '0 12px',
        border: '1px solid var(--border)',
        borderRadius: 999,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(244,248,251,0.92))',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9)',
        color: 'var(--t2)',
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        Date
      </span>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Select radar date"
        aria-expanded={open}
        style={{
          border: 0,
          outline: 'none',
          background: 'transparent',
          color: 'var(--t1)',
          fontSize: 12,
          fontWeight: 800,
          fontFamily: 'var(--mono)',
          cursor: 'pointer',
          padding: 0,
          minWidth: 96,
          textAlign: 'left',
          letterSpacing: 0,
        }}
      >
        Apr {selected.day}, 2026
      </button>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Open date menu"
        style={{
          width: 22,
          height: 22,
          border: '1px solid var(--border)',
          borderRadius: 999,
          background: open ? '#e8f3ff' : 'white',
          color: open ? '#1f6fb4' : 'var(--t3)',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          lineHeight: 1,
        }}
      >
        {open ? '×' : '⌄'}
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 8px)',
            zIndex: 30,
            width: 210,
            padding: 8,
            border: '1px solid var(--border)',
            borderRadius: 14,
            background: 'rgba(255,255,255,0.98)',
            boxShadow: '0 18px 38px rgba(15,23,42,0.14)',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 5,
          }}
        >
          {RADAR_DATE_OPTIONS.map((option) => {
            const active = option.value === value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
                aria-pressed={active}
                style={{
                  height: 34,
                  border: active ? `1px solid ${TODAY_COLOR}` : '1px solid transparent',
                  borderRadius: 9,
                  background: active ? '#e8f3ff' : 'transparent',
                  color: active ? '#1f6fb4' : 'var(--t2)',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 800,
                  fontFamily: 'var(--mono)',
                }}
              >
                {option.day}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function CustomTooltip({ active, payload, selectedLabel }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  return (
    <div style={{ background: '#13222c', color: '#fff', borderRadius: 7, padding: '8px 12px', fontSize: 11, boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{d.label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ color: TODAY_COLOR }}>{selectedLabel}: {d.today != null ? `${d.today} ${d.unit}` : '–'}</span>
        <span style={{ color: WEEKLY_COLOR }}>Previous 7-day avg: {d.weekly_avg != null ? `${d.weekly_avg} ${d.unit}` : '–'}</span>
      </div>
    </div>
  )
}

function AnomalyBadge({ axes, selectedLabel }) {
  const anomalies = axes
    .filter(a => a.today_norm != null && a.weekly_norm != null && a.today_norm > a.weekly_norm * 1.2)
    .sort((a, b) => (b.today_norm - b.weekly_norm) - (a.today_norm - a.weekly_norm))

  if (!anomalies.length) {
    return (
      <div style={{ fontSize: 12, color: '#0F6E56', background: '#e8f5e9', borderRadius: 6, padding: '6px 12px', display: 'inline-block' }}>
        All metrics within normal range for {selectedLabel}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {anomalies.map(a => {
        const pct = Math.round(((a.today_norm - a.weekly_norm) / a.weekly_norm) * 100)
        return (
          <div key={a.key} style={{ fontSize: 11, color: '#A32D2D', background: '#FCEBEB', borderRadius: 6, padding: '5px 10px', fontWeight: 600 }}>
            {a.label} +{pct}% above avg
          </div>
        )
      })}
    </div>
  )
}

export default function MultiPollutantRadar() {
  const [selectedDate, setSelectedDate] = useState(DEFAULT_RADAR_DATE)
  const selectedLabel = useMemo(() => formatDisplayDate(selectedDate), [selectedDate])
  const { data, loading, error, refetch } = useApi(() => getRadarPollutant(selectedDate), [selectedDate])

  const chartData = data?.axes?.map(a => ({
    label: a.label,
    unit: a.unit,
    key: a.key,
    today: a.today,
    weekly_avg: a.weekly_avg,
    today_norm: a.today_norm ?? 0,
    weekly_norm: a.weekly_norm ?? 0,
  })) ?? []

  const mostAbnormal = data?.axes
    ?.filter(a => a.today_norm != null && a.weekly_norm != null)
    ?.reduce((best, a) => {
      const delta = (a.today_norm ?? 0) - (a.weekly_norm ?? 0)
      const bestDelta = (best?.today_norm ?? 0) - (best?.weekly_norm ?? 0)
      return delta > bestDelta ? a : best
    }, null)

  return (
    <div>
      <SectionTitle action={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <DatePickerSelect value={selectedDate} onChange={setSelectedDate} />
          <button
            type="button"
            onClick={refetch}
            aria-label="Refresh radar"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', fontSize: 15, padding: '0 4px' }}
          >↺</button>
        </div>
      }>V4 · Multi-pollutant radar</SectionTitle>

      {loading && !data && <Loader />}
      {error && !data && <ErrorBox msg={error} onRetry={refetch} />}

      {data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 16 }}>
            <MetricCard label="PM2.5 selected" value={data.axes.find(a => a.key === 'pm25')?.today?.toFixed(1) ?? '–'} unit="µg/m³" color="#378ADD" sub={selectedLabel} />
            <MetricCard label="CO selected" value={data.axes.find(a => a.key === 'co')?.today?.toFixed(0) ?? '–'} unit="ppm" color="#E24B4A" sub={selectedLabel} />
            <MetricCard label="Temp selected" value={data.axes.find(a => a.key === 'temp')?.today?.toFixed(1) ?? '–'} unit="°C" color="#BA7517" sub={selectedLabel} />
            <MetricCard label="Humidity selected" value={data.axes.find(a => a.key === 'hum')?.today?.toFixed(0) ?? '–'} unit="%" color="#0F6E56" sub={selectedLabel} />
          </div>

          <div style={{ background: 'var(--bg2)', borderRadius: 8, padding: '14px 10px', position: 'relative' }}>
            {loading && (
              <div style={{ position: 'absolute', right: 14, top: 10, zIndex: 2, borderRadius: 999, border: '1px solid rgba(213,224,231,0.9)', background: 'rgba(255,255,255,0.88)', color: 'var(--t2)', padding: '5px 9px', fontSize: 10, fontWeight: 800 }}>
                updating
              </div>
            )}

            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={chartData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: 'var(--t2)', fontWeight: 600 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 1]}
                  tick={{ fontSize: 9, fill: 'var(--t3)' }}
                  tickCount={4}
                />
                <Radar
                  name={selectedLabel}
                  dataKey="today_norm"
                  stroke={TODAY_COLOR}
                  fill={TODAY_COLOR}
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
                <Radar
                  name="Previous 7-day avg"
                  dataKey="weekly_norm"
                  stroke={WEEKLY_COLOR}
                  fill={WEEKLY_COLOR}
                  fillOpacity={0.15}
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                />
                <Tooltip content={<CustomTooltip selectedLabel={selectedLabel} />} />
                <Legend
                  align="center"
                  verticalAlign="bottom"
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                />
              </RadarChart>
            </ResponsiveContainer>

            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: 10, color: 'var(--t3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Anomaly detection</div>
              <AnomalyBadge axes={data.axes} selectedLabel={selectedLabel} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
