import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Separator } from '../../components/ui/separator';
import { Users, Play, Pause, RotateCcw, Eye, EyeOff, Settings, Download, Upload, Plus, Edit, Trash2, Search, Filter, BarChart3, Target, TrendingUp, Clock, CheckCircle, XCircle, AlertTriangle, ArrowRight, Zap, BookOpen, Video, HelpCircle, MessageSquare, Star } from 'lucide-react';

interface OnboardingStep {
  id: string;
  name: string;
  description: string;
  type: 'tutorial' | 'video' | 'interactive' | 'document';
  status: 'draft' | 'active' | 'paused' | 'completed';
  duration: number;
  order: number;
  required: boolean;
  completionRate: number;
  skipRate: number;
}

interface UserOnboarding {
  id: string;
  userId: string;
  userName: string;
  email: string;
  currentStep: string;
  completedSteps: number;
  totalSteps: number;
  progress: number;
  startedAt: string;
  lastActivity: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'dropped-off';
}

interface OnboardingTemplate {
  id: string;
  name: string;
  description: string;
  targetAudience: string;
  steps: number;
  estimatedDuration: number;
  status: 'draft' | 'active' | 'archived';
  usage: number;
  rating: number;
}

const UXEnhancementOnboardingPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoProgress, setAutoProgress] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'step1',
      name: 'Welcome Tour',
      description: 'Introduction to the platform and key features',
      type: 'tutorial',
      status: 'active',
      duration: 5,
      order: 1,
      required: true,
      completionRate: 95,
      skipRate: 2
    },
    {
      id: 'step2',
      name: 'Profile Setup',
      description: 'Complete your profile and preferences',
      type: 'interactive',
      status: 'active',
      duration: 8,
      order: 2,
      required: true,
      completionRate: 88,
      skipRate: 5
    },
    {
      id: 'step3',
      name: 'Dashboard Overview',
      description: 'Learn to navigate the main dashboard',
      type: 'video',
      status: 'active',
      duration: 6,
      order: 3,
      required: false,
      completionRate: 72,
      skipRate: 15
    },
    {
      id: 'step4',
      name: 'First Project',
      description: 'Create your first project step-by-step',
      type: 'interactive',
      status: 'active',
      duration: 12,
      order: 4,
      required: true,
      completionRate: 65,
      skipRate: 8
    },
    {
      id: 'step5',
      name: 'Advanced Features',
      description: 'Explore advanced platform features',
      type: 'document',
      status: 'draft',
      duration: 10,
      order: 5,
      required: false,
      completionRate: 0,
      skipRate: 0
    },
  ];

  const userOnboarding: UserOnboarding[] = [
    {
      id: 'user1',
      userId: 'user1',
      userName: 'John Doe',
      email: 'john@example.com',
      currentStep: 'First Project',
      completedSteps: 3,
      totalSteps: 5,
      progress: 60,
      startedAt: '2024-01-15T10:30:00Z',
      lastActivity: '2024-01-15T14:20:00Z',
      status: 'in-progress'
    },
    {
      id: 'user2',
      userId: 'user2',
      userName: 'Jane Smith',
      email: 'jane@example.com',
      currentStep: 'Completed',
      completedSteps: 5,
      totalSteps: 5,
      progress: 100,
      startedAt: '2024-01-14T09:15:00Z',
      lastActivity: '2024-01-14T16:45:00Z',
      status: 'completed'
    },
    {
      id: 'user3',
      userId: 'user3',
      userName: 'Mike Johnson',
      email: 'mike@example.com',
      currentStep: 'Profile Setup',
      completedSteps: 1,
      totalSteps: 5,
      progress: 20,
      startedAt: '2024-01-13T11:30:00Z',
      lastActivity: '2024-01-13T12:15:00Z',
      status: 'dropped-off'
    },
    {
      id: 'user4',
      userId: 'user4',
      userName: 'Sarah Wilson',
      email: 'sarah@example.com',
      currentStep: 'Not Started',
      completedSteps: 0,
      totalSteps: 5,
      progress: 0,
      startedAt: '',
      lastActivity: '',
      status: 'not-started'
    },
  ];

  const onboardingTemplates: OnboardingTemplate[] = [
    {
      id: 'template1',
      name: 'Standard User Onboarding',
      description: 'Complete onboarding experience for regular users',
      targetAudience: 'New Users',
      steps: 5,
      estimatedDuration: 45,
      status: 'active',
      usage: 1250,
      rating: 4.6
    },
    {
      id: 'template2',
      name: 'Admin Quick Start',
      description: 'Accelerated onboarding for administrators',
      targetAudience: 'Administrators',
      steps: 3,
      estimatedDuration: 20,
      status: 'active',
      usage: 85,
      rating: 4.8
    },
    {
      id: 'template3',
      name: 'Power User Guide',
      description: 'Advanced features for experienced users',
      targetAudience: 'Power Users',
      steps: 8,
      estimatedDuration: 60,
      status: 'draft',
      usage: 0,
      rating: 0
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tutorial':
        return <BookOpen className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'interactive':
        return <Target className="h-4 w-4" />;
      case 'document':
        return <HelpCircle className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'draft':
      case 'not-started':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'paused':
      case 'dropped-off':
        return <Pause className="h-4 w-4 text-orange-500" />;
      default:
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      draft: 'secondary',
      paused: 'outline',
      completed: 'default',
      'not-started': 'secondary',
      'in-progress': 'default',
      'dropped-off': 'destructive',
      archived: 'outline'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const activeSteps = onboardingSteps.filter(step => step.status === 'active').length;
  const totalUsers = userOnboarding.length;
  const completedUsers = userOnboarding.filter(user => user.status === 'completed').length;
  const averageCompletion = Math.round(
    userOnboarding.filter(user => user.status !== 'not-started')
      .reduce((acc, user) => acc + user.progress, 0) / 
    userOnboarding.filter(user => user.status !== 'not-started').length
  );

  const filteredSteps = onboardingSteps.filter(step => {
    const matchesType = selectedType === 'all' || step.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || step.status === selectedStatus;
    const matchesSearch = step.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         step.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Onboarding</h1>
          <p className="text-muted-foreground">Design and manage user onboarding experiences</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Step
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Steps</p>
                <p className="text-2xl font-bold">{activeSteps}</p>
              </div>
              <Play className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{averageCompletion}%</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={averageCompletion} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Users</p>
                <p className="text-2xl font-bold">{completedUsers}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Drop-off Rate</p>
                <p className="text-2xl font-bold">15%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="steps" className="space-y-4">
        <TabsList>
          <TabsTrigger value="steps">Steps</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="steps" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Onboarding Steps</CardTitle>
                  <CardDescription>Configure onboarding flow and content</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Auto Progress</label>
                    <Switch checked={autoProgress} onCheckedChange={setAutoProgress} />
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
                      placeholder="Search steps..."
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
                    <SelectItem value="tutorial">Tutorial</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="interactive">Interactive</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {filteredSteps.map(step => (
                  <div key={step.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(step.status)}
                          {getTypeIcon(step.type)}
                          <h3 className="font-medium">Step {step.order}: {step.name}</h3>
                          {getStatusBadge(step.status)}
                          <Badge variant="outline">{step.type}</Badge>
                          {step.required && <Badge variant="secondary">Required</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span>Duration: {step.duration} min</span>
                          <span>•</span>
                          <span>Completion: {step.completionRate}%</span>
                          <span>•</span>
                          <span>Skip: {step.skipRate}%</span>
                        </div>
                        <Progress value={step.completionRate} className="w-32" />
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

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Progress</CardTitle>
              <CardDescription>Track individual user onboarding progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userOnboarding.map(user => (
                  <div key={user.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(user.status)}
                          <h3 className="font-medium">{user.userName}</h3>
                          {getStatusBadge(user.status)}
                          <Badge variant="outline">{user.email}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span>Current: {user.currentStep}</span>
                          <span>•</span>
                          <span>Progress: {user.completedSteps}/{user.totalSteps} steps</span>
                          <span>•</span>
                          <span>Started: {user.startedAt ? new Date(user.startedAt).toLocaleDateString() : 'Not started'}</span>
                        </div>
                        <Progress value={user.progress} className="w-48" />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {user.status === 'dropped-off' && (
                          <Button size="sm">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Follow Up
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Templates</CardTitle>
              <CardDescription>Predefined onboarding flows for different user types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {onboardingTemplates.map(template => (
                  <div key={template.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{template.name}</h3>
                          {getStatusBadge(template.status)}
                          <Badge variant="outline">{template.targetAudience}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span>Steps: {template.steps}</span>
                          <span>•</span>
                          <span>Duration: {template.estimatedDuration} min</span>
                          <span>•</span>
                          <span>Usage: {template.usage} users</span>
                          <span>•</span>
                          <span>Rating: {template.rating > 0 ? `${template.rating} ⭐` : 'Not rated'}</span>
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
                        <Button size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Use Template
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
                <CardTitle>Step Performance</CardTitle>
                <CardDescription>Completion and skip rates by step</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {onboardingSteps.filter(step => step.status === 'active').map(step => (
                    <div key={step.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(step.type)}
                        <span className="text-sm">{step.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${step.completionRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{step.completionRate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Status Distribution</CardTitle>
                <CardDescription>Current onboarding status of all users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['not-started', 'in-progress', 'completed', 'dropped-off'].map(status => {
                    const count = userOnboarding.filter(user => user.status === status).length;
                    const percentage = (count / totalUsers) * 100;
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status)}
                          <span className="text-sm capitalize">{status.replace('-', ' ')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
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

export default UXEnhancementOnboardingPage;
