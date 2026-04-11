import { useEffect } from 'react'
import { useApi } from '../../hooks/useApi'
import { getMainContributor } from '../../api'
import { Loader, ErrorBox, SectionTitle, InfoTip, formatUpdatedAt } from './ui'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useRiskSnapshot } from './RiskSnapshotContext'

const COLORS = { pm25: '#378ADD', co: '#E24B4A', heat: '#EF9F27', humidity: '#1D9E75' }
const LABELS = { pm25: 'PM2.5', co: 'CO / MQ9', heat: 'Heat', humidity: 'Humidity' }

export default function MainContributor() {
  const { snapshotTimestamp, setSnapshotTimestamp } = useRiskSnapshot()
  const { data, loading, error, refetch } = useApi(() => getMainContributor(snapshotTimestamp), [snapshotTimestamp])
  const totalRiskTip = 'Total risk combines PM2.5, CO/MQ9, temperature, and humidity into one score.'
  const totalRiskHelp = 'Total risk is the same 0-100 point score. The pie chart breaks down how PM2.5, CO/MQ9, heat, and humidity add to that score.'

  useEffect(() => {
    if (!snapshotTimestamp && data?.timestamp) {
      setSnapshotTimestamp(data.timestamp)
    }
  }, [data?.timestamp, setSnapshotTimestamp, snapshotTimestamp])

  const pieData = data ? [
    { name: 'PM2.5',    value: data.pm25_contribution,     key: 'pm25'     },
    { name: 'CO',       value: data.co_contribution,       key: 'co'       },
    { name: 'Heat',     value: data.heat_contribution,     key: 'heat'     },
    { name: 'Humidity', value: data.humidity_contribution, key: 'humidity' },
  ].filter(d => d.value > 0) : []

  return (
    <div>
      <SectionTitle action={<button className="refresh-btn" onClick={refetch}>↺</button>}>
        Q5 · Main risk contributor
      </SectionTitle>
      {loading && <Loader />}
      {error   && <ErrorBox msg={error} onRetry={refetch} />}
      {data    && (
        <>
          {data.main_contributor && (
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--t2)' }}>main driver: </span>
              <span style={{ fontSize: 13, fontWeight: 500, color: COLORS[data.main_contributor] || 'var(--t1)' }}>
                {LABELS[data.main_contributor] || data.main_contributor}
              </span>
            </div>
          )}
          <div style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                  dataKey="value" paddingAngle={2}>
                  {pieData.map(d => <Cell key={d.key} fill={COLORS[d.key]} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v}`, n]} contentStyle={{ fontSize: 11, border: '0.5px solid var(--border)', borderRadius: 6, background: 'var(--bg)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
            {pieData.map(d => (
              <span key={d.key} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--t2)' }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[d.key], display: 'inline-block' }} />
                {d.name} {d.value}
              </span>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 8, fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--t2)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
              total risk <InfoTip content={totalRiskTip} />:
            </span>{' '}
            <strong style={{ color: 'var(--t1)' }}>{data.total_risk}</strong> <span>points</span>
          </div>
          <div style={{ textAlign: 'center', marginTop: 8, fontSize: 11, color: 'var(--t3)' }}>
            Updated at {formatUpdatedAt(data.timestamp)}
          </div>
          <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: 'var(--t2)', lineHeight: 1.6 }}>
            {totalRiskHelp}
          </div>
        </>
      )}
    </div>
  )
}
