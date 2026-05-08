import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  MapPin, 
  Clock, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  RefreshCw,
  Filter,
  Download,
  Search
} from 'lucide-react';
import { SecuritySession, DeviceInfo } from '@/types/security';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { securityApi } from '../../api/securityApi';

const SecuritySessionsPage: React.FC = () => {
  const [sessions, setSessions] = useState<SecuritySession[]>([]);
      },
      ipAddress: '192.168.1.100',
      location: 'New York, US',
      loginTime: new Date('2024-01-20T07:45:00'),
      lastActivity: new Date('2024-01-20T12:20:00'),
      isActive: false,
      riskLevel: 'LOW',
      mfaVerified: true
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState<SecuritySession | null>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [filterRisk, setFilterRisk] = useState<'ALL' | 'LOW' | 'MEDIUM' | 'HIGH'>('ALL');
  const [loading, setLoading] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);

  const handleTerminateSession = async (sessionId: string) => {
    setLoading(true);
    try {
      // Use real securityApi to terminate session
      await securityApi.terminateSession(sessionId);
      
      setSessions(sessions.map(s => 
        s.id === sessionId ? { ...s, isActive: false } : s
      ));
      toast.success('Session terminated successfully');
    } catch (error) {
      console.error('Failed to terminate session:', error);
      toast.error('Failed to terminate session');
    } finally {
      setLoading(false);
    }
  };

  const handleTerminateAllSessions = async () => {
    setLoading(true);
    try {
      // Use real securityApi to terminate all sessions
      await securityApi.terminateAllSessions();
      
      setSessions(sessions.map(s => ({ ...s, isActive: false })));
      toast.success('All sessions terminated successfully');
    } catch (error) {
      console.error('Failed to terminate all sessions:', error);
      toast.error('Failed to terminate all sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleTrustDevice = async (sessionId: string) => {
    setLoading(true);
    try {
      // Use real securityApi to trust device
      await securityApi.trustDevice(sessionId);
      
      setSessions(sessions.map(s => 
        s.id === sessionId 
          ? { ...s, deviceInfo: { ...s.deviceInfo, trusted: true } }
          : s
      ));
      toast.success('Device marked as trusted');
    } catch (error) {
      console.error('Failed to trust device:', error);
      toast.error('Failed to trust device');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshSessions = async () => {
    setLoading(true);
    try {
      // Use real securityApi to refresh sessions
      const sessionsData = await securityApi.getSessions();
      if (sessionsData) {
        setSessions(sessionsData);
      }
      toast.success('Sessions refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh sessions:', error);
      toast.error('Failed to refresh sessions');
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'DESKTOP': return <Monitor className="h-4 w-4" />;
      case 'MOBILE': return <Smartphone className="h-4 w-4" />;
      case 'TABLET': return <Tablet className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.deviceInfo.browser.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.ipAddress.includes(searchQuery);
    
    const matchesStatus = filterStatus === 'ALL' || 
                         (filterStatus === 'ACTIVE' && session.isActive) ||
                         (filterStatus === 'INACTIVE' && !session.isActive);
    
    const matchesRisk = filterRisk === 'ALL' || session.riskLevel === filterRisk;
    
    return matchesSearch && matchesStatus && matchesRisk;
  });

  const activeSessions = sessions.filter(s => s.isActive);
  const highRiskSessions = sessions.filter(s => s.riskLevel === 'HIGH');
  const trustedDevices = sessions.filter(s => s.deviceInfo.trusted).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security Sessions</h1>
          <p className="text-gray-600">Monitor and manage active user sessions</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleRefreshSessions} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleTerminateAllSessions} disabled={loading}>
            <Trash2 className="h-4 w-4 mr-1" />
            Terminate All
          </Button>
          <Button variant="outline">
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
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeSessions.length}</p>
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
                <p className="text-2xl font-bold">{highRiskSessions.length}</p>
                <p className="text-sm text-gray-600">High Risk Sessions</p>
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
                <p className="text-2xl font-bold">{trustedDevices}</p>
                <p className="text-sm text-gray-600">Trusted Devices</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Monitor className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{sessions.length}</p>
                <p className="text-sm text-gray-600">Total Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by email, browser, location, or IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value as any)}
              >
                <option value="ALL">All Risk Levels</option>
                <option value="LOW">Low Risk</option>
                <option value="MEDIUM">Medium Risk</option>
                <option value="HIGH">High Risk</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Monitor className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No sessions found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>MFA</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.map(session => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{session.userEmail}</p>
                        <p className="text-sm text-gray-500">ID: {session.userId}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getDeviceIcon(session.deviceInfo.deviceType)}
                        <div>
                          <p className="text-sm font-medium">{session.deviceInfo.browser}</p>
                          <p className="text-xs text-gray-500">{session.deviceInfo.os}</p>
                        </div>
                        {session.deviceInfo.trusted && (
                          <Shield className="h-3 w-3 text-green-600" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">{session.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-mono">{session.ipAddress}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRiskColor(session.riskLevel)}>
                        {session.riskLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {session.mfaVerified ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">
                          {formatDistanceToNow(session.lastActivity, { addSuffix: true })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={session.isActive ? "default" : "secondary"}>
                        {session.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedSession(session);
                            setDetailsDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!session.deviceInfo.trusted && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTrustDevice(session.id)}
                            disabled={loading}
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                        )}
                        {session.isActive && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTerminateSession(session.id)}
                            disabled={loading}
                          >
                            <XCircle className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Session Details Dialog */}
      <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>User Email</Label>
                  <p className="font-medium">{selectedSession.userEmail}</p>
                </div>
                <div>
                  <Label>User ID</Label>
                  <p className="font-medium">{selectedSession.userId}</p>
                </div>
                <div>
                  <Label>Session ID</Label>
                  <p className="font-medium font-mono">{selectedSession.id}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge variant={selectedSession.isActive ? "default" : "secondary"}>
                    {selectedSession.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Device Information</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><strong>Device Type:</strong> {selectedSession.deviceInfo.deviceType}</div>
                    <div><strong>Browser:</strong> {selectedSession.deviceInfo.browser}</div>
                    <div><strong>OS:</strong> {selectedSession.deviceInfo.os}</div>
                    <div><strong>Trusted:</strong> {selectedSession.deviceInfo.trusted ? 'Yes' : 'No'}</div>
                  </div>
                  <div className="mt-2">
                    <strong>User Agent:</strong>
                    <p className="text-xs text-gray-600 mt-1 font-mono break-all">
                      {selectedSession.deviceInfo.userAgent}
                    </p>
                  </div>
                  <div className="mt-2">
                    <strong>Fingerprint:</strong>
                    <p className="text-xs text-gray-600 mt-1 font-mono">
                      {selectedSession.deviceInfo.fingerprint}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>IP Address</Label>
                  <p className="font-medium font-mono">{selectedSession.ipAddress}</p>
                </div>
                <div>
                  <Label>Location</Label>
                  <p className="font-medium">{selectedSession.location}</p>
                </div>
                <div>
                  <Label>Login Time</Label>
                  <p className="font-medium">{selectedSession.loginTime.toLocaleString()}</p>
                </div>
                <div>
                  <Label>Last Activity</Label>
                  <p className="font-medium">{selectedSession.lastActivity.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Risk Level</Label>
                  <Badge className={getRiskColor(selectedSession.riskLevel)}>
                    {selectedSession.riskLevel}
                  </Badge>
                </div>
                <div>
                  <Label>MFA Verified</Label>
                  {selectedSession.mfaVerified ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                {!selectedSession.deviceInfo.trusted && (
                  <Button onClick={() => handleTrustDevice(selectedSession.id)} disabled={loading}>
                    <Shield className="h-4 w-4 mr-1" />
                    Trust Device
                  </Button>
                )}
                {selectedSession.isActive && (
                  <Button variant="destructive" onClick={() => handleTerminateSession(selectedSession.id)} disabled={loading}>
                    <XCircle className="h-4 w-4 mr-1" />
                    Terminate Session
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecuritySessionsPage;
