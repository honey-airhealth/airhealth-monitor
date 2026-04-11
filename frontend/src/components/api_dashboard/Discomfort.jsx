import { useApi } from '../../hooks/useApi'
import { getDiscomfort } from '../../api'
import { MetricCard, ContribBar, Loader, ErrorBox, SectionTitle } from './ui'

export default function Discomfort() {
  const { data, loading, error, refetch } = useApi(getDiscomfort)

  const level = data
    ? data.discomfort_index <= 25 ? 'comfortable'
    : data.discomfort_index <= 50 ? 'mild'
    : data.discomfort_index <= 75 ? 'uncomfortable'
    : 'severe'
    : null

  const levelColor = { comfortable: '#0F6E56', mild: '#854F0B', uncomfortable: '#993C1D', severe: '#A32D2D' }

  return (
    <div>
      <SectionTitle action={<button className="refresh-btn" onClick={refetch}>↺</button>}>
        Q3 · Discomfort index
      </SectionTitle>
      {loading && <Loader />}
      {error   && <ErrorBox msg={error} onRetry={refetch} />}
      {data    && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
            <MetricCard label="discomfort index" value={data.discomfort_index} color={levelColor[level]} />
            <MetricCard label="level" value={level} color={levelColor[level]} />
          </div>
          <div style={{ background: 'var(--bg2)', borderRadius: 8, padding: '12px 14px', marginBottom: 10 }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--t2)', marginBottom: 10 }}>breakdown</div>
            <ContribBar label="Heat"     value={data.heat_component}     max={50} color="#EF9F27" />
            <ContribBar label="PM2.5"    value={data.pm25_component}     max={35} color="#378ADD" />
            <ContribBar label="Humidity" value={data.humidity_component} max={15} color="#1D9E75" />
          </div>
          {data.description && (
            <p style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.6 }}>{data.description}</p>
          )}
        </>
      )}
    </div>
  )
}
