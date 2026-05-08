import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Separator } from '../../components/ui/separator';
import { Bell, BellRing, BellOff, Mail, MessageSquare, Smartphone, Settings, Plus, Edit, Trash2, Search, Filter, Download, Upload, Eye, EyeOff, Send, Clock, CheckCircle, XCircle, AlertTriangle, Users, TrendingUp, TrendingDown, BarChart3, Zap, Volume2, VolumeX } from 'lucide-react';

interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'push' | 'in-app' | 'sms';
  category: string;
  status: 'active' | 'inactive' | 'draft';
  triggers: string[];
  content: {
    subject?: string;
    body: string;
    variables: string[];
  };
  sent: number;
  opened: number;
  clicked: number;
  lastUsed: string;
}

interface NotificationRule {
  id: string;
  name: string;
  description: string;
  event: string;
  conditions: string[];
  template: string;
  channels: string[];
  status: 'active' | 'inactive' | 'testing';
  priority: 'low' | 'medium' | 'high';
  users: number;
  satisfaction: number;
}

interface UserNotification {
  id: string;
  userId: string;
  userName: string;
  type: string;
  title: string;
  message: string;
  channel: string;
  status: 'sent' | 'delivered' | 'read' | 'clicked' | 'failed';
  timestamp: string;
  priority: string;
}

const UXEnhancementNotificationsPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoSend, setAutoSend] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);

  const notificationTemplates: NotificationTemplate[] = [
    {
      id: 'template1',
      name: 'Welcome Email',
      description: 'Welcome message for new users',
      type: 'email',
      category: 'onboarding',
      status: 'active',
      triggers: ['user_registered'],
      content: {
        subject: 'Welcome to our platform!',
        body: 'Hi {{user_name}}, welcome to our platform! Get started with our quick tour.',
        variables: ['user_name', 'platform_name']
      },
      sent: 1250,
      opened: 980,
      clicked: 450,
      lastUsed: '2024-01-15T10:30:00Z'
    },
    {
      id: 'template2',
      name: 'Password Reset',
      description: 'Password reset notification',
      type: 'email',
      category: 'security',
      status: 'active',
      triggers: ['password_reset_requested'],
      content: {
        subject: 'Reset your password',
        body: 'Click here to reset your password: {{reset_link}}',
        variables: ['reset_link', 'user_name']
      },
      sent: 89,
      opened: 76,
      clicked: 68,
      lastUsed: '2024-01-14T15:45:00Z'
    },
    {
      id: 'template3',
      name: 'New Feature Alert',
      description: 'In-app notification for new features',
      type: 'in-app',
      category: 'product',
      status: 'active',
      triggers: ['feature_released'],
      content: {
        body: 'New feature available: {{feature_name}} - {{feature_description}}',
        variables: ['feature_name', 'feature_description']
      },
      sent: 2100,
      opened: 1560,
      clicked: 890,
      lastUsed: '2024-01-13T09:20:00Z'
    },
    {
      id: 'template4',
      name: 'Push Notification',
      description: 'Mobile push notification template',
      type: 'push',
      category: 'engagement',
      status: 'draft',
      triggers: ['daily_reminder'],
      content: {
        body: 'Don\'t forget to check your dashboard today!',
        variables: ['user_name']
      },
      sent: 0,
      opened: 0,
      clicked: 0,
      lastUsed: ''
    },
    {
      id: 'template5',
      name: 'SMS Alert',
      description: 'Critical SMS notifications',
      type: 'sms',
      category: 'urgent',
      status: 'active',
      triggers: ['security_alert'],
      content: {
        body: 'Security alert: {{alert_message}}. Please login to review.',
        variables: ['alert_message', 'user_name']
      },
      sent: 12,
      opened: 12,
      clicked: 8,
      lastUsed: '2024-01-12T14:30:00Z'
    },
  ];

  const notificationRules: NotificationRule[] = [
    {
      id: 'rule1',
      name: 'New User Onboarding',
      description: 'Send welcome emails to new users',
      event: 'user_registered',
      conditions: ['user.is_new = true'],
      template: 'Welcome Email',
      channels: ['email'],
      status: 'active',
      priority: 'high',
      users: 1250,
      satisfaction: 92
    },
    {
      id: 'rule2',
      name: 'Abandoned Cart Recovery',
      description: 'Remind users about abandoned carts',
      event: 'cart_abandoned',
      conditions: ['cart.items > 0', 'cart.abandoned_time > 2h'],
      template: 'Cart Reminder',
      channels: ['email', 'push'],
      status: 'active',
      priority: 'medium',
      users: 340,
      satisfaction: 78
    },
    {
      id: 'rule3',
      name: 'Security Alerts',
      description: 'Send security notifications',
      event: 'security_event',
      conditions: ['event.severity = high'],
      template: 'Security Alert',
      channels: ['email', 'sms', 'push'],
      status: 'active',
      priority: 'high',
      users: 89,
      satisfaction: 95
    },
    {
      id: 'rule4',
      name: 'Weekly Digest',
      description: 'Send weekly activity summary',
      event: 'weekly_schedule',
      conditions: ['user.preferences.weekly_digest = true'],
      template: 'Weekly Summary',
      channels: ['email'],
      status: 'testing',
      priority: 'low',
      users: 567,
      satisfaction: 71
    },
  ];

  const userNotifications: UserNotification[] = [
    {
      id: 'notif1',
      userId: 'user1',
      userName: 'John Doe',
      type: 'Welcome Email',
      title: 'Welcome to our platform!',
      message: 'Hi John Doe, welcome to our platform! Get started with our quick tour.',
      channel: 'email',
      status: 'read',
      timestamp: '2024-01-15T10:30:00Z',
      priority: 'high'
    },
    {
      id: 'notif2',
      userId: 'user2',
      userName: 'Jane Smith',
      type: 'New Feature Alert',
      title: 'New Dashboard Available',
      message: 'Check out our new dashboard with improved analytics.',
      channel: 'in-app',
      status: 'clicked',
      timestamp: '2024-01-15T09:45:00Z',
      priority: 'medium'
    },
    {
      id: 'notif3',
      userId: 'user3',
      userName: 'Mike Johnson',
      type: 'Security Alert',
      title: 'Login from New Device',
      message: 'A new device logged into your account from New York.',
      channel: 'sms',
      status: 'delivered',
      timestamp: '2024-01-14T16:20:00Z',
      priority: 'high'
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'push':
        return <Smartphone className="h-4 w-4" />;
      case 'in-app':
        return <Bell className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'delivered':
      case 'read':
      case 'clicked':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'draft':
      case 'sent':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      inactive: 'destructive',
      draft: 'secondary',
      sent: 'secondary',
      delivered: 'default',
      read: 'default',
      clicked: 'default',
      failed: 'destructive'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      low: 'outline',
      medium: 'secondary',
      high: 'default'
    };
    return <Badge variant={variants[priority] || 'outline'}>{priority}</Badge>;
  };

  const activeTemplates = notificationTemplates.filter(template => template.status === 'active').length;
  const totalSent = notificationTemplates.reduce((acc, template) => acc + template.sent, 0);
  const averageOpenRate = notificationTemplates.filter(template => template.sent > 0)
    .reduce((acc, template) => acc + (template.opened / template.sent) * 100, 0) / 
    notificationTemplates.filter(template => template.sent > 0).length;
  const activeRules = notificationRules.filter(rule => rule.status === 'active').length;

  const filteredTemplates = notificationTemplates.filter(template => {
    const matchesType = selectedType === 'all' || template.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || template.status === selectedStatus;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Notification Management</h1>
          <p className="text-muted-foreground">Configure and manage user notifications across channels</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Templates</p>
                <p className="text-2xl font-bold">{activeTemplates}</p>
              </div>
              <BellRing className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sent</p>
                <p className="text-2xl font-bold">{totalSent.toLocaleString()}</p>
              </div>
              <Send className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Open Rate</p>
                <p className="text-2xl font-bold">{Math.round(averageOpenRate)}%</p>
              </div>
              <Eye className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Rules</p>
                <p className="text-2xl font-bold">{activeRules}</p>
              </div>
              <Settings className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Notification Templates</CardTitle>
                  <CardDescription>Manage email, push, and in-app notification templates</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Auto Send</label>
                    <Switch checked={autoSend} onCheckedChange={setAutoSend} />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Preview</label>
                    <Switch checked={previewMode} onCheckedChange={setPreviewMode} />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search templates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="push">Push</SelectItem>
                    <SelectItem value="in-app">In-App</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {filteredTemplates.map(template => (
                  <div key={template.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(template.status)}
                          {getTypeIcon(template.type)}
                          <h3 className="font-medium">{template.name}</h3>
                          {getStatusBadge(template.status)}
                          <Badge variant="outline">{template.type}</Badge>
                          <Badge variant="secondary">{template.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span>Trigger: {template.triggers.join(', ')}</span>
                          <span>•</span>
                          <span>Variables: {template.content.variables.join(', ')}</span>
                        </div>
                        {template.sent > 0 && (
                          <div className="flex items-center gap-4 text-sm">
                            <span>Sent: {template.sent}</span>
                            <span>•</span>
                            <span>Opened: {template.opened}</span>
                            <span>•</span>
                            <span>Clicked: {template.clicked}</span>
                            <span>•</span>
                            <span>Open Rate: {Math.round((template.opened / template.sent) * 100)}%</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button size="sm">
                          <Send className="h-4 w-4 mr-2" />
                          Test
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Rules</CardTitle>
              <CardDescription>Configure automated notification triggers and conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notificationRules.map(rule => (
                  <div key={rule.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(rule.status)}
                          <h3 className="font-medium">{rule.name}</h3>
                          {getStatusBadge(rule.status)}
                          {getPriorityBadge(rule.priority)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{rule.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span>Event: {rule.event}</span>
                          <span>•</span>
                          <span>Template: {rule.template}</span>
                          <span>•</span>
                          <span>Channels: {rule.channels.join(', ')}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span>Users: {rule.users}</span>
                          <span>•</span>
                          <span>Satisfaction: {rule.satisfaction}%</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest notification deliveries and user interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userNotifications.map(notification => (
                  <div key={notification.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(notification.status)}
                          {getTypeIcon(notification.channel)}
                          <h3 className="font-medium">{notification.title}</h3>
                          {getStatusBadge(notification.status)}
                          {getPriorityBadge(notification.priority)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>User: {notification.userName}</span>
                          <span>•</span>
                          <span>Type: {notification.type}</span>
                          <span>•</span>
                          <span>Channel: {notification.channel}</span>
                          <span>•</span>
                          <span>{new Date(notification.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Performance</CardTitle>
                <CardDescription>Open and click rates by template</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notificationTemplates.filter(template => template.sent > 0).map(template => (
                    <div key={template.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(template.type)}
                        <span className="text-sm">{template.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${(template.opened / template.sent) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {Math.round((template.opened / template.sent) * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Channel Distribution</CardTitle>
                <CardDescription>Notifications sent by channel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['email', 'push', 'in-app', 'sms'].map(channel => {
                    const count = notificationTemplates
                      .filter(template => template.type === channel)
                      .reduce((acc, template) => acc + template.sent, 0);
                    return (
                      <div key={channel} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(channel)}
                          <span className="text-sm capitalize">{channel}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${(count / totalSent) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UXEnhancementNotificationsPage;
