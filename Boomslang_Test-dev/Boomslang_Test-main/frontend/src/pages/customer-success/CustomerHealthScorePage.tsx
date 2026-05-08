import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { 
  Heart, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Target,
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Star,
  Users,
  BarChart3,
  LineChart,
  PieChart,
  Filter,
  Search,
  RefreshCw,
  Download,
  Eye,
  Settings,
  Zap,
  Shield,
  Calendar,
  Info
} from 'lucide-react';
import { Customer, CustomerHealthScore, HealthFactor } from '@/types/customerSuccess';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const CustomerHealthScorePage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: '1',
      name: 'Acme Corporation',
      email: 'success@acme.com',
      company: 'Acme Corporation',
      industry: 'Technology',
      segment: 'ENTERPRISE',
      tier: 'PLATINUM',
      status: 'ACTIVE',
      accountManager: 'John Smith',
      healthScore: {
        overall: 85,
        productUsage: 90,
        supportTickets: 75,
        engagement: 88,
        satisfaction: 87,
        lastUpdated: new Date('2024-01-20T10:00:00'),
        trend: {
          direction: 'IMPROVING',
          change: 5.2,
          period: '30d'
        },
        factors: [
          { name: 'Product Usage', weight: 30, score: 90, impact: 'HIGH', description: 'Strong adoption across all modules with 95% user activation' },
          { name: 'Support Tickets', weight: 20, score: 75, impact: 'MEDIUM', description: 'Low volume of support requests, quick resolution times' },
          { name: 'Engagement', weight: 25, score: 88, impact: 'HIGH', description: 'Regular participation in webinars, training sessions, and community forums' },
          { name: 'Satisfaction', weight: 25, score: 87, impact: 'HIGH', description: 'Positive NPS score of 72 and CSAT of 4.5/5' }
        ]
      },
      satisfactionScore: 4.5,
      npsScore: 72,
      churnRisk: 'LOW',
      lifetimeValue: 250000,
      contractValue: 50000,
      startDate: new Date('2023-01-15T00:00:00'),
      renewalDate: new Date('2024-01-15T00:00:00'),
      lastActivity: new Date('2024-01-20T09:30:00'),
      nextTouchpoint: new Date('2024-01-25T14:00:00'),
      tags: ['enterprise', 'technology', 'high-value'],
      customFields: {},
      metadata: {
        source: 'SALES',
        campaign: 'Enterprise 2023',
        region: 'North America',
        timezone: 'EST',
        language: 'English',
        createdAt: new Date('2023-01-15T00:00:00'),
        updatedAt: new Date('2024-01-20T10:00:00'),
        createdBy: 'sales-team',
        updatedBy: 'john.smith'
      }
    },
    {
      id: '2',
      name: 'Global Manufacturing Inc',
      email: 'it@globalmfg.com',
      company: 'Global Manufacturing Inc',
      industry: 'Manufacturing',
      segment: 'MID_MARKET',
      tier: 'GOLD',
      status: 'AT_RISK',
      accountManager: 'Sarah Johnson',
      healthScore: {
        overall: 65,
        productUsage: 70,
        supportTickets: 45,
        engagement: 60,
        satisfaction: 85,
        lastUpdated: new Date('2024-01-20T11:30:00'),
        trend: {
          direction: 'DECLINING',
          change: -8.3,
          period: '30d'
        },
        factors: [
          { name: 'Product Usage', weight: 30, score: 70, impact: 'HIGH', description: 'Declining usage in key modules, only 60% of features actively used' },
          { name: 'Support Tickets', weight: 20, score: 45, impact: 'HIGH', description: 'Increased support volume with 15 tickets this month, average resolution time 48h' },
          { name: 'Engagement', weight: 25, score: 60, impact: 'MEDIUM', description: 'Missed recent training sessions, low community participation' },
          { name: 'Satisfaction', weight: 25, score: 85, impact: 'LOW', description: 'Still satisfied with product quality, but concerned about support' }
        ]
      },
      satisfactionScore: 4.2,
      npsScore: 65,
      churnRisk: 'HIGH',
      lifetimeValue: 150000,
      contractValue: 30000,
      startDate: new Date('2023-03-10T00:00:00'),
      renewalDate: new Date('2024-03-10T00:00:00'),
      lastActivity: new Date('2024-01-18T16:45:00'),
      nextTouchpoint: new Date('2024-01-22T10:00:00'),
      tags: ['manufacturing', 'mid-market', 'at-risk'],
      customFields: {},
      metadata: {
        source: 'REFERRAL',
        region: 'Europe',
        timezone: 'CET',
        language: 'English',
        createdAt: new Date('2023-03-10T00:00:00'),
        updatedAt: new Date('2024-01-20T11:30:00'),
        createdBy: 'sarah.johnson',
        updatedBy: 'sarah.johnson'
      }
    },
    {
      id: '3',
      name: 'StartupTech Solutions',
      email: 'founder@startuptech.io',
      company: 'StartupTech Solutions',
      industry: 'Software',
      segment: 'STARTUP',
      tier: 'SILVER',
      status: 'ACTIVE',
      accountManager: 'Mike Chen',
      healthScore: {
        overall: 78,
        productUsage: 85,
        supportTickets: 80,
        engagement: 75,
        satisfaction: 72,
        lastUpdated: new Date('2024-01-20T14:15:00'),
        trend: {
          direction: 'STABLE',
          change: 1.1,
          period: '30d'
        },
        factors: [
          { name: 'Product Usage', weight: 30, score: 85, impact: 'HIGH', description: 'Good adoption of core features, 80% of team actively using platform' },
          { name: 'Support Tickets', weight: 20, score: 80, impact: 'MEDIUM', description: 'Moderate support needs, average resolution time 24h' },
          { name: 'Engagement', weight: 25, score: 75, impact: 'MEDIUM', description: 'Participates in community forums, attends monthly webinars' },
          { name: 'Satisfaction', weight: 25, score: 72, impact: 'MEDIUM', description: 'Generally satisfied, NPS of 58, room for improvement' }
        ]
      },
      satisfactionScore: 3.8,
      npsScore: 58,
      churnRisk: 'MEDIUM',
      lifetimeValue: 75000,
      contractValue: 15000,
      startDate: new Date('2023-06-01T00:00:00'),
      renewalDate: new Date('2024-06-01T00:00:00'),
      lastActivity: new Date('2024-01-19T13:20:00'),
      nextTouchpoint: new Date('2024-01-24T15:30:00'),
      tags: ['startup', 'software', 'growth'],
      customFields: {},
      metadata: {
        source: 'WEBSITE',
        campaign: 'Startup Program',
        region: 'Asia Pacific',
        timezone: 'PST',
        language: 'English',
        createdAt: new Date('2023-06-01T00:00:00'),
        updatedAt: new Date('2024-01-20T14:15:00'),
        createdBy: 'mike.chen',
        updatedBy: 'mike.chen'
      }
    }
  ]);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [settingsDialog, setSettingsDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterScore, setFilterScore] = useState<'ALL' | 'HEALTHY' | 'AT_RISK' | 'CRITICAL'>('ALL');
  const [filterTrend, setFilterTrend] = useState<'ALL' | 'IMPROVING' | 'DECLINING' | 'STABLE'>('ALL');

  const [healthScoreSettings, setHealthScoreSettings] = useState({
    productUsageWeight: 30,
    supportTicketsWeight: 20,
    engagementWeight: 25,
    satisfactionWeight: 25,
    healthyThreshold: 80,
    atRiskThreshold: 60,
    criticalThreshold: 40
  });

  const handleRefreshScores = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Health scores refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh health scores');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSettingsDialog(false);
      toast.success('Health score settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= healthScoreSettings.healthyThreshold) return 'text-green-600';
    if (score >= healthScoreSettings.atRiskThreshold) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreBgColor = (score: number) => {
    if (score >= healthScoreSettings.healthyThreshold) return 'bg-green-100';
    if (score >= healthScoreSettings.atRiskThreshold) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getHealthCategory = (score: number) => {
    if (score >= healthScoreSettings.healthyThreshold) return 'HEALTHY';
    if (score >= healthScoreSettings.atRiskThreshold) return 'AT_RISK';
    return 'CRITICAL';
  };

  const getHealthCategoryColor = (category: string) => {
    switch (category) {
      case 'HEALTHY': return 'bg-green-100 text-green-800';
      case 'AT_RISK': return 'bg-yellow-100 text-yellow-800';
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'IMPROVING': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'DECLINING': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'HIGH': return 'text-red-600';
      case 'MEDIUM': return 'text-yellow-600';
      case 'LOW': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.accountManager.toLowerCase().includes(searchQuery.toLowerCase());
    
    const healthCategory = getHealthCategory(customer.healthScore.overall);
    const matchesScore = filterScore === 'ALL' || healthCategory === filterScore;
    const matchesTrend = filterTrend === 'ALL' || customer.healthScore.trend.direction === filterTrend;
    
    return matchesSearch && matchesScore && matchesTrend;
  });

  const healthyCustomers = customers.filter(c => getHealthCategory(c.healthScore.overall) === 'HEALTHY');
  const atRiskCustomers = customers.filter(c => getHealthCategory(c.healthScore.overall) === 'AT_RISK');
  const criticalCustomers = customers.filter(c => getHealthCategory(c.healthScore.overall) === 'CRITICAL');
  const averageHealthScore = customers.reduce((sum, c) => sum + c.healthScore.overall, 0) / customers.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Health Scores</h1>
          <p className="text-gray-600">Monitor and analyze customer health metrics and trends</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleRefreshScores} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh Scores
          </Button>
          <Button variant="outline" onClick={() => setSettingsDialog(true)}>
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Health Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Heart className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{averageHealthScore.toFixed(0)}</p>
                <p className="text-sm text-gray-600">Average Health Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{healthyCustomers.length}</p>
                <p className="text-sm text-gray-600">Healthy</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{atRiskCustomers.length}</p>
                <p className="text-sm text-gray-600">At Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Target className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{criticalCustomers.length}</p>
                <p className="text-sm text-gray-600">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Customers Alert */}
      {criticalCustomers.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-800">
                CRITICAL: {criticalCustomers.length} customer(s) require immediate attention
              </span>
            </div>
            <Button variant="outline" size="sm" className="border-red-300 text-red-800">
              View Action Plan
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search customers by name, company, or account manager..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={filterScore}
                onChange={(e) => setFilterScore(e.target.value as any)}
              >
                <option value="ALL">All Health Scores</option>
                <option value="HEALTHY">Healthy (80+)</option>
                <option value="AT_RISK">At Risk (60-79)</option>
                <option value="CRITICAL">Critical (&lt;60)</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={filterTrend}
                onChange={(e) => setFilterTrend(e.target.value as any)}
              >
                <option value="ALL">All Trends</option>
                <option value="IMPROVING">Improving</option>
                <option value="DECLINING">Declining</option>
                <option value="STABLE">Stable</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Score Details */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="factors">Health Factors</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCustomers.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-gray-500">
                <Heart className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No customers found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            ) : (
              filteredCustomers.map(customer => {
                const healthCategory = getHealthCategory(customer.healthScore.overall);
                return (
                  <Card key={customer.id} className={
                    healthCategory === 'CRITICAL' ? 'border-red-200' : 
                    healthCategory === 'AT_RISK' ? 'border-yellow-200' : ''
                  }>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getHealthScoreBgColor(customer.healthScore.overall)}`}>
                            <Heart className={`h-5 w-5 ${getHealthScoreColor(customer.healthScore.overall)}`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                            <p className="text-sm text-gray-600">{customer.industry} • {customer.segment}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge className={getHealthCategoryColor(healthCategory)}>
                                {healthCategory}
                              </Badge>
                              <div className="flex items-center space-x-1">
                                {getTrendIcon(customer.healthScore.trend.direction)}
                                <span className="text-sm text-gray-600">
                                  {customer.healthScore.trend.change > 0 ? '+' : ''}{customer.healthScore.trend.change}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Overall Health Score */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Overall Health Score</span>
                          <div className="flex items-center space-x-2">
                            <span className={`text-lg font-bold ${getHealthScoreColor(customer.healthScore.overall)}`}>
                              {customer.healthScore.overall}
                            </span>
                            {getTrendIcon(customer.healthScore.trend.direction)}
                          </div>
                        </div>
                        <Progress value={customer.healthScore.overall} className="h-3" />
                      </div>

                      {/* Component Scores */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">Product Usage</span>
                            <span className="text-xs font-bold">{customer.healthScore.productUsage}</span>
                          </div>
                          <Progress value={customer.healthScore.productUsage} className="h-1" />
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">Support Tickets</span>
                            <span className="text-xs font-bold">{customer.healthScore.supportTickets}</span>
                          </div>
                          <Progress value={customer.healthScore.supportTickets} className="h-1" />
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">Engagement</span>
                            <span className="text-xs font-bold">{customer.healthScore.engagement}</span>
                          </div>
                          <Progress value={customer.healthScore.engagement} className="h-1" />
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">Satisfaction</span>
                            <span className="text-xs font-bold">{customer.healthScore.satisfaction}</span>
                          </div>
                          <Progress value={customer.healthScore.satisfaction} className="h-1" />
                        </div>
                      </div>

                      {/* Last Updated */}
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <span>Account Manager: {customer.accountManager}</span>
                        <span>
                          Updated: {formatDistanceToNow(customer.healthScore.lastUpdated, { addSuffix: true })}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setDetailsDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <BarChart3 className="h-4 w-4 mr-1" />
                          Analytics
                        </Button>
                        {healthCategory !== 'HEALTHY' && (
                          <Button variant="outline" size="sm">
                            <Target className="h-4 w-4 mr-1" />
                            Action Plan
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="factors" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {customers.map(customer => (
              <Card key={customer.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{customer.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-lg font-bold ${getHealthScoreColor(customer.healthScore.overall)}`}>
                        {customer.healthScore.overall}
                      </span>
                      {getTrendIcon(customer.healthScore.trend.direction)}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {customer.healthScore.factors.map((factor, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{factor.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {factor.weight}%
                            </Badge>
                            <span className={`text-xs font-medium ${getImpactColor(factor.impact)}`}>
                              {factor.impact}
                            </span>
                          </div>
                          <span className="text-sm font-bold">{factor.score}</span>
                        </div>
                        <Progress value={factor.score} className="h-2" />
                        <p className="text-xs text-gray-600 mt-1">{factor.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Improving</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {customers
                    .filter(c => c.healthScore.trend.direction === 'IMPROVING')
                    .map(customer => (
                      <div key={customer.id} className="p-3 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-800">{customer.name}</h4>
                        <p className="text-sm text-green-600">
                          +{customer.healthScore.trend.change}% ({customer.healthScore.overall})
                        </p>
                        <p className="text-xs text-green-500">{customer.accountManager}</p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  <span>Declining</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {customers
                    .filter(c => c.healthScore.trend.direction === 'DECLINING')
                    .map(customer => (
                      <div key={customer.id} className="p-3 bg-red-50 rounded-lg">
                        <h4 className="font-medium text-red-800">{customer.name}</h4>
                        <p className="text-sm text-red-600">
                          {customer.healthScore.trend.change}% ({customer.healthScore.overall})
                        </p>
                        <p className="text-xs text-red-500">{customer.accountManager}</p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-gray-600" />
                  <span>Stable</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {customers
                    .filter(c => c.healthScore.trend.direction === 'STABLE')
                    .map(customer => (
                      <div key={customer.id} className="p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-800">{customer.name}</h4>
                        <p className="text-sm text-gray-600">
                          {customer.healthScore.trend.change > 0 ? '+' : ''}{customer.healthScore.trend.change}% ({customer.healthScore.overall})
                        </p>
                        <p className="text-xs text-gray-500">{customer.accountManager}</p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Health Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Healthy (80+)</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(healthyCustomers.length / customers.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{healthyCustomers.length}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">At Risk (60-79)</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-600 h-2 rounded-full" 
                          style={{ width: `${(atRiskCustomers.length / customers.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{atRiskCustomers.length}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Critical (&lt;60)</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full" 
                          style={{ width: `${(criticalCustomers.length / customers.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{criticalCustomers.length}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Factor Impact Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Product Usage</span>
                      <span className="text-sm font-bold">30% weight</span>
                    </div>
                    <p className="text-xs text-gray-600">Highest impact factor - strong correlation with retention</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Engagement</span>
                      <span className="text-sm font-bold">25% weight</span>
                    </div>
                    <p className="text-xs text-gray-600">Key indicator of customer satisfaction and loyalty</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Satisfaction</span>
                      <span className="text-sm font-bold">25% weight</span>
                    </div>
                    <p className="text-xs text-gray-600">Direct measure of customer happiness and NPS</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Support Tickets</span>
                      <span className="text-sm font-bold">20% weight</span>
                    </div>
                    <p className="text-xs text-gray-600">Inverse relationship - fewer tickets = better health</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Customer Details Dialog */}
      <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Health Score Details</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Customer Name</Label>
                  <p className="font-medium">{selectedCustomer.name}</p>
                </div>
                <div>
                  <Label>Account Manager</Label>
                  <p className="font-medium">{selectedCustomer.accountManager}</p>
                </div>
                <div>
                  <Label>Overall Health Score</Label>
                  <div className="flex items-center space-x-2">
                    <span className={`text-lg font-bold ${getHealthScoreColor(selectedCustomer.healthScore.overall)}`}>
                      {selectedCustomer.healthScore.overall}
                    </span>
                    {getTrendIcon(selectedCustomer.healthScore.trend.direction)}
                  </div>
                </div>
                <div>
                  <Label>Health Category</Label>
                  <Badge className={getHealthCategoryColor(getHealthCategory(selectedCustomer.healthScore.overall))}>
                    {getHealthCategory(selectedCustomer.healthScore.overall)}
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Health Score Factors</Label>
                <div className="mt-2 space-y-3">
                  {selectedCustomer.healthScore.factors.map((factor, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{factor.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {factor.weight}% weight
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${getImpactColor(factor.impact)}`}>
                            {factor.impact} impact
                          </Badge>
                        </div>
                        <span className="font-bold">{factor.score}</span>
                      </div>
                      <Progress value={factor.score} className="h-2 mb-2" />
                      <p className="text-sm text-gray-600">{factor.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Export Health Report
                </Button>
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  View Detailed Analytics
                </Button>
                <Button>
                  <Target className="h-4 w-4 mr-1" />
                  Create Action Plan
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsDialog} onOpenChange={setSettingsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Health Score Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Factor Weights (must sum to 100%)</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label>Product Usage</Label>
                  <Input
                    type="number"
                    value={healthScoreSettings.productUsageWeight}
                    onChange={(e) => setHealthScoreSettings({
                      ...healthScoreSettings,
                      productUsageWeight: parseInt(e.target.value)
                    })}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Label>Support Tickets</Label>
                  <Input
                    type="number"
                    value={healthScoreSettings.supportTicketsWeight}
                    onChange={(e) => setHealthScoreSettings({
                      ...healthScoreSettings,
                      supportTicketsWeight: parseInt(e.target.value)
                    })}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Label>Engagement</Label>
                  <Input
                    type="number"
                    value={healthScoreSettings.engagementWeight}
                    onChange={(e) => setHealthScoreSettings({
                      ...healthScoreSettings,
                      engagementWeight: parseInt(e.target.value)
                    })}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Label>Satisfaction</Label>
                  <Input
                    type="number"
                    value={healthScoreSettings.satisfactionWeight}
                    onChange={(e) => setHealthScoreSettings({
                      ...healthScoreSettings,
                      satisfactionWeight: parseInt(e.target.value)
                    })}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>
            <div>
              <Label>Health Score Thresholds</Label>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div>
                  <Label>Healthy Threshold</Label>
                  <Input
                    type="number"
                    value={healthScoreSettings.healthyThreshold}
                    onChange={(e) => setHealthScoreSettings({
                      ...healthScoreSettings,
                      healthyThreshold: parseInt(e.target.value)
                    })}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Label>At Risk Threshold</Label>
                  <Input
                    type="number"
                    value={healthScoreSettings.atRiskThreshold}
                    onChange={(e) => setHealthScoreSettings({
                      ...healthScoreSettings,
                      atRiskThreshold: parseInt(e.target.value)
                    })}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Label>Critical Threshold</Label>
                  <Input
                    type="number"
                    value={healthScoreSettings.criticalThreshold}
                    onChange={(e) => setHealthScoreSettings({
                      ...healthScoreSettings,
                      criticalThreshold: parseInt(e.target.value)
                    })}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setSettingsDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateSettings} disabled={loading} className="flex-1">
                {loading ? 'Updating...' : 'Update Settings'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerHealthScorePage;
