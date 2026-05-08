import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Separator } from '../../components/ui/separator';
import { Star, MessageSquare, ThumbsUp, ThumbsDown, Send, Filter, Search, TrendingUp, TrendingDown, Users, Eye, EyeOff, Flag, Clock, CheckCircle, AlertTriangle, Download, Upload, BarChart3, PieChart, Activity } from 'lucide-react';

interface Feedback {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: 'bug' | 'feature' | 'improvement' | 'compliment' | 'complaint';
  category: string;
  title: string;
  description: string;
  rating: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'in-review' | 'in-progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  tags: string[];
  attachments: string[];
  upvotes: number;
  downvotes: number;
}

interface FeedbackStats {
  total: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  averageRating: number;
  responseRate: number;
}

const UXEnhancementFeedbackPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showResolved, setShowResolved] = useState(true);
  const [sortBy, setSortBy] = useState<string>('newest');

  const feedback: Feedback[] = [
    {
      id: 'fb1',
      userId: 'user1',
      userName: 'John Doe',
      userEmail: 'john@example.com',
      type: 'feature',
      category: 'navigation',
      title: 'Add keyboard shortcuts for main navigation',
      description: 'It would be great to have keyboard shortcuts for navigating between main sections of the application.',
      rating: 4,
      priority: 'medium',
      status: 'in-review',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T14:20:00Z',
      assignedTo: 'dev1',
      tags: ['accessibility', 'productivity'],
      attachments: [],
      upvotes: 15,
      downvotes: 2
    },
    {
      id: 'fb2',
      userId: 'user2',
      userName: 'Jane Smith',
      userEmail: 'jane@example.com',
      type: 'bug',
      category: 'performance',
      title: 'Slow loading on dashboard with large datasets',
      description: 'The dashboard takes more than 10 seconds to load when displaying large datasets.',
      rating: 2,
      priority: 'high',
      status: 'in-progress',
      createdAt: '2024-01-14T15:45:00Z',
      updatedAt: '2024-01-15T09:30:00Z',
      assignedTo: 'dev2',
      tags: ['performance', 'urgent'],
      attachments: ['screenshot.png'],
      upvotes: 8,
      downvotes: 1
    },
    {
      id: 'fb3',
      userId: 'user3',
      userName: 'Mike Johnson',
      userEmail: 'mike@example.com',
      type: 'improvement',
      category: 'ui',
      title: 'Improve color contrast in dark mode',
      description: 'Some text elements have poor contrast in dark mode, making them hard to read.',
      rating: 3,
      priority: 'medium',
      status: 'new',
      createdAt: '2024-01-15T08:15:00Z',
      updatedAt: '2024-01-15T08:15:00Z',
      tags: ['accessibility', 'ui'],
      attachments: [],
      upvotes: 12,
      downvotes: 0
    },
    {
      id: 'fb4',
      userId: 'user4',
      userName: 'Sarah Wilson',
      userEmail: 'sarah@example.com',
      type: 'compliment',
      category: 'general',
      title: 'Excellent user experience!',
      description: 'The new interface is intuitive and easy to use. Great work!',
      rating: 5,
      priority: 'low',
      status: 'resolved',
      createdAt: '2024-01-13T11:20:00Z',
      updatedAt: '2024-01-13T16:45:00Z',
      tags: ['positive'],
      attachments: [],
      upvotes: 25,
      downvotes: 0
    },
    {
      id: 'fb5',
      userId: 'user5',
      userName: 'Tom Brown',
      userEmail: 'tom@example.com',
      type: 'complaint',
      category: 'functionality',
      title: 'Missing export functionality',
      description: 'Cannot export data to CSV format, which is essential for our reporting.',
      rating: 1,
      priority: 'critical',
      status: 'in-progress',
      createdAt: '2024-01-12T14:30:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      assignedTo: 'dev3',
      tags: ['export', 'critical'],
      attachments: [],
      upvotes: 18,
      downvotes: 3
    }
  ];

  const feedbackStats: FeedbackStats = {
    total: feedback.length,
    byType: {
      bug: feedback.filter(f => f.type === 'bug').length,
      feature: feedback.filter(f => f.type === 'feature').length,
      improvement: feedback.filter(f => f.type === 'improvement').length,
      compliment: feedback.filter(f => f.type === 'compliment').length,
      complaint: feedback.filter(f => f.type === 'complaint').length,
    },
    byCategory: {
      navigation: feedback.filter(f => f.category === 'navigation').length,
      performance: feedback.filter(f => f.category === 'performance').length,
      ui: feedback.filter(f => f.category === 'ui').length,
      general: feedback.filter(f => f.category === 'general').length,
      functionality: feedback.filter(f => f.category === 'functionality').length,
    },
    byStatus: {
      new: feedback.filter(f => f.status === 'new').length,
      'in-review': feedback.filter(f => f.status === 'in-review').length,
      'in-progress': feedback.filter(f => f.status === 'in-progress').length,
      resolved: feedback.filter(f => f.status === 'resolved').length,
      closed: feedback.filter(f => f.status === 'closed').length,
    },
    averageRating: feedback.reduce((acc, f) => acc + f.rating, 0) / feedback.length,
    responseRate: (feedback.filter(f => f.status !== 'new').length / feedback.length) * 100
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'feature':
        return <Star className="h-4 w-4 text-blue-500" />;
      case 'improvement':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'compliment':
        return <ThumbsUp className="h-4 w-4 text-purple-500" />;
      case 'complaint':
        return <ThumbsDown className="h-4 w-4 text-orange-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      new: 'secondary',
      'in-review': 'outline',
      'in-progress': 'default',
      resolved: 'default',
      closed: 'outline'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      low: 'outline',
      medium: 'secondary',
      high: 'default',
      critical: 'destructive'
    };
    return <Badge variant={variants[priority] || 'outline'}>{priority}</Badge>;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-2 text-sm text-muted-foreground">({rating})</span>
      </div>
    );
  };

  const filteredFeedback = feedback.filter(item => {
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesResolved = showResolved || item.status !== 'resolved';
    
    return matchesType && matchesStatus && matchesSearch && matchesResolved;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'priority':
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Feedback</h1>
          <p className="text-muted-foreground">Collect and manage user feedback for UX enhancements</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Send className="h-4 w-4 mr-2" />
            Collect Feedback
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Feedback</p>
                <p className="text-2xl font-bold">{feedbackStats.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">{feedbackStats.averageRating.toFixed(1)}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Response Rate</p>
                <p className="text-2xl font-bold">{feedbackStats.responseRate.toFixed(0)}%</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Issues</p>
                <p className="text-2xl font-bold">{feedback.filter(f => f.priority === 'critical').length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold">{feedbackStats.byStatus.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="feedback" className="space-y-4">
        <TabsList>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="surveys">Surveys</TabsTrigger>
        </TabsList>

        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Feedback Management</CardTitle>
                  <CardDescription>Review and respond to user feedback</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="show-resolved">Show Resolved</Label>
                    <Switch id="show-resolved" checked={showResolved} onCheckedChange={setShowResolved} />
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
                      placeholder="Search feedback..."
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
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="improvement">Improvement</SelectItem>
                    <SelectItem value="compliment">Compliment</SelectItem>
                    <SelectItem value="complaint">Complaint</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in-review">In Review</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {filteredFeedback.map(item => (
                  <Card key={item.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getTypeIcon(item.type)}
                            <h3 className="font-medium">{item.title}</h3>
                            {getPriorityBadge(item.priority)}
                            {getStatusBadge(item.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{item.userName}</span>
                            <span>•</span>
                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                            {item.assignedTo && (
                              <>
                                <span>•</span>
                                <span>Assigned to {item.assignedTo}</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            {renderStars(item.rating)}
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-4 w-4 text-green-500" />
                              <span className="text-sm">{item.upvotes}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsDown className="h-4 w-4 text-red-500" />
                              <span className="text-sm">{item.downvotes}</span>
                            </div>
                            {item.tags.length > 0 && (
                              <div className="flex gap-1">
                                {item.tags.map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button size="sm">
                            Respond
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Feedback by Type</CardTitle>
                <CardDescription>Distribution of feedback categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(feedbackStats.byType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(type)}
                        <span className="capitalize">{type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(count / feedbackStats.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feedback by Status</CardTitle>
                <CardDescription>Current status of all feedback items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(feedbackStats.byStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(status)}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${(count / feedbackStats.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="surveys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Surveys</CardTitle>
              <CardDescription>Create and manage user satisfaction surveys</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Surveys</h3>
                <p className="text-muted-foreground">Create a survey to collect structured user feedback</p>
                <Button className="mt-4">
                  <Send className="h-4 w-4 mr-2" />
                  Create Survey
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UXEnhancementFeedbackPage;
