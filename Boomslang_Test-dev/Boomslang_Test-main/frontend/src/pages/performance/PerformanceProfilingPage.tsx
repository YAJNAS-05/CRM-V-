import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { 
  Search, 
  Code, 
  Clock, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Target,
  Play,
  Pause,
  Square,
  RefreshCw,
  Plus,
  Filter,
  Eye,
  Download,
  Settings,
  Calendar,
  Timer,
  Gauge,
  Cpu,
  Database,
  Globe,
  Server,
  HardDrive,
  MemoryStick,
  Network,
  FileText,
  Bug,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  BarChart3,
  LineChart,
  PieChart,
  ArrowUp,
  ArrowDown,
  Minus,
  Layers,
  Package,
  GitBranch,
  GitCommit,
  GitMerge,
  Terminal,
  Code2,
  Braces,
  Hash,
  FileCode,
  FolderTree,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Copy,
  Trash2,
  Edit
} from 'lucide-react';
import { toast } from 'sonner';
import { performanceApi } from '../../api/performanceApi';

interface ProfileSession {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'recording' | 'processing' | 'completed' | 'failed';
  startTime?: string;
  endTime?: string;
  duration?: number;
  application: string;
  environment: 'development' | 'staging' | 'production';
  type: 'cpu' | 'memory' | 'io' | 'network' | 'full';
  samples: ProfileSample[];
  summary: ProfileSummary;
  configuration: ProfileConfiguration;
}

interface ProfileSample {
  id: string;
  timestamp: string;
  stackTrace: StackFrame[];
  cpuUsage: number;
  memoryUsage: number;
  ioOperations: number;
  networkActivity: number;
  threadId: string;
  processId: string;
}

interface StackFrame {
  id: string;
  functionName: string;
  fileName: string;
  lineNumber: number;
  columnNumber: number;
  module: string;
  package: string;
  isUserCode: boolean;
}

interface ProfileSummary {
  totalSamples: number;
  cpuTime: number;
  memoryPeak: number;
  ioOperations: number;
  networkBytes: number;
  hotspots: ProfileHotspot[];
  callTree: CallTreeNode[];
  flameGraph: FlameGraphNode[];
}

interface ProfileHotspot {
  id: string;
  functionName: string;
  fileName: string;
  lineNumber: number;
  samples: number;
  percentage: number;
  cpuTime: number;
  memoryUsage: number;
  category: 'application' | 'system' | 'library' | 'framework';
}

interface CallTreeNode {
  id: string;
  functionName: string;
  fileName: string;
  samples: number;
  percentage: number;
  cpuTime: number;
  memoryUsage: number;
  children: CallTreeNode[];
  expanded: boolean;
}

interface FlameGraphNode {
  id: string;
  name: string;
  value: number;
  percentage: number;
  level: number;
  start: number;
  end: number;
  color: string;
  children: FlameGraphNode[];
}

interface ProfileConfiguration {
  samplingInterval: number;
  maxSamples: number;
  includeSystemCode: boolean;
  includeLibraryCode: boolean;
  trackMemory: boolean;
  trackIO: boolean;
  trackNetwork: boolean;
  filters: ProfileFilter[];
}

interface ProfileFilter {
  id: string;
  type: 'module' | 'function' | 'package' | 'file';
  pattern: string;
  action: 'include' | 'exclude';
  enabled: boolean;
}

interface ProfileComparison {
  id: string;
  name: string;
  description: string;
  baselineSession: string;
  comparisonSession: string;
  baselineName: string;
  comparisonName: string;
  createdAt: string;
  differences: ProfileDifference[];
  summary: ComparisonSummary;
}

interface ProfileDifference {
  type: 'performance' | 'memory' | 'hotspot' | 'call_tree';
  description: string;
  impact: 'low' | 'medium' | 'high';
  baseline: number;
  comparison: number;
  change: number;
  changePercentage: number;
}

interface ComparisonSummary {
  performanceChange: number;
  memoryChange: number;
  newHotspots: number;
  resolvedHotspots: number;
  overallImpact: 'improved' | 'degraded' | 'stable';
}

const PerformanceProfilingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('sessions');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [profileSessions, setProfileSessions] = useState<ProfileSession[]>([]);
  const [loading, setLoading] = useState(false);

  // Load profile sessions from API on component mount
  useEffect(() => {
    const loadProfileSessions = async () => {
      setLoading(true);
      try {
        const sessionsData = await performanceApi.getProfileSessions();
        if (sessionsData) {
          setProfileSessions(sessionsData);
        }
      } catch (error) {
        console.error('Failed to load profile sessions:', error);
        toast.error('Failed to load profile sessions');
      } finally {
        setLoading(false);
            cpuTime: 29400,
            memoryUsage: 64,
            category: 'application'
          }
        ],
        callTree: [],
        flameGraph: []
      },
      configuration: {
        samplingInterval: 10,
        maxSamples: 20000,
        includeSystemCode: false,
        includeLibraryCode: true,
        trackMemory: true,
        trackIO: true,
        trackNetwork: true,
        filters: [
          { id: 'filter-1', type: 'module', pattern: 'node_modules', action: 'exclude', enabled: true }
        ]
      }
    },
    {
      id: 'session-2',
      name: 'Memory Leak Investigation',
      description: 'Investigate memory usage patterns and potential leaks',
      status: 'recording',
      startTime: '2024-01-15 15:00:00',
      application: 'Web Frontend',
      environment: 'development',
      type: 'memory',
      samples: [],
      summary: {
        totalSamples: 0,
        cpuTime: 0,
        memoryPeak: 0,
        ioOperations: 0,
        networkBytes: 0,
        hotspots: [],
        callTree: [],
        flameGraph: []
      },
      configuration: {
        samplingInterval: 50,
        maxSamples: 50000,
        includeSystemCode: true,
        includeLibraryCode: true,
        trackMemory: true,
        trackIO: false,
        trackNetwork: false,
        filters: []
      }
    },
    {
      id: 'session-3',
      name: 'Database Performance Profile',
      description: 'Profile database operations and query performance',
      status: 'processing',
      startTime: '2024-01-15 13:45:00',
      endTime: '2024-01-15 13:50:00',
      duration: 300,
      application: 'Database Service',
      environment: 'production',
      type: 'io',
      samples: [],
      summary: {
        totalSamples: 8500,
        cpuTime: 125000,
        memoryPeak: 1024,
        ioOperations: 3400,
        networkBytes: 512000,
        hotspots: [
          {
            id: 'hotspot-4',
            functionName: 'executeQuery',
            fileName: 'query-executor.js',
            lineNumber: 234,
            samples: 2100,
            percentage: 24.7,
            cpuTime: 30875,
            memoryUsage: 512,
            category: 'application'
          }
        ],
        callTree: [],
        flameGraph: []
      },
      configuration: {
        samplingInterval: 25,
        maxSamples: 15000,
        includeSystemCode: false,
        includeLibraryCode: false,
        trackMemory: true,
        trackIO: true,
        trackNetwork: false,
        filters: []
      }
    }
  ];

  const profileComparisons: ProfileComparison[] = [
    {
      id: 'comp-1',
      name: 'Before vs After Optimization',
      description: 'Compare performance before and after code optimization',
      baselineSession: 'session-1',
      comparisonSession: 'session-3',
      baselineName: 'API Response Time Analysis',
      comparisonName: 'Database Performance Profile',
      createdAt: '2024-01-15 15:30:00',
      differences: [
        {
          type: 'performance',
          description: 'CPU time reduced by 49%',
          impact: 'high',
          baseline: 245000,
          comparison: 125000,
          change: -120000,
          changePercentage: -49.0
        },
        {
          type: 'memory',
          description: 'Memory usage increased by 100%',
          impact: 'medium',
          baseline: 512,
          comparison: 1024,
          change: 512,
          changePercentage: 100.0
        }
      ],
      summary: {
        performanceChange: -49.0,
        memoryChange: 100.0,
        newHotspots: 1,
        resolvedHotspots: 2,
        overallImpact: 'improved'
      }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'improved':
        return 'text-green-600 bg-green-50';
      case 'recording':
      case 'processing':
        return 'text-yellow-600 bg-yellow-50';
      case 'idle':
      case 'stable':
        return 'text-gray-600 bg-gray-50';
      case 'failed':
      case 'degraded':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'cpu':
        return 'text-blue-600 bg-blue-50';
      case 'memory':
        return 'text-purple-600 bg-purple-50';
      case 'io':
        return 'text-orange-600 bg-orange-50';
      case 'network':
        return 'text-green-600 bg-green-50';
      case 'full':
        return 'text-indigo-600 bg-indigo-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'application':
        return 'text-blue-600 bg-blue-50';
      case 'system':
        return 'text-orange-600 bg-orange-50';
      case 'library':
        return 'text-purple-600 bg-purple-50';
      case 'framework':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredSessions = profileSessions.filter(session => {
    const matchesSearch = session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.application.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || session.status === filterStatus;
    const matchesType = filterType === 'all' || session.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const selectedSessionData = profileSessions.find(s => s.id === selectedSession);

  const activeSessions = profileSessions.filter(s => s.status === 'recording').length;
  const completedSessions = profileSessions.filter(s => s.status === 'completed').length;
  const totalSamples = profileSessions.reduce((acc, s) => acc + s.summary.totalSamples, 0);
  const avgCpuTime = profileSessions.filter(s => s.summary.cpuTime > 0).reduce((acc, s) => acc + s.summary.cpuTime, 0) / profileSessions.filter(s => s.summary.cpuTime > 0).length;

  const toggleNodeExpansion = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Profiling</h1>
          <p className="text-muted-foreground">
            Advanced code profiling and performance analysis tools
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Profiles
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Profile Session
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{activeSessions}</div>
            <p className="text-xs text-muted-foreground">
              currently recording
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedSessions}</div>
            <p className="text-xs text-muted-foreground">
              profiles analyzed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Samples</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalSamples.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              samples collected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg CPU Time</CardTitle>
            <Cpu className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{Math.round(avgCpuTime).toLocaleString()}μs</div>
            <p className="text-xs text-muted-foreground">
              average CPU time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Recording Alert */}
      {activeSessions > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <Activity className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{activeSessions} profile session(s)</strong> are currently recording. 
            Monitor performance and stop recording when complete.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="sessions">Profile Sessions</TabsTrigger>
          <TabsTrigger value="hotspots">Hotspots Analysis</TabsTrigger>
          <TabsTrigger value="calltree">Call Tree</TabsTrigger>
          <TabsTrigger value="comparisons">Comparisons</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Profile Sessions</h3>
              <p className="text-sm text-muted-foreground">
                Manage and analyze performance profiling sessions
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search sessions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-md text-sm w-64"
                />
              </div>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="idle">Idle</option>
                <option value="recording">Recording</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Types</option>
                <option value="cpu">CPU</option>
                <option value="memory">Memory</option>
                <option value="io">I/O</option>
                <option value="network">Network</option>
                <option value="full">Full</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sessions List */}
            <div className="space-y-4">
              {filteredSessions.map((session) => (
                <Card 
                  key={session.id}
                  className={`cursor-pointer transition-colors ${
                    selectedSession === session.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedSession(session.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getStatusColor(session.status)}`}>
                          {session.status === 'recording' ? <Activity className="w-4 h-4" /> :
                           session.status === 'processing' ? <RefreshCw className="w-4 h-4" /> :
                           session.status === 'completed' ? <CheckCircle className="w-4 h-4" /> :
                           session.status === 'failed' ? <XCircle className="w-4 h-4" /> :
                           <Pause className="w-4 h-4" />}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{session.name}</CardTitle>
                          <CardDescription>{session.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeColor(session.type)}>
                          {session.type}
                        </Badge>
                        <Badge className={getStatusColor(session.status)}>
                          {session.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Application:</span>
                      <Badge variant="outline">{session.application}</Badge>
                      <span className="text-muted-foreground">Environment:</span>
                      <Badge variant="outline" className="capitalize">{session.environment}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <p className="font-medium">{session.duration ? `${session.duration}s` : 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Samples:</span>
                        <p className="font-medium">{session.summary.totalSamples.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">CPU Time:</span>
                        <p className="font-medium">{session.summary.cpuTime.toLocaleString()}μs</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Memory Peak:</span>
                        <p className="font-medium">{session.summary.memoryPeak}MB</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {session.status === 'recording' ? (
                        <Button size="sm" variant="outline">
                          <Square className="w-4 h-4 mr-2" />
                          Stop Recording
                        </Button>
                      ) : session.status === 'completed' ? (
                        <Button size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View Analysis
                        </Button>
                      ) : (
                        <Button size="sm" disabled>
                          <Play className="w-4 h-4 mr-2" />
                          {session.status === 'idle' ? 'Start' : 'Processing...'}
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Session Details */}
            <div>
              {selectedSessionData ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {selectedSessionData.name}
                      <Button variant="outline" size="sm" onClick={() => setSelectedSession(null)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                    </CardTitle>
                    <CardDescription>{selectedSessionData.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Session Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge className={getStatusColor(selectedSessionData.status)}>
                              {selectedSessionData.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <Badge className={getTypeColor(selectedSessionData.type)}>
                              {selectedSessionData.type}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Application:</span>
                            <span className="font-medium">{selectedSessionData.application}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Environment:</span>
                            <span className="font-medium capitalize">{selectedSessionData.environment}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Configuration</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Sampling Interval:</span>
                            <span className="font-medium">{selectedSessionData.configuration.samplingInterval}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Max Samples:</span>
                            <span className="font-medium">{selectedSessionData.configuration.maxSamples.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Track Memory:</span>
                            <span className="font-medium">{selectedSessionData.configuration.trackMemory ? 'Yes' : 'No'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Track I/O:</span>
                            <span className="font-medium">{selectedSessionData.configuration.trackIO ? 'Yes' : 'No'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedSessionData.summary.hotspots.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Performance Hotspots</h4>
                        <div className="space-y-2">
                          {selectedSessionData.summary.hotspots.map((hotspot) => (
                            <div key={hotspot.id} className="flex items-center justify-between p-3 border rounded">
                              <div className="flex items-center gap-3">
                                <div className={`p-1 rounded ${getCategoryColor(hotspot.category)}`}>
                                  <Code className="w-3 h-3" />
                                </div>
                                <div>
                                  <div className="font-medium text-sm">{hotspot.functionName}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {hotspot.fileName}:{hotspot.lineNumber}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">{hotspot.percentage.toFixed(1)}%</div>
                                <div className="text-xs text-muted-foreground">
                                  {hotspot.samples.toLocaleString()} samples
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {selectedSessionData.status === 'completed' && (
                        <Button size="sm">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          View Detailed Analysis
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export Profile
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <Code className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Select a profile session to view details
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="hotspots" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Hotspots Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Identify performance bottlenecks and hot code paths
              </p>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Hotspots
            </Button>
          </div>

          <div className="space-y-4">
            {profileSessions.filter(s => s.summary.hotspots.length > 0).map((session) => (
              <Card key={session.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {session.name}
                    <Badge className={getStatusColor(session.status)}>
                      {session.summary.hotspots.length} hotspots
                    </Badge>
                  </CardTitle>
                  <CardDescription>{session.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {session.summary.hotspots.map((hotspot) => (
                      <div key={hotspot.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-full ${getCategoryColor(hotspot.category)}`}>
                              <Code className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-medium">{hotspot.functionName}</div>
                              <div className="text-sm text-muted-foreground">
                                {hotspot.fileName}:{hotspot.lineNumber}
                              </div>
                            </div>
                          </div>
                          <Badge className={getCategoryColor(hotspot.category)}>
                            {hotspot.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="font-medium">{hotspot.percentage.toFixed(1)}%</div>
                            <div className="text-sm text-muted-foreground">of total time</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{hotspot.samples.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">samples</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{hotspot.cpuTime.toLocaleString()}μs</div>
                            <div className="text-sm text-muted-foreground">CPU time</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{hotspot.memoryUsage}MB</div>
                            <div className="text-sm text-muted-foreground">memory</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calltree" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Call Tree Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Visualize function call hierarchy and execution paths
              </p>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Call Tree
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-3 border rounded cursor-pointer hover:bg-muted">
                  <ChevronRight className="w-4 h-4" />
                  <Code className="w-4 h-4" />
                  <span className="font-medium">main()</span>
                  <Badge variant="outline">100%</Badge>
                  <span className="text-sm text-muted-foreground ml-auto">245,000μs</span>
                </div>
                <div className="ml-6 space-y-2">
                  <div className="flex items-center gap-2 p-3 border rounded cursor-pointer hover:bg-muted">
                    <ChevronRight className="w-4 h-4" />
                    <Code className="w-4 h-4" />
                    <span className="font-medium">processUserRequest()</span>
                    <Badge variant="outline">21.3%</Badge>
                    <span className="text-sm text-muted-foreground ml-auto">52,185μs</span>
                  </div>
                  <div className="ml-6 space-y-2">
                    <div className="flex items-center gap-2 p-3 border rounded cursor-pointer hover:bg-muted">
                      <ChevronRight className="w-4 h-4" />
                      <Code className="w-4 h-4" />
                      <span className="font-medium">validateInput()</span>
                      <Badge variant="outline">5.2%</Badge>
                      <span className="text-sm text-muted-foreground ml-auto">12,740μs</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 border rounded cursor-pointer hover:bg-muted">
                      <ChevronRight className="w-4 h-4" />
                      <Code className="w-4 h-4" />
                      <span className="font-medium">databaseQuery()</span>
                      <Badge variant="outline">18.7%</Badge>
                      <span className="text-sm text-muted-foreground ml-auto">45,815μs</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 border rounded cursor-pointer hover:bg-muted">
                    <ChevronRight className="w-4 h-4" />
                    <Code className="w-4 h-4" />
                    <span className="font-medium">authenticateUser()</span>
                    <Badge variant="outline">12.0%</Badge>
                    <span className="text-sm text-muted-foreground ml-auto">29,400μs</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparisons" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Profile Comparisons</h3>
              <p className="text-sm text-muted-foreground">
                Compare performance profiles across different sessions
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Comparison
            </Button>
          </div>

          <div className="space-y-4">
            {profileComparisons.map((comparison) => (
              <Card key={comparison.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{comparison.name}</div>
                      <div className="text-sm text-muted-foreground">{comparison.description}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(comparison.summary.overallImpact)}>
                        {comparison.summary.overallImpact}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h5 className="font-medium text-sm mb-2">Compared Sessions</h5>
                    <div className="flex gap-2">
                      <Badge variant="outline">{comparison.baselineName}</Badge>
                      <span>vs</span>
                      <Badge variant="outline">{comparison.comparisonName}</Badge>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h5 className="font-medium text-sm mb-2">Key Differences</h5>
                    <div className="space-y-2">
                      {comparison.differences.map((diff, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <div className="font-medium text-sm">{diff.description}</div>
                            <div className="text-xs text-muted-foreground">
                              {diff.baseline} → {diff.comparison}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getImpactColor(diff.impact)}>
                              {diff.impact}
                            </Badge>
                            <div className={`text-sm font-medium ${
                              diff.changePercentage > 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {diff.changePercentage > 0 ? '+' : ''}{diff.changePercentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export Comparison
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceProfilingPage;
