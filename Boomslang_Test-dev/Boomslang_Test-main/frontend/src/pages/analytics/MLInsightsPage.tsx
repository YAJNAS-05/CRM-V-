import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { 
  Brain, 
  Lightbulb, 
  Target, 
  TrendingUp, 
  AlertTriangle,
  Eye,
  Download,
  Plus,
  Filter,
  Search,
  Settings,
  Zap,
  CheckCircle,
  Clock,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart,
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { analyticsApi } from '../../api/analyticsApi';

interface MLInsight {
  id: string;
  title: string;
  description: string;
  category: 'business' | 'customer' | 'operational' | 'financial' | 'product' | 'marketing';
  type: 'opportunity' | 'risk' | 'trend' | 'anomaly' | 'recommendation' | 'prediction';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  priority: number;
  status: 'new' | 'reviewed' | 'accepted' | 'rejected' | 'implemented';
  source: string;
  model: string;
  generatedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  data: InsightData;
  recommendations: Recommendation[];
  relatedInsights: string[];
  feedback?: InsightFeedback;
  actions: InsightAction[];
}

interface InsightData {
  metrics: {
    name: string;
    value: number;
    change: number;
    baseline: number;
  }[];
  patterns: string[];
  correlations: {
    metric1: string;
    metric2: string;
    correlation: number;
  }[];
  anomalies: {
    metric: string;
    value: number;
    expected: number;
    deviation: number;
  }[];
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  timeline: string;
  owner?: string;
  status: 'pending' | 'in-progress' | 'completed';
}

interface InsightFeedback {
  rating: number;
  comment: string;
  useful: boolean;
  submittedBy: string;
  submittedAt: string;
}

interface InsightAction {
  id: string;
  type: 'view' | 'share' | 'export' | 'implement' | 'feedback';
  performedBy: string;
  performedAt: string;
  details: string;
}

interface InsightPattern {
  id: string;
  name: string;
  description: string;
  frequency: number;
  confidence: number;
  category: string;
  examples: string[];
  businessValue: string;
}

const MLInsightsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('insights');
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [mlInsights, setMlInsights] = useState<MLInsight[]>([]);
  const [loading, setLoading] = useState(false);

  // Load ML insights from API on component mount
  useEffect(() => {
    const loadMLInsights = async () => {
      setLoading(true);
      try {
        const insightsData = await analyticsApi.getMLInsights();
        if (insightsData) {
          setMlInsights(insightsData);
        }
      } catch (error) {
        console.error('Failed to load ML insights:', error);
        toast.error('Failed to load ML insights');
      } finally {
        setLoading(false);
      }
    };
    loadMLInsights();
  }, []);

  return (
    // ... rest of the code remains the same ...
  );
};

export default MLInsightsPage;
        ],
        correlations: [
          { metric1: 'Feature Usage', metric2: 'Revenue', correlation: 0.87 },
          { metric1: 'Support Tickets', metric2: 'Churn', correlation: -0.65 }
        ],
        anomalies: []
      },
      recommendations: [
        { id: 'rec-1', title: 'Create targeted marketing campaign', description: 'Develop specialized campaigns for this segment', effort: 'medium', impact: 'high', timeline: '2 weeks', status: 'pending' },
        { id: 'rec-2', title: 'Develop premium features', description: 'Create features specifically for this segment', effort: 'high', impact: 'high', timeline: '2 months', status: 'pending' },
        { id: 'rec-3', title: 'Adjust pricing strategy', description: 'Implement tiered pricing for this segment', effort: 'low', impact: 'medium', timeline: '1 month', status: 'pending' }
      ],
      relatedInsights: ['insight-3', 'insight-5'],
      actions: [
        { id: 'action-1', type: 'view', performedBy: 'John Smith', performedAt: '2024-01-15 15:00:00', details: 'Viewed insight details' }
      ]
    },
    {
      id: 'insight-2',
      title: 'Supply Chain Risk Detected',
      description: 'Predictive model flags 78% probability of supply chain disruption in APAC region due to weather patterns',
      category: 'operational',
      type: 'risk',
      severity: 'critical',
      confidence: 78.3,
      impact: 'critical',
      priority: 1,
      status: 'reviewed',
      source: 'Supply Chain Risk Model',
      model: 'Random Forest v3.0',
      generatedAt: '2024-01-15 12:15:00',
      reviewedAt: '2024-01-15 13:30:00',
      reviewedBy: 'Operations Manager',
      data: {
        metrics: [
          { name: 'Risk Probability', value: 78, change: 45, baseline: 33 },
          { name: 'Impact Score', value: 9.2, change: 3.1, baseline: 6.1 },
          { name: 'Lead Time', value: 45, change: 15, baseline: 30 }
        ],
        patterns: [
          'Seasonal weather pattern correlation',
          'Port congestion indicators',
          'Supplier financial stress signals'
        ],
        correlations: [
          { metric1: 'Weather Index', metric2: 'Delivery Delay', correlation: 0.72 },
          { metric1: 'Supplier Health', metric2: 'Quality Issues', correlation: -0.68 }
        ],
        anomalies: [
          { metric: 'Port Traffic', value: 145, expected: 89, deviation: 63 },
          { metric: 'Weather Severity', value: 8.5, expected: 4.2, deviation: 102 }
        ]
      },
      recommendations: [
        { id: 'rec-4', title: 'Diversify suppliers', description: 'Add backup suppliers in less risky regions', effort: 'high', impact: 'high', timeline: '3 months', status: 'in-progress', owner: 'Procurement Team' },
        { id: 'rec-5', title: 'Increase safety stock', description: 'Build buffer inventory for critical components', effort: 'medium', impact: 'medium', timeline: '1 month', status: 'pending' },
        { id: 'rec-6', title: 'Activate contingency plans', description: 'Implement pre-defined disruption response', effort: 'low', impact: 'high', timeline: '1 week', status: 'completed' }
      ],
      relatedInsights: ['insight-4'],
      feedback: {
        rating: 5,
        comment: 'Critical insight that helped prevent major disruption',
        useful: true,
        submittedBy: 'Operations Manager',
        submittedAt: '2024-01-15 13:45:00'
      },
      actions: [
        { id: 'action-2', type: 'view', performedBy: 'Operations Manager', performedAt: '2024-01-15 12:30:00', details: 'Reviewed risk assessment' },
        { id: 'action-3', type: 'implement', performedBy: 'Procurement Team', performedAt: '2024-01-15 14:00:00', details: 'Started supplier diversification' }
      ]
    },
    {
      id: 'insight-3',
      title: 'Revenue Growth Pattern Shift',
      description: 'ML analysis detects fundamental shift in revenue growth drivers from product-led to service-led',
      category: 'business',
      type: 'trend',
      severity: 'medium',
      confidence: 86.7,
      impact: 'high',
      priority: 2,
      status: 'accepted',
      source: 'Revenue Driver Analysis',
      model: 'Gradient Boosting v1.5',
      generatedAt: '2024-01-15 10:45:00',
      reviewedAt: '2024-01-15 11:30:00',
      reviewedBy: 'CFO',
      data: {
        metrics: [
          { name: 'Service Revenue %', value: 42, change: 18, baseline: 24 },
          { name: 'Product Revenue %', value: 58, change: -18, baseline: 76 },
          { name: 'Growth Rate', value: 15.8, change: 3.2, baseline: 12.6 }
        ],
        patterns: [
          'Service contracts driving new customer acquisition',
          'Higher retention rates for service customers',
          'Increased cross-sell opportunities'
        ],
        correlations: [
          { metric1: 'Service Revenue', metric2: 'Customer Lifetime', correlation: 0.81 },
          { metric1: 'Product Revenue', metric2: 'New Customers', correlation: 0.45 }
        ],
        anomalies: []
      },
      recommendations: [
        { id: 'rec-7', title: 'Invest in service capabilities', description: 'Scale service delivery infrastructure', effort: 'high', impact: 'high', timeline: '6 months', status: 'in-progress', owner: 'Service Team' },
        { id: 'rec-8', title: 'Adjust sales compensation', description: 'Incentivize service sales over product sales', effort: 'medium', impact: 'medium', timeline: '1 month', status: 'completed' }
      ],
      relatedInsights: ['insight-1', 'insight-6'],
      feedback: {
        rating: 4,
        comment: 'Valuable strategic insight for business planning',
        useful: true,
        submittedBy: 'CFO',
        submittedAt: '2024-01-15 11:45:00'
      },
      actions: [
        { id: 'action-4', type: 'share', performedBy: 'CFO', performedAt: '2024-01-15 12:00:00', details: 'Shared with executive team' }
      ]
    },
    {
      id: 'insight-4',
      title: 'Customer Satisfaction Anomaly',
      description: 'Unusual drop in satisfaction scores detected for enterprise customers in Q4',
      category: 'customer',
      type: 'anomaly',
      severity: 'high',
      confidence: 91.5,
      impact: 'medium',
      priority: 2,
      status: 'accepted',
      source: 'Sentiment Analysis Model',
      model: 'BERT Sentiment v2.0',
      generatedAt: '2024-01-15 09:30:00',
      reviewedAt: '2024-01-15 10:15:00',
      reviewedBy: 'Customer Success Manager',
      data: {
        metrics: [
          { name: 'Enterprise CSAT', value: 72.3, change: -12.7, baseline: 85.0 },
          { name: 'Support Response Time', value: 18.5, change: 8.2, baseline: 10.3 },
          { name: 'Feature Requests', value: 45, change: 22, baseline: 23 }
        ],
        patterns: [
          'Increased support ticket volume',
          'Negative sentiment in recent reviews',
          'Feature gap complaints'
        ],
        correlations: [
          { metric1: 'Response Time', metric2: 'Satisfaction', correlation: -0.78 },
          { metric1: 'Feature Requests', metric2: 'Churn Risk', correlation: 0.65 }
        ],
        anomalies: [
          { metric: 'CSAT Score', value: 72.3, expected: 84.5, deviation: -14.5 },
          { metric: 'Ticket Volume', value: 234, expected: 156, deviation: 50 }
        ]
      },
      recommendations: [
        { id: 'rec-9', title: 'Improve support response times', description: 'Hire additional support staff', effort: 'medium', impact: 'high', timeline: '1 month', status: 'in-progress' },
        { id: 'rec-10', title: 'Address feature gaps', description: 'Prioritize enterprise feature requests', effort: 'high', impact: 'high', timeline: '3 months', status: 'pending' }
      ],
      relatedInsights: ['insight-2'],
      actions: [
        { id: 'action-5', type: 'feedback', performedBy: 'Customer Success Manager', performedAt: '2024-01-15 10:30:00', details: 'Provided feedback on accuracy' }
      ]
    },
    {
      id: 'insight-5',
      title: 'Marketing Channel Optimization',
      description: 'ML model identifies optimal marketing mix with 23% higher ROI than current allocation',
      category: 'marketing',
      type: 'recommendation',
      severity: 'medium',
      confidence: 83.4,
      impact: 'medium',
      priority: 3,
      status: 'new',
      source: 'Marketing Optimization Model',
      model: 'Multi-Armed Bandit v1.2',
      generatedAt: '2024-01-15 08:00:00',
      data: {
        metrics: [
          { name: 'Predicted ROI', value: 28.5, change: 6.2, baseline: 22.3 },
          { name: 'Customer Acquisition Cost', value: 125, change: -35, baseline: 160 },
          { name: 'Conversion Rate', value: 4.2, change: 0.8, baseline: 3.4 }
        ],
        patterns: [
          'LinkedIn ads performing 45% better',
          'Email marketing underperforming',
          'Content marketing showing strong ROI'
        ],
        correlations: [
          { metric1: 'Ad Spend', metric2: 'Conversions', correlation: 0.73 },
          { metric1: 'Content Quality', metric2: 'Engagement', correlation: 0.81 }
        ],
        anomalies: []
      },
      recommendations: [
        { id: 'rec-11', title: 'Reallocate budget to LinkedIn', description: 'Shift 30% budget to LinkedIn ads', effort: 'low', impact: 'medium', timeline: '1 week', status: 'pending' },
        { id: 'rec-12', title: 'Optimize email campaigns', description: 'Revamp email marketing strategy', effort: 'medium', impact: 'medium', timeline: '2 weeks', status: 'pending' }
      ],
      relatedInsights: ['insight-1'],
      actions: []
    }
  ];

  const insightPatterns: InsightPattern[] = [
    {
      id: 'pattern-1',
      name: 'Seasonal Revenue Patterns',
      description: 'Consistent quarterly revenue patterns across all product lines',
      frequency: 4,
      confidence: 94.2,
      category: 'business',
      examples: ['Q4 always strongest', 'Q2 typically slow', 'Back-to-school boost in Q3'],
      businessValue: 'Improved forecasting accuracy and resource planning'
    },
    {
      id: 'pattern-2',
      name: 'Customer Lifecycle Behaviors',
      description: 'Predictable customer behavior patterns at different lifecycle stages',
      frequency: 12,
      confidence: 87.6,
      category: 'customer',
      examples: ['30-day trial conversion peak', '6-month renewal decision', '12-month expansion opportunity'],
      businessValue: 'Targeted engagement and retention strategies'
    },
    {
      id: 'pattern-3',
      name: 'Feature Adoption Correlation',
      description: 'Strong correlation between specific feature usage and customer success',
      frequency: 8,
      confidence: 91.3,
      category: 'product',
      examples: ['Dashboard users stay 45% longer', 'API users have 3x higher LTV', 'Mobile users churn 25% less'],
      businessValue: 'Product roadmap prioritization and customer onboarding'
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'business':
        return 'text-blue-600 bg-blue-50';
      case 'customer':
        return 'text-green-600 bg-green-50';
      case 'operational':
        return 'text-orange-600 bg-orange-50';
      case 'financial':
        return 'text-purple-600 bg-purple-50';
      case 'product':
        return 'text-pink-600 bg-pink-50';
      case 'marketing':
        return 'text-indigo-600 bg-indigo-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'opportunity':
        return 'text-green-600 bg-green-50';
      case 'risk':
        return 'text-red-600 bg-red-50';
      case 'trend':
        return 'text-blue-600 bg-blue-50';
      case 'anomaly':
        return 'text-yellow-600 bg-yellow-50';
      case 'recommendation':
        return 'text-purple-600 bg-purple-50';
      case 'prediction':
        return 'text-indigo-600 bg-indigo-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'text-blue-600 bg-blue-50';
      case 'reviewed':
        return 'text-yellow-600 bg-yellow-50';
      case 'accepted':
        return 'text-green-600 bg-green-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      case 'implemented':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredInsights = mlInsights.filter(insight => {
    const matchesSearch = insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         insight.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || insight.category === filterCategory;
    const matchesType = filterType === 'all' || insight.type === filterType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const selectedInsightData = mlInsights.find(i => i.id === selectedInsight);

  const totalInsights = mlInsights.length;
  const newInsights = mlInsights.filter(i => i.status === 'new').length;
  const criticalInsights = mlInsights.filter(i => i.severity === 'critical').length;
  const implementedInsights = mlInsights.filter(i => i.status === 'implemented').length;
  const avgConfidence = Math.round(
    mlInsights.reduce((acc, i) => acc + i.confidence, 0) / totalInsights
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ML Insights</h1>
          <p className="text-muted-foreground">
            AI-generated insights and recommendations for business optimization
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Insights
          </Button>
          <Button>
            <Lightbulb className="w-4 h-4 mr-2" />
            Generate Insights
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Insights</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInsights}</div>
            <p className="text-xs text-muted-foreground">
              AI-generated insights
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Insights</CardTitle>
            <Lightbulb className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{newInsights}</div>
            <p className="text-xs text-muted-foreground">
              awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalInsights}</div>
            <p className="text-xs text-muted-foreground">
              require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
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
      {criticalInsights > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{criticalInsights} critical insights</strong> require immediate attention. 
            Review and take action on high-priority recommendations.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">ML-Generated Insights</h3>
              <p className="text-sm text-muted-foreground">
                Review and act on AI-powered business insights
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search insights..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-md text-sm w-64"
                />
              </div>
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Categories</option>
                <option value="business">Business</option>
                <option value="customer">Customer</option>
                <option value="operational">Operational</option>
                <option value="financial">Financial</option>
                <option value="product">Product</option>
                <option value="marketing">Marketing</option>
              </select>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Types</option>
                <option value="opportunity">Opportunity</option>
                <option value="risk">Risk</option>
                <option value="trend">Trend</option>
                <option value="anomaly">Anomaly</option>
                <option value="recommendation">Recommendation</option>
                <option value="prediction">Prediction</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Insights List */}
            <div className="space-y-4">
              {filteredInsights.map((insight) => (
                <Card 
                  key={insight.id}
                  className={`cursor-pointer transition-colors ${
                    selectedInsight === insight.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedInsight(insight.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getTypeColor(insight.type)}`}>
                          {insight.type === 'opportunity' ? <Target className="w-4 h-4" /> :
                           insight.type === 'risk' ? <AlertTriangle className="w-4 h-4" /> :
                           insight.type === 'trend' ? <TrendingUp className="w-4 h-4" /> :
                           insight.type === 'anomaly' ? <Zap className="w-4 h-4" /> :
                           insight.type === 'recommendation' ? <Lightbulb className="w-4 h-4" /> :
                           <Brain className="w-4 h-4" />}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{insight.title}</CardTitle>
                          <CardDescription>{insight.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(insight.severity)}>
                          {insight.severity}
                        </Badge>
                        <Badge className={getStatusColor(insight.status)}>
                          {insight.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Confidence:</span>
                        <p className="font-medium">{insight.confidence}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Impact:</span>
                        <Badge className={getSeverityColor(insight.impact)}>
                          {insight.impact}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Source:</span>
                        <p className="font-medium">{insight.source}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Generated:</span>
                        <p className="font-medium">{insight.generatedAt}</p>
                      </div>
                    </div>

                    {insight.feedback && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3 h-3 ${
                                i < insight.feedback!.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                              }`} 
                            />
                          ))}
                        </div>
                        <span className="text-muted-foreground">
                          {insight.feedback.useful ? 'Helpful' : 'Not helpful'}
                        </span>
                      </div>
                    )}

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

            {/* Insight Details */}
            <div>
              {selectedInsightData ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {selectedInsightData.title}
                      <Button variant="outline" size="sm" onClick={() => setSelectedInsight(null)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                    </CardTitle>
                    <CardDescription>{selectedInsightData.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Insight Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <Badge className={getTypeColor(selectedInsightData.type)}>
                              {selectedInsightData.type}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Category:</span>
                            <Badge className={getCategoryColor(selectedInsightData.category)}>
                              {selectedInsightData.category}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Severity:</span>
                            <Badge className={getSeverityColor(selectedInsightData.severity)}>
                              {selectedInsightData.severity}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge className={getStatusColor(selectedInsightData.status)}>
                              {selectedInsightData.status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Metrics</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Confidence:</span>
                            <span className="font-medium">{selectedInsightData.confidence}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Impact:</span>
                            <Badge className={getSeverityColor(selectedInsightData.impact)}>
                              {selectedInsightData.impact}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Priority:</span>
                            <span className="font-medium">P{selectedInsightData.priority}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Model:</span>
                            <span className="font-medium">{selectedInsightData.model}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Key Metrics</h4>
                      <div className="space-y-2">
                        {selectedInsightData.data.metrics.map((metric, index) => (
                          <div key={index} className="flex justify-between items-center p-2 border rounded">
                            <div>
                              <span className="font-medium text-sm">{metric.name}</span>
                              <div className="text-xs text-muted-foreground">
                                Baseline: {metric.baseline}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                {metric.value.toLocaleString()}
                              </div>
                              <div className={`text-xs ${
                                metric.change > 0 ? 'text-green-600' : 
                                metric.change < 0 ? 'text-red-600' : 
                                'text-gray-600'
                              }`}>
                                {metric.change > 0 ? '+' : ''}{metric.change}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Identified Patterns</h4>
                      <ul className="space-y-1">
                        {selectedInsightData.data.patterns.map((pattern, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            {pattern}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Recommendations</h4>
                      <div className="space-y-2">
                        {selectedInsightData.recommendations.map((rec) => (
                          <div key={rec.id} className="p-3 border rounded">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">{rec.title}</span>
                              <div className="flex gap-1">
                                <Badge variant="outline" className="text-xs">
                                  {rec.effort} effort
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {rec.impact} impact
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                            <div className="flex justify-between items-center text-xs">
                              <span>Timeline: {rec.timeline}</span>
                              <Badge className={rec.status === 'completed' ? 'bg-green-50 text-green-600' :
                                             rec.status === 'in-progress' ? 'bg-blue-50 text-blue-600' :
                                             'bg-gray-50 text-gray-600'}>
                                {rec.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm">
                        Take Action
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Provide Feedback
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export
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
                        Select an insight to view details
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Detected Patterns</h3>
              <p className="text-sm text-muted-foreground">
                Recurring patterns identified by ML models
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Analyze New Patterns
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insightPatterns.map((pattern) => (
              <Card key={pattern.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{pattern.name}</CardTitle>
                  <CardDescription>{pattern.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Frequency:</span>
                      <p className="font-medium">{pattern.frequency}/month</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Confidence:</span>
                      <p className="font-medium">{pattern.confidence}%</p>
                    </div>
                  </div>

                  <div>
                    <Badge className={getCategoryColor(pattern.category)}>
                      {pattern.category}
                    </Badge>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-sm">Business Value:</span>
                    <p className="text-sm mt-1">{pattern.businessValue}</p>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-sm">Examples:</span>
                    <ul className="mt-1 space-y-1">
                      {pattern.examples.slice(0, 2).map((example, index) => (
                        <li key={index} className="text-xs">• {example}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <BarChart3 className="w-4 h-4 mr-1" />
                      Analyze
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">All Recommendations</h3>
              <p className="text-sm text-muted-foreground">
                Track and manage all AI-generated recommendations
              </p>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted">
                    <tr>
                      <th className="text-left p-4 font-medium">Recommendation</th>
                      <th className="text-left p-4 font-medium">Insight</th>
                      <th className="text-left p-4 font-medium">Effort</th>
                      <th className="text-left p-4 font-medium">Impact</th>
                      <th className="text-left p-4 font-medium">Timeline</th>
                      <th className="text-left p-4 font-medium">Owner</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mlInsights.flatMap(insight => 
                      insight.recommendations.map(rec => (
                        <tr key={`${insight.id}-${rec.id}`} className="border-b hover:bg-muted">
                          <td className="p-4">
                            <div>
                              <div className="font-medium text-sm">{rec.title}</div>
                              <div className="text-xs text-muted-foreground">{rec.description}</div>
                            </div>
                          </td>
                          <td className="p-4 text-sm">{insight.title}</td>
                          <td className="p-4">
                            <Badge variant="outline" className="capitalize">
                              {rec.effort}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className="capitalize">
                              {rec.impact}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm">{rec.timeline}</td>
                          <td className="p-4 text-sm">{rec.owner || 'Unassigned'}</td>
                          <td className="p-4">
                            <Badge className={rec.status === 'completed' ? 'bg-green-50 text-green-600' :
                                           rec.status === 'in-progress' ? 'bg-blue-50 text-blue-600' :
                                           'bg-gray-50 text-gray-600'}>
                              {rec.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                Assign
                              </Button>
                              <Button size="sm" variant="outline">
                                Update
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Insight Feedback</h3>
              <p className="text-sm text-muted-foreground">
                Review user feedback on ML-generated insights
              </p>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Feedback
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Feedback Summary</CardTitle>
                <CardDescription>
                  Overall feedback metrics and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Average Rating</span>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${
                              i < 4 ? 'text-yellow-500 fill-current' : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="font-medium">4.2</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Useful Insights</span>
                    <span className="font-medium">78%</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Total Feedback</span>
                    <span className="font-medium">156</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Feedback</CardTitle>
                <CardDescription>
                  Latest user feedback on insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mlInsights.filter(i => i.feedback).map((insight) => (
                    <div key={insight.id} className="p-3 border rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{insight.title}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3 h-3 ${
                                i < insight.feedback!.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                              }`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{insight.feedback!.comment}</p>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>{insight.feedback!.submittedBy}</span>
                        <span>{insight.feedback!.submittedAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MLInsightsPage;
