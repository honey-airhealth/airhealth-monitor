import React from 'react';
import HealthRisk from './api_dashboard/HealthRisk';
import Correlation from './api_dashboard/Correlation';
import Discomfort from './api_dashboard/Discomfort';
import WorstHours from './api_dashboard/WorstHours';
import MainContributor from './api_dashboard/MainContributor';
import History from './api_dashboard/History';
import { CompareOfficial, Trend, Safety } from './api_dashboard/StatusPanels';
import { RiskSnapshotProvider } from './api_dashboard/RiskSnapshotContext';

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

const cardStyle = {
  background: 'rgba(255, 255, 255, 0.88)',
  border: '1px solid rgba(213, 224, 231, 0.95)',
  borderRadius: 24,
  padding: 20,
  boxShadow: '0 24px 60px rgba(15, 23, 42, 0.08)',
  backdropFilter: 'blur(12px)',
};

const dashboardCards = [
  { id: 'health-risk', title: 'Q1 · Current health risk', component: HealthRisk },
  { id: 'correlation', title: 'Q2 · PM2.5 vs illness trends', component: Correlation },
  { id: 'discomfort', title: 'Q3 · Discomfort index', component: Discomfort },
  { id: 'worst-hours', title: 'Q4 · Worst hours of day', component: WorstHours },
  { id: 'main-contributor', title: 'Q5 · Main risk contributor', component: MainContributor },
  { id: 'history', title: 'Q6 · Air quality history', component: History, fullWidth: true },
  { id: 'compare-official', title: 'Q7 · Local vs official PM2.5', component: CompareOfficial },
  { id: 'trend', title: 'Q8 · Trend direction', component: Trend },
  { id: 'safety', title: 'Q9 · Safety for daily activity', component: Safety },
];

function TopBar() {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--t2)', marginBottom: 8 }}>
          AirHealth frontend API
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)', lineHeight: 1, fontWeight: 700, margin: 0, color: 'var(--t1)' }}>
          API Dashboard
        </h1>
        <p style={{ margin: '12px 0 0', maxWidth: 700, fontSize: 14, lineHeight: 1.7, color: 'var(--t2)' }}>
          Explore live health and air-quality insights through a unified dashboard powered by your integration API.
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          window.location.href = '/';
        }}
        style={{
          border: '1px solid var(--border)',
          background: 'rgba(255, 255, 255, 0.9)',
          color: 'var(--t1)',
          padding: '10px 16px',
          borderRadius: 999,
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        Back to landing
      </button>
    </div>
  );
}

function OptionalCard({ title, component: Component, fullWidth = false }) {
  const [open, setOpen] = React.useState(false);

  return (
    <section
      style={{
        ...cardStyle,
        gridColumn: fullWidth ? '1 / -1' : 'auto',
        padding: open ? 20 : 18,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--t1)', letterSpacing: '0.04em' }}>{title}</div>
          {!open && (
            <div style={{ marginTop: 6, fontSize: 12, color: 'var(--t2)' }}>
              Hidden by default to keep initial loading lighter.
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          style={{
            border: '1px solid var(--border)',
            background: 'var(--bg2)',
            color: 'var(--t1)',
            borderRadius: 999,
            padding: '8px 14px',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
            minWidth: 74,
          }}
        >
          {open ? 'Hide' : 'View'}
        </button>
      </div>

      {open && <div style={{ marginTop: 18 }}><Component /></div>}
    </section>
  );
}

export default function ApiDashboardPage() {
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
      `}</style>

      <div className="api-dashboard-page" style={{ maxWidth: 1320, margin: '0 auto', padding: '40px 20px 56px' }}>
        <RiskSnapshotProvider>
          <TopBar />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
            {dashboardCards.map((card) => (
              <OptionalCard key={card.id} {...card} />
            ))}
          </div>
        </RiskSnapshotProvider>
      </div>
    </main>
  );
}
