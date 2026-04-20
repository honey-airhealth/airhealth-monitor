import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getVisualizationTimeSeries } from '../../api'
import { useApi } from '../../hooks/useApi'
import { ErrorBox, Loader, MetricCard, SectionTitle } from '../api_dashboard/ui'

const pollutants = {
  pm25: { key: 'avg_pm25', label: 'PM2.5', unit: 'ug/m3', color: '#378ADD' },
  pm10: { key: 'avg_pm10', label: 'PM10', unit: 'ug/m3', color: '#7C3AED' },
  co: { key: 'avg_co', label: 'CO', unit: 'ppm', color: '#E24B4A' },
}

const keywords = {
  illness_index: { label: 'Illness index', color: '#0F6E56' },
  cough: { label: 'Cough', color: '#8B5CF6' },
  breathless: { label: 'Breathless', color: '#BA7517' },
  chest_tight: { label: 'Chest tight', color: '#DC2626' },
  wheeze: { label: 'Wheeze', color: '#9333EA' },
  headache: { label: 'Headache', color: '#14B8A6' },
  sore_throat: { label: 'Sore throat', color: '#F97316' },
  itchy_throat: { label: 'Itchy throat', color: '#A16207' },
  stuffy_nose: { label: 'Stuffy nose', color: '#475569' },
  runny_nose: { label: 'Runny nose', color: '#0891B2' },
  dizziness: { label: 'Dizziness', color: '#7C3AED' },
  nausea: { label: 'Nausea', color: '#BE123C' },
  itchy_eyes: { label: 'Itchy eyes', color: '#6366F1' },
  allergy: { label: 'Allergy', color: '#64748B' },
  pm25_search: { label: 'PM2.5 search', color: '#0284C7' },
}

const timeRanges = [
  { value: 1, label: '1D' },
  { value: 3, label: '3D' },
  { value: 7, label: '1W' },
  { value: 14, label: '2W' },
]

function average(values) {
  const present = values.filter((value) => value != null)
  if (!present.length) return null
  return (present.reduce((sum, value) => sum + Number(value), 0) / present.length).toFixed(1)
}

function formatDate(value) {
  if (!value) return 'Date'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value).slice(4)
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg)',
      border: '0.5px solid var(--border)',
      borderRadius: 8,
      padding: '8px 12px',
      fontSize: 11,
      boxShadow: '0 12px 28px rgba(15, 23, 42, 0.1)',
    }}>
      <div style={{ color: 'var(--t3)', marginBottom: 4 }}>{label}</div>
      {payload.map((entry) => (
        <div key={entry.dataKey} style={{ color: entry.color, marginBottom: 2 }}>
          {entry.name}: <strong>{entry.value ?? '-'}</strong>
        </div>
      ))}
    </div>
  )
}

function ControlButton({ active, children, onClick, title }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        border: active ? '1px solid rgba(55, 138, 221, 0.8)' : '1px solid rgba(213, 224, 231, 0.9)',
        background: active
          ? 'rgba(230, 243, 255, 0.98)'
          : 'rgba(255, 255, 255, 0.78)',
        color: active ? '#185D9D' : '#516879',
        borderRadius: 999,
        padding: '8px 13px',
        minHeight: 36,
        fontSize: 12,
        fontWeight: 800,
        lineHeight: 1,
        cursor: 'pointer',
        boxShadow: active ? '0 8px 18px rgba(55, 138, 221, 0.14)' : 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  )
}

function SegmentedControl({ options, value, onChange, getLabel = (option) => option.label }) {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      borderRadius: 999,
      border: '1px solid rgba(213, 224, 231, 0.75)',
      background: 'rgba(241, 247, 250, 0.82)',
      padding: 5,
    }}>
      {options.map((option) => (
        <ControlButton
          key={option.value}
          active={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {getLabel(option)}
        </ControlButton>
      ))}
    </div>
  )
}

function KeywordMenu({ value, onChange }) {
  const active = keywords[value] || keywords.illness_index

  return (
    <details style={{ position: 'relative' }}>
      <summary
        style={{
          listStyle: 'none',
          border: '1px solid rgba(213, 224, 231, 0.95)',
          background: 'rgba(255,255,255,0.86)',
          color: 'var(--t1)',
          borderRadius: 999,
          padding: '10px 34px 10px 14px',
          minHeight: 38,
          minWidth: 148,
          fontSize: 12,
          fontWeight: 800,
          lineHeight: 1,
          cursor: 'pointer',
          boxShadow: 'none',
          position: 'relative',
        }}
      >
        {active.label}
        <span style={{ position: 'absolute', right: 13, top: 10, color: 'var(--t3)', fontSize: 11 }}>▾</span>
      </summary>
      <div style={{
        position: 'absolute',
        top: 'calc(100% + 6px)',
        right: 0,
        zIndex: 30,
        width: 190,
        maxHeight: 300,
        overflowY: 'auto',
        borderRadius: 12,
        border: '1px solid rgba(203, 213, 225, 0.95)',
        background: 'rgba(255,255,255,0.98)',
        boxShadow: '0 18px 42px rgba(15, 23, 42, 0.16)',
        padding: 5,
      }}>
        {Object.entries(keywords).map(([key, item]) => (
          <button
            key={key}
            type="button"
            onClick={(event) => {
              onChange(key)
              event.currentTarget.closest('details')?.removeAttribute('open')
            }}
            style={{
              width: '100%',
              border: 'none',
              borderRadius: 8,
              background: value === key ? 'rgba(55, 138, 221, 0.12)' : 'transparent',
              color: value === key ? '#1F5F9E' : 'var(--t1)',
              padding: '8px 10px',
              textAlign: 'left',
              fontSize: 12,
              fontWeight: value === key ? 800 : 700,
              cursor: 'pointer',
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </details>
  )
}

export default function TimeSeriesPollution() {
  const [days, setDays] = useState(7)
  const [pollutant, setPollutant] = useState('pm25')
  const [keyword, setKeyword] = useState('illness_index')
  const { data, loading, error, refetch } = useApi(() => getVisualizationTimeSeries(days, 'daily'), [days])

  const pollutantConfig = pollutants[pollutant]
  const keywordConfig = keywords[keyword]
  const chartData = (data?.data || []).map((row) => ({
    ...row,
    label: formatDate(row.week_start || row.week),
  }))

  const latest = chartData[chartData.length - 1] || {}
  const pollutantValues = chartData.map((row) => row[pollutantConfig.key]).filter((value) => value != null)
  const keywordValues = chartData.map((row) => row[keyword]).filter((value) => value != null)
  const avgPollutant = average(pollutantValues)
  const avgKeyword = average(keywordValues)
  const xTickInterval = chartData.length > 18 ? Math.ceil(chartData.length / 12) : 0

  return (
    <div>
      <SectionTitle action={
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end' }}>
          <SegmentedControl options={timeRanges} value={days} onChange={setDays} />
          <SegmentedControl
            options={Object.entries(pollutants).map(([value, item]) => ({ value, label: item.label }))}
            value={pollutant}
            onChange={setPollutant}
          />
          <KeywordMenu value={keyword} onChange={setKeyword} />
          <button className="refresh-btn" onClick={refetch}>↺</button>
        </div>
      }>V1 · Pollution vs sickness keywords</SectionTitle>

      {loading && chartData.length === 0 && <Loader />}
      {error && chartData.length === 0 && <ErrorBox msg={error} onRetry={refetch} />}
      {error && chartData.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <ErrorBox msg={error} onRetry={refetch} />
        </div>
      )}

      {chartData.length > 0 && (
        <>
          {(data?.weather_summary || data?.weather_outlook) && (
            <div style={{
              marginBottom: 16,
              borderRadius: 12,
              border: '1px solid rgba(203, 213, 225, 0.9)',
              background: 'rgba(248, 250, 252, 0.95)',
              padding: '12px 14px',
              color: 'var(--t2)',
              fontSize: 12,
              lineHeight: 1.65,
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: 6 }}>
                PM2.5 weather insight
              </div>
              {data?.weather_summary ? <div>{data.weather_summary}</div> : null}
              {data?.weather_outlook ? <div style={{ marginTop: 6, color: 'var(--t1)', fontWeight: 700 }}>{data.weather_outlook}</div> : null}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 16 }}>
            <MetricCard label={`avg ${pollutantConfig.label}`} value={avgPollutant} unit={pollutantConfig.unit} color={pollutantConfig.color} />
            <MetricCard label={`avg ${keywordConfig.label}`} value={avgKeyword} unit="trend" color={keywordConfig.color} />
            <MetricCard label={`latest ${pollutantConfig.label}`} value={latest[pollutantConfig.key]} unit={pollutantConfig.unit} color={pollutantConfig.color} />
            <MetricCard label={`latest ${keywordConfig.label}`} value={latest[keyword]} unit="trend" color={keywordConfig.color} />
          </div>

          <div style={{ position: 'relative', height: 320, background: 'var(--bg2)', borderRadius: 8, padding: '14px 10px 6px' }}>
            {loading && (
              <div style={{
                position: 'absolute',
                right: 14,
                top: 10,
                zIndex: 2,
                borderRadius: 999,
                border: '1px solid rgba(213, 224, 231, 0.9)',
                background: 'rgba(255,255,255,0.88)',
                color: 'var(--t2)',
                padding: '5px 9px',
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                boxShadow: '0 8px 18px rgba(15, 23, 42, 0.08)',
              }}>
                updating
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--t3)' }} interval={xTickInterval} />
                <YAxis yAxisId="pollutant" tick={{ fontSize: 10, fill: 'var(--t3)' }} />
                <YAxis yAxisId="co" hide />
                <YAxis yAxisId="keyword" orientation="right" tick={{ fontSize: 10, fill: 'var(--t3)' }} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line yAxisId="pollutant" type="monotone" dataKey={pollutantConfig.key} name={`${pollutantConfig.label} (${pollutantConfig.unit})`} stroke={pollutantConfig.color} strokeWidth={2} dot={chartData.length <= 20 ? { r: 3 } : false} connectNulls />
                <Line yAxisId="keyword" type="monotone" dataKey={keyword} name={`${keywordConfig.label} trend`} stroke={keywordConfig.color} strokeWidth={2} dot={chartData.length <= 20 ? { r: 3 } : false} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p style={{ marginTop: 12, color: 'var(--t2)', fontSize: 12, lineHeight: 1.6 }}>
            Daily PM2.5, PM10, and CO (ppm) averages are aligned with Google Trends sickness keywords.
          </p>
        </>
      )}

      {!loading && !error && chartData.length === 0 && (
        <div style={{ fontSize: 12, color: 'var(--t3)', padding: '8px 0' }}>
          No daily visualization data is available yet.
        </div>
      )}
    </div>
  )
}
