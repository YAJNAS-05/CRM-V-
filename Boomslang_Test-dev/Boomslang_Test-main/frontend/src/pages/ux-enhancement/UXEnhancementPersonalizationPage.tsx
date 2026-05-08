import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Separator } from '../../components/ui/separator';
import { Slider } from '../../components/ui/slider';
import { User, Settings, Palette, Layout, Zap, Eye, EyeOff, Save, RotateCcw, Download, Upload, Plus, Edit, Trash2, Search, Filter, BarChart3, Users, Target, TrendingUp, Clock, Star, Heart, Bookmark } from 'lucide-react';

interface PersonalizationRule {
  id: string;
  name: string;
  description: string;
  type: 'theme' | 'layout' | 'content' | 'behavior';
  condition: string;
  action: string;
  status: 'active' | 'inactive' | 'testing';
  priority: 'low' | 'medium' | 'high';
  users: number;
  satisfaction: number;
}

interface UserPreference {
  id: string;
  userId: string;
  userName: string;
  preferences: {
    theme: string;
    layout: string;
    language: string;
    notifications: boolean;
    compactMode: boolean;
    fontSize: number;
  };
  lastUpdated: string;
  devices: number;
}

interface PersonalizationSegment {
  id: string;
  name: string;
  description: string;
  criteria: string[];
  userCount: number;
  conversionRate: number;
  engagement: number;
  status: 'active' | 'inactive';
}

const UXEnhancementPersonalizationPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoPersonalize, setAutoPersonalize] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  const personalizationRules: PersonalizationRule[] = [
    {
      id: 'rule1',
      name: 'Dark Mode for Night Users',
      description: 'Automatically switch to dark theme for users active after 8 PM',
      type: 'theme',
      condition: 'time > 8pm',
      action: 'apply dark theme',
      status: 'active',
      priority: 'medium',
      users: 1250,
      satisfaction: 92
    },
    {
      id: 'rule2',
      name: 'Compact Layout for Mobile',
      description: 'Use compact layout for mobile device users',
      type: 'layout',
      condition: 'device = mobile',
      action: 'apply compact layout',
      status: 'active',
      priority: 'high',
      users: 2100,
      satisfaction: 88
    },
    {
      id: 'rule3',
      name: 'Content Recommendations',
      description: 'Show personalized content based on user behavior',
      type: 'content',
      condition: 'user_activity > 10',
      action: 'show recommended content',
      status: 'testing',
      priority: 'high',
      users: 890,
      satisfaction: 76
    },
    {
      id: 'rule4',
      name: 'Quick Actions for Power Users',
      description: 'Enable advanced shortcuts for frequent users',
      type: 'behavior',
      condition: 'login_frequency > daily',
      action: 'enable power user features',
      status: 'active',
      priority: 'medium',
      users: 450,
      satisfaction: 94
    },
    {
      id: 'rule5',
      name: 'Large Text for Accessibility',
      description: 'Increase font size for accessibility needs',
      type: 'theme',
      condition: 'accessibility_mode = true',
      action: 'increase font size',
      status: 'inactive',
      priority: 'low',
      users: 120,
      satisfaction: 85
    },
  ];

  const userPreferences: UserPreference[] = [
    {
      id: 'pref1',
      userId: 'user1',
      userName: 'John Doe',
      preferences: {
        theme: 'dark',
        layout: 'compact',
        language: 'en-US',
        notifications: true,
        compactMode: true,
        fontSize: 14
      },
      lastUpdated: '2024-01-15T10:30:00Z',
      devices: 3
    },
    {
      id: 'pref2',
      userId: 'user2',
      userName: 'Jane Smith',
      preferences: {
        theme: 'light',
        layout: 'spacious',
        language: 'es-ES',
        notifications: false,
        compactMode: false,
        fontSize: 16
      },
      lastUpdated: '2024-01-14T15:45:00Z',
      devices: 2
    },
    {
      id: 'pref3',
      userId: 'user3',
      userName: 'Mike Johnson',
      preferences: {
        theme: 'auto',
        layout: 'default',
        language: 'en-US',
        notifications: true,
        compactMode: false,
        fontSize: 12
      },
      lastUpdated: '2024-01-13T09:20:00Z',
      devices: 1
    },
  ];

  const personalizationSegments: PersonalizationSegment[] = [
    {
      id: 'seg1',
      name: 'Power Users',
      description: 'Frequent users with high engagement',
      criteria: ['login_frequency > daily', 'session_duration > 30m'],
      userCount: 450,
      conversionRate: 12.5,
      engagement: 89,
      status: 'active'
    },
    {
      id: 'seg2',
      name: 'Mobile First',
      description: 'Users who primarily use mobile devices',
      criteria: ['mobile_usage > 80%', 'device_type = mobile'],
      userCount: 2100,
      conversionRate: 8.3,
      engagement: 72,
      status: 'active'
    },
    {
      id: 'seg3',
      name: 'New Users',
      description: 'Recently onboarded users',
      criteria: ['account_age < 30d', 'login_count < 10'],
      userCount: 890,
      conversionRate: 15.2,
      engagement: 45,
      status: 'active'
    },
    {
      id: 'seg4',
      name: 'Accessibility Users',
      description: 'Users with accessibility preferences',
      criteria: ['accessibility_mode = true', 'font_size > 14'],
      userCount: 120,
      conversionRate: 6.8,
      engagement: 78,
      status: 'inactive'
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'theme':
        return <Palette className="h-4 w-4" />;
      case 'layout':
        return <Layout className="h-4 w-4" />;
      case 'content':
        return <Bookmark className="h-4 w-4" />;
      case 'behavior':
        return <Zap className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <div className="h-2 w-2 bg-green-500 rounded-full" />;
      case 'inactive':
        return <div className="h-2 w-2 bg-red-500 rounded-full" />;
      case 'testing':
        return <div className="h-2 w-2 bg-yellow-500 rounded-full" />;
      default:
        return <div className="h-2 w-2 bg-gray-500 rounded-full" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      inactive: 'destructive',
      testing: 'secondary'
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

  const activeRules = personalizationRules.filter(rule => rule.status === 'active').length;
  const totalUsers = userPreferences.length;
  const averageSatisfaction = Math.round(
    personalizationRules.reduce((acc, rule) => acc + rule.satisfaction, 0) / personalizationRules.length
  );
  const totalSegmentUsers = personalizationSegments.reduce((acc, seg) => acc + seg.userCount, 0);

  const filteredRules = personalizationRules.filter(rule => {
    const matchesType = selectedType === 'all' || rule.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || rule.status === selectedStatus;
    const matchesSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Personalization</h1>
          <p className="text-muted-foreground">Customize user experience based on preferences and behavior</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Rule
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Rules</p>
                <p className="text-2xl font-bold">{activeRules}</p>
              </div>
              <Zap className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">User Satisfaction</p>
                <p className="text-2xl font-bold">{averageSatisfaction}%</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
            <Progress value={averageSatisfaction} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Personalized Users</p>
                <p className="text-2xl font-bold">{totalSegmentUsers}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Segments</p>
                <p className="text-2xl font-bold">{personalizationSegments.filter(s => s.status === 'active').length}</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Personalization Rules</CardTitle>
                  <CardDescription>Automated rules for customizing user experience</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Auto Personalize</label>
                    <Switch checked={autoPersonalize} onCheckedChange={setAutoPersonalize} />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Preview</label>
                    <Switch checked={showPreview} onCheckedChange={setShowPreview} />
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
                      placeholder="Search rules..."
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
                    <SelectItem value="theme">Theme</SelectItem>
                    <SelectItem value="layout">Layout</SelectItem>
                    <SelectItem value="content">Content</SelectItem>
                    <SelectItem value="behavior">Behavior</SelectItem>
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
                    <SelectItem value="testing">Testing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {filteredRules.map(rule => (
                  <div key={rule.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(rule.status)}
                          {getTypeIcon(rule.type)}
                          <h3 className="font-medium">{rule.name}</h3>
                          {getStatusBadge(rule.status)}
                          {getPriorityBadge(rule.priority)}
                          <Badge variant="outline">{rule.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{rule.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>When: {rule.condition}</span>
                          <span>•</span>
                          <span>Then: {rule.action}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span>Users: {rule.users}</span>
                          <span>•</span>
                          <span>Satisfaction: {rule.satisfaction}%</span>
                        </div>
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Preferences</CardTitle>
              <CardDescription>Individual user personalization settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userPreferences.map(preference => (
                  <div key={preference.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4" />
                          <h3 className="font-medium">{preference.userName}</h3>
                          <Badge variant="outline">{preference.devices} devices</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Theme:</span>
                            <span className="ml-2 font-medium">{preference.preferences.theme}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Layout:</span>
                            <span className="ml-2 font-medium">{preference.preferences.layout}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Language:</span>
                            <span className="ml-2 font-medium">{preference.preferences.language}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Notifications:</span>
                            <span className="ml-2 font-medium">{preference.preferences.notifications ? 'On' : 'Off'}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Compact Mode:</span>
                            <span className="ml-2 font-medium">{preference.preferences.compactMode ? 'On' : 'Off'}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Font Size:</span>
                            <span className="ml-2 font-medium">{preference.preferences.fontSize}px</span>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          Last updated: {new Date(preference.lastUpdated).toLocaleString()}
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

        <TabsContent value="segments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Segments</CardTitle>
              <CardDescription>Personalized user segments for targeted experiences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {personalizationSegments.map(segment => (
                  <div key={segment.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-4 w-4" />
                          <h3 className="font-medium">{segment.name}</h3>
                          {getStatusBadge(segment.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{segment.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span>Users: {segment.userCount}</span>
                          <span>•</span>
                          <span>Conversion: {segment.conversionRate}%</span>
                          <span>•</span>
                          <span>Engagement: {segment.engagement}%</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {segment.criteria.map((criterion, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {criterion}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Analytics
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

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Personalization Impact</CardTitle>
                <CardDescription>Effectiveness of personalization rules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {personalizationRules.filter(rule => rule.status === 'active').map(rule => (
                    <div key={rule.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(rule.type)}
                        <span className="text-sm">{rule.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${rule.satisfaction}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{rule.satisfaction}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Segment Performance</CardTitle>
                <CardDescription>User segment engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {personalizationSegments.filter(segment => segment.status === 'active').map(segment => (
                    <div key={segment.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        <span className="text-sm">{segment.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${segment.engagement}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{segment.engagement}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UXEnhancementPersonalizationPage;
