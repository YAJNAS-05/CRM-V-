import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { 
  Users, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Star,
  Target,
  Calendar,
  DollarSign,
  Activity,
  Phone,
  Mail,
  Video,
  Filter,
  Search,
  RefreshCw,
  Download,
  Eye,
  Plus,
  BarChart3,
  PieChart,
  LineChart,
  Award,
  Heart,
  Zap,
  Shield,
  Building
} from 'lucide-react';
import { Customer, CustomerSegment, CustomerTier, CustomerStatus, ChurnRisk, CustomerHealthScore } from '@/types/customerSuccess';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const CustomerDashboardPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: '1',
      name: 'Acme Corporation',
      email: 'success@acme.com',
      phone: '+1-555-0123',
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
          { name: 'Product Usage', weight: 30, score: 90, impact: 'HIGH', description: 'Strong adoption across all modules' },
          { name: 'Support Tickets', weight: 20, score: 75, impact: 'MEDIUM', description: 'Low volume of support requests' },
          { name: 'Engagement', weight: 25, score: 88, impact: 'HIGH', description: 'Regular participation in webinars and training' },
          { name: 'Satisfaction', weight: 25, score: 87, impact: 'HIGH', description: 'Positive NPS and CSAT scores' }
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
      phone: '+1-555-0456',
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
          { name: 'Product Usage', weight: 30, score: 70, impact: 'HIGH', description: 'Declining usage in key modules' },
          { name: 'Support Tickets', weight: 20, score: 45, impact: 'HIGH', description: 'Increased support volume' },
          { name: 'Engagement', weight: 25, score: 60, impact: 'MEDIUM', description: 'Missed recent training sessions' },
          { name: 'Satisfaction', weight: 25, score: 85, impact: 'LOW', description: 'Still satisfied with product' }
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
      phone: '+1-555-0789',
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
          { name: 'Product Usage', weight: 30, score: 85, impact: 'HIGH', description: 'Good adoption of core features' },
          { name: 'Support Tickets', weight: 20, score: 80, impact: 'MEDIUM', description: 'Moderate support needs' },
          { name: 'Engagement', weight: 25, score: 75, impact: 'MEDIUM', description: 'Participates in community forums' },
          { name: 'Satisfaction', weight: 25, score: 72, impact: 'MEDIUM', description: 'Generally satisfied, room for improvement' }
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
    },
    {
      id: '4',
      name: 'Government Agency',
      email: 'procurement@gov.agency',
      phone: '+1-555-0321',
      company: 'Government Agency',
      industry: 'Government',
      segment: 'GOVERNMENT',
      tier: 'PLATINUM',
      status: 'ACTIVE',
      accountManager: 'Emily Davis',
      healthScore: {
        overall: 92,
        productUsage: 95,
        supportTickets: 90,
        engagement: 93,
        satisfaction: 90,
        lastUpdated: new Date('2024-01-20T12:00:00'),
        trend: {
          direction: 'IMPROVING',
          change: 3.7,
          period: '30d'
        },
        factors: [
          { name: 'Product Usage', weight: 30, score: 95, impact: 'HIGH', description: 'Excellent adoption across all departments' },
          { name: 'Support Tickets', weight: 20, score: 90, impact: 'MEDIUM', description: 'Very low support requirements' },
          { name: 'Engagement', weight: 25, score: 93, impact: 'HIGH', description: 'Highly engaged in strategic planning' },
          { name: 'Satisfaction', weight: 25, score: 90, impact: 'HIGH', description: 'Excellent satisfaction scores' }
        ]
      },
      satisfactionScore: 4.8,
      npsScore: 85,
      churnRisk: 'LOW',
      lifetimeValue: 500000,
      contractValue: 100000,
      startDate: new Date('2022-09-01T00:00:00'),
      renewalDate: new Date('2024-09-01T00:00:00'),
      lastActivity: new Date('2024-01-20T11:00:00'),
      nextTouchpoint: new Date('2024-01-26T09:00:00'),
      tags: ['government', 'public-sector', 'strategic'],
      customFields: {},
      metadata: {
        source: 'PARTNER',
        region: 'North America',
        timezone: 'EST',
        language: 'English',
        createdAt: new Date('2022-09-01T00:00:00'),
        updatedAt: new Date('2024-01-20T12:00:00'),
        createdBy: 'emily.davis',
        updatedBy: 'emily.davis'
      }
    }
  ]);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSegment, setFilterSegment] = useState<CustomerSegment | 'ALL'>('ALL');
  const [filterTier, setFilterTier] = useState<CustomerTier | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<CustomerStatus | 'ALL'>('ALL');
  const [filterRisk, setFilterRisk] = useState<ChurnRisk | 'ALL'>('ALL');

  const handleRefreshCustomers = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Customer data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh customer data');
    } finally {
      setLoading(false);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getChurnRiskColor = (risk: ChurnRisk) => {
    switch (risk) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: CustomerStatus) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'AT_RISK': return 'bg-orange-100 text-orange-800';
      case 'CHURNED': return 'bg-red-100 text-red-800';
      case 'DORMANT': return 'bg-gray-100 text-gray-800';
      case 'TRIAL': return 'bg-blue-100 text-blue-800';
      case 'ONBOARDING': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierIcon = (tier: CustomerTier) => {
    switch (tier) {
      case 'PLATINUM': return <Award className="h-4 w-4 text-purple-600" />;
      case 'GOLD': return <Star className="h-4 w-4 text-yellow-600" />;
      case 'SILVER': return <Shield className="h-4 w-4 text-gray-600" />;
      case 'BRONZE': return <Target className="h-4 w-4 text-orange-600" />;
      default: return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'IMPROVING': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'DECLINING': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.accountManager.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSegment = filterSegment === 'ALL' || customer.segment === filterSegment;
    const matchesTier = filterTier === 'ALL' || customer.tier === filterTier;
    const matchesStatus = filterStatus === 'ALL' || customer.status === filterStatus;
    const matchesRisk = filterRisk === 'ALL' || customer.churnRisk === filterRisk;
    
    return matchesSearch && matchesSegment && matchesTier && matchesStatus && matchesRisk;
  });

  const activeCustomers = customers.filter(c => c.status === 'ACTIVE');
  const atRiskCustomers = customers.filter(c => c.status === 'AT_RISK');
  const highRiskCustomers = customers.filter(c => c.churnRisk === 'HIGH' || c.churnRisk === 'CRITICAL');
  const totalContractValue = customers.reduce((sum, c) => sum + c.contractValue, 0);
  const averageHealthScore = customers.reduce((sum, c) => sum + c.healthScore.overall, 0) / customers.length;
  const averageNPS = customers.reduce((sum, c) => sum + c.npsScore, 0) / customers.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Success Dashboard</h1>
          <p className="text-gray-600">Monitor customer health, satisfaction, and engagement</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleRefreshCustomers} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{customers.length}</p>
                <p className="text-sm text-gray-600">Total Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Heart className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{averageHealthScore.toFixed(0)}</p>
                <p className="text-sm text-gray-600">Avg Health Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Star className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{averageNPS.toFixed(0)}</p>
                <p className="text-sm text-gray-600">Avg NPS Score</p>
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
                <p className="text-2xl font-bold">{highRiskCustomers.length}</p>
                <p className="text-sm text-gray-600">High Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">${(totalContractValue / 1000).toFixed(0)}K</p>
                <p className="text-sm text-gray-600">Total Contract Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* At Risk Customers Banner */}
      {highRiskCustomers.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-orange-800">
                ATTENTION: {highRiskCustomers.length} customer(s) at high risk of churn
              </span>
            </div>
            <Button variant="outline" size="sm" className="border-orange-300 text-orange-800">
              View Risk Mitigation Plan
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
                placeholder="Search customers by name, company, email, or account manager..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={filterSegment}
                onChange={(e) => setFilterSegment(e.target.value as any)}
              >
                <option value="ALL">All Segments</option>
                <option value="ENTERPRISE">Enterprise</option>
                <option value="MID_MARKET">Mid Market</option>
                <option value="SMALL_BUSINESS">Small Business</option>
                <option value="STARTUP">Startup</option>
                <option value="GOVERNMENT">Government</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value as any)}
              >
                <option value="ALL">All Tiers</option>
                <option value="PLATINUM">Platinum</option>
                <option value="GOLD">Gold</option>
                <option value="SILVER">Silver</option>
                <option value="BRONZE">Bronze</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="AT_RISK">At Risk</option>
                <option value="CHURNED">Churned</option>
                <option value="DORMANT">Dormant</option>
                <option value="TRIAL">Trial</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value as any)}
              >
                <option value="ALL">All Risk Levels</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Overview Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="health-scores">Health Scores</TabsTrigger>
          <TabsTrigger value="risk-analysis">Risk Analysis</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCustomers.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No customers found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            ) : (
              filteredCustomers.map(customer => (
                <Card key={customer.id} className={
                  customer.status === 'AT_RISK' ? 'border-orange-200' : 
                  customer.status === 'CHURNED' ? 'border-red-200' : ''
                }>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getHealthScoreBgColor(customer.healthScore.overall)}`}>
                          <Building className={`h-5 w-5 ${getHealthScoreColor(customer.healthScore.overall)}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                          <p className="text-sm text-gray-600">{customer.industry} • {customer.segment}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge className={getStatusColor(customer.status)}>
                              {customer.status}
                            </Badge>
                            <Badge className={getChurnRiskColor(customer.churnRisk)}>
                              {customer.churnRisk} Risk
                            </Badge>
                            <div className="flex items-center space-x-1">
                              {getTierIcon(customer.tier)}
                              <span className="text-sm text-gray-600">{customer.tier}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Health Score */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Health Score</span>
                        <div className="flex items-center space-x-1">
                          <span className={`text-sm font-bold ${getHealthScoreColor(customer.healthScore.overall)}`}>
                            {customer.healthScore.overall}
                          </span>
                          {getTrendIcon(customer.healthScore.trend.direction)}
                        </div>
                      </div>
                      <Progress value={customer.healthScore.overall} className="h-2" />
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold">{customer.satisfactionScore.toFixed(1)}</p>
                        <p className="text-sm text-gray-600">Satisfaction</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold">{customer.npsScore}</p>
                        <p className="text-sm text-gray-600">NPS</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold">${(customer.contractValue / 1000).toFixed(0)}K</p>
                        <p className="text-sm text-gray-600">Contract</p>
                      </div>
                    </div>

                    {/* Account Manager & Activity */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>Account Manager: {customer.accountManager}</span>
                      <span>
                        Last activity: {formatDistanceToNow(customer.lastActivity, { addSuffix: true })}
                      </span>
                    </div>

                    {/* Next Touchpoint */}
                    {customer.nextTouchpoint && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">
                            Next Touchpoint: {customer.nextTouchpoint.toLocaleDateString()} at {customer.nextTouchpoint.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    )}

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
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4 mr-1" />
                        Email
                      </Button>
                      <Button variant="outline" size="sm">
                        <Video className="h-4 w-4 mr-1" />
                        Meeting
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="health-scores" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {customers.map(customer => (
              <Card key={customer.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{customer.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`text-2xl font-bold ${getHealthScoreColor(customer.healthScore.overall)}`}>
                        {customer.healthScore.overall}
                      </span>
                      {getTrendIcon(customer.healthScore.trend.direction)}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {customer.healthScore.factors.map((factor, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{factor.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">{factor.score}</span>
                            <Badge variant="outline" className="text-xs">
                              {factor.impact}
                            </Badge>
                          </div>
                        </div>
                        <Progress value={factor.score} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">{factor.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="risk-analysis" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Critical Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customers.filter(c => c.churnRisk === 'CRITICAL').map(customer => (
                    <div key={customer.id} className="p-3 bg-red-50 rounded-lg">
                      <h4 className="font-medium text-red-800">{customer.name}</h4>
                      <p className="text-sm text-red-600">Health Score: {customer.healthScore.overall}</p>
                      <p className="text-xs text-red-500">Account Manager: {customer.accountManager}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600">High Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customers.filter(c => c.churnRisk === 'HIGH').map(customer => (
                    <div key={customer.id} className="p-3 bg-orange-50 rounded-lg">
                      <h4 className="font-medium text-orange-800">{customer.name}</h4>
                      <p className="text-sm text-orange-600">Health Score: {customer.healthScore.overall}</p>
                      <p className="text-xs text-orange-500">Account Manager: {customer.accountManager}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-yellow-600">Medium Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customers.filter(c => c.churnRisk === 'MEDIUM').map(customer => (
                    <div key={customer.id} className="p-3 bg-yellow-50 rounded-lg">
                      <h4 className="font-medium text-yellow-800">{customer.name}</h4>
                      <p className="text-sm text-yellow-600">Health Score: {customer.healthScore.overall}</p>
                      <p className="text-xs text-yellow-500">Account Manager: {customer.accountManager}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Touchpoints</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {customers
                    .filter(c => c.nextTouchpoint)
                    .sort((a, b) => (a.nextTouchpoint?.getTime() || 0) - (b.nextTouchpoint?.getTime() || 0))
                    .slice(0, 5)
                    .map(customer => (
                      <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium">{customer.name}</h4>
                          <p className="text-sm text-gray-600">{customer.accountManager}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {customer.nextTouchpoint?.toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {customer.nextTouchpoint?.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {customers
                    .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())
                    .slice(0, 5)
                    .map(customer => (
                      <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium">{customer.name}</h4>
                          <p className="text-sm text-gray-600">{customer.accountManager}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {formatDistanceToNow(customer.lastActivity, { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
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
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Company Name</Label>
                  <p className="font-medium">{selectedCustomer.name}</p>
                </div>
                <div>
                  <Label>Industry</Label>
                  <p className="font-medium">{selectedCustomer.industry}</p>
                </div>
                <div>
                  <Label>Segment</Label>
                  <p className="font-medium">{selectedCustomer.segment}</p>
                </div>
                <div>
                  <Label>Tier</Label>
                  <p className="font-medium">{selectedCustomer.tier}</p>
                </div>
                <div>
                  <Label>Account Manager</Label>
                  <p className="font-medium">{selectedCustomer.accountManager}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedCustomer.status)}>
                    {selectedCustomer.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <p className="font-medium">{selectedCustomer.email}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="font-medium">{selectedCustomer.phone || 'N/A'}</p>
                </div>
                <div>
                  <Label>Contract Value</Label>
                  <p className="font-medium">${selectedCustomer.contractValue.toLocaleString()}</p>
                </div>
                <div>
                  <Label>Lifetime Value</Label>
                  <p className="font-medium">${selectedCustomer.lifetimeValue.toLocaleString()}</p>
                </div>
                <div>
                  <Label>Start Date</Label>
                  <p className="font-medium">{selectedCustomer.startDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Renewal Date</Label>
                  <p className="font-medium">{selectedCustomer.renewalDate?.toLocaleDateString() || 'N/A'}</p>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Export Customer Profile
                </Button>
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  View Analytics
                </Button>
                <Button>
                  <Phone className="h-4 w-4 mr-1" />
                  Schedule Call
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerDashboardPage;
