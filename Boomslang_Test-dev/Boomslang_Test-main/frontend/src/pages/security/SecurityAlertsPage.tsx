import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  Bell, 
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  Clock,
  MapPin,
  User,
  Activity
} from 'lucide-react';
import { SecurityAlert, AlertType } from '@/types/security';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { securityApi } from '../../api/securityApi';

const SecurityAlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
      title: 'MFA Bypass Attempt',
      message: 'User attempted to bypass MFA requirements',
      userId: 'user-4',
      details: {
        method: 'TOTP',
        bypassTechnique: 'Token reuse',
        riskScore: 85
      },
      ipAddress: '192.168.1.105',
      location: 'New York, US',
      timestamp: new Date('2024-01-20T11:30:00'),
      acknowledged: false,
      resolved: false
    },
    {
      id: '4',
      type: 'POLICY_VIOLATION',
      severity: 'MEDIUM',
      title: 'Security Policy Violation',
      message: 'User accessed sensitive data without proper authorization',
      userId: 'user-5',
      details: {
        policy: 'Data Access Control',
        resource: '/api/customers/export',
        violationType: 'Unauthorized Access'
      },
      ipAddress: '192.168.1.100',
      location: 'New York, US',
      timestamp: new Date('2024-01-20T10:20:00'),
      acknowledged: true,
      acknowledgedBy: 'system',
      acknowledgedAt: new Date('2024-01-20T10:25:00'),
      resolved: true,
      resolvedBy: 'admin@company.com',
      resolvedAt: new Date('2024-01-20T10:30:00')
    },
    {
      id: '5',
      type: 'UNAUTHORIZED_ACCESS',
      severity: 'HIGH',
      title: 'Unauthorized Access Attempt',
      message: 'Attempt to access admin panel without permissions',
      userId: 'user-6',
      details: {
        endpoint: '/admin/users',
        method: 'GET',
        userAgent: 'Custom Bot/1.0'
      },
      ipAddress: '203.0.113.99',
      location: 'Sydney, AU',
      timestamp: new Date('2024-01-20T09:15:00'),
      acknowledged: false,
      resolved: false
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACKNOWLEDGED' | 'UNACKNOWLEDGED' | 'RESOLVED' | 'UNRESOLVED'>('ALL');
  const [filterType, setFilterType] = useState<AlertType | 'ALL'>('ALL');
  const [loading, setLoading] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);

  const handleAcknowledgeAlert = async (alertId: string) => {
    setLoading(true);
    try {
      // Use real securityApi to acknowledge alert
      await securityApi.acknowledgeAlert(alertId);
      
      setAlerts(alerts.map(alert => 
        alert.id === alertId 
          ? { 
              ...alert, 
              acknowledged: true, 
              acknowledgedBy: 'current-user', 
              acknowledgedAt: new Date() 
            }
          : alert
      ));
      toast.success('Alert acknowledged successfully');
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      toast.error('Failed to acknowledge alert');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    setLoading(true);
    try {
      // Use real securityApi to resolve alert
      await securityApi.resolveAlert(alertId);
      
      setAlerts(alerts.map(alert => 
        alert.id === alertId 
          ? { 
              ...alert, 
              resolved: true, 
              resolvedBy: 'current-user', 
              resolvedAt: new Date() 
            }
          : alert
      ));
      toast.success('Alert resolved successfully');
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      toast.error('Failed to resolve alert');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    setLoading(true);
    try {
      // Use real securityApi to delete alert
      await securityApi.deleteAlert(alertId);
      
      setAlerts(alerts.filter(alert => alert.id !== alertId));
      toast.success('Alert deleted successfully');
    } catch (error) {
      console.error('Failed to delete alert:', error);
      toast.error('Failed to delete alert');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshAlerts = async () => {
    setLoading(true);
    try {
      // Use real securityApi to refresh alerts
      const alertsData = await securityApi.getAlerts();
      if (alertsData) {
        setAlerts(alertsData);
      }
      toast.success('Security alerts refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh alerts:', error);
      toast.error('Failed to refresh alerts');
    } finally {
      setLoading(false);
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

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case 'SUSPICIOUS_LOGIN': return <User className="h-4 w-4" />;
      case 'BRUTE_FORCE_ATTACK': return <Shield className="h-4 w-4" />;
      case 'MFA_BYPASS_ATTEMPT': return <AlertTriangle className="h-4 w-4" />;
      case 'POLICY_VIOLATION': return <XCircle className="h-4 w-4" />;
      case 'UNAUTHORIZED_ACCESS': return <Activity className="h-4 w-4" />;
      case 'SYSTEM_BREACH': return <AlertTriangle className="h-4 w-4" />;
      case 'COMPLIANCE_ISSUE': return <Bell className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getAlertTypeName = (type: AlertType): string => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (alert.userId && alert.userId.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         alert.ipAddress.includes(searchQuery);
    
    const matchesSeverity = filterSeverity === 'ALL' || alert.severity === filterSeverity;
    const matchesType = filterType === 'ALL' || alert.type === filterType;
    const matchesStatus = filterStatus === 'ALL' || 
                         (filterStatus === 'ACKNOWLEDGED' && alert.acknowledged) ||
                         (filterStatus === 'UNACKNOWLEDGED' && !alert.acknowledged) ||
                         (filterStatus === 'RESOLVED' && alert.resolved) ||
                         (filterStatus === 'UNRESOLVED' && !alert.resolved);
    
    return matchesSearch && matchesSeverity && matchesType && matchesStatus;
  });

  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' && !a.resolved);
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);
  const unresolvedAlerts = alerts.filter(a => !a.resolved);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security Alerts</h1>
          <p className="text-gray-600">Monitor and respond to security alerts and incidents</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleRefreshAlerts} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {criticalAlerts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>CRITICAL ALERTS:</strong> {criticalAlerts.length} critical alerts require immediate attention
              </div>
              <Button variant="outline" size="sm" className="ml-4">
                View Critical Alerts
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
                <p className="text-2xl font-bold">{criticalAlerts.length}</p>
                <p className="text-sm text-gray-600">Critical Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Bell className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{unacknowledgedAlerts.length}</p>
                <p className="text-sm text-gray-600">Unacknowledged</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Activity className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{unresolvedAlerts.length}</p>
                <p className="text-sm text-gray-600">Unresolved</p>
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
                <p className="text-2xl font-bold">{alerts.length}</p>
                <p className="text-sm text-gray-600">Total Alerts</p>
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
                placeholder="Search alerts by title, message, user, or IP..."
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
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="ALL">All Status</option>
                <option value="UNACKNOWLEDGED">Unacknowledged</option>
                <option value="ACKNOWLEDGED">Acknowledged</option>
                <option value="UNRESOLVED">Unresolved</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Alerts</TabsTrigger>
          <TabsTrigger value="critical">Critical</TabsTrigger>
          <TabsTrigger value="unacknowledged">Unacknowledged</TabsTrigger>
          <TabsTrigger value="unresolved">Unresolved</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <AlertsList 
            alerts={filteredAlerts} 
            onAcknowledge={handleAcknowledgeAlert}
            onResolve={handleResolveAlert}
            onDelete={handleDeleteAlert}
            onView={setSelectedAlert}
            onDetailsDialog={setDetailsDialog}
            loading={loading}
            getSeverityColor={getSeverityColor}
            getAlertIcon={getAlertIcon}
            getAlertTypeName={getAlertTypeName}
          />
        </TabsContent>

        <TabsContent value="critical">
          <AlertsList 
            alerts={filteredAlerts.filter(a => a.severity === 'CRITICAL')} 
            onAcknowledge={handleAcknowledgeAlert}
            onResolve={handleResolveAlert}
            onDelete={handleDeleteAlert}
            onView={setSelectedAlert}
            onDetailsDialog={setDetailsDialog}
            loading={loading}
            getSeverityColor={getSeverityColor}
            getAlertIcon={getAlertIcon}
            getAlertTypeName={getAlertTypeName}
          />
        </TabsContent>

        <TabsContent value="unacknowledged">
          <AlertsList 
            alerts={filteredAlerts.filter(a => !a.acknowledged)} 
            onAcknowledge={handleAcknowledgeAlert}
            onResolve={handleResolveAlert}
            onDelete={handleDeleteAlert}
            onView={setSelectedAlert}
            onDetailsDialog={setDetailsDialog}
            loading={loading}
            getSeverityColor={getSeverityColor}
            getAlertIcon={getAlertIcon}
            getAlertTypeName={getAlertTypeName}
          />
        </TabsContent>

        <TabsContent value="unresolved">
          <AlertsList 
            alerts={filteredAlerts.filter(a => !a.resolved)} 
            onAcknowledge={handleAcknowledgeAlert}
            onResolve={handleResolveAlert}
            onDelete={handleDeleteAlert}
            onView={setSelectedAlert}
            onDetailsDialog={setDetailsDialog}
            loading={loading}
            getSeverityColor={getSeverityColor}
            getAlertIcon={getAlertIcon}
            getAlertTypeName={getAlertTypeName}
          />
        </TabsContent>
      </Tabs>

      {/* Alert Details Dialog */}
      <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Security Alert Details</DialogTitle>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Alert ID</Label>
                  <p className="font-medium font-mono">{selectedAlert.id}</p>
                </div>
                <div>
                  <Label>Alert Type</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    {getAlertIcon(selectedAlert.type)}
                    <span className="font-medium">{getAlertTypeName(selectedAlert.type)}</span>
                  </div>
                </div>
                <div>
                  <Label>Severity</Label>
                  <Badge className={getSeverityColor(selectedAlert.severity)}>
                    {selectedAlert.severity}
                  </Badge>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    {selectedAlert.resolved ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Resolved</span>
                      </>
                    ) : selectedAlert.acknowledged ? (
                      <>
                        <Bell className="h-4 w-4 text-yellow-600" />
                        <span>Acknowledged</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span>Unacknowledged</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label>Title</Label>
                <p className="font-medium">{selectedAlert.title}</p>
              </div>

              <div>
                <Label>Message</Label>
                <p className="font-medium">{selectedAlert.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>User ID</Label>
                  <p className="font-medium">{selectedAlert.userId || 'System'}</p>
                </div>
                <div>
                  <Label>IP Address</Label>
                  <p className="font-medium font-mono">{selectedAlert.ipAddress}</p>
                </div>
                <div>
                  <Label>Location</Label>
                  <p className="font-medium">{selectedAlert.location}</p>
                </div>
                <div>
                  <Label>Timestamp</Label>
                  <p className="font-medium">{selectedAlert.timestamp.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <Label>Details</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(selectedAlert.details, null, 2)}
                  </pre>
                </div>
              </div>

              {selectedAlert.acknowledged && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Acknowledged By</Label>
                    <p className="font-medium">{selectedAlert.acknowledgedBy}</p>
                  </div>
                  <div>
                    <Label>Acknowledged At</Label>
                    <p className="font-medium">
                      {selectedAlert.acknowledgedAt?.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {selectedAlert.resolved && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Resolved By</Label>
                    <p className="font-medium">{selectedAlert.resolvedBy}</p>
                  </div>
                  <div>
                    <Label>Resolved At</Label>
                    <p className="font-medium">
                      {selectedAlert.resolvedAt?.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                {!selectedAlert.acknowledged && (
                  <Button onClick={() => handleAcknowledgeAlert(selectedAlert.id)} disabled={loading}>
                    <Bell className="h-4 w-4 mr-1" />
                    Acknowledge
                  </Button>
                )}
                {!selectedAlert.resolved && (
                  <Button onClick={() => handleResolveAlert(selectedAlert.id)} disabled={loading}>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Resolve
                  </Button>
                )}
                <Button variant="destructive" onClick={() => handleDeleteAlert(selectedAlert.id)} disabled={loading}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper component for alerts list
interface AlertsListProps {
  alerts: SecurityAlert[];
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (alert: SecurityAlert) => void;
  onDetailsDialog: (open: boolean) => void;
  loading: boolean;
  getSeverityColor: (severity: string) => string;
  getAlertIcon: (type: AlertType) => React.ReactNode;
  getAlertTypeName: (type: AlertType) => string;
}

const AlertsList: React.FC<AlertsListProps> = ({
  alerts,
  onAcknowledge,
  onResolve,
  onDelete,
  onView,
  onDetailsDialog,
  loading,
  getSeverityColor,
  getAlertIcon,
  getAlertTypeName
}) => {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-gray-500">
          <Bell className="h-12 w-12 mx-auto mb-2 text-gray-400" />
          <p>No security alerts found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="space-y-2">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={`p-4 border-b last:border-b-0 ${
                alert.severity === 'CRITICAL' ? 'bg-red-50 border-red-200' : 
                alert.severity === 'HIGH' ? 'bg-orange-50 border-orange-200' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    alert.severity === 'CRITICAL' ? 'bg-red-100' : 
                    alert.severity === 'HIGH' ? 'bg-orange-100' : 'bg-gray-100'
                  }`}>
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold">{alert.title}</h3>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      {alert.acknowledged && !alert.resolved && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Acknowledged
                        </Badge>
                      )}
                      {alert.resolved && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Resolved
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDistanceToNow(alert.timestamp, { addSuffix: true })}</span>
                      </div>
                      {alert.userId && (
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{alert.userId}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{alert.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onView(alert);
                      onDetailsDialog(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {!alert.acknowledged && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAcknowledge(alert.id)}
                      disabled={loading}
                    >
                      <Bell className="h-4 w-4 text-yellow-600" />
                    </Button>
                  )}
                  {!alert.resolved && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onResolve(alert.id)}
                      disabled={loading}
                    >
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(alert.id)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityAlertsPage;
