import React from 'react'

const RiskSnapshotContext = React.createContext({
  snapshotTimestamp: null,
  setSnapshotTimestamp: () => {},
})

export function RiskSnapshotProvider({ children }) {
  const [snapshotTimestamp, setSnapshotTimestamp] = React.useState(null)

  return (
    <RiskSnapshotContext.Provider value={{ snapshotTimestamp, setSnapshotTimestamp }}>
      {children}
    </RiskSnapshotContext.Provider>
  )
}

export function useRiskSnapshot() {
  return React.useContext(RiskSnapshotContext)
}
