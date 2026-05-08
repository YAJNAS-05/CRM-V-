import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { 
  AlertTriangle, 
  Search, 
  Filter,
  Eye,
  RefreshCw,
  Download,
  Settings,
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  Clock,
  MapPin,
  Target,
  Zap,
  CheckCircle,
  XCircle,
  BarChart3,
  Database
} from 'lucide-react';
import { AnomalyDetection, AnomalyType } from '@/types/analytics';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { analyticsApi } from '../../api/analyticsApi';

const AnomalyDetectionPage: React.FC = () => {
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([]);
  const [loading, setLoading] = useState(false);
      confidence: 0.88,
      metadata: {
        source: 'user_activity_logs',
        region: 'us-east-1',
        deviceType: 'web'
      }
    },
    {
      id: '2',
      modelId: 'system-performance-anomaly',
      timestamp: new Date('2024-01-20T13:15:00'),
      dataPoint: {
        serverId: 'srv-web-01',
        cpuUsage: 0.95,
        memoryUsage: 0.87,
        diskIO: 1250,
        networkLatency: 450,
        responseTime: 2800
      },
      anomalyScore: 0.87,
      threshold: 0.80,
      isAnomaly: true,
      type: 'CONTEXTUAL_ANOMALY',
      severity: 'CRITICAL',
      explanation: {
        primaryFeatures: ['cpuUsage', 'responseTime'],
        featureContributions: [
          { feature: 'cpuUsage', importance: 0.52, direction: 'POSITIVE', value: 0.95 },
          { feature: 'responseTime', importance: 0.38, direction: 'POSITIVE', value: 2800 }
        ],
        normalRange: {
          cpuUsage: [0.20, 0.60],
          responseTime: [200, 800]
        },
        similarAnomalies: ['anom-234', 'anom-567'],
        recommendedAction: 'Scale resources immediately and investigate performance bottleneck'
      },
      confidence: 0.91,
      metadata: {
        source: 'system_metrics',
        region: 'us-west-2',
        environment: 'production'
      }
    },
    {
      id: '3',
      modelId: 'transaction-anomaly',
      timestamp: new Date('2024-01-20T12:45:00'),
      dataPoint: {
        transactionId: 'txn-98765',
        amount: 45000,
        merchantCategory: 'electronics',
        location: 'Tokyo, JP',
        userLocation: 'New York, US',
        timeOfDay: '03:30',
        deviceFingerprint: 'fp-abc123'
      },
      anomalyScore: 0.78,
      threshold: 0.70,
      isAnomaly: true,
      type: 'COLLECTIVE_ANOMALY',
      severity: 'MEDIUM',
      explanation: {
        primaryFeatures: ['amount', 'location'],
        featureContributions: [
          { feature: 'amount', importance: 0.41, direction: 'POSITIVE', value: 45000 },
          { feature: 'location', importance: 0.33, direction: 'POSITIVE', value: 'geographic_mismatch' }
        ],
        normalRange: {
          amount: [50, 2000],
          location: ['same_country']
        },
        similarAnomalies: ['anom-345', 'anom-678'],
        recommendedAction: 'Verify transaction legitimacy with customer and implement additional verification'
      },
      confidence: 0.82,
      metadata: {
        source: 'payment_transactions',
        region: 'global',
        paymentMethod: 'credit_card'
      }
    },
    {
      id: '4',
      modelId: 'network-traffic-anomaly',
      timestamp: new Date('2024-01-20T11:30:00'),
      dataPoint: {
        sourceIP: '203.0.113.45',
        destinationPort: 22,
        packetCount: 15000,
        bytesTransferred: 2500000,
        connectionDuration: 7200,
        protocol: 'SSH'
      },
      anomalyScore: 0.83,
      threshold: 0.75,
      isAnomaly: true,
      type: 'TREND_ANOMALY',
      severity: 'HIGH',
      explanation: {
        primaryFeatures: ['packetCount', 'bytesTransferred'],
        featureContributions: [
          { feature: 'packetCount', importance: 0.48, direction: 'POSITIVE', value: 15000 },
          { feature: 'bytesTransferred', importance: 0.42, direction: 'POSITIVE', value: 2500000 }
        ],
        normalRange: {
          packetCount: [100, 2000],
          bytesTransferred: [10000, 500000]
        },
        similarAnomalies: ['anom-901'],
        recommendedAction: 'Investigate potential data exfiltration or unauthorized access'
      },
      confidence: 0.85,
      metadata: {
        source: 'network_logs',
        region: 'eu-central-1',
        firewall: 'fw-main-01'
      }
    },
    {
      id: '5',
      modelId: 'sales-pattern-anomaly',
      timestamp: new Date('2024-01-20T10:15:00'),
      dataPoint: {
        productId: 'prod-456',
        salesVolume: 5,
        averagePrice: 29.99,
        region: 'northeast',
        dayOfWeek: 'Monday',
        season: 'winter'
      },
      anomalyScore: 0.71,
      threshold: 0.65,
      isAnomaly: true,
      type: 'SEASONAL_ANOMALY',
      severity: 'LOW',
      explanation: {
        primaryFeatures: ['salesVolume'],
        featureContributions: [
          { feature: 'salesVolume', importance: 0.65, direction: 'NEGATIVE', value: 5 }
        ],
        normalRange: {
          salesVolume: [25, 75]
        },
        similarAnomalies: [],
        recommendedAction: 'Monitor product availability and marketing effectiveness'
      },
      confidence: 0.76,
      metadata: {
        source: 'sales_data',
        region: 'northeast',
        category: 'consumer_electronics'
      }
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyDetection | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('ALL');
  const [filterType, setFilterType] = useState<AnomalyType | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ANOMALY' | 'NORMAL'>('ALL');
  const [loading, setLoading] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);

  const handleAcknowledgeAnomaly = async (anomalyId: string) => {
    setLoading(true);
    try {
      // Use real analyticsApi to acknowledge anomaly
      await analyticsApi.acknowledgeAnomaly(anomalyId);
      toast.success('Anomaly acknowledged successfully');
    } catch (error) {
      console.error('Failed to acknowledge anomaly:', error);
      toast.error('Failed to acknowledge anomaly');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAnomaly = async (anomalyId: string) => {
    setLoading(true);
    try {
      // Use real analyticsApi to resolve anomaly
      await analyticsApi.resolveAnomaly(anomalyId);
      setAnomalies(anomalies.filter(a => a.id !== anomalyId));
      toast.success('Anomaly resolved successfully');
    } catch (error) {
      console.error('Failed to resolve anomaly:', error);
      toast.error('Failed to resolve anomaly');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshAnomalies = async () => {
    setLoading(true);
    try {
      // Use real analyticsApi to refresh anomalies
      const anomaliesData = await analyticsApi.getAnomalies();
      if (anomaliesData) {
        setAnomalies(anomaliesData);
      }
      toast.success('Anomaly data refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh anomaly data:', error);
      toast.error('Failed to refresh anomaly data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportAnomalies = () => {
    const csvContent = [
      ['ID', 'Model', 'Timestamp', 'Type', 'Severity', 'Score', 'Confidence', 'Status'],
      ...anomalies.map(anomaly => [
        anomaly.id,
        anomaly.modelId,
        anomaly.timestamp.toISOString(),
        anomaly.type,
        anomaly.severity,
        anomaly.anomalyScore.toFixed(3),
        anomaly.confidence.toFixed(3),
        anomaly.isAnomaly ? 'Anomaly' : 'Normal'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anomalies-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Anomalies exported successfully');
  };

  const getTypeIcon = (type: AnomalyType) => {
    switch (type) {
      case 'POINT_ANOMALY': return <Target className="h-5 w-5" />;
      case 'CONTEXTUAL_ANOMALY': return <Activity className="h-5 w-5" />;
      case 'COLLECTIVE_ANOMALY': return <Database className="h-5 w-5" />;
      case 'SEASONAL_ANOMALY': return <Clock className="h-5 w-5" />;
      case 'TREND_ANOMALY': return <TrendingUp className="h-5 w-5" />;
      default: return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number, threshold: number) => {
    if (score >= threshold + 0.2) return 'text-red-600';
    if (score >= threshold) return 'text-orange-600';
    if (score >= threshold - 0.1) return 'text-yellow-600';
    return 'text-green-600';
  };

  const filteredAnomalies = anomalies.filter(anomaly => {
    const matchesSearch = anomaly.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         anomaly.modelId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         Object.values(anomaly.metadata).some(val => 
                           typeof val === 'string' && val.toLowerCase().includes(searchQuery.toLowerCase())
                         );
    
    const matchesSeverity = filterSeverity === 'ALL' || anomaly.severity === filterSeverity;
    const matchesType = filterType === 'ALL' || anomaly.type === filterType;
    const matchesStatus = filterStatus === 'ALL' || 
                         (filterStatus === 'ANOMALY' && anomaly.isAnomaly) ||
                         (filterStatus === 'NORMAL' && !anomaly.isAnomaly);
    
    return matchesSearch && matchesSeverity && matchesType && matchesStatus;
  });

  const criticalAnomalies = anomalies.filter(a => a.severity === 'CRITICAL');
  const highAnomalies = anomalies.filter(a => a.severity === 'HIGH');
  const totalAnomalies = anomalies.filter(a => a.isAnomaly);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Anomaly Detection</h1>
          <p className="text-gray-600">Monitor and investigate detected anomalies across systems</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleRefreshAnomalies} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportAnomalies}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-1" />
            Configure Models
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalAnomalies.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>CRITICAL ANOMALIES DETECTED:</strong> {criticalAnomalies.length} critical anomalies require immediate attention
              </div>
              <Button variant="outline" size="sm" className="ml-4">
                Investigate Critical
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{criticalAnomalies.length}</p>
                <p className="text-sm text-gray-600">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{highAnomalies.length}</p>
                <p className="text-sm text-gray-600">High Priority</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalAnomalies.length}</p>
                <p className="text-sm text-gray-600">Total Anomalies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Activity className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {anomalies.length > 0 ? (totalAnomalies.length / anomalies.length * 100).toFixed(1) : 0}%
                </p>
                <p className="text-sm text-gray-600">Anomaly Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search anomalies by ID, model, or metadata..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value as any)}
              >
                <option value="ALL">All Severities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
              >
                <option value="ALL">All Types</option>
                <option value="POINT_ANOMALY">Point Anomaly</option>
                <option value="CONTEXTUAL_ANOMALY">Contextual Anomaly</option>
                <option value="COLLECTIVE_ANOMALY">Collective Anomaly</option>
                <option value="SEASONAL_ANOMALY">Seasonal Anomaly</option>
                <option value="TREND_ANOMALY">Trend Anomaly</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="ALL">All Status</option>
                <option value="ANOMALY">Anomaly</option>
                <option value="NORMAL">Normal</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Anomalies List */}
      <div className="space-y-4">
        {filteredAnomalies.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No anomalies found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        ) : (
          filteredAnomalies.map(anomaly => (
            <Card key={anomaly.id} className={
              anomaly.severity === 'CRITICAL' ? 'border-red-200 bg-red-50' : 
              anomaly.severity === 'HIGH' ? 'border-orange-200 bg-orange-50' : ''
            }>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      anomaly.severity === 'CRITICAL' ? 'bg-red-100' : 
                      anomaly.severity === 'HIGH' ? 'bg-orange-100' : 
                      anomaly.severity === 'MEDIUM' ? 'bg-yellow-100' : 'bg-green-100'
                    }`}>
                      {getTypeIcon(anomaly.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold">Anomaly #{anomaly.id}</h3>
                        <Badge className={getSeverityColor(anomaly.severity)}>
                          {anomaly.severity}
                        </Badge>
                        <Badge variant="outline">{anomaly.type.replace(/_/g, ' ')}</Badge>
                        <Badge variant="outline">{anomaly.modelId}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <span className="text-sm text-gray-600">Anomaly Score</span>
                          <p className={`font-bold text-lg ${getScoreColor(anomaly.anomalyScore, anomaly.threshold)}`}>
                            {anomaly.anomalyScore.toFixed(3)}
                          </p>
                          <p className="text-xs text-gray-500">Threshold: {anomaly.threshold.toFixed(3)}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Confidence</span>
                          <p className="font-bold text-lg">
                            {(anomaly.confidence * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Time Detected</span>
                          <p className="font-medium">
                            {formatDistanceToNow(anomaly.timestamp, { addSuffix: true })}
                          </p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <span className="text-sm text-gray-600">Primary Features</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {anomaly.explanation.primaryFeatures.map((feature, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="mb-3">
                        <span className="text-sm text-gray-600">Recommended Action</span>
                        <p className="text-sm font-medium mt-1">{anomaly.explanation.recommendedAction}</p>
                      </div>

                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Database className="h-3 w-3" />
                          <span>Source: {anomaly.metadata.source}</span>
                        </div>
                        {anomaly.metadata.region && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>Region: {anomaly.metadata.region}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedAnomaly(anomaly);
                        setDetailsDialog(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAcknowledgeAnomaly(anomaly.id)}
                      disabled={loading}
                    >
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleResolveAnomaly(anomaly.id)}
                      disabled={loading}
                    >
                      <XCircle className="h-4 w-4 text-green-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Anomaly Details Dialog */}
      <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Anomaly Details</DialogTitle>
          </DialogHeader>
          {selectedAnomaly && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Anomaly ID</Label>
                  <p className="font-medium font-mono">#{selectedAnomaly.id}</p>
                </div>
                <div>
                  <Label>Model</Label>
                  <p className="font-medium">{selectedAnomaly.modelId}</p>
                </div>
                <div>
                  <Label>Type</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    {getTypeIcon(selectedAnomaly.type)}
                    <span className="font-medium">{selectedAnomaly.type.replace(/_/g, ' ')}</span>
                  </div>
                </div>
                <div>
                  <Label>Severity</Label>
                  <Badge className={getSeverityColor(selectedAnomaly.severity)}>
                    {selectedAnomaly.severity}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Anomaly Score</Label>
                  <p className={`text-2xl font-bold ${getScoreColor(selectedAnomaly.anomalyScore, selectedAnomaly.threshold)}`}>
                    {selectedAnomaly.anomalyScore.toFixed(3)}
                  </p>
                  <p className="text-sm text-gray-600">Threshold: {selectedAnomaly.threshold.toFixed(3)}</p>
                </div>
                <div>
                  <Label>Confidence</Label>
                  <p className="text-2xl font-bold">
                    {(selectedAnomaly.confidence * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    {selectedAnomaly.isAnomaly ? (
                      <>
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        <span className="font-medium">Anomaly Detected</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Normal</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label>Data Point</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(selectedAnomaly.dataPoint, null, 2)}
                  </pre>
                </div>
              </div>

              <div>
                <Label>Feature Contributions</Label>
                <div className="mt-2 space-y-2">
                  {selectedAnomaly.explanation.featureContributions.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          feature.direction === 'POSITIVE' ? 'bg-red-100' : 'bg-blue-100'
                        }`}>
                          {feature.direction === 'POSITIVE' ? (
                            <TrendingUp className="h-4 w-4 text-red-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{feature.feature}</p>
                          <p className="text-sm text-gray-600">Value: {feature.value}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{(feature.importance * 100).toFixed(1)}%</p>
                        <p className="text-xs text-gray-600">Importance</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Normal Range</Label>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  {Object.entries(selectedAnomaly.explanation.normalRange).map(([feature, range]) => (
                    <div key={feature} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium">{feature}</p>
                      <p className="text-sm text-gray-600">
                        Min: {range[0]} - Max: {range[1]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Recommended Action</Label>
                <div className="mt-2 p-3 bg-yellow-50 rounded-lg">
                  <p className="font-medium text-yellow-800">{selectedAnomaly.explanation.recommendedAction}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Detection Time</Label>
                  <p className="font-medium">{selectedAnomaly.timestamp.toLocaleString()}</p>
                </div>
                <div>
                  <Label>Metadata</Label>
                  <div className="mt-1 text-sm space-y-1">
                    {Object.entries(selectedAnomaly.metadata).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-gray-600">{key}:</span>
                        <span className="ml-2 font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button onClick={() => handleAcknowledgeAnomaly(selectedAnomaly.id)} disabled={loading}>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Acknowledge
                </Button>
                <Button variant="destructive" onClick={() => handleResolveAnomaly(selectedAnomaly.id)} disabled={loading}>
                  <XCircle className="h-4 w-4 mr-1" />
                  Resolve
                </Button>
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  View Analysis
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Export Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnomalyDetectionPage;
