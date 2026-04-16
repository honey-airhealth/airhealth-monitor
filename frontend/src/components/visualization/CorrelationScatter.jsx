import { useState } from 'react'
import { CartesianGrid, Legend, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from 'recharts'
import { getCorrelationScatter } from '../../api'
import { useApi } from '../../hooks/useApi'
import { ErrorBox, Loader, MetricCard, SectionTitle } from '../api_dashboard/ui'

const timeRanges = [
  { value: 3, label: '3D' },
  { value: 7, label: '1W' },
  { value: 14, label: '2W' },
  { value: 30, label: '1M' },
]

const pollutants = {
  pm25: { label: 'PM2.5', unit: 'ug/m3', color: '#378ADD' },
  co: { label: 'CO / MQ9', unit: 'raw', color: '#E24B4A' },
}

const keywords = {
  illness_index: { label: 'Illness index', color: '#0F6E56' },
  cough: { label: 'Cough', color: '#8B5CF6' },
  breathless: { label: 'Breathless', color: '#BA7517' },
  headache: { label: 'Headache', color: '#14B8A6' },
  sore_throat: { label: 'Sore throat', color: '#F97316' },
  itchy_eyes: { label: 'Itchy eyes', color: '#6366F1' },
  allergy: { label: 'Allergy', color: '#64748B' },
  pm25_search: { label: 'PM2.5 search', color: '#0284C7' },
}

function ControlButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: active ? '1px solid rgba(55, 138, 221, 0.8)' : '1px solid rgba(213, 224, 231, 0.9)',
        background: active ? 'rgba(230, 243, 255, 0.98)' : 'rgba(255, 255, 255, 0.78)',
        color: active ? '#185D9D' : '#516879',
        borderRadius: 999,
        padding: '8px 13px',
        minHeight: 36,
        fontSize: 12,
        fontWeight: 800,
        lineHeight: 1,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  )
}

function SegmentedControl({ options, value, onChange }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 999, border: '1px solid rgba(213, 224, 231, 0.75)', background: 'rgba(241, 247, 250, 0.82)', padding: 5 }}>
      {options.map((option) => (
        <ControlButton key={option.value} active={value === option.value} onClick={() => onChange(option.value)}>
          {option.label}
        </ControlButton>
      ))}
    </div>
  )
}

function KeywordMenu({ value, onChange }) {
  const active = keywords[value] || keywords.illness_index

  return (
    <details style={{ position: 'relative' }}>
      <summary style={{ listStyle: 'none', border: '1px solid rgba(213, 224, 231, 0.95)', background: 'rgba(255,255,255,0.86)', color: 'var(--t1)', borderRadius: 999, padding: '10px 34px 10px 14px', minHeight: 38, minWidth: 160, fontSize: 12, fontWeight: 800, lineHeight: 1, cursor: 'pointer', position: 'relative' }}>
        {active.label}
        <span style={{ position: 'absolute', right: 13, top: 10, color: 'var(--t3)', fontSize: 11 }}>v</span>
      </summary>
      <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 30, width: 190, borderRadius: 12, border: '1px solid rgba(203, 213, 225, 0.95)', background: 'rgba(255,255,255,0.98)', boxShadow: '0 18px 42px rgba(15, 23, 42, 0.16)', padding: 5 }}>
        {Object.entries(keywords).map(([key, item]) => (
          <button
            key={key}
            type="button"
            onClick={(event) => {
              onChange(key)
              event.currentTarget.closest('details')?.removeAttribute('open')
            }}
            style={{ width: '100%', border: 'none', borderRadius: 8, background: value === key ? 'rgba(55, 138, 221, 0.12)' : 'transparent', color: value === key ? '#1F5F9E' : 'var(--t1)', padding: '8px 10px', textAlign: 'left', fontSize: 12, fontWeight: value === key ? 800 : 700, cursor: 'pointer' }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </details>
  )
}

function ScatterTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload
  if (!row) return null
  return (
    <div style={{ background: 'var(--bg)', border: '0.5px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 11, boxShadow: '0 12px 28px rgba(15, 23, 42, 0.1)' }}>
      <div style={{ color: 'var(--t3)', marginBottom: 4 }}>{row.label}</div>
      <div style={{ color: '#378ADD' }}>Pollutant: <strong>{row.pollutant_value ?? '-'}</strong></div>
      <div style={{ color: '#0F6E56' }}>Search: <strong>{row.search_volume ?? '-'}</strong></div>
    </div>
  )
}

function formatDate(value) {
  if (!value) return 'Date'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)
}

function getDomain(values) {
  const present = values.filter((value) => value != null)
  if (!present.length) return ['auto', 'auto']
  const min = Math.min(...present)
  const max = Math.max(...present)
  if (min === max) return [Math.max(0, min - 1), max + 1]
  const pad = (max - min) * 0.12
  return [Math.max(0, min - pad), max + pad]
}

function buildRegression(points) {
  if (points.length < 2) return []
  const xs = points.map((p) => p.pollutant_value)
  const ys = points.map((p) => p.search_volume)
  const xMean = xs.reduce((sum, value) => sum + value, 0) / xs.length
  const yMean = ys.reduce((sum, value) => sum + value, 0) / ys.length
  const den = xs.reduce((sum, value) => sum + ((value - xMean) ** 2), 0)
  if (!den) return []
  const slope = xs.reduce((sum, value, index) => sum + ((value - xMean) * (ys[index] - yMean)), 0) / den
  const intercept = yMean - slope * xMean
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  return [
    { pollutant_value: minX, search_volume: slope * minX + intercept },
    { pollutant_value: maxX, search_volume: slope * maxX + intercept },
  ]
}

export default function CorrelationScatter() {
  const [days, setDays] = useState(14)
  const [pollutant, setPollutant] = useState('pm25')
  const [keyword, setKeyword] = useState('illness_index')
  const { data, loading, error, refetch } = useApi(() => getCorrelationScatter(days, pollutant, keyword, 'daily'), [days, pollutant, keyword])

  const pollutantConfig = pollutants[pollutant]
  const keywordConfig = keywords[keyword]
  const points = (data?.data || [])
    .filter((row) => row.pollutant_value != null && row.search_volume != null)
    .map((row) => ({ ...row, label: formatDate(row.period_start || row.period) }))
  const regression = buildRegression(points)
  const r = data?.pearson_r
  const p = data?.p_value
  const xDomain = getDomain(points.map((point) => point.pollutant_value))
  const yDomain = getDomain(points.map((point) => point.search_volume))

  return (
    <div>
      <SectionTitle action={
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end' }}>
          <SegmentedControl options={timeRanges} value={days} onChange={setDays} />
          <SegmentedControl options={Object.entries(pollutants).map(([value, item]) => ({ value, label: item.label }))} value={pollutant} onChange={setPollutant} />
          <KeywordMenu value={keyword} onChange={setKeyword} />
          <button className="refresh-btn" onClick={refetch}>↺</button>
        </div>
      }>V2 · Correlation scatter plot</SectionTitle>

      {loading && points.length === 0 && <Loader />}
      {error && points.length === 0 && <ErrorBox msg={error} onRetry={refetch} />}

      {points.length > 0 && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 16 }}>
            <MetricCard label="Pearson r" value={r == null ? '-' : `${r > 0 ? '+' : ''}${r.toFixed(3)}`} color={data?.significant ? '#0F6E56' : '#BA7517'} />
            <MetricCard label="p-value" value={p == null ? '-' : p.toFixed(5)} color={data?.significant ? '#0F6E56' : '#BA7517'} />
            <MetricCard label="significance" value={data?.significant ? 'yes' : 'no'} color={data?.significant ? '#0F6E56' : '#A32D2D'} />
            <MetricCard label="paired points" value={data?.overlap_points} unit="days" color="var(--t1)" />
          </div>

          <div style={{ position: 'relative', height: 340, background: 'var(--bg2)', borderRadius: 8, padding: '14px 10px 6px' }}>
            {loading && (
              <div style={{ position: 'absolute', right: 14, top: 10, zIndex: 2, borderRadius: 999, border: '1px solid rgba(213, 224, 231, 0.9)', background: 'rgba(255,255,255,0.88)', color: 'var(--t2)', padding: '5px 9px', fontSize: 10, fontWeight: 800 }}>
                updating
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 18, left: 0, bottom: 46 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis type="number" dataKey="pollutant_value" name={pollutantConfig.label} domain={xDomain} tick={{ fontSize: 10, fill: 'var(--t3)' }} label={{ value: `${pollutantConfig.label} (${pollutantConfig.unit})`, position: 'bottom', offset: 4, fontSize: 10, fill: 'var(--t3)' }} />
                <YAxis type="number" dataKey="search_volume" name={keywordConfig.label} domain={yDomain} tick={{ fontSize: 10, fill: 'var(--t3)' }} label={{ value: `${keywordConfig.label} search volume`, angle: -90, position: 'insideLeft', fontSize: 10, fill: 'var(--t3)' }} />
                <ZAxis range={[70, 70]} />
                <Tooltip content={<ScatterTooltip />} />
                <Legend align="center" verticalAlign="bottom" wrapperStyle={{ left: 0, right: 0, margin: '0 auto', textAlign: 'center', fontSize: 11, paddingTop: 20, transform: 'translateY(34px)' }} />
                <Scatter name={`${pollutantConfig.label} vs ${keywordConfig.label}`} data={points} fill={pollutantConfig.color} stroke={keywordConfig.color} line={false} />
                {regression.length === 2 && (
                  <Scatter name="fit line" data={regression} fill="transparent" line={{ stroke: '#13222c', strokeWidth: 1.5, strokeDasharray: '5 5' }} shape={() => null} />
                )}
                {p != null && p < 0.05 && <ReferenceLine y={points.reduce((sum, point) => sum + point.search_volume, 0) / points.length} stroke="rgba(15,110,86,0.35)" strokeDasharray="4 4" />}
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {data?.interpretation && (
            <p style={{ marginTop: 12, color: 'var(--t2)', fontSize: 12, lineHeight: 1.6 }}>
              {data.interpretation}
            </p>
          )}
        </>
      )}

      {!loading && !error && points.length === 0 && (
        <div style={{ fontSize: 12, color: 'var(--t3)', padding: '8px 0' }}>
          No paired pollutant/search points are available yet.
        </div>
      )}
    </div>
  )
}
