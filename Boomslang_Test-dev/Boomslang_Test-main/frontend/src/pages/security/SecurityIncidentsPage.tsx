import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { 
  AlertTriangle, 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Edit, 
  Archive,
  Users,
  Target,
  Activity,
  FileText,
  MessageSquare,
  Calendar,
  Zap,
  TrendingUp,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Filter,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { securityApi } from '../../api/securityApi';

interface SecurityIncident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'contained' | 'resolved' | 'closed';
  category: 'data-breach' | 'malware' | 'phishing' | 'unauthorized-access' | 'ddos' | 'system-compromise';
  priority: number;
  assignedTo?: string;
  reportedBy: string;
  reportedAt: string;
  lastUpdated: string;
  resolvedAt?: string;
  affectedSystems: string[];
  affectedUsers: number;
  estimatedImpact: string;
  containmentActions: string[];
  resolutionActions: string[];
  lessonsLearned?: string;
  attachments: number;
  comments: number;
}

interface IncidentTimeline {
  id: string;
  incidentId: string;
  timestamp: string;
  action: string;
  performedBy: string;
  description: string;
  type: 'detection' | 'assignment' | 'investigation' | 'containment' | 'resolution' | 'closure';
}

interface IncidentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: string;
  priority: number;
  responsePlan: string[];
  escalationRules: string[];
}

const SecurityIncidentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('incidents');
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [loading, setLoading] = useState(false);

  // Load incidents from API on component mount
  useEffect(() => {
    const loadIncidents = async () => {
      setLoading(true);
      try {
        const incidentsData = await securityApi.getIncidents();
        if (incidentsData) {
          setIncidents(incidentsData);
        }
      } catch (error) {
        console.error('Failed to load incidents:', error);
        toast.error('Failed to load incidents');
      } finally {
        setLoading(false);
      }
    };
    loadIncidents();
  }, []);
      category: 'phishing',
      priority: 2,
      assignedTo: 'Sarah Johnson',
      reportedBy: 'Email Security System',
      reportedAt: '2024-01-15 12:15:00',
      lastUpdated: '2024-01-15 14:20:00',
      affectedSystems: ['Email System', 'User Accounts'],
      affectedUsers: 25,
      estimatedImpact: 'Medium - Credential exposure risk',
      containmentActions: ['Blocked sender domains', 'Filtered malicious emails'],
      resolutionActions: ['Password reset for affected users', 'Security awareness training'],
      attachments: 5,
      comments: 12
    },
    {
      id: 'incident-3',
      title: 'Malware Detection on File Server',
      description: 'Ransomware variant detected on file server during routine scan.',
      severity: 'critical',
      status: 'resolved',
      category: 'malware',
      priority: 1,
      assignedTo: 'Mike Wilson',
      reportedBy: 'Antivirus System',
      reportedAt: '2024-01-15 10:30:00',
      lastUpdated: '2024-01-15 13:15:00',
      resolvedAt: '2024-01-15 13:15:00',
      affectedSystems: ['File Server', 'Backup Systems'],
      affectedUsers: 200,
      estimatedImpact: 'High - Data encryption risk',
      containmentActions: ['Isolated infected server', 'Stopped malware propagation'],
      resolutionActions: ['Restored from backup', 'Updated antivirus signatures'],
      lessonsLearned: 'Implement real-time malware scanning on all file uploads',
      attachments: 8,
      comments: 15
    },
    {
      id: 'incident-4',
      title: 'DDoS Attack on Web Services',
      description: 'Distributed denial of service attack targeting public web APIs.',
      severity: 'high',
      status: 'resolved',
      category: 'ddos',
      priority: 2,
      assignedTo: 'David Lee',
      reportedBy: 'Network Monitor',
      reportedAt: '2024-01-15 09:45:00',
      lastUpdated: '2024-01-15 11:30:00',
      resolvedAt: '2024-01-15 11:30:00',
      affectedSystems: ['Web Servers', 'Load Balancers'],
      affectedUsers: 5000,
      estimatedImpact: 'Medium - Service disruption',
      containmentActions: ['Activated DDoS protection', 'Blocked malicious IPs'],
      resolutionActions: 'Implemented rate limiting and traffic filtering',
      lessonsLearned: 'Review and update DDoS protection thresholds',
      attachments: 4,
      comments: 6
    },
    {
      id: 'incident-5',
      title: 'Suspicious Login Activity',
      description: 'Multiple failed login attempts detected from unusual geographic locations.',
      severity: 'medium',
      status: 'open',
      category: 'unauthorized-access',
      priority: 3,
      reportedBy: 'Authentication System',
      reportedAt: '2024-01-15 16:20:00',
      lastUpdated: '2024-01-15 16:20:00',
      affectedSystems: ['Authentication Service'],
      affectedUsers: 5,
      estimatedImpact: 'Low - Limited access attempts',
      containmentActions: [],
      resolutionActions: [],
      attachments: 1,
      comments: 2
    }
  ];

  const incidentTimeline: IncidentTimeline[] = [
    {
      id: 'timeline-1',
      incidentId: 'incident-1',
      timestamp: '2024-01-15 14:32:00',
      action: 'Incident Detected',
      performedBy: 'Security Monitor',
      description: 'Unusual database access patterns detected',
      type: 'detection'
    },
    {
      id: 'timeline-2',
      incidentId: 'incident-1',
      timestamp: '2024-01-15 14:45:00',
      action: 'Incident Assigned',
      performedBy: 'System',
      description: 'Assigned to John Smith (Security Analyst)',
      type: 'assignment'
    },
    {
      id: 'timeline-3',
      incidentId: 'incident-1',
      timestamp: '2024-01-15 15:15:00',
      action: 'Containment Started',
      performedBy: 'John Smith',
      description: 'Blocked suspicious IP address',
      type: 'containment'
    },
    {
      id: 'timeline-4',
      incidentId: 'incident-1',
      timestamp: '2024-01-15 15:45:00',
      action: 'Investigation Update',
      performedBy: 'John Smith',
      description: 'Analyzing access logs and determining scope',
      type: 'investigation'
    }
  ];

  const incidentTemplates: IncidentTemplate[] = [
    {
      id: 'template-1',
      name: 'Data Breach Response',
      description: 'Standard response plan for data breach incidents',
      category: 'data-breach',
      severity: 'critical',
      priority: 1,
      responsePlan: [
        'Immediate containment of affected systems',
        'Assess data exposure scope',
        'Notify stakeholders and legal team',
        'Document all actions taken',
        'Implement remediation measures'
      ],
      escalationRules: [
        'Immediate escalation to CISO for critical breaches',
        'Legal team notification within 1 hour',
        'Executive team notification within 2 hours'
      ]
    },
    {
      id: 'template-2',
      name: 'Malware Incident Response',
      description: 'Response plan for malware and ransomware incidents',
      category: 'malware',
      severity: 'high',
      priority: 1,
      responsePlan: [
        'Isolate infected systems',
        'Identify malware variant',
        'Activate incident response team',
        'Restore from clean backups',
        'Update security controls'
      ],
      escalationRules: [
        'Escalate to IT Security Manager',
        'Notify system administrators',
        'Consider external communication if widespread'
      ]
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'text-red-600 bg-red-50';
      case 'investigating':
        return 'text-yellow-600 bg-yellow-50';
      case 'contained':
        return 'text-blue-600 bg-blue-50';
      case 'resolved':
        return 'text-green-600 bg-green-50';
      case 'closed':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'data-breach':
        return <AlertCircle className="w-4 h-4" />;
      case 'malware':
        return <Shield className="w-4 h-4" />;
      case 'phishing':
        return <MessageSquare className="w-4 h-4" />;
      case 'unauthorized-access':
        return <Users className="w-4 h-4" />;
      case 'ddos':
        return <Activity className="w-4 h-4" />;
      case 'system-compromise':
        return <Target className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const filteredIncidents = filterStatus === 'all' 
    ? incidents 
    : incidents.filter(incident => incident.status === filterStatus);

  const openIncidents = incidents.filter(i => i.status === 'open' || i.status === 'investigating');
  const criticalIncidents = incidents.filter(i => i.severity === 'critical');
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved' || i.status === 'closed');

  const selectedIncidentData = incidents.find(i => i.id === selectedIncident);
  const selectedTimeline = incidentTimeline.filter(t => t.incidentId === selectedIncident);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Incidents</h1>
          <p className="text-muted-foreground">
            Track and manage security incidents from detection to resolution
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Incident
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{openIncidents.length}</div>
            <p className="text-xs text-muted-foreground">
              requiring attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Incidents</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalIncidents.length}</div>
            <p className="text-xs text-muted-foreground">
              high priority
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{resolvedIncidents.length}</div>
            <p className="text-xs text-muted-foreground">
              incidents closed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2h</div>
            <p className="text-xs text-muted-foreground">
              average time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alert */}
      {criticalIncidents.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{criticalIncidents.length} critical incidents</strong> require immediate attention. 
            Priority response team has been notified.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="incidents" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Incident List</h3>
              <p className="text-sm text-muted-foreground">
                All security incidents and their current status
              </p>
            </div>
            <div className="flex gap-2">
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="investigating">Investigating</option>
                <option value="contained">Contained</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredIncidents.map((incident) => (
              <Card 
                key={incident.id} 
                className={`cursor-pointer transition-colors ${
                  selectedIncident === incident.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                }`}
                onClick={() => setSelectedIncident(incident.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${getSeverityColor(incident.severity)}`}>
                        {getCategoryIcon(incident.category)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{incident.title}</CardTitle>
                        <CardDescription>
                          {incident.category.replace('-', ' ').charAt(0).toUpperCase() + 
                           incident.category.slice(1).replace('-', ' ')} • 
                          Reported by {incident.reportedBy}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(incident.status)}>
                        {incident.status}
                      </Badge>
                      <Badge className={getSeverityColor(incident.severity)}>
                        {incident.severity}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{incident.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Priority:</span>
                      <p className="font-medium">P{incident.priority}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Assigned To:</span>
                      <p className="font-medium">{incident.assignedTo || 'Unassigned'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Affected Users:</span>
                      <p className="font-medium">{incident.affectedUsers}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Updated:</span>
                      <p className="font-medium">{incident.lastUpdated}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {incident.attachments} attachments
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {incident.comments} comments
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Incident Details Panel */}
          {selectedIncidentData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Incident Details: {selectedIncidentData.title}
                  <Button variant="outline" size="sm" onClick={() => setSelectedIncident(null)}>
                    <XCircle className="w-4 h-4 mr-2" />
                    Close
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Incident Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ID:</span>
                        <span className="font-medium">{selectedIncidentData.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge className={getStatusColor(selectedIncidentData.status)}>
                          {selectedIncidentData.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Severity:</span>
                        <Badge className={getSeverityColor(selectedIncidentData.severity)}>
                          {selectedIncidentData.severity}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Priority:</span>
                        <span className="font-medium">P{selectedIncidentData.priority}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Reported At:</span>
                        <span className="font-medium">{selectedIncidentData.reportedAt}</span>
                      </div>
                      {selectedIncidentData.resolvedAt && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Resolved At:</span>
                          <span className="font-medium">{selectedIncidentData.resolvedAt}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Impact Assessment</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Affected Users:</span>
                        <span className="font-medium">{selectedIncidentData.affectedUsers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Impact Level:</span>
                        <span className="font-medium">{selectedIncidentData.estimatedImpact}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Affected Systems:</span>
                        <div className="mt-1">
                          {selectedIncidentData.affectedSystems.map((system, index) => (
                            <Badge key={index} variant="outline" className="mr-1 mb-1">
                              {system}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedIncidentData.containmentActions.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Containment Actions</h4>
                    <ul className="space-y-1 text-sm">
                      {selectedIncidentData.containmentActions.map((action, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedIncidentData.resolutionActions.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Resolution Actions</h4>
                    <ul className="space-y-1 text-sm">
                      {selectedIncidentData.resolutionActions.map((action, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedIncidentData.lessonsLearned && (
                  <div>
                    <h4 className="font-medium mb-3">Lessons Learned</h4>
                    <p className="text-sm bg-muted p-3 rounded">
                      {selectedIncidentData.lessonsLearned}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Update Incident
                  </Button>
                  <Button size="sm" variant="outline">
                    <Archive className="w-4 h-4 mr-2" />
                    Archive
                  </Button>
                  <Button size="sm" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Incident Timeline</h3>
              <p className="text-sm text-muted-foreground">
                Chronological view of all incident activities
              </p>
            </div>
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Export Timeline
            </Button>
          </div>

          {selectedIncident ? (
            <Card>
              <CardHeader>
                <CardTitle>Timeline for {selectedIncidentData?.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedTimeline.map((event) => (
                    <div key={event.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${
                          event.type === 'detection' ? 'bg-red-500' :
                          event.type === 'assignment' ? 'bg-blue-500' :
                          event.type === 'investigation' ? 'bg-yellow-500' :
                          event.type === 'containment' ? 'bg-orange-500' :
                          event.type === 'resolution' ? 'bg-green-500' :
                          'bg-gray-500'
                        }`} />
                        <div className="w-0.5 h-full bg-gray-300" />
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{event.action}</span>
                          <span className="text-sm text-muted-foreground">{event.timestamp}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          by {event.performedBy}
                        </p>
                        <p className="text-sm">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Select an incident to view its timeline
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Incident Templates</h3>
              <p className="text-sm text-muted-foreground">
                Predefined response plans for common incident types
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incidentTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge className={getSeverityColor(template.severity)}>
                      {template.severity}
                    </Badge>
                  </div>
                  <CardDescription>
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Category:</span>
                      <p className="font-medium">{template.category}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Priority:</span>
                      <p className="font-medium">P{template.priority}</p>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Response Plan</h5>
                    <ul className="space-y-1 text-sm">
                      {template.responsePlan.slice(0, 3).map((step, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          {step}
                        </li>
                      ))}
                      {template.responsePlan.length > 3 && (
                        <li className="text-muted-foreground">
                          +{template.responsePlan.length - 3} more steps
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Play className="w-4 h-4 mr-1" />
                      Use
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Incident Trends</CardTitle>
                <CardDescription>
                  Security incidents over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <TrendingUp className="w-12 h-12" />
                  <p className="ml-2">Analytics visualization would go here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resolution Metrics</CardTitle>
                <CardDescription>
                  Incident resolution performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Average Resolution Time</span>
                    <span className="font-medium">4.2 hours</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span>Containment Time</span>
                    <span className="font-medium">1.5 hours</span>
                  </div>
                  <Progress value={85} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span>Detection Time</span>
                    <span className="font-medium">12 minutes</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityIncidentsPage;
