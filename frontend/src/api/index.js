import axios from 'axios'

const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api/v1/integration'

const api = axios.create({ baseURL: BASE, timeout: 10000 })
const MAX_CONCURRENT_REQUESTS = 4

let activeRequests = 0
const pendingQueue = []

function runNextRequest() {
  if (activeRequests >= MAX_CONCURRENT_REQUESTS || pendingQueue.length === 0) return

  activeRequests += 1
  const resume = pendingQueue.shift()
  resume()
}

api.interceptors.request.use((config) => new Promise((resolve) => {
  pendingQueue.push(() => resolve(config))
  runNextRequest()
}))

api.interceptors.response.use(
  (response) => {
    activeRequests = Math.max(0, activeRequests - 1)
    runNextRequest()
    return response
  },
  (error) => {
    activeRequests = Math.max(0, activeRequests - 1)
    runNextRequest()
    return Promise.reject(error)
  }
)

export const getHealthRisk      = (timestamp)     => api.get('/health-risk', { params: timestamp ? { timestamp } : {} })
export const getCorrelation     = (days = 7)      => api.get('/correlation', { params: { days } })
export const getDiscomfort      = ()              => api.get('/discomfort')
export const getWorstHours      = (days = 7)      => api.get('/worst-hours', { params: { days } })
export const getMainContributor = (timestamp)     => api.get('/main-contributor', { params: timestamp ? { timestamp } : {} })
export const getHistory         = (hours = 168, interval = 'hourly') => api.get('/history', { params: { hours, interval } })
export const getCompareOfficial = ()              => api.get('/compare-official')
export const getTrend           = (hours = 24)    => api.get('/trend', { params: { hours } })
export const getSafety          = (timestamp)     => api.get('/safety', { params: timestamp ? { timestamp } : {} })
export const getVisualizationTimeSeries = (days = 84, interval = 'daily') => api.get('/visualization/time-series', { params: { days, interval } })
export const getCorrelationScatter = (days = 14, pollutant = 'pm25', keyword = 'illness_index', interval = 'daily') => api.get('/visualization/correlation-scatter', { params: { days, pollutant, keyword, interval } })
