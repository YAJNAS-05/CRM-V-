import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  Trash2,
  RefreshCw,
  Filter,
  Download,
  Search,
  Calendar,
  MapPin,
  User,
  Activity
} from 'lucide-react';
import { SecurityEvent, SecurityEventType } from '@/types/security';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { securityApi } from '../../api/securityApi';

const SecurityEventsPage: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
      resolvedAt: new Date('2024-01-20T10:50:00')
    },
    {
      id: '6',
      type: 'PERMISSION_ESCALATION',
      severity: 'CRITICAL',
      userId: 'user-5',
      description: 'Attempted privilege escalation detected',
      details: { attemptedRole: 'ADMIN', originalRole: 'USER' },
      ipAddress: '192.0.2.88',
      location: 'Berlin, DE',
      timestamp: new Date('2024-01-20T09:15:00'),
      resolved: false
    },
    {
      id: '7',
      type: 'DATA_BREACH_ATTEMPT',
      severity: 'CRITICAL',
      description: 'Potential data breach attempt detected',
      details: { endpoint: '/api/users/export', volume: '1000+ records' },
      ipAddress: '203.0.113.99',
      location: 'Unknown',
      timestamp: new Date('2024-01-20T08:45:00'),
      resolved: false
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('ALL');
  const [filterType, setFilterType] = useState<SecurityEventType | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'RESOLVED' | 'UNRESOLVED'>('ALL');
  const [loading, setLoading] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);

  const handleResolveEvent = async (eventId: string) => {
    setLoading(true);
    try {
      // Use real securityApi to resolve event
      await securityApi.resolveEvent(eventId);
      
      setEvents(events.map(e => 
        e.id === eventId 
          ? { 
              ...e, 
              resolved: true, 
              resolvedBy: 'current-user', 
              resolvedAt: new Date() 
            }
          : e
      ));
      toast.success('Event marked as resolved');
    } catch (error) {
      console.error('Failed to resolve event:', error);
      toast.error('Failed to resolve event');
    } finally {
      setLoading(false);
    }
  };

  const handleUnresolveEvent = async (eventId: string) => {
    setLoading(true);
    try {
      // Use real securityApi to unresolve event
      await securityApi.unresolveEvent(eventId);
      
      setEvents(events.map(e => 
        e.id === eventId 
          ? { 
              ...e, 
              resolved: false, 
              resolvedBy: undefined, 
              resolvedAt: undefined 
            }
          : e
      ));
      toast.success('Event marked as unresolved');
    } catch (error) {
      console.error('Failed to unresolve event:', error);
      toast.error('Failed to unresolve event');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    setLoading(true);
    try {
      // Use real securityApi to delete event
      await securityApi.deleteEvent(eventId);
      
      setEvents(events.filter(e => e.id !== eventId));
      toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error('Failed to delete event');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshEvents = async () => {
    setLoading(true);
    try {
      // Use real securityApi to refresh events
      const eventsData = await securityApi.getEvents();
      if (eventsData) {
        setEvents(eventsData);
      }
      toast.success('Events refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh events:', error);
      toast.error('Failed to refresh events');
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

  const getEventIcon = (type: SecurityEventType) => {
    switch (type) {
      case 'LOGIN_SUCCESS':
      case 'LOGIN_FAILURE':
        return <User className="h-4 w-4" />;
      case 'MFA_ENABLED':
      case 'MFA_DISABLED':
        return <Shield className="h-4 w-4" />;
      case 'ACCOUNT_LOCKED':
      case 'ACCOUNT_UNLOCKED':
        return <XCircle className="h-4 w-4" />;
      case 'SUSPICIOUS_ACTIVITY':
      case 'DATA_BREACH_ATTEMPT':
      case 'PERMISSION_ESCALATION':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getEventTypeName = (type: SecurityEventType): string => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.ipAddress.includes(searchQuery) ||
                         event.location.toLowerCase().includes(searchQuery) ||
                         (event.userId && event.userId.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSeverity = filterSeverity === 'ALL' || event.severity === filterSeverity;
    const matchesType = filterType === 'ALL' || event.type === filterType;
    const matchesStatus = filterStatus === 'ALL' || 
                         (filterStatus === 'RESOLVED' && event.resolved) ||
                         (filterStatus === 'UNRESOLVED' && !event.resolved);
    
    return matchesSearch && matchesSeverity && matchesType && matchesStatus;
  });

  const criticalEvents = events.filter(e => e.severity === 'CRITICAL' && !e.resolved);
  const highRiskEvents = events.filter(e => e.severity === 'HIGH' && !e.resolved);
  const unresolvedEvents = events.filter(e => !e.resolved);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security Events</h1>
          <p className="text-gray-600">Monitor and manage security events and incidents</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleRefreshEvents} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {(criticalEvents.length > 0 || highRiskEvents.length > 0) && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>Immediate Action Required:</strong> {criticalEvents.length} critical and {highRiskEvents.length} high-risk events need attention
              </div>
              <Button variant="outline" size="sm" className="ml-4">
                Review Critical Events
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
                <p className="text-2xl font-bold">{criticalEvents.length}</p>
                <p className="text-sm text-gray-600">Critical Events</p>
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
                <p className="text-2xl font-bold">{highRiskEvents.length}</p>
                <p className="text-sm text-gray-600">High Risk Events</p>
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
                <p className="text-2xl font-bold">{unresolvedEvents.length}</p>
                <p className="text-sm text-gray-600">Unresolved Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Activity className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{events.length}</p>
                <p className="text-sm text-gray-600">Total Events</p>
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
                placeholder="Search events by description, IP, location, or user ID..."
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
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
              >
                <option value="ALL">All Types</option>
                <option value="LOGIN_SUCCESS">Login Success</option>
                <option value="LOGIN_FAILURE">Login Failure</option>
                <option value="MFA_ENABLED">MFA Enabled</option>
                <option value="MFA_DISABLED">MFA Disabled</option>
                <option value="ACCOUNT_LOCKED">Account Locked</option>
                <option value="SUSPICIOUS_ACTIVITY">Suspicious Activity</option>
                <option value="DATA_BREACH_ATTEMPT">Data Breach Attempt</option>
                <option value="PERMISSION_ESCALATION">Permission Escalation</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="ALL">All Status</option>
                <option value="RESOLVED">Resolved</option>
                <option value="UNRESOLVED">Unresolved</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Security Events</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No security events found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map(event => (
                  <TableRow key={event.id} className={event.severity === 'CRITICAL' ? 'bg-red-50' : ''}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getEventIcon(event.type)}
                        <span className="text-sm font-medium">
                          {getEventTypeName(event.type)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(event.severity)}>
                        {event.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{event.description}</p>
                        <p className="text-xs text-gray-500">IP: {event.ipAddress}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{event.userId || 'System'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">{event.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">
                          {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {event.resolved ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <Badge variant="secondary" className="text-xs">
                              Resolved
                            </Badge>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-red-600" />
                            <Badge variant="destructive" className="text-xs">
                              Unresolved
                            </Badge>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedEvent(event);
                            setDetailsDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {event.resolved ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnresolveEvent(event.id)}
                            disabled={loading}
                          >
                            <XCircle className="h-4 w-4 text-yellow-600" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResolveEvent(event.id)}
                            disabled={loading}
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Security Event Details</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Event ID</Label>
                  <p className="font-medium font-mono">{selectedEvent.id}</p>
                </div>
                <div>
                  <Label>Event Type</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    {getEventIcon(selectedEvent.type)}
                    <span className="font-medium">{getEventTypeName(selectedEvent.type)}</span>
                  </div>
                </div>
                <div>
                  <Label>Severity</Label>
                  <Badge className={getSeverityColor(selectedEvent.severity)}>
                    {selectedEvent.severity}
                  </Badge>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    {selectedEvent.resolved ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Resolved</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span>Unresolved</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <p className="font-medium">{selectedEvent.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>User ID</Label>
                  <p className="font-medium">{selectedEvent.userId || 'System'}</p>
                </div>
                <div>
                  <Label>IP Address</Label>
                  <p className="font-medium font-mono">{selectedEvent.ipAddress}</p>
                </div>
                <div>
                  <Label>Location</Label>
                  <p className="font-medium">{selectedEvent.location}</p>
                </div>
                <div>
                  <Label>Timestamp</Label>
                  <p className="font-medium">{selectedEvent.timestamp.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <Label>Event Details</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(selectedEvent.details, null, 2)}
                  </pre>
                </div>
              </div>

              {selectedEvent.resolved && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Resolved By</Label>
                    <p className="font-medium">{selectedEvent.resolvedBy}</p>
                  </div>
                  <div>
                    <Label>Resolved At</Label>
                    <p className="font-medium">
                      {selectedEvent.resolvedAt?.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                {selectedEvent.resolved ? (
                  <Button variant="outline" onClick={() => handleUnresolveEvent(selectedEvent.id)} disabled={loading}>
                    <XCircle className="h-4 w-4 mr-1" />
                    Mark as Unresolved
                  </Button>
                ) : (
                  <Button onClick={() => handleResolveEvent(selectedEvent.id)} disabled={loading}>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Mark as Resolved
                  </Button>
                )}
                <Button variant="destructive" onClick={() => handleDeleteEvent(selectedEvent.id)} disabled={loading}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete Event
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecurityEventsPage;
