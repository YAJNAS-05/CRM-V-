import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { CheckCircle, AlertTriangle, Clock, FileText, Shield, TrendingUp, Users, Settings, Download, Upload, Eye, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { securityApi } from '../../api/securityApi';

interface ComplianceStandard {
  id: string;
  name: string;
  description: string;
  status: 'compliant' | 'non-compliant' | 'partial';
  score: number;
  lastAssessed: string;
  nextAssessment: string;
  requirements: ComplianceRequirement[];
}

interface ComplianceRequirement {
  id: string;
  name: string;
  status: 'compliant' | 'non-compliant' | 'not-applicable';
  description: string;
  evidence?: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface ComplianceReport {
  id: string;
  name: string;
  type: 'assessment' | 'audit' | 'review';
  date: string;
  status: 'draft' | 'in-progress' | 'completed';
  score: number;
  findings: number;
  recommendations: number;
}

const SecurityCompliancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStandard, setSelectedStandard] = useState<string | null>(null);
  const [complianceStandards, setComplianceStandards] = useState<ComplianceStandard[]>([]);
  const [loading, setLoading] = useState(false);

  // Load compliance standards from API on component mount
  useEffect(() => {
    const loadComplianceStandards = async () => {
      setLoading(true);
      try {
        const standardsData = await securityApi.getComplianceStandards();
        if (standardsData) {
          setComplianceStandards(standardsData);
        }
      } catch (error) {
        console.error('Failed to load compliance standards:', error);
        toast.error('Failed to load compliance standards');
      } finally {
        setLoading(false);
      }
    };
    loadComplianceStandards();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'partial':
      case 'in-progress':
        return 'text-yellow-600 bg-yellow-50';
      case 'non-compliant':
      case 'draft':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
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

  const overallComplianceScore = Math.round(
    complianceStandards.reduce((acc, std) => acc + std.score, 0) / complianceStandards.length
  );

  const selectedStandardData = complianceStandards.find(std => std.id === selectedStandard);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Compliance</h1>
          <p className="text-muted-foreground">
            Monitor and manage regulatory compliance across multiple standards
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Run Assessment
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallComplianceScore}%</div>
            <p className="text-xs text-muted-foreground">
              Across all standards
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliant Standards</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {complianceStandards.filter(s => s.status === 'compliant').length}
            </div>
            <p className="text-xs text-muted-foreground">
              of {complianceStandards.length} standards
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Findings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">27</div>
            <p className="text-xs text-muted-foreground">
              require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Assessment</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">
              days remaining
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="standards">Standards</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="remediation">Remediation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance Score by Standard */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Score by Standard</CardTitle>
                <CardDescription>
                  Current compliance status across all standards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {complianceStandards.map((standard) => (
                  <div key={standard.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{standard.name}</span>
                        <Badge className={getStatusColor(standard.status)}>
                          {standard.status}
                        </Badge>
                      </div>
                      <span className="text-sm font-medium">{standard.score}%</span>
                    </div>
                    <Progress value={standard.score} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Last: {standard.lastAssessed}</span>
                      <span>Next: {standard.nextAssessed}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Reports */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
                <CardDescription>
                  Latest compliance assessments and audits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {complianceReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{report.name}</span>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {report.date} • Score: {report.score}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {report.findings} findings • {report.recommendations} recommendations
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* High Priority Issues */}
          <Card>
            <CardHeader>
              <CardTitle>High Priority Issues</CardTitle>
              <CardDescription>
                Critical compliance items requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>SOC 2 Processing Integrity:</strong> Data processing accuracy controls need improvement. 
                  Recommended action: Implement automated data validation and reconciliation processes.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="standards" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Standards List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Standards</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {complianceStandards.map((standard) => (
                    <div
                      key={standard.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedStandard === standard.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedStandard(standard.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{standard.name}</span>
                        <Badge className={getStatusColor(standard.status)}>
                          {standard.score}%
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {standard.description}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Standard Details */}
            <div className="lg:col-span-2">
              {selectedStandardData ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {selectedStandardData.name}
                      <Badge className={getStatusColor(selectedStandardData.status)}>
                        {selectedStandardData.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {selectedStandardData.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 border rounded">
                        <div className="text-2xl font-bold text-primary">
                          {selectedStandardData.score}%
                        </div>
                        <div className="text-sm text-muted-foreground">Compliance Score</div>
                      </div>
                      <div className="text-center p-3 border rounded">
                        <div className="text-2xl font-bold">
                          {selectedStandardData.requirements.filter(r => r.status === 'compliant').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Compliant Requirements</div>
                      </div>
                      <div className="text-center p-3 border rounded">
                        <div className="text-2xl font-bold">
                          {selectedStandardData.requirements.filter(r => r.status === 'non-compliant').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Non-Compliant</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Requirements</h4>
                      <div className="space-y-3">
                        {selectedStandardData.requirements.map((requirement) => (
                          <div key={requirement.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{requirement.name}</span>
                                <Badge className={getStatusColor(requirement.status)}>
                                  {requirement.status}
                                </Badge>
                                <Badge className={getRiskColor(requirement.riskLevel)}>
                                  {requirement.riskLevel}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {requirement.description}
                            </p>
                            {requirement.evidence && (
                              <p className="text-xs bg-muted p-2 rounded">
                                <strong>Evidence:</strong> {requirement.evidence}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Select a compliance standard to view details
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Compliance Reports</h3>
              <p className="text-sm text-muted-foreground">
                Historical assessments, audits, and reviews
              </p>
            </div>
            <Button>
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {complianceReports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                    <Badge className={getStatusColor(report.status)}>
                      {report.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Date:</span>
                      <p className="font-medium">{report.date}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Score:</span>
                      <p className="font-medium">{report.score}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Findings:</span>
                      <p className="font-medium">{report.findings}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Recommendations:</span>
                      <p className="font-medium">{report.recommendations}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="remediation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Remediation Plan</CardTitle>
              <CardDescription>
                Track and manage compliance remediation activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>3 high-priority remediation items</strong> require immediate attention to maintain compliance status.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">SOC 2 Processing Integrity</span>
                        <Badge className="bg-red-50 text-red-600">Critical</Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">Due in 15 days</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Implement automated data validation and reconciliation processes to ensure processing accuracy.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm">Start Remediation</Button>
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">GDPR Data Processing Records</span>
                        <Badge className="bg-orange-50 text-orange-600">High</Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">Due in 30 days</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Update data processing records to include all lawful bases for processing activities.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm">Start Remediation</Button>
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
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

export default SecurityCompliancePage;
