import React from 'react';
import HealthRisk from './api_dashboard/HealthRisk';
import WorstHours from './api_dashboard/WorstHours';
import { RiskSnapshotProvider } from './api_dashboard/RiskSnapshotContext';
import { Lightbulb } from 'lucide-react';
import DashboardHero from './DashboardHero.jsx';

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
};

const dashboardCards = [
  { id: 'health-risk', shortLabel: 'S1', title: 'Current health risk', description: 'Latest score, level, and primary contributor from the current snapshot.', component: HealthRisk },
  { id: 'worst-hours', shortLabel: 'S2', title: 'Worst hours of day', description: 'Hours when air conditions are typically the most difficult.', component: WorstHours },
];

function DashboardSelector({ cards, activeId, onSelect }) {
  return (
    <div className="api-dashboard-selector">
      {cards.map((card) => {
        const active = card.id === activeId;
        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelect(card.id)}
            className={`api-dashboard-selector__item${active ? ' is-active' : ''}`}
          >
            <span className="api-dashboard-selector__kicker">{card.shortLabel}</span>
            <span className="api-dashboard-selector__label">{card.title}</span>
            <span className="api-dashboard-selector__desc">{card.description}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function ApiDashboardPage() {
  const [activeId, setActiveId] = React.useState(dashboardCards[0].id);
  const activeCard = dashboardCards.find((card) => card.id === activeId) || dashboardCards[0];
  const ActiveComponent = activeCard.component;

  return (
    <main style={pageStyle}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .api-dashboard-page .refresh-btn {
          border: 0.5px solid var(--border);
          background: var(--bg2);
          color: var(--t1);
          border-radius: 6px;
          padding: 3px 10px;
          cursor: pointer;
          font-size: 11px;
        }

        .api-dashboard-page select,
        .api-dashboard-page button {
          font-family: inherit;
        }

        .api-dashboard-shell {
          display: grid;
          grid-template-columns: minmax(320px, 360px) minmax(0, 1fr);
          gap: 18px;
          align-items: start;
        }

        .api-dashboard-selector {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          position: sticky;
          top: 20px;
          max-height: calc(100vh - 40px);
        }

        .api-dashboard-selector__item {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
          min-height: 0;
          border-radius: 16px;
          border: 1px solid rgba(211, 219, 228, 0.92);
          background: linear-gradient(180deg, rgba(241,245,249,0.95), rgba(233,239,244,0.92));
          color: #476173;
          padding: 12px 14px;
          text-align: left;
          cursor: pointer;
          transition: border-color 160ms ease, background 160ms ease, box-shadow 160ms ease, transform 160ms ease, color 160ms ease;
        }

        .api-dashboard-selector__item:hover {
          transform: translateY(-1px);
          border-color: rgba(174, 190, 206, 1);
          color: #243746;
        }

        .api-dashboard-selector__item.is-active {
          background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,251,253,0.97));
          border-color: rgba(145, 169, 191, 0.96);
          color: #122433;
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
        }

        .api-dashboard-selector__kicker {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #8297a9;
        }

        .api-dashboard-selector__item.is-active .api-dashboard-selector__kicker {
          color: #3a6ea5;
        }

        .api-dashboard-selector__label {
          font-size: 13px;
          line-height: 1.28;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .api-dashboard-selector__desc {
          font-size: 10px;
          line-height: 1.4;
          font-weight: 400;
          color: #8fa8bc;
          margin-top: 1px;
        }

        .api-dashboard-selector__item.is-active .api-dashboard-selector__desc {
          color: #6b8da6;
        }

        .api-dashboard-panel {
          border-radius: 26px;
          border: 1px solid rgba(213, 224, 231, 0.96);
          background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,251,253,0.96));
          box-shadow: 0 26px 60px rgba(15, 23, 42, 0.08);
          overflow: hidden;
        }

        .api-dashboard-panel__hero {
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

        .api-dashboard-panel__eyebrow {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #7390a7;
        }

        .api-dashboard-panel__title {
          margin-top: 10px;
          font-size: clamp(1.8rem, 3vw, 2.7rem);
          line-height: 0.98;
          font-weight: 800;
          letter-spacing: -0.05em;
          color: #0f1f2e;
          max-width: 14ch;
        }

        .api-dashboard-panel__description {
          margin-top: 12px;
          max-width: 60ch;
          font-size: 14px;
          line-height: 1.7;
          color: #597082;
        }

        .api-dashboard-panel__status {
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

        .api-dashboard-panel__body {
          padding: 22px 24px 24px;
        }

        @media (max-width: 1100px) {
          .api-dashboard-shell {
            grid-template-columns: 1fr;
          }

          .api-dashboard-selector {
            position: static;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          .api-dashboard-selector {
            grid-template-columns: 1fr;
          }

          .api-dashboard-panel__hero {
            flex-direction: column;
          }
        }
      `}</style>

      <div className="api-dashboard-page" style={{ maxWidth: 1320, margin: '0 auto', padding: '18px 20px 48px' }}>
        <RiskSnapshotProvider>
          <div style={{ marginBottom: 16 }}>
            <DashboardHero
              current="suggestion"
              icon={Lightbulb}
              title="suggestion"
              subtitle="Health and air-quality suggestions from the integration service."
              badge="Suggestion metrics"
              path="/suggestion"
            />
          </div>

          <div className="api-dashboard-shell">
            <DashboardSelector cards={dashboardCards} activeId={activeId} onSelect={setActiveId} />

            <section className="api-dashboard-panel">
              <div className="api-dashboard-panel__hero">
                <div>
                  <div className="api-dashboard-panel__eyebrow">{activeCard.shortLabel} · Analysis panel</div>
                  <div className="api-dashboard-panel__title">{activeCard.title}</div>
                  <div className="api-dashboard-panel__description">{activeCard.description}</div>
                </div>
                <div className="api-dashboard-panel__status">Selected view</div>
              </div>

              <div className="api-dashboard-panel__body">
                <ActiveComponent />
              </div>
            </section>
          </div>
        </RiskSnapshotProvider>
      </div>
    </main>
  );
}
