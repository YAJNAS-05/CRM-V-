import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Activity,
  Eye,
  Download,
  Plus,
  Filter,
  Search,
  BarChart3,
  Zap,
  Users,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { analyticsApi } from '../../api/analyticsApi';

interface Prediction {
  id: string;
  type: 'customer-churn' | 'sales-lead' | 'fraud' | 'demand' | 'inventory' | 'revenue' | 'employee-turnover';
  entityId: string;
  entityName: string;
  prediction: number;
  confidence: number;
  probability?: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  model: string;
  generatedAt: string;
  validUntil: string;
  factors: PredictionFactor[];
  recommendations: string[];
  status: 'active' | 'expired' | 'acted-upon';
  assignedTo?: string;
  priority: number;
}

interface PredictionFactor {
  name: string;
  value: number;
  impact: 'positive' | 'negative';
  weight: number;
  description: string;
}

interface PredictionBatch {
  id: string;
  name: string;
  type: string;
  totalPredictions: number;
  highRiskCount: number;
  generatedAt: string;
  status: 'processing' | 'completed' | 'failed';
  accuracy: number;
}

const PredictionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('predictions');
  const [selectedPrediction, setSelectedPrediction] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);

  // Load predictions from API on component mount
  useEffect(() => {
    const loadPredictions = async () => {
      setLoading(true);
      try {
        const predictionsData = await analyticsApi.getPredictions();
        if (predictionsData) {
          setPredictions(predictionsData);
        }
      } catch (error) {
        console.error('Failed to load predictions:', error);
        toast.error('Failed to load predictions');
      } finally {
        setLoading(false);
      }
    };
    loadPredictions();
  }, []);
      confidence: 85.6,
      probability: 78,
      riskLevel: 'low',
      model: 'Lead Scoring Model v1.5',
      generatedAt: '2024-01-15 13:15:00',
      validUntil: '2024-01-22 13:15:00',
      factors: [
        { name: 'Company Size', value: 0.25, impact: 'positive', weight: 0.20, description: 'Ideal company size (500-1000 employees)' },
        { name: 'Industry Fit', value: 0.30, impact: 'positive', weight: 0.25, description: 'Perfect industry match for our solution' },
        { name: 'Budget', value: 0.40, impact: 'positive', weight: 0.30, description: 'Sufficient budget indicated in initial conversation' },
        { name: 'Timeline', value: 0.20, impact: 'positive', weight: 0.25, description: 'Decision timeline aligns with sales cycle' }
      ],
      recommendations: [
        'Prioritize for sales team follow-up',
        'Schedule demo within 48 hours',
        'Send case studies from similar companies',
        'Engage technical team for solution discussion'
      ],
      status: 'active',
      assignedTo: 'Mike Wilson',
      priority: 2
    },
    {
      id: 'pred-3',
      type: 'fraud',
      entityId: 'trans-789',
      entityName: 'Transaction #789',
      prediction: 0.94,
      confidence: 96.2,
      probability: 94,
      riskLevel: 'critical',
      model: 'Fraud Detection v3.0',
      generatedAt: '2024-01-15 12:45:00',
      validUntil: '2024-01-15 13:45:00',
      factors: [
        { name: 'Amount', value: 0.35, impact: 'negative', weight: 0.25, description: 'Unusually high transaction amount' },
        { name: 'Location', value: 0.45, impact: 'negative', weight: 0.30, description: 'Transaction from unusual geographic location' },
        { name: 'Time', value: 0.30, impact: 'negative', weight: 0.20, description: 'Transaction outside normal business hours' },
        { name: 'Device', value: 0.25, impact: 'negative', weight: 0.25, description: 'New device not previously used by customer' }
      ],
      recommendations: [
        'Block transaction immediately',
        'Contact customer for verification',
        'Flag account for enhanced monitoring',
        'Report to security team for investigation'
      ],
      status: 'acted-upon',
      assignedTo: 'Security Team',
      priority: 1
    },
    {
      id: 'pred-4',
      type: 'demand',
      entityId: 'prod-123',
      entityName: 'Product SKU-12345',
      prediction: 1250,
      confidence: 79.8,
      riskLevel: 'medium',
      model: 'Demand Forecasting v1.0',
      generatedAt: '2024-01-15 11:30:00',
      validUntil: '2024-01-22 11:30:00',
      factors: [
        { name: 'Historical Demand', value: 0.40, impact: 'positive', weight: 0.35, description: 'Based on last 12 months sales data' },
        { name: 'Seasonality', value: 0.25, impact: 'positive', weight: 0.25, description: 'Seasonal demand increase expected' },
        { name: 'Market Trends', value: 0.15, impact: 'negative', weight: 0.20, description: 'Slight market contraction predicted' },
        { name: 'Competitor Activity', value: -0.10, impact: 'negative', weight: 0.20, description: 'New competitor product launch' }
      ],
      recommendations: [
        'Increase inventory by 20%',
        'Monitor competitor pricing',
        'Prepare promotional campaign',
        'Review supplier capacity'
      ],
      status: 'active',
      assignedTo: 'Operations Team',
      priority: 3
    },
    {
      id: 'pred-5',
      type: 'employee-turnover',
      entityId: 'emp-234',
      entityName: 'John Smith',
      prediction: 0.72,
      confidence: 84.3,
      probability: 72,
      riskLevel: 'medium',
      model: 'Employee Retention v1.2',
      generatedAt: '2024-01-15 10:15:00',
      validUntil: '2024-02-15 10:15:00',
      factors: [
        { name: 'Satisfaction Score', value: -0.30, impact: 'negative', weight: 0.30, description: 'Below average satisfaction survey results' },
        { name: 'Performance', value: 0.20, impact: 'positive', weight: 0.25, description: 'Strong performance metrics' },
        { name: 'Tenure', value: 0.15, impact: 'positive', weight: 0.20, description: 'Long tenure with company' },
        { name: 'Market Opportunities', value: -0.25, impact: 'negative', weight: 0.25, description: 'High demand for skills in job market' }
      ],
      recommendations: [
        'Schedule career development discussion',
        'Review compensation package',
        'Provide additional training opportunities',
        'Consider for promotion track'
      ],
      status: 'active',
      assignedTo: 'HR Manager',
      priority: 2
    }
  ];

  const predictionBatches: PredictionBatch[] = [
    {
      id: 'batch-1',
      name: 'Daily Customer Churn Analysis',
      type: 'customer-churn',
      totalPredictions: 1500,
      highRiskCount: 87,
      generatedAt: '2024-01-15 06:00:00',
      status: 'completed',
      accuracy: 92.3
    },
    {
      id: 'batch-2',
      name: 'Weekly Lead Scoring',
      type: 'sales-lead',
      totalPredictions: 500,
      highRiskCount: 125,
      generatedAt: '2024-01-15 08:00:00',
      status: 'completed',
      accuracy: 85.6
    },
    {
      id: 'batch-3',
      name: 'Real-time Fraud Detection',
      type: 'fraud',
      totalPredictions: 25000,
      highRiskCount: 12,
      generatedAt: '2024-01-15 14:30:00',
      status: 'processing',
      accuracy: 96.2
    }
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'customer-churn':
        return 'text-orange-600 bg-orange-50';
      case 'sales-lead':
        return 'text-green-600 bg-green-50';
      case 'fraud':
        return 'text-red-600 bg-red-50';
      case 'demand':
        return 'text-blue-600 bg-blue-50';
      case 'inventory':
        return 'text-purple-600 bg-purple-50';
      case 'revenue':
        return 'text-emerald-600 bg-emerald-50';
      case 'employee-turnover':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'customer-churn':
        return <Users className="w-4 h-4" />;
      case 'sales-lead':
        return <Target className="w-4 h-4" />;
      case 'fraud':
        return <AlertTriangle className="w-4 h-4" />;
      case 'demand':
        return <TrendingUp className="w-4 h-4" />;
      case 'inventory':
        return <ShoppingCart className="w-4 h-4" />;
      case 'revenue':
        return <DollarSign className="w-4 h-4" />;
      case 'employee-turnover':
        return <Users className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  const filteredPredictions = predictions.filter(prediction => {
    const matchesSearch = prediction.entityName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || prediction.type === filterType;
    return matchesSearch && matchesType;
  });

  const selectedPredictionData = predictions.find(p => p.id === selectedPrediction);

  const totalPredictions = predictions.length;
  const criticalPredictions = predictions.filter(p => p.riskLevel === 'critical').length;
  const highRiskPredictions = predictions.filter(p => p.riskLevel === 'high').length;
  const activePredictions = predictions.filter(p => p.status === 'active').length;
  const avgConfidence = Math.round(
    predictions.reduce((acc, p) => acc + p.confidence, 0) / totalPredictions
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Predictions</h1>
          <p className="text-muted-foreground">
            Real-time AI predictions and insights for business decisions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Prediction
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPredictions}</div>
            <p className="text-xs text-muted-foreground">
              active predictions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalPredictions}</div>
            <p className="text-xs text-muted-foreground">
              require immediate action
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{highRiskPredictions}</div>
            <p className="text-xs text-muted-foreground">
              need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgConfidence}%</div>
            <p className="text-xs text-muted-foreground">
              model confidence
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alert */}
      {criticalPredictions > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{criticalPredictions} critical predictions</strong> require immediate attention. 
            Review and take action on high-priority items.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="batches">Batch Processing</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Active Predictions</h3>
              <p className="text-sm text-muted-foreground">
                Review and act on AI-generated predictions
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search predictions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-md text-sm w-64"
                />
              </div>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Types</option>
                <option value="customer-churn">Customer Churn</option>
                <option value="sales-lead">Sales Lead</option>
                <option value="fraud">Fraud</option>
                <option value="demand">Demand</option>
                <option value="employee-turnover">Employee Turnover</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Predictions List */}
            <div className="space-y-4">
              {filteredPredictions.map((prediction) => (
                <Card 
                  key={prediction.id}
                  className={`cursor-pointer transition-colors ${
                    selectedPrediction === prediction.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedPrediction(prediction.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getRiskColor(prediction.riskLevel)}`}>
                          {getTypeIcon(prediction.type)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{prediction.entityName}</CardTitle>
                          <CardDescription>
                            {prediction.type.replace('-', ' ').charAt(0).toUpperCase() + prediction.type.slice(1).replace('-', ' ')}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeColor(prediction.type)}>
                          {prediction.type}
                        </Badge>
                        <Badge className={getRiskColor(prediction.riskLevel)}>
                          {prediction.riskLevel}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Prediction:</span>
                        <p className="font-medium">
                          {prediction.type === 'fraud' ? `${(prediction.probability || 0)}% risk` :
                           prediction.type === 'demand' ? prediction.prediction.toLocaleString() :
                           `${(prediction.probability || prediction.prediction * 100).toFixed(1)}%`}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Confidence:</span>
                        <p className="font-medium">{prediction.confidence}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Generated:</span>
                        <p className="font-medium">{prediction.generatedAt}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Assigned to:</span>
                        <p className="font-medium">{prediction.assignedTo || 'Unassigned'}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button size="sm">
                        Take Action
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Prediction Details */}
            <div>
              {selectedPredictionData ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {selectedPredictionData.entityName}
                      <Button variant="outline" size="sm" onClick={() => setSelectedPrediction(null)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      {selectedPredictionData.type.replace('-', ' ').charAt(0).toUpperCase() + 
                       selectedPredictionData.type.slice(1).replace('-', ' ')} Prediction
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Prediction Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <Badge className={getTypeColor(selectedPredictionData.type)}>
                              {selectedPredictionData.type}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Risk Level:</span>
                            <Badge className={getRiskColor(selectedPredictionData.riskLevel)}>
                              {selectedPredictionData.riskLevel}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Model:</span>
                            <span className="font-medium">{selectedPredictionData.model}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge className={selectedPredictionData.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'}>
                              {selectedPredictionData.status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Confidence Metrics</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Confidence:</span>
                            <span className="font-medium">{selectedPredictionData.confidence}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Probability:</span>
                            <span className="font-medium">
                              {selectedPredictionData.probability ? `${selectedPredictionData.probability}%` : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Valid Until:</span>
                            <span className="font-medium">{selectedPredictionData.validUntil}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Priority:</span>
                            <span className="font-medium">P{selectedPredictionData.priority}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Influencing Factors</h4>
                      <div className="space-y-3">
                        {selectedPredictionData.factors.map((factor, index) => (
                          <div key={index} className="p-3 border rounded">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{factor.name}</span>
                              <div className="flex items-center gap-2">
                                <Badge className={factor.impact === 'positive' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}>
                                  {factor.impact}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  Weight: {(factor.weight * 100).toFixed(0)}%
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{factor.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Recommendations</h4>
                      <ul className="space-y-2">
                        {selectedPredictionData.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm">
                        Take Action
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                      <Button size="sm" variant="outline">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Analytics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Select a prediction to view details
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="batches" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Batch Processing</h3>
              <p className="text-sm text-muted-foreground">
                Monitor batch prediction jobs and schedules
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Batch Job
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predictionBatches.map((batch) => (
              <Card key={batch.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{batch.name}</CardTitle>
                    <Badge className={batch.status === 'completed' ? 'bg-green-50 text-green-600' : 
                                   batch.status === 'processing' ? 'bg-blue-50 text-blue-600' : 
                                   'bg-red-50 text-red-600'}>
                      {batch.status}
                    </Badge>
                  </div>
                  <CardDescription>{batch.type}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total:</span>
                      <p className="font-medium">{batch.totalPredictions.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">High Risk:</span>
                      <p className="font-medium text-red-600">{batch.highRiskCount}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Accuracy:</span>
                      <p className="font-medium">{batch.accuracy}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Generated:</span>
                      <p className="font-medium">{batch.generatedAt}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Prediction Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Analyze prediction accuracy and performance trends
              </p>
            </div>
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              Export Analytics
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Prediction Distribution</CardTitle>
                <CardDescription>
                  Distribution of predictions by type and risk level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <BarChart3 className="w-12 h-12" />
                  <p className="ml-2">Distribution chart would go here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Accuracy Trends</CardTitle>
                <CardDescription>
                  Model accuracy over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <TrendingUp className="w-12 h-12" />
                  <p className="ml-2">Accuracy trend chart would go here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Prediction Settings</h3>
              <p className="text-sm text-muted-foreground">
                Configure prediction models and parameters
              </p>
            </div>
            <Button>
              Save Settings
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Model Configuration</CardTitle>
              <CardDescription>
                Configure prediction models and thresholds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Risk Thresholds</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Critical Risk Threshold</label>
                      <input type="number" defaultValue="90" className="w-full mt-1 px-3 py-2 border rounded-md" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">High Risk Threshold</label>
                      <input type="number" defaultValue="70" className="w-full mt-1 px-3 py-2 border rounded-md" />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Notification Settings</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Notify on critical predictions</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Send daily summary reports</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" />
                      <span className="text-sm">Auto-assign to team members</span>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PredictionsPage;
