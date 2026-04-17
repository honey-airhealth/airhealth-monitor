import React from 'react'
import { LineChart } from 'lucide-react'
import DashboardHero from './DashboardHero.jsx'
import CorrelationMatrix from './visualization/CorrelationMatrix.jsx'
import CorrelationScatter from './visualization/CorrelationScatter.jsx'
import HourlyHeatmap from './visualization/HourlyHeatmap.jsx'
import MultiPollutantRadar from './visualization/MultiPollutantRadar.jsx'
import TimeSeriesPollution from './visualization/TimeSeriesPollution.jsx'
import SensorValidation from './visualization/SensorValidation.jsx'
import AirQualityHistory from './visualization/AirQualityHistory.jsx'
import SensorDataDescriptive from './visualization/SensorDataDescriptive.jsx'
import GoogleTrendsKeywords from './visualization/GoogleTrendsKeywords.jsx'
import WindSpeed from './visualization/WindSpeed.jsx'
import { RiskSnapshotProvider } from './api_dashboard/RiskSnapshotContext.jsx'

const pageStyle = {
  minHeight: '100vh',
  background:
    'radial-gradient(circle at top, rgba(125, 211, 252, 0.18), transparent 28%), linear-gradient(180deg, #f4f9fc 0%, #edf4f7 45%, #f7fbfd 100%)',
  color: 'var(--t1)',
  '--bg': '#f7fbfd',
  '--bg2': '#ffffff',
  '--bg3': '#e7eff3',
  '--card': '#ffffff',
  '--border': '#d5e0e7',
  '--t1': '#13222c',
  '--t2': '#48616f',
  '--t3': '#738896',
  '--mono': '"IBM Plex Mono", "SFMono-Regular", Consolas, monospace',
}

const analyticCards = [
  {
    id: 'time-series',
    shortLabel: 'V1',
    title: 'Time-series chart',
    description: 'PM2.5 or CO compared with Google Trends sickness keywords over weekly periods.',
    component: TimeSeriesPollution,
  },
  {
    id: 'correlation-scatter',
    shortLabel: 'V2',
    title: 'Correlation scatter plot',
    description: 'Paired pollutant and Google Trends points with Pearson r and p-value.',
    component: CorrelationScatter,
  },
  {
    id: 'hourly-heatmap',
    shortLabel: 'V3',
    title: 'Hourly heatmap',
    description: 'PM2.5 intensity by hour of day and day of week to reveal temporal patterns.',
    component: HourlyHeatmap,
  },
  {
    id: 'multi-pollutant-radar',
    shortLabel: 'V4',
    title: 'Multi-pollutant radar',
    description: 'PM2.5, CO, temperature, humidity and wind — today vs 7-day average on a radar shape.',
    component: MultiPollutantRadar,
  },
  {
    id: 'correlation-matrix',
    shortLabel: 'V5',
    title: 'Correlation matrix',
    description: 'Pearson r between every pollutant and health keyword pair — spot which variables truly matter.',
    component: CorrelationMatrix,
  },
  {
    id: 'sensor-validation',
    shortLabel: 'V6',
    title: 'Sensor validation',
    description: 'Compare PMS7003 readings against the nearest official PM2.5 station — RMSE shows how accurate your sensor is.',
    component: SensorValidation,
  },
]

const statisticCards = [
  {
    id: 'sensor-data-descriptive',
    // Statistic 1 shows descriptive statistics for all sensor data in the selected range.
    shortLabel: 'Static 1',
    title: 'Sensor data descriptive',
    description: 'Average, SD, Max and Min for PM2.5, temperature, humidity and MQ9 raw.',
    component: SensorDataDescriptive,
  },
  {
    id: 'air-quality-history',
    // Statistic 2 shows air-quality history as a line chart.
    shortLabel: 'Static 2',
    title: 'Air quality history',
    description: 'Line chart showing longer-range PM2.5, temperature, humidity and MQ9 raw — switch between hourly and daily resolution.',
    component: AirQualityHistory,
  },
  {
    id: 'google-trends-keywords',
    // Statistic 3 shows Google Trends keyword search terms as a range-selectable bar chart.
    shortLabel: 'Static 3',
    title: 'Google Trends keywords',
    description: 'Bar chart showing average Google Trends search term frequency over 3 days, 1 week or 2 weeks.',
    component: GoogleTrendsKeywords,
  },
  {
    id: 'wind-speed',
    // Statistic 4 shows wind speed statistics from Open-Meteo secondary data.
    shortLabel: 'Static 4',
    title: 'Wind speed',
    description: 'Wind speed at 10 m from Open-Meteo — average, max, min and hourly/daily time series.',
    component: WindSpeed,
  },
]

function VisualizationSelector({ cards, activeId, onSelect }) {
  return (
    <div className="visualization-selector">
      {cards.map((card) => {
        const active = card.id === activeId
        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelect(card.id)}
            className={`visualization-selector__item${active ? ' is-active' : ''}`}
          >
            <span className="visualization-selector__kicker">{card.shortLabel}</span>
            <span className="visualization-selector__label">{card.title}</span>
            <span className="visualization-selector__desc">{card.description}</span>
          </button>
        )
      })}
    </div>
  )
}

const pageCopy = {
  analytic: {
    current: 'analytic',
    title: 'analytic',
    subtitle: 'Charts for comparing air quality readings with health-search signals.',
    badge: 'Analytic metrics',
    path: '/visualization',
    panelLabel: 'analytic panel',
    cards: analyticCards,
  },
  statistic: {
    current: 'statistic',
    title: 'statistic',
    subtitle: 'Static air-quality history line chart for longer-range sensor review.',
    badge: 'Statistic metrics',
    path: '/statistic',
    panelLabel: 'statistic panel',
    cards: statisticCards,
  },
}

export default function VisualizationPage({ variant = 'analytic' }) {
  const copy = pageCopy[variant] || pageCopy.analytic
  const cards = copy.cards
  const getInitialActiveId = React.useCallback(() => {
    if (typeof window === 'undefined') return cards[0].id
    const view = new URLSearchParams(window.location.search).get('view')
    return cards.some((card) => card.id === view) ? view : cards[0].id
  }, [cards])

  const [activeId, setActiveId] = React.useState(getInitialActiveId)

  React.useEffect(() => {
    setActiveId(getInitialActiveId())
  }, [getInitialActiveId])

  const handleSelectCard = React.useCallback((id) => {
    setActiveId(id)
    if (typeof window === 'undefined') return

    const url = new URL(window.location.href)
    if (id === cards[0].id) {
      url.searchParams.delete('view')
    } else {
      url.searchParams.set('view', id)
    }
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
  }, [cards])

  const activeCard = cards.find((card) => card.id === activeId) || cards[0]
  const ActiveComponent = activeCard.component

  return (
    <main style={pageStyle}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .visualization-page .refresh-btn {
          border: 0.5px solid var(--border);
          background: var(--bg2);
          color: var(--t1);
          border-radius: 6px;
          padding: 3px 10px;
          cursor: pointer;
          font-size: 11px;
        }

        .visualization-page select,
        .visualization-page button {
          font-family: inherit;
        }

        .visualization-shell {
          display: grid;
          grid-template-columns: minmax(320px, 360px) minmax(0, 1fr);
          gap: 18px;
          align-items: start;
        }

        .visualization-selector {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          position: sticky;
          top: 20px;
          max-height: calc(100vh - 40px);
        }

        .visualization-selector__item {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
          border-radius: 16px;
          border: 1px solid rgba(211, 219, 228, 0.92);
          background: linear-gradient(180deg, rgba(241,245,249,0.95), rgba(233,239,244,0.92));
          color: #476173;
          padding: 12px 14px;
          text-align: left;
          cursor: pointer;
          transition: border-color 160ms ease, background 160ms ease, box-shadow 160ms ease, transform 160ms ease, color 160ms ease;
        }

        .visualization-selector__item:hover {
          transform: translateY(-1px);
          border-color: rgba(174, 190, 206, 1);
          color: #243746;
        }

        .visualization-selector__item.is-active {
          background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,251,253,0.97));
          border-color: rgba(145, 169, 191, 0.96);
          color: #122433;
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
        }

        .visualization-selector__kicker {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #3a6ea5;
        }

        .visualization-selector__label {
          font-size: 13px;
          line-height: 1.28;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .visualization-selector__desc {
          font-size: 10px;
          line-height: 1.4;
          font-weight: 400;
          color: #8fa8bc;
          margin-top: 1px;
        }

        .visualization-selector__item.is-active .visualization-selector__desc {
          color: #6b8da6;
        }

        .visualization-panel {
          border-radius: 26px;
          border: 1px solid rgba(213, 224, 231, 0.96);
          background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,251,253,0.96));
          box-shadow: 0 26px 60px rgba(15, 23, 42, 0.08);
          overflow: hidden;
        }

        .visualization-panel__hero {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          padding: 24px 24px 18px;
          border-bottom: 1px solid rgba(229, 235, 241, 0.9);
          background:
            radial-gradient(circle at top right, rgba(191, 219, 254, 0.28), transparent 24%),
            linear-gradient(180deg, rgba(251,253,255,0.96), rgba(246,250,252,0.94));
        }

        .visualization-panel__eyebrow {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #7390a7;
        }

        .visualization-panel__title {
          margin-top: 10px;
          font-size: clamp(1.8rem, 3vw, 2.7rem);
          line-height: 0.98;
          font-weight: 800;
          letter-spacing: -0.05em;
          color: #0f1f2e;
          max-width: none;
          white-space: nowrap;
        }

        .visualization-panel__description {
          margin-top: 12px;
          max-width: 60ch;
          font-size: 14px;
          line-height: 1.7;
          color: #597082;
        }

        .visualization-panel__status {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          border: 1px solid rgba(193, 212, 229, 0.9);
          background: rgba(255,255,255,0.88);
          padding: 10px 14px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #547089;
          white-space: nowrap;
        }

        .visualization-panel__body {
          padding: 22px 24px 24px;
        }

        @media (max-width: 1100px) {
          .visualization-shell {
            grid-template-columns: 1fr;
          }

          .visualization-selector {
            position: static;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          .visualization-selector {
            grid-template-columns: 1fr;
          }

          .visualization-panel__hero {
            flex-direction: column;
          }
        }
      `}</style>

      <div className="visualization-page" style={{ maxWidth: 1320, margin: '0 auto', padding: '18px 20px 48px' }}>
        <RiskSnapshotProvider>
          <div style={{ marginBottom: 16 }}>
            <DashboardHero
              current={copy.current}
              icon={LineChart}
              title={copy.title}
              subtitle={copy.subtitle}
              badge={copy.badge}
              path={copy.path}
            />
          </div>

          <div className="visualization-shell">
            <VisualizationSelector cards={cards} activeId={activeId} onSelect={handleSelectCard} />

            <section className="visualization-panel">
              <div className="visualization-panel__hero">
                <div>
                  <div className="visualization-panel__eyebrow">{activeCard.shortLabel} · {copy.panelLabel}</div>
                  <div className="visualization-panel__title">{activeCard.title}</div>
                  <div className="visualization-panel__description">{activeCard.description}</div>
                </div>
                <div className="visualization-panel__status">Selected view</div>
              </div>

              <div className="visualization-panel__body">
                <ActiveComponent />
              </div>
            </section>
          </div>
        </RiskSnapshotProvider>
      </div>
    </main>
  )
}
