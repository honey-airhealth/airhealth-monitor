import { useEffect } from 'react'
import { useApi } from '../../hooks/useApi'
import { getHealthRisk } from '../../api'
import { MetricCard, StatusBadge, ContribBar, Loader, ErrorBox, SectionTitle, getRiskColor, InfoTip, formatUpdatedAt } from './ui'
import { useRiskSnapshot } from './RiskSnapshotContext'

export default function HealthRisk() {
  const { snapshotTimestamp, setSnapshotTimestamp } = useRiskSnapshot()
  const { data, loading, error, refetch } = useApi(() => getHealthRisk(snapshotTimestamp), [snapshotTimestamp])
  const riskFormulaTip = 'Calculated from PM2.5, CO/MQ9, temperature, and humidity. Higher pollution or harsher heat/humidity raises the score.'
  const contributionsTip = 'Shows how much each factor contributes to the current risk score.'
  const riskScoreHelp = 'Risk score is a 0-100 point score calculated from PM2.5, CO/MQ9, temperature, and humidity.'

  useEffect(() => {
    if (!snapshotTimestamp && data?.timestamp) {
      setSnapshotTimestamp(data.timestamp)
    }
  }, [data?.timestamp, setSnapshotTimestamp, snapshotTimestamp])

  return (
    <div>
      <SectionTitle action={<button className="refresh-btn" onClick={refetch}>↺</button>}>
        Q1 · Current health risk
      </SectionTitle>

      {loading && <Loader />}
      {error   && <ErrorBox msg={error} onRetry={refetch} />}
      {data    && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 8, marginBottom: 16 }}>
            <MetricCard
              label={<span style={{ display: 'inline-flex', alignItems: 'center' }}>risk score <InfoTip content={riskFormulaTip} /></span>}
              value={data.risk_score}
              color={getRiskColor(data.risk_level)}
            />
            <MetricCard label="level" value={<StatusBadge level={data.risk_level} />} />
            <MetricCard
              label="main driver"
              value={data.main_contributor}
            />
            {data.official_pm25 != null && <MetricCard label="official PM2.5" value={data.official_pm25} unit="µg/m³" />}
          </div>

          <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.6, marginBottom: 14 }}>
            {riskScoreHelp}
          </div>

          <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 14 }}>
            Updated at {formatUpdatedAt(data.timestamp)}
          </div>

          <div style={{ background: 'var(--bg2)', borderRadius: 8, padding: '12px 14px', marginBottom: 14 }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--t2)', marginBottom: 10, display: 'inline-flex', alignItems: 'center' }}>
              contributions <InfoTip content={contributionsTip} />
            </div>
            <ContribBar label="PM2.5"    value={data.contributions?.pm25}     max={40} color="#378ADD" />
            <ContribBar label="CO / MQ9" value={data.contributions?.co}       max={25} color="#E24B4A" />
            <ContribBar label="Heat 🔥"  value={data.contributions?.heat}     max={20} color="#EF9F27" />
            <ContribBar label="Humidity" value={data.contributions?.humidity} max={15} color="#1D9E75" />
          </div>

          {data.recommendation && (
            <div style={{ fontSize: 12, color: 'var(--t2)', padding: '10px 14px', background: 'var(--bg2)', borderRadius: 8, borderLeft: `3px solid ${getRiskColor(data.risk_level)}`, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
              {data.recommendation}
            </div>
          )}
        </>
      )}
    </div>
  )
}
