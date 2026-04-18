import React from 'react'
import { TrendingUp } from 'lucide-react'
import DashboardHero from './DashboardHero.jsx'
import ForecastExplorer from './forecast/ForecastExplorer.jsx'

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

export default function ForecastPage() {
  return (
    <main style={pageStyle}>
      <div className="mx-auto max-w-[1320px] px-4 py-4 sm:px-6 lg:px-6 lg:py-5">
        <div style={{ marginBottom: 16 }}>
          <DashboardHero
            current="forecast"
            icon={TrendingUp}
            title="forecast"
            subtitle="Short-horizon outlooks for PM2.5, temperature, and humidity."
            badge="Forecast metrics"
            path="/forecast"
          />
        </div>

        <ForecastExplorer />
      </div>
    </main>
  )
}
