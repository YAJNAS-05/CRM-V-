import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Clock,
  Download,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Calendar,
  Zap,
  Shield,
  FileText,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { performanceApi } from '../../api/performanceApi';

interface SLA {
  id: string;
  name: string;
  description: string;
  category: 'response_time' | 'availability' | 'throughput' | 'error_rate';
  target: number;
  unit: string;
  currentValue: number;
  status: 'compliant' | 'warning' | 'violation' | 'exceeded';
  compliancePercentage: number;
  period: {
    type: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    startDate: string;
    endDate: string;
  };
  history: SLAHistoryPoint[];
  penalties?: SLAPenalty[];
}

interface SLAHistoryPoint {
  timestamp: string;
  value: number;
  target: number;
  status: 'compliant' | 'warning' | 'violation';
}

interface SLAPenalty {
  type: string;
  description: string;
  amount: number;
  currency: string;
  applied: boolean;
}

const PerformanceSLAPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSLA, setSelectedSLA] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [slaData, setSlaData] = useState<SLA[]>([]);

  // Load SLA data from API on component mount
  useEffect(() => {
    const loadSLAData = async () => {
      setIsLoading(true);
      try {
        const slaDataResponse = await performanceApi.getSLAData();
        if (slaDataResponse) {
          setSlaData(slaDataResponse);
        }
      } catch (error) {
        console.error('Failed to load SLA data:', error);
        toast.error('Failed to load SLA data');
      } finally {
        setIsLoading(false);
      }
    };
    loadSLAData();
  }, []);
      unit: '%',
      currentValue: 99.95,
      status: 'exceeded',
      compliancePercentage: 100.5,
      period: {
        type: 'monthly',
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      },
      history: [
        { timestamp: '2024-01-01', value: 99.92, target: 99.9, status: 'compliant' },
        { timestamp: '2024-01-07', value: 99.88, target: 99.9, status: 'violation' },
        { timestamp: '2024-01-14', value: 99.94, target: 99.9, status: 'compliant' },
        { timestamp: '2024-01-21', value: 99.96, target: 99.9, status: 'compliant' },
        { timestamp: '2024-01-28', value: 99.95, target: 99.9, status: 'compliant' }
      ]
    },
    {
      id: 'sla-3',
      name: 'Request Throughput',
      description: 'System must handle minimum requests per second',
      category: 'throughput',
      target: 1000,
      unit: 'req/s',
      currentValue: 1250,
      status: 'exceeded',
      compliancePercentage: 125,
      period: {
        type: 'monthly',
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      },
      history: [
        { timestamp: '2024-01-01', value: 1050, target: 1000, status: 'compliant' },
        { timestamp: '2024-01-07', value: 980, target: 1000, status: 'violation' },
        { timestamp: '2024-01-14', value: 1150, target: 1000, status: 'compliant' },
        { timestamp: '2024-01-21', value: 1200, target: 1000, status: 'compliant' },
        { timestamp: '2024-01-28', value: 1250, target: 1000, status: 'compliant' }
      ]
    },
    {
      id: 'sla-4',
      name: 'Error Rate',
      description: 'Error rate must stay below maximum threshold',
      category: 'error_rate',
      target: 1.0,
      unit: '%',
      currentValue: 0.8,
      status: 'compliant',
      compliancePercentage: 80,
      period: {
        type: 'monthly',
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      },
      history: [
        { timestamp: '2024-01-01', value: 0.9, target: 1.0, status: 'compliant' },
        { timestamp: '2024-01-07', value: 1.2, target: 1.0, status: 'violation' },
        { timestamp: '2024-01-14', value: 0.85, target: 1.0, status: 'compliant' },
        { timestamp: '2024-01-21', value: 0.7, target: 1.0, status: 'compliant' },
        { timestamp: '2024-01-28', value: 0.8, target: 1.0, status: 'compliant' }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeded': return 'bg-green-100 text-green-800';
      case 'compliant': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'violation': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'exceeded': return <TrendingUp className="w-4 h-4" />;
      case 'compliant': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'violation': return <XCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getComplianceColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 95) return 'text-blue-600';
    if (percentage >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const overallCompliance = Math.round(
    slaData.reduce((acc, sla) => acc + sla.compliancePercentage, 0) / slaData.length
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance SLA</h1>
          <p className="text-muted-foreground">
            Monitor and manage Service Level Agreement compliance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total SLAs</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{slaData.length}</div>
            <p className="text-xs text-muted-foreground">Active agreements</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {slaData.filter(sla => sla.status === 'compliant' || sla.status === 'exceeded').length}
            </div>
            <p className="text-xs text-muted-foreground">Meeting targets</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Violations</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {slaData.filter(sla => sla.status === 'violation').length}
            </div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getComplianceColor(overallCompliance)}`}>
              {overallCompliance}%
            </div>
            <p className="text-xs text-muted-foreground">Average compliance</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">SLA Details</TabsTrigger>
          <TabsTrigger value="history">Compliance History</TabsTrigger>
          <TabsTrigger value="penalties">Penalties</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {slaData.map((sla) => (
              <Card key={sla.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{sla.name}</CardTitle>
                      <CardDescription>{sla.description}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(sla.status)}>
                      {getStatusIcon(sla.status)}
                      <span className="ml-1 capitalize">{sla.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Target</p>
                      <p className="text-lg font-semibold">
                        {sla.target} {sla.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Current</p>
                      <p className="text-lg font-semibold">
                        {sla.currentValue} {sla.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Compliance</p>
                      <p className={`text-lg font-semibold ${getComplianceColor(sla.compliancePercentage)}`}>
                        {sla.compliancePercentage}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Period</p>
                      <p className="text-lg font-semibold capitalize">
                        {sla.period.type}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Compliance Progress</span>
                      <span className="text-xs text-muted-foreground">
                        {sla.compliancePercentage}% of target
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          sla.status === 'exceeded' ? 'bg-green-500' : 
                          sla.status === 'compliant' ? 'bg-blue-500' : 
                          sla.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ 
                          width: `${Math.min(sla.compliancePercentage, 120)}%` 
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Detailed SLA metrics and compliance information for each service level agreement.
            </AlertDescription>
          </Alert>
          
          <div className="grid gap-4">
            {slaData.map((sla) => (
              <Card key={sla.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{sla.name}</span>
                    <Badge className={getStatusColor(sla.status)}>
                      {sla.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium mb-2">SLA Parameters</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Category:</span>
                            <span className="capitalize">{sla.category.replace('_', ' ')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Target Value:</span>
                            <span>{sla.target} {sla.unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Current Value:</span>
                            <span>{sla.currentValue} {sla.unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Measurement Period:</span>
                            <span className="capitalize">{sla.period.type}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium mb-2">Compliance Details</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Compliance Rate:</span>
                            <span className={getComplianceColor(sla.compliancePercentage)}>
                              {sla.compliancePercentage}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <span className="capitalize">{sla.status}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Period Start:</span>
                            <span>{sla.period.startDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Period End:</span>
                            <span>{sla.period.endDate}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium mb-2">Performance Trend</h5>
                        <div className="h-32 bg-muted rounded flex items-end justify-around p-2">
                          {sla.history.slice(-5).map((point, index) => (
                            <div key={index} className="flex flex-col items-center flex-1">
                              <div 
                                className={`w-full rounded-t ${
                                  point.status === 'compliant' ? 'bg-green-500' : 
                                  point.status === 'violation' ? 'bg-red-500' : 'bg-yellow-500'
                                }`}
                                style={{ 
                                  height: `${(point.value / Math.max(...sla.history.map(h => h.value))) * 100}px` 
                                }}
                              />
                              <span className="text-xs mt-1">
                                {new Date(point.timestamp).getDate()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium mb-2">Recent Status</h5>
                        <div className="space-y-1">
                          {sla.history.slice(-3).reverse().map((point, index) => (
                            <div key={index} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                              <span>{new Date(point.timestamp).toLocaleDateString()}</span>
                              <span>{point.value} {sla.unit}</span>
                              <Badge className={getStatusColor(point.status)} variant="outline">
                                {point.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              Historical compliance data shows SLA performance trends over time.
            </AlertDescription>
          </Alert>
          
          <div className="grid gap-4">
            {slaData.map((sla) => (
              <Card key={sla.id}>
                <CardHeader>
                  <CardTitle>{sla.name} - Compliance History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-muted rounded">
                        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                        <p className="font-semibold">Compliant Days</p>
                        <p className="text-2xl font-bold">
                          {sla.history.filter(h => h.status === 'compliant').length}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-muted rounded">
                        <XCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
                        <p className="font-semibold">Violations</p>
                        <p className="text-2xl font-bold">
                          {sla.history.filter(h => h.status === 'violation').length}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-muted rounded">
                        <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                        <p className="font-semibold">Best Performance</p>
                        <p className="text-2xl font-bold">
                          {Math.min(...sla.history.map(h => h.value))} {sla.unit}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-muted rounded">
                        <Activity className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                        <p className="font-semibold">Average</p>
                        <p className="text-2xl font-bold">
                          {(sla.history.reduce((acc, h) => acc + h.value, 0) / sla.history.length).toFixed(1)} {sla.unit}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-2">Detailed History</h5>
                      <div className="space-y-1">
                        {sla.history.map((point, index) => (
                          <div key={index} className="flex items-center justify-between text-sm p-3 border rounded">
                            <div className="flex items-center gap-3">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span>{new Date(point.timestamp).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-medium">{point.value} {sla.unit}</span>
                              <span className="text-muted-foreground">Target: {point.target} {sla.unit}</span>
                              <Badge className={getStatusColor(point.status)}>
                                {point.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="penalties" className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              SLA violations may result in penalties or service credits as defined in the agreement.
            </AlertDescription>
          </Alert>
          
          <div className="grid gap-4">
            {slaData.filter(sla => sla.penalties && sla.penalties.length > 0).map((sla) => (
              <Card key={sla.id}>
                <CardHeader>
                  <CardTitle>{sla.name} - Penalties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sla.penalties?.map((penalty, index) => (
                      <div key={index} className="border rounded p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">{penalty.type}</h5>
                          <Badge className={penalty.applied ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                            {penalty.applied ? 'Applied' : 'Pending'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{penalty.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold">
                            {penalty.amount} {penalty.currency}
                          </span>
                          <Button size="sm" variant={penalty.applied ? 'secondary' : 'outline'}>
                            {penalty.applied ? 'View Details' : 'Apply Penalty'}
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="mt-4 p-4 bg-muted rounded">
                      <h5 className="font-medium mb-2">Penalty Summary</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Total Penalties:</span>
                          <span className="ml-2 font-semibold">
                            {sla.penalties?.reduce((acc, p) => acc + p.amount, 0)} {sla.penalties?.[0]?.currency}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Applied:</span>
                          <span className="ml-2 font-semibold">
                            {sla.penalties?.filter(p => p.applied).reduce((acc, p) => acc + p.amount, 0)} {sla.penalties?.[0]?.currency}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {slaData.filter(sla => sla.penalties && sla.penalties.length > 0).length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
                  <h3 className="text-lg font-semibold mb-2">No Penalties</h3>
                  <p className="text-muted-foreground">
                    All SLAs are currently compliant with no penalties applied.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceSLAPage;
