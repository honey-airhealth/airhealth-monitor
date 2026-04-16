import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { getRadarPollutant } from '../../api'
import { useApi } from '../../hooks/useApi'
import { ErrorBox, Loader, MetricCard, SectionTitle } from '../api_dashboard/ui'

const TODAY_COLOR  = '#378ADD'
const WEEKLY_COLOR = '#94a3b8'

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  if (!d) return null
  return (
    <div style={{ background: '#13222c', color: '#fff', borderRadius: 7, padding: '8px 12px', fontSize: 11, boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{d.label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ color: TODAY_COLOR }}>Today: {d.today != null ? `${d.today} ${d.unit}` : '–'}</span>
        <span style={{ color: WEEKLY_COLOR }}>7-day avg: {d.weekly_avg != null ? `${d.weekly_avg} ${d.unit}` : '–'}</span>
      </div>
    </div>
  )
}

function AnomalyBadge({ axes }) {
  const anomalies = axes
    .filter(a => a.today_norm != null && a.weekly_norm != null && a.today_norm > a.weekly_norm * 1.2)
    .sort((a, b) => (b.today_norm - b.weekly_norm) - (a.today_norm - a.weekly_norm))

  if (!anomalies.length) {
    return (
      <div style={{ fontSize: 12, color: '#0F6E56', background: '#e8f5e9', borderRadius: 6, padding: '6px 12px', display: 'inline-block' }}>
        All metrics within normal range today
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
  const { data, loading, error, refetch } = useApi(() => getRadarPollutant(), [])

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
        <button
          type="button"
          onClick={refetch}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', fontSize: 15, padding: '0 4px' }}
        >↺</button>
      }>V4 · Multi-pollutant radar</SectionTitle>

      {loading && !data && <Loader />}
      {error && !data && <ErrorBox msg={error} onRetry={refetch} />}

      {data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 16 }}>
            <MetricCard label="PM2.5 today" value={data.axes.find(a => a.key === 'pm25')?.today?.toFixed(1) ?? '–'} unit="µg/m³" color="#378ADD" />
            <MetricCard label="CO today" value={data.axes.find(a => a.key === 'co')?.today?.toFixed(0) ?? '–'} unit="raw" color="#E24B4A" />
            <MetricCard label="Temp today" value={data.axes.find(a => a.key === 'temp')?.today?.toFixed(1) ?? '–'} unit="°C" color="#BA7517" />
            <MetricCard label="Humidity" value={data.axes.find(a => a.key === 'hum')?.today?.toFixed(0) ?? '–'} unit="%" color="#0F6E56" />
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
                  name="Today"
                  dataKey="today_norm"
                  stroke={TODAY_COLOR}
                  fill={TODAY_COLOR}
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
                <Radar
                  name="7-day avg"
                  dataKey="weekly_norm"
                  stroke={WEEKLY_COLOR}
                  fill={WEEKLY_COLOR}
                  fillOpacity={0.15}
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  align="center"
                  verticalAlign="bottom"
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                />
              </RadarChart>
            </ResponsiveContainer>

            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: 10, color: 'var(--t3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Anomaly detection</div>
              <AnomalyBadge axes={data.axes} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
