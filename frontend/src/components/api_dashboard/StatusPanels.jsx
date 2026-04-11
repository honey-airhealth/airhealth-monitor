import { useEffect, useState } from 'react'
import { useApi } from '../../hooks/useApi'
import { getCompareOfficial, getTrend, getSafety } from '../../api'
import { MetricCard, StatusBadge, Loader, ErrorBox, SectionTitle, getRiskColor, formatUpdatedAt } from './ui'
import { useRiskSnapshot } from './RiskSnapshotContext'

export function CompareOfficial() {
  const { data, loading, error, refetch } = useApi(getCompareOfficial)
  const diff = data?.difference
  const diffColor = diff == null ? 'var(--t1)' : diff > 5 ? '#A32D2D' : diff < -5 ? '#0F6E56' : '#854F0B'

  return (
    <div>
      <SectionTitle action={<button className="refresh-btn" onClick={refetch}>↺</button>}>
        Q7 · Local vs official PM2.5
      </SectionTitle>
      {loading && <Loader />}
      {error   && <ErrorBox msg={error} onRetry={refetch} />}
      {data    && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
          <MetricCard label="local sensor" value={data.local_pm25?.toFixed(1)} unit="µg/m³" color="#378ADD" />
          <MetricCard label="official"     value={data.official_pm25?.toFixed(1) ?? 'N/A'} unit={data.official_pm25 ? 'µg/m³' : ''} />
          <MetricCard label="difference"   value={diff != null ? (diff > 0 ? '+' : '') + diff.toFixed(1) : 'N/A'} unit={diff != null ? 'µg/m³' : ''} color={diffColor} />
        </div>
      )}
    </div>
  )
}

export function Trend() {
  const [hours, setHours] = useState(24)
  const { data, loading, error, refetch } = useApi(() => getTrend(hours), [hours])

  const dirColor = { improving: '#0F6E56', stable: '#854F0B', worsening: '#A32D2D' }
  const dirIcon  = { improving: '↓', stable: '→', worsening: '↑' }

  return (
    <div>
      <SectionTitle action={
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <select value={hours} onChange={e => setHours(Number(e.target.value))} style={{ fontSize: 11, padding: '3px 6px', border: '0.5px solid var(--border)', borderRadius: 6, background: 'var(--bg)', color: 'var(--t1)' }}>
            <option value={6}>6h</option>
            <option value={12}>12h</option>
            <option value={24}>24h</option>
            <option value={48}>48h</option>
          </select>
          <button className="refresh-btn" onClick={refetch}>↺</button>
        </div>
      }>Q8 · Trend direction</SectionTitle>

      {loading && <Loader />}
      {error   && <ErrorBox msg={error} onRetry={refetch} />}
      {data    && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(110px,1fr))', gap: 8, marginBottom: 12 }}>
            {[
              ['overall',   data.direction],
              ['pm2.5',     data.pm25_trend],
              ['co / mq9',  data.co_trend],
              ['temp',      data.temperature_trend],
              ['humidity',  data.humidity_trend],
            ].map(([label, dir]) => (
              <div key={label} style={{ background: 'var(--bg2)', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 10, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 16, fontWeight: 500, color: dirColor[dir] || 'var(--t1)' }}>
                  {dirIcon[dir] || '–'} {dir || '–'}
                </div>
              </div>
            ))}
          </div>
          {data.summary && <p style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.6 }}>{data.summary}</p>}
        </>
      )}
    </div>
  )
}

export function Safety() {
  const { snapshotTimestamp, setSnapshotTimestamp } = useRiskSnapshot()
  const { data, loading, error, refetch } = useApi(() => getSafety(snapshotTimestamp), [snapshotTimestamp])

  useEffect(() => {
    if (!snapshotTimestamp && data?.timestamp) {
      setSnapshotTimestamp(data.timestamp)
    }
  }, [data?.timestamp, setSnapshotTimestamp, snapshotTimestamp])

  return (
    <div>
      <SectionTitle action={<button className="refresh-btn" onClick={refetch}>↺</button>}>
        Q9 · Safety for daily activity
      </SectionTitle>
      {loading && <Loader />}
      {error   && <ErrorBox msg={error} onRetry={refetch} />}
      {data    && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{ fontSize: 40, fontWeight: 500, color: getRiskColor(data.risk_level), fontFamily: 'var(--mono)' }}>
              {data.risk_score}
            </div>
            <div>
              <StatusBadge level={data.risk_level} />
              <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 4 }}>risk score / 100</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 14 }}>
            Updated at {formatUpdatedAt(data.timestamp)}
          </div>
          {data.recommendation && (
            <div style={{ fontSize: 12, color: 'var(--t2)', padding: '10px 14px', background: 'var(--bg2)', borderRadius: 8, lineHeight: 1.6 }}>
              {data.recommendation}
            </div>
          )}
        </>
      )}
    </div>
  )
}
