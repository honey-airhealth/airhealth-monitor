import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { getWindSpeed } from '../../api/index.js'
import { useApi } from '../../hooks/useApi'

const COLOR = '#0ea5e9'

const TIME_OPTIONS = [
  { label: '24H', hours: 24 },
  { label: '3D',  hours: 72 },
  { label: '1W',  hours: 168 },
  { label: '2W',  hours: 336 },
]

function windLabel(kmh) {
  if (kmh == null) return { label: 'N/A', color: '#94a3b8' }
  if (kmh < 5)  return { label: 'Calm',     color: '#22c55e' }
  if (kmh < 15) return { label: 'Light',    color: '#84cc16' }
  if (kmh < 25) return { label: 'Moderate', color: '#f59e0b' }
  if (kmh < 40) return { label: 'Fresh',    color: '#f97316' }
  return             { label: 'Strong',    color: '#ef4444' }
}

function StatBox({ label, value, unit, color }) {
  return (
    <div style={{
      borderRadius: 12,
      border: `1px solid ${color}26`,
      background: `linear-gradient(135deg, ${color}10, rgba(255,255,255,0.98))`,
      padding: '12px 14px',
      flex: 1,
      minWidth: 80,
    }}>
      <div style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#58738a' }}>{label}</div>
      <div style={{ marginTop: 4, fontSize: 18, fontWeight: 800, fontFamily: 'var(--mono)', color }}>
        {value != null ? value.toFixed(1) : '—'}
      </div>
      {unit && <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 1 }}>{unit}</div>}
    </div>
  )
}

function SegmentedControl({ options, value, onChange }) {
  return (
    <div style={{
      display: 'inline-flex', gap: 2, padding: 3,
      background: 'var(--bg3)', borderRadius: 8,
    }}>
      {options.map(opt => (
        <button
          key={opt.label}
          type="button"
          onClick={() => onChange(opt)}
          style={{
            padding: '3px 10px', borderRadius: 6, border: 'none',
            fontSize: 11, fontWeight: 700, cursor: 'pointer',
            background: value === opt.label ? 'var(--bg2)' : 'transparent',
            color: value === opt.label ? 'var(--t1)' : 'var(--t3)',
            boxShadow: value === opt.label ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const val = payload[0]?.value
  const { label: wl, color } = windLabel(val)
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '8px 12px', fontSize: 11,
    }}>
      <div style={{ color: 'var(--t3)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: 'var(--mono)', fontWeight: 800, color: COLOR }}>
        {val != null ? `${val.toFixed(1)} km/h` : '—'}
      </div>
      <div style={{ fontSize: 10, color, fontWeight: 700, marginTop: 2 }}>{wl}</div>
    </div>
  )
}

export default function WindSpeed() {
  const [timeOpt, setTimeOpt] = useState(TIME_OPTIONS[2])
  const [interval, setInterval] = useState('hourly')

  const { data, loading, error } = useApi(
    () => getWindSpeed(timeOpt.hours, interval),
    [timeOpt.hours, interval],
  )

  const avg = data?.avg_wind
  const { label: avgLabel, color: avgColor } = windLabel(avg)

  const tickFormatter = (v) => {
    if (!v) return ''
    if (interval === 'daily') return v.slice(5)
    return v.slice(8, 13)
  }

  return (
    <div style={{
      border: '1px solid var(--border)', borderRadius: 16,
      background: 'radial-gradient(circle at 12% 0%, rgba(14,165,233,0.07), transparent 28%), linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,252,255,0.96))',
      padding: 18, boxShadow: '0 14px 34px rgba(15,23,42,0.06)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#58738a' }}>
            Open-Meteo · Secondary data
          </div>
          <div style={{ marginTop: 4, fontSize: 14, fontWeight: 900, color: 'var(--t1)' }}>
            Wind speed at 10 m above ground
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <SegmentedControl
            options={[{ label: 'Hourly' }, { label: 'Daily' }]}
            value={interval === 'hourly' ? 'Hourly' : 'Daily'}
            onChange={opt => setInterval(opt.label === 'Hourly' ? 'hourly' : 'daily')}
          />
          <SegmentedControl
            options={TIME_OPTIONS}
            value={timeOpt.label}
            onChange={setTimeOpt}
          />
        </div>
      </div>

      {loading && <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t3)' }}>Loading…</div>}
      {error   && <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>{error}</div>}

      {data && (
        <>
          {/* Stat boxes */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <StatBox label="Average" value={data.avg_wind} unit="km/h" color={COLOR} />
            <StatBox label="Max"     value={data.max_wind} unit="km/h" color="#f97316" />
            <StatBox label="Min"     value={data.min_wind} unit="km/h" color="#22c55e" />
            <div style={{
              borderRadius: 12, border: `1px solid ${avgColor}30`,
              background: `${avgColor}10`, padding: '12px 14px',
              flex: 1, minWidth: 80, display: 'flex', flexDirection: 'column', justifyContent: 'center',
            }}>
              <div style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#58738a' }}>Condition</div>
              <div style={{ marginTop: 4, fontSize: 16, fontWeight: 800, color: avgColor }}>{avgLabel}</div>
              <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 1 }}>{data.count} readings</div>
            </div>
          </div>

          {/* Chart */}
          {data.data.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data.data} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="windGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={COLOR} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={COLOR} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="period"
                  tickFormatter={tickFormatter}
                  tick={{ fontSize: 9, fill: '#738896' }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 9, fill: '#738896' }} unit=" km/h" width={54} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={25} stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity={0.5} />
                <Area
                  type="monotone"
                  dataKey="avg_wind"
                  stroke={COLOR}
                  strokeWidth={2}
                  fill="url(#windGrad)"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t3)', fontSize: 13 }}>
              No wind data in this range
            </div>
          )}

          {/* Wind scale legend */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            {[
              ['Calm',     '#22c55e', '< 5'],
              ['Light',    '#84cc16', '5–15'],
              ['Moderate', '#f59e0b', '15–25'],
              ['Fresh',    '#f97316', '25–40'],
              ['Strong',   '#ef4444', '> 40'],
            ].map(([label, color, range]) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '3px 8px', borderRadius: 6,
                background: `${color}12`, border: `1px solid ${color}30`,
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 700, color }}>{label}</span>
                <span style={{ fontSize: 9, color: 'var(--t3)' }}>{range} km/h</span>
              </div>
            ))}
            <span style={{ fontSize: 10, color: 'var(--t3)', alignSelf: 'center', marginLeft: 4 }}>
              — dashed line = Moderate threshold (25 km/h)
            </span>
          </div>
        </>
      )}
    </div>
  )
}
