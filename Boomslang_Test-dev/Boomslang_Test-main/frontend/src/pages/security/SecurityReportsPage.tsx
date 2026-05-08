import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  FileText, 
  Download, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Shield,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Users,
  Globe,
  Eye,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { securityApi } from '../../api/securityApi';

interface SecurityReport {
  id: string;
  name: string;
  type: 'SECURITY_OVERVIEW' | 'INCIDENT_SUMMARY' | 'COMPLIANCE_STATUS' | 'RISK_ASSESSMENT' | 'THREAT_INTELLIGENCE' | 'VULNERABILITY_SCAN' | 'AUDIT_TRAIL';
  description: string;
  generatedAt: Date;
  generatedBy: string;
  period: {
    startDate: Date;
    endDate: Date;
    type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  };
  status: 'GENERATING' | 'COMPLETED' | 'FAILED';
  fileSize: string;
  downloadUrl?: string;
  metrics: {
    totalEvents: number;
    criticalIncidents: number;
    resolvedIncidents: number;
    riskScore: number;
    complianceScore: number;
  };
}

const SecurityReportsPage: React.FC = () => {
  const [reports, setReports] = useState<SecurityReport[]>([]);
        type: 'WEEKLY'
      },
      status: 'COMPLETED',
      fileSize: '856 KB',
      downloadUrl: '/api/reports/download/2',
      metrics: {
        totalEvents: 3840,
        criticalIncidents: 1,
        resolvedIncidents: 4,
        riskScore: 82.1,
        complianceScore: 94.5
      }
    },
    {
      id: '3',
      name: 'Q1 2024 Compliance Status',
      type: 'COMPLIANCE_STATUS',
      description: 'Compliance assessment for SOC 2, ISO 27001, and GDPR frameworks',
      generatedAt: new Date('2024-01-15T14:30:00'),
      generatedBy: 'compliance@company.com',
      period: {
        startDate: new Date('2024-01-01T00:00:00'),
        endDate: new Date('2024-03-31T23:59:59'),
        type: 'QUARTERLY'
      },
      status: 'COMPLETED',
      fileSize: '3.1 MB',
      downloadUrl: '/api/reports/download/3',
      metrics: {
        totalEvents: 0,
        criticalIncidents: 0,
        resolvedIncidents: 0,
        riskScore: 0,
        complianceScore: 88.7
      }
    },
    {
      id: '4',
      name: 'Threat Intelligence Report',
      type: 'THREAT_INTELLIGENCE',
      description: 'Latest threat landscape analysis and emerging vulnerabilities',
      generatedAt: new Date('2024-01-20T09:15:00'),
      generatedBy: 'threat-intel@company.com',
      period: {
        startDate: new Date('2024-01-14T00:00:00'),
        endDate: new Date('2024-01-20T23:59:59'),
        type: 'WEEKLY'
      },
      status: 'COMPLETED',
      fileSize: '1.2 MB',
      downloadUrl: '/api/reports/download/4',
      metrics: {
        totalEvents: 156,
        criticalIncidents: 2,
        resolvedIncidents: 8,
        riskScore: 71.3,
        complianceScore: 0
      }
    },
    {
      id: '5',
      name: 'Vulnerability Scan Results',
      type: 'VULNERABILITY_SCAN',
      description: 'Automated vulnerability assessment of infrastructure and applications',
      generatedAt: new Date('2024-01-25T16:45:00'),
      generatedBy: 'system',
      period: {
        startDate: new Date('2024-01-25T00:00:00'),
        endDate: new Date('2024-01-25T23:59:59'),
        type: 'DAILY'
      },
      status: 'GENERATING',
      fileSize: '0 KB',
      metrics: {
        totalEvents: 0,
        criticalIncidents: 0,
        resolvedIncidents: 0,
        riskScore: 0,
        complianceScore: 0
      }
    }
  ]);

  const [selectedReport, setSelectedReport] = useState<SecurityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('reports');

  const handleGenerateReport = async (type: string) => {
    setLoading(true);
    try {
      // Use real securityApi to generate report
      const newReport = await securityApi.generateReport(type as any);

      setReports([newReport, ...reports]);
      toast.success('Report generation started');
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (report: SecurityReport) => {
    if (!report.downloadUrl) {
      toast.error('Report download not available');
      return;
    }

    setLoading(true);
    try {
      // Simulate download
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.error('Failed to download report');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    setLoading(true);
    try {
      // Use real securityApi to delete report
      await securityApi.deleteReport(reportId);
      
      setReports(reports.filter(r => r.id !== reportId));
      toast.success('Report deleted successfully');
    } catch (error) {
      console.error('Failed to delete report:', error);
      toast.error('Failed to delete report');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SECURITY_OVERVIEW': return <Shield className="h-5 w-5" />;
      case 'INCIDENT_SUMMARY': return <AlertTriangle className="h-5 w-5" />;
      case 'COMPLIANCE_STATUS': return <CheckCircle className="h-5 w-5" />;
      case 'RISK_ASSESSMENT': return <TrendingUp className="h-5 w-5" />;
      case 'THREAT_INTELLIGENCE': return <Activity className="h-5 w-5" />;
      case 'VULNERABILITY_SCAN': return <Eye className="h-5 w-5" />;
      case 'AUDIT_TRAIL': return <FileText className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SECURITY_OVERVIEW': return 'bg-blue-100 text-blue-800';
      case 'INCIDENT_SUMMARY': return 'bg-red-100 text-red-800';
      case 'COMPLIANCE_STATUS': return 'bg-green-100 text-green-800';
      case 'RISK_ASSESSMENT': return 'bg-orange-100 text-orange-800';
      case 'THREAT_INTELLIGENCE': return 'bg-purple-100 text-purple-800';
      case 'VULNERABILITY_SCAN': return 'bg-yellow-100 text-yellow-800';
      case 'AUDIT_TRAIL': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'GENERATING': return 'bg-blue-100 text-blue-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const completedReports = reports.filter(r => r.status === 'COMPLETED');
  const generatingReports = reports.filter(r => r.status === 'GENERATING');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security Reports</h1>
          <p className="text-gray-600">Generate and download comprehensive security reports</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reports.length}</p>
                <p className="text-sm text-gray-600">Total Reports</p>
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
                <p className="text-2xl font-bold">{completedReports.length}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{generatingReports.length}</p>
                <p className="text-sm text-gray-600">Generating</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {completedReports.length > 0 
                    ? (completedReports.reduce((sum, r) => sum + r.metrics.riskScore, 0) / completedReports.length).toFixed(1)
                    : '0'
                  }%
                </p>
                <p className="text-sm text-gray-600">Avg Risk Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="generate">Generate Report</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No security reports available</p>
                  <p className="text-sm">Generate your first security report to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map(report => (
                    <div key={report.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            report.status === 'COMPLETED' ? 'bg-green-100' : 
                            report.status === 'GENERATING' ? 'bg-blue-100' : 'bg-red-100'
                          }`}>
                            {getTypeIcon(report.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold">{report.name}</h3>
                              <Badge className={getTypeColor(report.type)}>
                                {report.type.replace(/_/g, ' ')}
                              </Badge>
                              <Badge className={getStatusColor(report.status)}>
                                {report.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{report.generatedAt.toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="h-3 w-3" />
                                <span>{report.generatedBy}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <FileText className="h-3 w-3" />
                                <span>{report.fileSize}</span>
                              </div>
                            </div>
                            {report.status === 'COMPLETED' && report.metrics.totalEvents > 0 && (
                              <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
                                <div className="text-center">
                                  <p className="font-medium">{report.metrics.totalEvents.toLocaleString()}</p>
                                  <p className="text-gray-500">Events</p>
                                </div>
                                <div className="text-center">
                                  <p className="font-medium text-red-600">{report.metrics.criticalIncidents}</p>
                                  <p className="text-gray-500">Critical</p>
                                </div>
                                <div className="text-center">
                                  <p className="font-medium text-green-600">{report.metrics.resolvedIncidents}</p>
                                  <p className="text-gray-500">Resolved</p>
                                </div>
                                <div className="text-center">
                                  <p className="font-medium">{report.metrics.riskScore}%</p>
                                  <p className="text-gray-500">Risk Score</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {report.status === 'COMPLETED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadReport(report)}
                              disabled={loading}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteReport(report.id)}
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Security Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex-col"
                  onClick={() => handleGenerateReport('SECURITY_OVERVIEW')}
                  disabled={loading}
                >
                  <Shield className="h-6 w-6 mb-2" />
                  <span>Security Overview</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col"
                  onClick={() => handleGenerateReport('INCIDENT_SUMMARY')}
                  disabled={loading}
                >
                  <AlertTriangle className="h-6 w-6 mb-2" />
                  <span>Incident Summary</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col"
                  onClick={() => handleGenerateReport('COMPLIANCE_STATUS')}
                  disabled={loading}
                >
                  <CheckCircle className="h-6 w-6 mb-2" />
                  <span>Compliance Status</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col"
                  onClick={() => handleGenerateReport('RISK_ASSESSMENT')}
                  disabled={loading}
                >
                  <TrendingUp className="h-6 w-6 mb-2" />
                  <span>Risk Assessment</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col"
                  onClick={() => handleGenerateReport('THREAT_INTELLIGENCE')}
                  disabled={loading}
                >
                  <Activity className="h-6 w-6 mb-2" />
                  <span>Threat Intelligence</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col"
                  onClick={() => handleGenerateReport('VULNERABILITY_SCAN')}
                  disabled={loading}
                >
                  <Eye className="h-6 w-6 mb-2" />
                  <span>Vulnerability Scan</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col"
                  onClick={() => handleGenerateReport('AUDIT_TRAIL')}
                  disabled={loading}
                >
                  <FileText className="h-6 w-6 mb-2" />
                  <span>Audit Trail</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Report Generation Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">This Month</span>
                    <span className="font-medium">12 reports</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Month</span>
                    <span className="font-medium">8 reports</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Growth</span>
                    <span className="font-medium text-green-600">+50%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5" />
                  <span>Report Types Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Security Overview</span>
                    <span className="font-medium">35%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Incident Summary</span>
                    <span className="font-medium">25%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Compliance Status</span>
                    <span className="font-medium">20%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Others</span>
                    <span className="font-medium">20%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityReportsPage;
