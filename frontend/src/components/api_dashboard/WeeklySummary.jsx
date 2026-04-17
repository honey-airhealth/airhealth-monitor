import { useApi } from '../../hooks/useApi'
import { getWeeklySummary } from '../../api'
import { Loader, ErrorBox, SectionTitle } from './ui'

function ratioToColor(ratio) {
  if (ratio < 0.5) {
    const t = ratio * 2
    return `rgb(${Math.round(34+(234-34)*t)},${Math.round(197+(179-197)*t)},${Math.round(94+(8-94)*t)})`
  } else {
    const t = (ratio - 0.5) * 2
    return `rgb(${Math.round(234+(239-234)*t)},${Math.round(179+(68-179)*t)},${Math.round(8+(68-8)*t)})`
  }
}

export default function WeeklySummary() {
  const { data, loading, error, refetch } = useApi(getWeeklySummary, [])

  const pmValues = data?.days?.map(d => d.pm25_avg).filter(v => v != null) ?? []
  const maxPm    = pmValues.length > 0 ? Math.max(...pmValues) : 1
  const minPm    = pmValues.length > 0 ? Math.min(...pmValues) : 0
  const pmRange  = maxPm - minPm || 1

  return (
    <div>
      <SectionTitle action={<button type="button" className="refresh-btn" onClick={refetch}>↺</button>}>
        S3 · Weekly summary
      </SectionTitle>

      {loading && <Loader />}
      {error   && <ErrorBox msg={error} onRetry={refetch} />}

      {data?.days && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
          {data.days.map((day) => {
            const ratio    = day.pm25_avg != null ? (day.pm25_avg - minPm) / pmRange : 0
            const barColor = ratioToColor(ratio)
            const barPct   = Math.round(15 + ratio * 85)
            const border   = day.is_today
              ? '2px solid #818cf8'
              : `1.5px solid ${barColor}`

            return (
              <div
                key={day.date}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 4px 10px',
                  borderRadius: 12,
                  background: `linear-gradient(160deg, ${barColor}22 0%, ${barColor}10 100%)`,
                  border,
                  boxShadow: day.is_today
                    ? `0 0 0 3px rgba(129,140,248,0.18), inset 0 1px 0 ${barColor}30`
                    : `0 2px 8px ${barColor}30, inset 0 1px 0 ${barColor}20`,
                }}
              >
                {/* Day name */}
                <div style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: day.is_today ? '#818cf8' : barColor,
                }}>
                  {day.is_today ? 'Today' : day.day_name}
                </div>

                {/* Bar */}
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                  <div style={{
                    width: 10, height: 44,
                    background: 'rgba(0,0,0,0.06)',
                    borderRadius: 5,
                    display: 'flex', alignItems: 'flex-end', overflow: 'hidden',
                  }}>
                    <div style={{
                      width: '100%',
                      height: `${barPct}%`,
                      background: barColor,
                      borderRadius: 5,
                      transition: 'height 0.4s ease',
                    }} />
                  </div>
                </div>

                {/* PM2.5 value */}
                <div style={{
                  fontSize: 14,
                  fontWeight: 800,
                  fontFamily: 'var(--mono)',
                  color: barColor,
                  lineHeight: 1,
                }}>
                  {day.pm25_avg != null ? day.pm25_avg.toFixed(1) : '—'}
                </div>

              </div>
            )
          })}
        </div>
      )}

      {/* Color gradient legend */}
      {data?.days && (
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 80, height: 6, borderRadius: 3,
              background: 'linear-gradient(to right, rgb(34,197,94), rgb(234,179,8), rgb(239,68,68))',
              display: 'inline-block',
            }} />
            <span style={{ fontSize: 10, color: 'var(--t3)' }}>low → high PM2.5 (relative within the week)</span>
          </div>
          <span style={{ fontSize: 10, color: 'var(--t3)' }}>· purple border = today</span>
        </div>
      )}
    </div>
  )
}
