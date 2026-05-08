import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Separator } from '../../components/ui/separator';
import { Search, Filter, Download, Upload, Plus, Edit, Trash2, MessageSquare, BookOpen, Video, HelpCircle, FileText, ExternalLink, Star, ThumbsUp, ThumbsDown, Clock, User, Tag, TrendingUp, Eye, Settings, Zap, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'article' | 'video' | 'faq' | 'guide';
  status: 'published' | 'draft' | 'archived';
  views: number;
  helpful: number;
  notHelpful: number;
  lastUpdated: string;
  author: string;
  tags: string[];
}

interface HelpCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  articleCount: number;
  views: number;
}

interface HelpSearch {
  id: string;
  query: string;
  results: number;
  timestamp: string;
  user: string;
}

const UXEnhancementHelpPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);

  const helpArticles: HelpArticle[] = [
    {
      id: 'article1',
      title: 'Getting Started with the Platform',
      description: 'Complete guide for new users to get started with all features',
      category: 'getting-started',
      type: 'article',
      status: 'published',
      views: 1250,
      helpful: 98,
      notHelpful: 12,
      lastUpdated: '2024-01-15T10:30:00Z',
      author: 'John Doe',
      tags: ['beginner', 'tutorial', 'onboarding']
    },
    {
      id: 'article2',
      title: 'Dashboard Navigation Video',
      description: 'Video tutorial showing how to navigate the main dashboard',
      category: 'navigation',
      type: 'video',
      status: 'published',
      views: 890,
      helpful: 76,
      notHelpful: 8,
      lastUpdated: '2024-01-14T15:45:00Z',
      author: 'Jane Smith',
      tags: ['video', 'dashboard', 'navigation']
    },
    {
      id: 'article3',
      title: 'Common Issues and Solutions',
      description: 'Frequently asked questions and their solutions',
      category: 'troubleshooting',
      type: 'faq',
      status: 'published',
      views: 2100,
      helpful: 145,
      notHelpful: 25,
      lastUpdated: '2024-01-13T09:20:00Z',
      author: 'Mike Johnson',
      tags: ['faq', 'troubleshooting', 'common']
    },
    {
      id: 'article4',
      title: 'Advanced Features Guide',
      description: 'In-depth guide to advanced platform features',
      category: 'advanced',
      type: 'guide',
      status: 'draft',
      views: 0,
      helpful: 0,
      notHelpful: 0,
      lastUpdated: '2024-01-12T14:30:00Z',
      author: 'Sarah Wilson',
      tags: ['advanced', 'features', 'power-user']
    },
    {
      id: 'article5',
      title: 'Security Best Practices',
      description: 'How to keep your account secure and protected',
      category: 'security',
      type: 'article',
      status: 'published',
      views: 567,
      helpful: 89,
      notHelpful: 5,
      lastUpdated: '2024-01-11T16:45:00Z',
      author: 'Tom Brown',
      tags: ['security', 'best-practices', 'protection']
    },
  ];

  const helpCategories: HelpCategory[] = [
    {
      id: 'cat1',
      name: 'Getting Started',
      description: 'Basic tutorials and setup guides',
      icon: <BookOpen className="h-5 w-5" />,
      articleCount: 12,
      views: 5430
    },
    {
      id: 'cat2',
      name: 'Navigation',
      description: 'How to navigate the interface',
      icon: <HelpCircle className="h-5 w-5" />,
      articleCount: 8,
      views: 3210
    },
    {
      id: 'cat3',
      name: 'Troubleshooting',
      description: 'Common issues and solutions',
      icon: <AlertTriangle className="h-5 w-5" />,
      articleCount: 15,
      views: 7890
    },
    {
      id: 'cat4',
      name: 'Advanced',
      description: 'Advanced features and power user guides',
      icon: <Zap className="h-5 w-5" />,
      articleCount: 6,
      views: 2340
    },
    {
      id: 'cat5',
      name: 'Security',
      description: 'Security and privacy information',
      icon: <Settings className="h-5 w-5" />,
      articleCount: 4,
      views: 1567
    },
  ];

  const recentSearches: HelpSearch[] = [
    { id: 'search1', query: 'how to reset password', results: 5, timestamp: '2024-01-15T10:30:00Z', user: 'John Doe' },
    { id: 'search2', query: 'dashboard tutorial', results: 8, timestamp: '2024-01-15T09:45:00Z', user: 'Jane Smith' },
    { id: 'search3', query: 'export data', results: 3, timestamp: '2024-01-15T08:20:00Z', user: 'Mike Johnson' },
    { id: 'search4', query: 'api documentation', results: 12, timestamp: '2024-01-14T16:15:00Z', user: 'Sarah Wilson' },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <FileText className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'faq':
        return <HelpCircle className="h-4 w-4" />;
      case 'guide':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'draft':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'archived':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      published: 'default',
      draft: 'secondary',
      archived: 'destructive'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const publishedArticles = helpArticles.filter(article => article.status === 'published').length;
  const totalViews = helpArticles.reduce((acc, article) => acc + article.views, 0);
  const averageHelpfulness = helpArticles.filter(article => article.status === 'published' && article.helpful > 0)
    .reduce((acc, article) => {
      const total = article.helpful + article.notHelpful;
      const percentage = (article.helpful / total) * 100;
      return acc + percentage;
    }, 0) / helpArticles.filter(article => article.status === 'published' && article.helpful > 0).length;

  const filteredArticles = helpArticles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesType = selectedType === 'all' || article.type === selectedType;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Help Center</h1>
          <p className="text-muted-foreground">Manage help articles, documentation, and user support</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Article
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Published Articles</p>
                <p className="text-2xl font-bold">{publishedArticles}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Helpfulness</p>
                <p className="text-2xl font-bold">{Math.round(averageHelpfulness)}%</p>
              </div>
              <ThumbsUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{helpCategories.length}</p>
              </div>
              <Tag className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="articles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="search">Search Analytics</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Help Articles</CardTitle>
                  <CardDescription>Manage help content and documentation</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Analytics</label>
                    <Switch checked={showAnalytics} onCheckedChange={setShowAnalytics} />
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
                      placeholder="Search articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {helpCategories.map(category => (
                      <SelectItem key={category.id} value={category.id.replace('cat', '').toLowerCase()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="faq">FAQ</SelectItem>
                    <SelectItem value="guide">Guide</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {filteredArticles.map(article => (
                  <div key={article.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(article.status)}
                          {getTypeIcon(article.type)}
                          <h3 className="font-medium">{article.title}</h3>
                          {getStatusBadge(article.status)}
                          <Badge variant="outline">{article.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{article.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span>Author: {article.author}</span>
                          <span>•</span>
                          <span>Updated: {new Date(article.lastUpdated).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span>Views: {article.views}</span>
                          <span>•</span>
                          <span>Helpful: {article.helpful}</span>
                          <span>•</span>
                          <span>Not Helpful: {article.notHelpful}</span>
                        </div>
                        {article.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {article.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
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

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Help Categories</CardTitle>
              <CardDescription>Organize help content by categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {helpCategories.map(category => (
                  <div key={category.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {category.icon}
                          <h3 className="font-medium">{category.name}</h3>
                          <Badge variant="outline">{category.articleCount} articles</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
                        <div className="text-sm text-muted-foreground">
                          Total views: {category.views.toLocaleString()}
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

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Analytics</CardTitle>
              <CardDescription>Recent search queries and user behavior</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSearches.map(search => (
                  <div key={search.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Search className="h-4 w-4" />
                          <h3 className="font-medium">"{search.query}"</h3>
                          <Badge variant="outline">{search.results} results</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>User: {search.user}</span>
                          <span>•</span>
                          <span>{new Date(search.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Search className="h-4 w-4 mr-2" />
                          Search
                        </Button>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Article
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Feedback</CardTitle>
              <CardDescription>Helpfulness ratings and user comments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Feedback Analytics</h3>
                <p className="text-muted-foreground">Analyze user feedback to improve help content</p>
                <Button className="mt-4">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UXEnhancementHelpPage;
