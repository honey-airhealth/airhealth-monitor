import React, { useEffect, useState } from 'react'
import { getSensorDescriptive } from '../../api/index.js'

const METRICS = [
  { key: 'pm25', color: '#3b82f6' },
  { key: 'temp', color: '#f97316' },
  { key: 'hum', color: '#10b981' },
  { key: 'co', color: '#ef4444' },
]

function formatStat(value, unit) {
  if (value == null) return '—'
  return unit ? `${value} ${unit}` : String(value)
}

export default function SensorDataDescriptive() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getSensorDescriptive(168, 'hourly')
      .then(response => { setData(response.data); setLoading(false) })
      .catch(() => { setError('Load failed'); setLoading(false) })
  }, [])

  const descriptiveStats = (data?.metrics ?? []).map(metric => ({
    ...metric,
    color: METRICS.find(item => item.key === metric.key)?.color ?? '#3b82f6',
  }))

  const periodLabel = data?.period_start && data?.period_end
    ? `${data.period_start} to ${data.period_end}`
    : 'No period selected'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <section style={{
        border: '1px solid var(--border)',
        borderRadius: 16,
        background:
          'radial-gradient(circle at 12% 0%, rgba(59,130,246,0.08), transparent 28%), linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,252,255,0.96))',
        padding: 18,
        boxShadow: '0 14px 34px rgba(15,23,42,0.06)',
      }}>
        {loading ? (
          <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t3)' }}>Loading...</div>
        ) : error ? (
          <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>{error}</div>
        ) : (
          <>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              marginBottom: 16,
            }}>
              <div>
                <div style={{
                  fontSize: 10, fontWeight: 900, letterSpacing: '0.18em',
                  textTransform: 'uppercase', color: '#58738a',
                }}>
                  Sensor data descriptive
                </div>
                <div style={{ marginTop: 4, fontSize: 14, fontWeight: 900, color: 'var(--t1)' }}>
                  Average, SD, Max and Min for the latest 1-week hourly range
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <span style={{
                  border: '1px solid rgba(186,204,218,0.9)',
                  borderRadius: 999,
                  background: 'var(--bg2)',
                  padding: '5px 10px',
                  color: 'var(--t3)',
                  fontSize: 11,
                  fontFamily: 'var(--mono)',
                  fontWeight: 800,
                  }}>
                  {descriptiveStats.reduce((sum, metric) => sum + (metric.count || 0), 0)} data points
                </span>
                <span style={{
                  border: '1px solid rgba(186,204,218,0.9)',
                  borderRadius: 999,
                  background: 'var(--bg2)',
                  padding: '5px 10px',
                  color: 'var(--t3)',
                  fontSize: 11,
                  fontFamily: 'var(--mono)',
                  fontWeight: 800,
                }}>
                  {periodLabel}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14 }}>
              {descriptiveStats.map(stat => (
                <div key={stat.key} style={{
                  border: `1px solid ${stat.color}26`,
                  borderRadius: 14,
                  background: `linear-gradient(135deg, ${stat.color}12, rgba(255,255,255,0.98) 58%, ${stat.color}08)`,
                  padding: '14px 16px',
                  boxShadow: `0 12px 28px ${stat.color}0f`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ color: stat.color, fontSize: 12, fontWeight: 900 }}>{stat.label}</span>
                    <span style={{ color: 'var(--t3)', fontSize: 10, fontFamily: 'var(--mono)', fontWeight: 700 }}>
                      n={stat.count}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
                    {[
                      ['Average', stat.average],
                      ['SD', stat.sd],
                      ['Max', stat.max],
                      ['Min', stat.min],
                    ].map(([label, value]) => (
                      <div key={label} style={{
                        borderRadius: 9,
                        background: 'rgba(255,255,255,0.72)',
                        border: '1px solid rgba(210,222,232,0.78)',
                        padding: '7px 8px',
                      }}>
                        <div style={{ color: 'var(--t3)', fontSize: 9, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                          {label}
                        </div>
                        <div style={{ marginTop: 3, color: 'var(--t1)', fontSize: 12, fontFamily: 'var(--mono)', fontWeight: 800 }}>
                          {formatStat(value, stat.unit)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  )
}
