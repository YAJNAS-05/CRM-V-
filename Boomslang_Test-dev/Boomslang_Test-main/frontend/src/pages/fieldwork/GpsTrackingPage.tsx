import { useState, useEffect } from 'react'
import { fieldworkApi } from '../../api/fieldworkApi'
import { formatDateTime } from '../../utils/formatters'
import { MapPin, Navigation, Clock, Battery, Activity, Users } from 'lucide-react'

interface EngineerLocation {
  engineerId: string
  engineerName: string
  latitude: number
  longitude: number
  timestamp: string
  speed: number
  heading: number
  isOnJob: boolean
  currentJobId: string | null
  lastUpdateMinutes: number
}

interface RoutePoint {
  id: string
  latitude: number
  longitude: number
  timestamp: string
  pointType: 'CHECK_IN' | 'CHECK_OUT' | 'EN_ROUTE' | 'JOB_SITE' | 'PAUSE'
  address?: string
}

export default function GpsTrackingPage() {
  const [activeEngineers, setActiveEngineers] = useState<EngineerLocation[]>([])
  const [selectedEngineer, setSelectedEngineer] = useState<string | null>(null)
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActiveEngineers()
    const interval = setInterval(loadActiveEngineers, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (selectedEngineer) {
      loadEngineerRoute(selectedEngineer)
    }
  }, [selectedEngineer])

  const loadActiveEngineers = async () => {
    try {
      const response = await fieldworkApi.getActiveEngineerLocations()
      setActiveEngineers(response.data.data || [])
    } catch (error) {
      console.error('Failed to load engineer locations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadEngineerRoute = async (engineerId: string) => {
    try {
      const endDate = new Date().toISOString()
      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const response = await fieldworkApi.getEngineerRoute(engineerId, startDate, endDate)
      setRoutePoints(response.data.data || [])
    } catch (error) {
      console.error('Failed to load route:', error)
    }
  }

  const getPointTypeIcon = (type: string) => {
    switch (type) {
      case 'CHECK_IN':
        return <span className="text-green-500">●</span>
      case 'CHECK_OUT':
        return <span className="text-red-500">●</span>
      case 'JOB_SITE':
        return <span className="text-blue-500">●</span>
      case 'PAUSE':
        return <span className="text-yellow-500">●</span>
      default:
        return <span className="text-gray-400">●</span>
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Live GPS Tracking</h1>
            <p className="text-sm text-gray-500">Real-time field engineer locations and routes</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{activeEngineers.length} Active</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm text-green-600">Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Engineer List Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Active Engineers</h2>
          </div>
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : activeEngineers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No active engineers</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {activeEngineers.map((engineer) => (
                <button
                  key={engineer.engineerId}
                  onClick={() => setSelectedEngineer(engineer.engineerId)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    selectedEngineer === engineer.engineerId ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{engineer.engineerName}</h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>Updated {engineer.lastUpdateMinutes}m ago</span>
                      </div>
                    </div>
                    <div className={`px-2 py-1 text-xs rounded-full ${engineer.isOnJob ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {engineer.isOnJob ? 'On Job' : 'Available'}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Navigation className="w-3 h-3" />
                      {engineer.speed?.toFixed(1) || 0} km/h
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      {engineer.heading?.toFixed(0) || 0}°
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map Area (Placeholder for actual map integration) */}
        <div className="flex-1 bg-gray-100 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Interactive Map Integration</p>
              <p className="text-sm text-gray-400 mt-2">
                Google Maps / Mapbox integration would render here
              </p>
              <div className="mt-4 text-left text-sm text-gray-600 max-w-md mx-auto">
                <p className="font-medium">Engineer Positions:</p>
                {activeEngineers.map((eng) => (
                  <div key={eng.engineerId} className="mt-2 p-2 bg-white rounded border">
                    <p className="font-medium">{eng.engineerName}</p>
                    <p className="text-xs">Lat: {eng.latitude}, Lng: {eng.longitude}</p>
                    <p className="text-xs">Status: {eng.isOnJob ? 'Working' : 'Traveling'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Route Timeline Overlay */}
          {selectedEngineer && routePoints.length > 0 && (
            <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-lg p-4 max-h-64 overflow-y-auto">
              <h3 className="font-semibold text-gray-900 mb-3">
                Route History - {activeEngineers.find(e => e.engineerId === selectedEngineer)?.engineerName}
              </h3>
              <div className="space-y-2">
                {routePoints.slice(0, 20).map((point, idx) => (
                  <div key={point.id} className="flex items-center gap-3 text-sm">
                    <span className="text-gray-400 w-6">{idx + 1}</span>
                    {getPointTypeIcon(point.pointType)}
                    <span className="text-gray-600">{point.pointType}</span>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-500">{formatDateTime(point.timestamp)}</span>
                    {point.address && (
                      <>
                        <span className="text-gray-400">|</span>
                        <span className="text-gray-600 truncate max-w-xs">{point.address}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
