import React from 'react'
import { LineChart } from 'lucide-react'
import DashboardHero from './DashboardHero.jsx'
import CorrelationScatter from './visualization/CorrelationScatter.jsx'
import TimeSeriesPollution from './visualization/TimeSeriesPollution.jsx'
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

const visualizationCards = [
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
          </button>
        )
      })}
    </div>
  )
}

export default function VisualizationPage() {
  const [activeId, setActiveId] = React.useState(visualizationCards[0].id)
  const activeCard = visualizationCards.find((card) => card.id === activeId) || visualizationCards[0]
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
              current="visualization"
              icon={LineChart}
              title="Visualization"
              subtitle="Charts for comparing air quality readings with health-search signals."
              badge="Visual metrics"
              path="/visualization"
            />
          </div>

          <div className="visualization-shell">
            <VisualizationSelector cards={visualizationCards} activeId={activeId} onSelect={setActiveId} />

            <section className="visualization-panel">
              <div className="visualization-panel__hero">
                <div>
                  <div className="visualization-panel__eyebrow">{activeCard.shortLabel} · Visualization panel</div>
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
