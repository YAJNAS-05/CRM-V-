import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { 
  Shield, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Users,
  Activity,
  Eye,
  Globe,
  Lock,
  Smartphone,
  Calendar,
  BarChart3,
  PieChart,
  Download,
  RefreshCw
} from 'lucide-react';
import { SecurityMetrics, RiskFactor } from '@/types/security';
import { toast } from 'sonner';
import { securityApi } from '../../api/securityApi';

const SecurityAnalyticsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);

  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      // Use real securityApi to refresh metrics
      const metricsData = await securityApi.getSecurityMetrics();
      if (metricsData) {
        setMetrics(metricsData);
      }
      toast.success('Security analytics refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh analytics:', error);
      toast.error('Failed to refresh analytics');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Poor';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const securityTrends = [
    { metric: 'Security Score', current: 78.5, previous: 75.2, trend: 'up' },
    { metric: 'MFA Adoption', current: 73.4, previous: 68.1, trend: 'up' },
    { metric: 'Suspicious Logins', current: 12, previous: 18, trend: 'down' },
    { metric: 'Policy Violations', current: 8, previous: 15, trend: 'down' },
    { metric: 'Blocked Attempts', current: 45, previous: 52, trend: 'down' }
  ];

  const threatLandscape = [
    { type: 'Phishing Attempts', count: 23, change: -15 },
    { type: 'Malware Detection', count: 8, change: -20 },
    { type: 'Brute Force', count: 45, change: 10 },
    { type: 'Data Breach Attempts', count: 3, change: 0 },
    { type: 'Insider Threats', count: 2, change: -50 }
  ];

  const complianceStatus = [
    { framework: 'SOC 2', score: 92, status: 'COMPLIANT' },
    { framework: 'ISO 27001', score: 88, status: 'COMPLIANT' },
    { framework: 'GDPR', score: 85, status: 'COMPLIANT' },
    { framework: 'HIPAA', score: 78, status: 'PARTIALLY_COMPLIANT' },
    { framework: 'PCI DSS', score: 95, status: 'COMPLIANT' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security Analytics</h1>
          <p className="text-gray-600">Monitor security metrics, trends, and compliance status</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            className="px-3 py-2 border border-gray-300 rounded-md"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-1" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Security Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Overall Security Score</span>
            <Badge variant="outline" className={getScoreColor(metrics.securityScore)}>
              {getScoreLabel(metrics.securityScore)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-bold">{metrics.securityScore}</span>
                <span className="text-sm text-gray-600">out of 100</span>
              </div>
              <Progress value={metrics.securityScore} className="h-3" />
              <p className="text-sm text-gray-600 mt-2">
                Your security posture is {getScoreLabel(metrics.securityScore).toLowerCase()}. 
                {metrics.securityScore < 80 && ' Consider implementing the recommended improvements.'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-sm font-medium">Strong Areas</p>
                <p className="text-xs text-gray-600">MFA, Access Control</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-2">
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
                <p className="text-sm font-medium">Needs Attention</p>
                <p className="text-xs text-gray-600">Password Policy, Monitoring</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.mfaAdoptionRate}%</p>
                <p className="text-sm text-gray-600">MFA Adoption</p>
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
                <p className="text-2xl font-bold">{metrics.activeSessions}</p>
                <p className="text-sm text-gray-600">Active Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.blockedAttempts}</p>
                <p className="text-sm text-gray-600">Blocked Attempts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Security Trends</TabsTrigger>
          <TabsTrigger value="threats">Threat Landscape</TabsTrigger>
          <TabsTrigger value="risks">Risk Factors</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Security Trends</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityTrends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        trend.trend === 'up' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {trend.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{trend.metric}</p>
                        <p className="text-sm text-gray-600">
                          Previous: {trend.previous}
                          {typeof trend.current === 'number' && trend.current > 1 && '%'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {trend.current}
                        {typeof trend.current === 'number' && trend.current > 1 && '%'}
                      </p>
                      <p className={`text-sm ${
                        trend.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {trend.trend === 'up' ? '+' : ''}
                        {((trend.current - trend.previous) / trend.previous * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Threat Landscape</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {threatLandscape.map((threat, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">{threat.type}</p>
                        <p className="text-sm text-gray-600">{threat.count} attempts</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${
                        threat.change < 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {threat.change > 0 ? '+' : ''}{threat.change}%
                      </span>
                      {threat.change < 0 ? (
                        <TrendingDown className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Top Risk Factors</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.topRiskFactors.map((risk, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={getSeverityColor(risk.severity)}>
                          {risk.severity}
                        </Badge>
                        <h4 className="font-medium">{risk.type}</h4>
                      </div>
                      <span className="text-sm font-medium">{risk.count} instances</span>
                    </div>
                    <p className="text-sm text-gray-600">{risk.description}</p>
                    <div className="mt-2">
                      <Progress value={(risk.count / 50) * 100} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5" />
                <span>Compliance Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceStatus.map((compliance, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        compliance.status === 'COMPLIANT' ? 'bg-green-100' : 'bg-yellow-100'
                      }`}>
                        {compliance.status === 'COMPLIANT' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{compliance.framework}</p>
                        <p className="text-sm text-gray-600">{compliance.status.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{compliance.score}%</p>
                      <Progress value={compliance.score} className="h-2 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Security Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <h4 className="font-medium text-red-800">High Priority</h4>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Implement stronger password policies</li>
                <li>• Enable device trust verification</li>
                <li>• Enhance monitoring for anomalous logins</li>
              </ul>
            </div>
            <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <h4 className="font-medium text-yellow-800">Medium Priority</h4>
              </div>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Increase MFA adoption rate</li>
                <li>• Regular security training for users</li>
                <li>• Implement automated threat detection</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityAnalyticsPage;
