import { useState } from 'react'

export function getRiskColor(level) {
  const l = String(level || '').toLowerCase()
  if (l.includes('safe') || l.includes('good'))      return '#0F6E56'
  if (l.includes('unhealthy') || l.includes('danger')) return '#A32D2D'
  return '#854F0B'
}

export function getRiskBg(level) {
  const l = String(level || '').toLowerCase()
  if (l.includes('safe') || l.includes('good'))        return '#E1F5EE'
  if (l.includes('unhealthy') || l.includes('danger')) return '#FCEBEB'
  return '#FAEEDA'
}

export function StatusBadge({ level }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 500, padding: '3px 10px',
      borderRadius: 999, background: getRiskBg(level), color: getRiskColor(level),
    }}>
      {String(level || '').toLowerCase()}
    </span>
  )
}

export function InfoTip({ content }) {
  const [open, setOpen] = useState(false)

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', marginLeft: 6 }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label="More information"
        style={{
          width: 16,
          height: 16,
          borderRadius: 999,
          border: '0.5px solid var(--border)',
          background: 'var(--bg2)',
          color: 'var(--t2)',
          fontSize: 10,
          lineHeight: 1,
          padding: 0,
          cursor: 'help',
        }}
      >
        i
      </button>
      {open && (
        <span
          style={{
            position: 'absolute',
            left: 0,
            top: 'calc(100% + 8px)',
            width: 220,
            padding: '8px 10px',
            borderRadius: 8,
            background: 'var(--t1)',
            color: 'white',
            fontSize: 10,
            lineHeight: 1.5,
            letterSpacing: 'normal',
            textTransform: 'none',
            zIndex: 20,
            boxShadow: '0 12px 28px rgba(15, 23, 42, 0.18)',
          }}
        >
          {content}
        </span>
      )}
    </span>
  )
}

export function MetricCard({ label, value, unit, color, sub }) {
  return (
    <div style={{
      background: 'var(--bg2)', borderRadius: 8, padding: '12px 14px', minWidth: 0,
    }}>
      <div style={{ fontSize: 10, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 500, fontFamily: 'var(--mono)', color: color || 'var(--t1)', lineHeight: 1.1 }}>
        {value ?? '–'}{unit && <span style={{ fontSize: 12, marginLeft: 3, color: 'var(--t2)' }}>{unit}</span>}
      </div>
      {sub && <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

export function Loader() {
  return (
    <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--t3)', fontSize: 13 }}>
      <div style={{ width: 20, height: 20, border: '2px solid var(--border)', borderTopColor: 'var(--t2)', borderRadius: '50%', margin: '0 auto 10px', animation: 'spin 0.8s linear infinite' }} />
      loading…
    </div>
  )
}

export function ErrorBox({ msg, onRetry }) {
  return (
    <div style={{ background: '#FCEBEB', color: '#A32D2D', borderRadius: 8, padding: '12px 16px', fontSize: 13 }}>
      {msg}
      {onRetry && <button onClick={onRetry} style={{ marginLeft: 12, fontSize: 11, background: 'transparent', border: '0.5px solid #A32D2D', color: '#A32D2D', borderRadius: 6, padding: '2px 10px', cursor: 'pointer' }}>retry</button>}
    </div>
  )
}

export function SectionTitle({ children, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <h2 style={{ fontSize: 13, fontWeight: 500, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{children}</h2>
      {action}
    </div>
  )
}

export function ContribBar({ label, value, max = 40, color = '#378ADD' }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--t2)', marginBottom: 3 }}>
        <span>{label}</span><span style={{ fontFamily: 'var(--mono)', color: 'var(--t1)' }}>{value}</span>
      </div>
      <div style={{ height: 5, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  )
}

export function formatUpdatedAt(timestamp) {
  if (!timestamp) return ''

  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}
