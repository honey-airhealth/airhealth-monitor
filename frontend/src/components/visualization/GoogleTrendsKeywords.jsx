import React, { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList,
} from 'recharts'
import { getGoogleTrendsKeywords } from '../../api/index.js'
import { useApi } from '../../hooks/useApi.js'

const TIME_RANGES = [
  { value: 3, label: '3D' },
  { value: 7, label: '1W' },
  { value: 14, label: '2W' },
]

const PALETTE = ['#2563eb', '#0284c7', '#0891b2', '#0f766e', '#16a34a', '#65a30d', '#ca8a04', '#ea580c', '#dc2626', '#7c3aed']

function SegmentedControl({ options, value, onChange }) {
  return (
    <div style={{
      display: 'inline-flex',
      background: 'linear-gradient(180deg, rgba(226,236,243,0.95), rgba(215,229,238,0.9))',
      borderRadius: 10,
      padding: 4,
      gap: 3,
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.75)',
    }}>
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          style={{
            padding: '5px 15px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: 800, fontFamily: 'var(--mono)',
            background: value === option.value ? 'linear-gradient(180deg,#ffffff,#f5fbff)' : 'transparent',
            color: value === option.value ? '#102033' : '#6d8292',
            boxShadow: value === option.value ? '0 6px 16px rgba(37,99,235,0.14)' : 'none',
            transition: 'all .15s',
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload
  return (
    <div style={{
      background: 'rgba(255,255,255,0.96)',
      border: '1px solid rgba(186,204,218,0.9)',
      borderRadius: 12,
      padding: '10px 12px',
      fontSize: 12,
      boxShadow: '0 18px 38px rgba(15,23,42,.13)',
      backdropFilter: 'blur(10px)',
    }}>
      <div style={{ fontWeight: 900, marginBottom: 6, color: row?.color || '#2563eb' }}>{label}</div>
      <div style={{ color: '#31485a', fontFamily: 'var(--mono)', fontWeight: 800 }}>
        search interest {row?.value ?? '-'}
      </div>
    </div>
  )
}

function TrendBar({ x, y, width, height, payload }) {
  const safeWidth = Math.max(width, 0)
  const radius = Math.min(10, height / 2)
  return (
    <g>
      <rect
        x={x}
        y={y + 2}
        width={safeWidth}
        height={height - 4}
        rx={radius}
        fill={`url(#trend-${payload.key})`}
      />
      <rect
        x={x}
        y={y + 2}
        width={Math.min(safeWidth, 70)}
        height={height - 4}
        rx={radius}
        fill="rgba(255,255,255,0.18)"
      />
    </g>
  )
}

function ValueLabel({ x, y, width, height, value }) {
  if (value == null) return null
  const label = Number(value).toFixed(Number(value) % 1 === 0 ? 0 : 1)
  return (
    <text
      x={x + width + 10}
      y={y + height / 2 + 4}
      fill="#40586a"
      fontSize={12}
      fontWeight={800}
      fontFamily="var(--mono)"
    >
      {label}
    </text>
  )
}

export default function GoogleTrendsKeywords() {
  const [days, setDays] = useState(7)
  const { data, loading, error, refetch } = useApi(() => getGoogleTrendsKeywords(days), [days])

  const chartData = (data?.keywords ?? [])
    .map((keyword, index) => ({
      key: keyword.key,
      label: keyword.label,
      value: keyword.avg_search,
      avg: keyword.avg_search,
      max: keyword.max_search,
      color: PALETTE[index % PALETTE.length],
    }))
    .filter(item => item.value != null)
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <span style={{
            border: '1px solid rgba(186,204,218,0.9)',
            borderRadius: 10,
            background: 'linear-gradient(180deg,#ffffff,#f7fbfe)',
            padding: '6px 11px',
            fontSize: 12,
            color: '#40586a',
            fontFamily: 'var(--mono)',
            fontWeight: 800,
          }}>
            {data?.sample_count ?? '-'} samples
          </span>
          <span style={{
            border: '1px solid rgba(186,204,218,0.9)',
            borderRadius: 10,
            background: 'linear-gradient(180deg,#ffffff,#f7fbfe)',
            padding: '6px 11px',
            fontSize: 12,
            color: '#40586a',
            fontFamily: 'var(--mono)',
            fontWeight: 800,
          }}>
            {data?.count ?? '-'} dates
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <SegmentedControl options={TIME_RANGES} value={days} onChange={setDays} />
          <button
            type="button"
            onClick={refetch}
            style={{
              padding: '6px 11px',
              borderRadius: 9,
              border: '1px solid rgba(186,204,218,0.9)',
              background: 'linear-gradient(180deg,#ffffff,#f7fbfe)',
              color: '#40586a',
              cursor: 'pointer',
              fontSize: 13,
              boxShadow: '0 6px 16px rgba(15,23,42,0.06)',
            }}
          >↻</button>
        </div>
      </div>

      <div style={{
        background:
          'radial-gradient(circle at 18% 8%, rgba(96,165,250,0.10), transparent 30%), linear-gradient(180deg, rgba(255,255,255,0.99), rgba(247,251,254,0.97))',
        borderRadius: 16,
        border: '1px solid rgba(194,211,224,0.95)',
        padding: '18px 18px 14px 12px',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 18px 42px rgba(59,130,246,0.07)',
      }}>
        {loading ? (
          <div style={{ height: 330, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t3)' }}>Loading...</div>
        ) : error ? (
          <div style={{ height: 330, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>{error}</div>
        ) : chartData.length === 0 ? (
          <div style={{ height: 330, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t3)' }}>No Google Trends keyword data for this range.</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 50, left: 20, bottom: 0 }} barCategoryGap={10}>
              <defs>
                {chartData.map(item => (
                  <linearGradient key={item.key} id={`trend-${item.key}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={item.color} stopOpacity={0.62} />
                    <stop offset="100%" stopColor={item.color} stopOpacity={1} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 7" stroke="rgba(186,204,218,0.55)" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tick={{ fontSize: 10, fill: '#7b8d9b', fontFamily: 'var(--mono)' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                width={104}
                tick={{ fontSize: 12, fill: '#33485a', fontWeight: 800 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Search interest" shape={<TrendBar />} barSize={22}>
                {chartData.map(item => (
                  <Cell key={item.key} fill={`url(#trend-${item.key})`} />
                ))}
                <LabelList dataKey="value" content={<ValueLabel />} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {chartData.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
          {chartData.slice(0, 4).map((item, index) => (
            <div key={item.key} style={{
              border: `1px solid ${item.color}24`,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${item.color}14, rgba(255,255,255,0.98) 58%, ${item.color}08)`,
              padding: '11px 13px',
              boxShadow: `0 12px 28px ${item.color}10`,
            }}>
              <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.12em', color: item.color, textTransform: 'uppercase' }}>
                rank {index + 1}
              </div>
              <div style={{ marginTop: 5, fontSize: 14, fontWeight: 900, color: '#102033' }}>{item.label}</div>
              <div style={{ marginTop: 3, fontSize: 11, color: '#6c8191', fontFamily: 'var(--mono)' }}>
                avg {item.avg} · max {item.max ?? '-'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
