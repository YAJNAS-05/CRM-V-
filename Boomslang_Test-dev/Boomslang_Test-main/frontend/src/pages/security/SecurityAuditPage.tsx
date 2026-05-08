import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { 
  Shield, 
  FileText, 
  Search, 
  Filter, 
  Download,
  Calendar,
  User,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { securityApi } from '../../api/securityApi';

interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  category: 'AUTHENTICATION' | 'AUTHORIZATION' | 'DATA_ACCESS' | 'CONFIGURATION' | 'SECURITY';
}

const SecurityAuditPage: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
      success: true,
      riskLevel: 'HIGH',
      category: 'AUTHORIZATION'
    },
    {
      id: '4',
      timestamp: new Date('2024-01-20T11:30:00'),
      userId: 'user-4',
      userEmail: 'sarah.jones@company.com',
      action: 'DATA_EXPORT',
      resource: 'Customer Data',
      details: 'Exported 500 customer records',
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
      success: true,
      riskLevel: 'MEDIUM',
      category: 'DATA_ACCESS'
    },
    {
      id: '5',
      timestamp: new Date('2024-01-20T10:20:00'),
      userId: 'user-5',
      userEmail: 'admin@company.com',
      action: 'SECURITY_POLICY_UPDATE',
      resource: 'Security Settings',
      details: 'Updated password complexity requirements',
      ipAddress: '192.168.1.10',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
      success: true,
      riskLevel: 'HIGH',
      category: 'SECURITY'
    },
    {
      id: '6',
      timestamp: new Date('2024-01-20T09:15:00',
      userId: 'system',
      userEmail: 'system@company.com',
      action: 'BACKUP_COMPLETED',
      resource: 'System Backup',
      details: 'Automated backup completed successfully',
      ipAddress: '127.0.0.1',
      userAgent: 'System Process',
      success: true,
      riskLevel: 'LOW',
      category: 'CONFIGURATION'
    },
    {
      id: '7',
      timestamp: new Date('2024-01-20T08:45:00'),
      userId: 'user-6',
      userEmail: 'robert.brown@company.com',
      action: 'LOGIN_FAILURE',
      resource: 'Authentication',
      details: 'Failed login attempt - invalid credentials',
      ipAddress: '203.0.113.99',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/605.1.15',
      success: false,
      riskLevel: 'MEDIUM',
      category: 'AUTHENTICATION'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [filterSuccess, setFilterSuccess] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [loading, setLoading] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);

  const handleRefreshLogs = async () => {
    setLoading(true);
    try {
      // Use real securityApi to refresh audit logs
      const auditLogsData = await securityApi.getAuditLogs();
      if (auditLogsData) {
        setAuditLogs(auditLogsData);
      }
      toast.success('Audit logs refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh audit logs:', error);
      toast.error('Failed to refresh audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleExportLogs = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Action', 'Resource', 'Details', 'IP Address', 'Risk Level', 'Success'],
      ...auditLogs.map(log => [
        log.timestamp.toISOString(),
        log.userEmail,
        log.action,
        log.resource,
        log.details,
        log.ipAddress,
        log.riskLevel,
        log.success ? 'Yes' : 'No'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Audit logs exported successfully');
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'AUTHENTICATION': return 'bg-blue-100 text-blue-800';
      case 'AUTHORIZATION': return 'bg-purple-100 text-purple-800';
      case 'DATA_ACCESS': return 'bg-orange-100 text-orange-800';
      case 'CONFIGURATION': return 'bg-gray-100 text-gray-800';
      case 'SECURITY': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.ipAddress.includes(searchQuery);
    
    const matchesCategory = filterCategory === 'ALL' || log.category === filterCategory;
    const matchesRisk = filterRisk === 'ALL' || log.riskLevel === filterRisk;
    const matchesSuccess = filterSuccess === 'ALL' || 
                         (filterSuccess === 'SUCCESS' && log.success) ||
                         (filterSuccess === 'FAILURE' && !log.success);
    
    return matchesSearch && matchesCategory && matchesRisk && matchesSuccess;
  });

  const highRiskLogs = auditLogs.filter(log => log.riskLevel === 'HIGH');
  const failedAttempts = auditLogs.filter(log => !log.success);
  const uniqueUsers = new Set(auditLogs.map(log => log.userId)).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security Audit</h1>
          <p className="text-gray-600">Review system activity and security events</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            className="px-3 py-2 border border-gray-300 rounded-md"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <Button variant="outline" onClick={handleRefreshLogs} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportLogs}>
            <Download className="h-4 w-4 mr-1" />
            Export
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
                <p className="text-2xl font-bold">{auditLogs.length}</p>
                <p className="text-sm text-gray-600">Total Logs</p>
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
                <p className="text-2xl font-bold">{highRiskLogs.length}</p>
                <p className="text-sm text-gray-600">High Risk Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Activity className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{failedAttempts.length}</p>
                <p className="text-sm text-gray-600">Failed Attempts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{uniqueUsers}</p>
                <p className="text-sm text-gray-600">Active Users</p>
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
                placeholder="Search logs by user, action, resource, or IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="ALL">All Categories</option>
                <option value="AUTHENTICATION">Authentication</option>
                <option value="AUTHORIZATION">Authorization</option>
                <option value="DATA_ACCESS">Data Access</option>
                <option value="CONFIGURATION">Configuration</option>
                <option value="SECURITY">Security</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
              >
                <option value="ALL">All Risk Levels</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={filterSuccess}
                onChange={(e) => setFilterSuccess(e.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="SUCCESS">Success</option>
                <option value="FAILURE">Failure</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No audit logs found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map(log => (
                  <TableRow key={log.id} className={log.riskLevel === 'HIGH' ? 'bg-red-50' : ''}>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">
                          {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{log.userEmail}</p>
                        <p className="text-xs text-gray-500">{log.userId}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{log.action}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{log.resource}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(log.category)}>
                        {log.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRiskColor(log.riskLevel)}>
                        {log.riskLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {log.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedLog(log);
                          setDetailsDialog(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Log Details Dialog */}
      <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Log ID</Label>
                  <p className="font-medium font-mono">{selectedLog.id}</p>
                </div>
                <div>
                  <Label>Timestamp</Label>
                  <p className="font-medium">{selectedLog.timestamp.toLocaleString()}</p>
                </div>
                <div>
                  <Label>User</Label>
                  <p className="font-medium">{selectedLog.userEmail}</p>
                  <p className="text-sm text-gray-500">{selectedLog.userId}</p>
                </div>
                <div>
                  <Label>Action</Label>
                  <p className="font-medium">{selectedLog.action}</p>
                </div>
                <div>
                  <Label>Resource</Label>
                  <p className="font-medium">{selectedLog.resource}</p>
                </div>
                <div>
                  <Label>Category</Label>
                  <Badge className={getCategoryColor(selectedLog.category)}>
                    {selectedLog.category}
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Details</Label>
                <p className="font-medium">{selectedLog.details}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>IP Address</Label>
                  <p className="font-medium font-mono">{selectedLog.ipAddress}</p>
                </div>
                <div>
                  <Label>User Agent</Label>
                  <p className="font-medium text-sm">{selectedLog.userAgent}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Risk Level</Label>
                  <Badge className={getRiskColor(selectedLog.riskLevel)}>
                    {selectedLog.riskLevel}
                  </Badge>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="flex items-center space-x-2">
                    {selectedLog.success ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Success</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span>Failure</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecurityAuditPage;
