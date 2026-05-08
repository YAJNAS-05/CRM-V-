import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Text AutoComplete } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Separator } from '../../components/ui/separator';
import { Plus, Edit, Trash2, Search, Filter, Download, Upload, Eye, EyeOff, Settings, Zap, Save, Play, Pause, RotateCcw, CheckCircle, XCircle, AlertTriangle, Users, TrendingUp, Clock, Star, Layout, Grid, List, Monitor, Smartphone, Tablet, Code, Palette } from 'lucide-react';

interface Widget {
  id: string;
  name: string;
  description: string;
  type: 'chart' | 'table' | 'form' | 'card' | 'list' | 'custom';
  category: string;
  status: 'active' | 'inactive' | 'draft';
  size: 'small' | 'medium' | 'large' | 'fullscreen';
  responsive: boolean;
  customizable: boolean;
  config: {
    dataSource: string;
    refreshInterval: number;
    showHeader: boolean;
    showFooter: boolean;
  };
  usage: number;
  rating: number;
  lastUpdated: string;
  createdBy: string;
}

interface WidgetTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  preview: string;
  usage: number;
  rating: number;
  featured: boolean;
}

interface WidgetLayout {
  id: string;
  name: string;
  description: string;
  widgets: string[];
  layout: 'grid' | 'flex' | 'custom';
  responsive: boolean;
  status: 'active' | 'inactive';
  usage: number;
}

const UXEnhancementWidgetsPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [showCustom, setShowCustom] = useState(false);

  const widgets: Widget[] = [
    {
      id: 'widget1',
      name: 'Sales Dashboard',
      description: 'Real-time sales metrics and charts',
      type: 'chart',
      category: 'analytics',
      status: 'active',
      size: 'large',
      responsive: true,
      customizable: true,
      config: {
        dataSource: 'sales_api',
        refreshInterval: 30,
        showHeader: true,
        showFooter: true
      },
      usage: 1250,
      rating: 4.6,
      lastUpdated: '2024-01-15T10:30:00Z',
      createdBy: 'John Doe'
    },
    {
      id: 'widget2',
      name: 'User List',
      description: 'Display list of users with search and filters',
      type: 'table',
      category: 'data',
      status: 'active',
      size: 'medium',
      responsive: true,
      customizable: true,
      config: {
        dataSource: 'users_db',
        refreshInterval: 60,
        showHeader: true,
        showFooter: false
      },
      usage: 890,
      rating: 4.3,
      lastUpdated: '2024-01-14T15:45:00Z',
      createdBy: 'Jane Smith'
    },
    {
      id: 'widget3',
      name: 'Quick Actions',
      description: 'Quick action buttons for common tasks',
      type: 'card',
      category: 'navigation',
      status: 'active',
      size: 'small',
      responsive: true,
      customizable: true,
      config: {
        dataSource: 'static',
        refreshInterval: 0,
        showHeader: false,
        showFooter: false
      },
      usage: 2100,
      rating: 4.8,
      lastUpdated: '2024-01-13T09:20:00Z',
      createdBy: 'Mike Johnson'
    },
    {
      id: 'widget4',
      name: 'Task Form',
      description: 'Create and edit tasks with validation',
      type: 'form',
      category: 'forms',
      status: 'draft',
      size: 'medium',
      responsive: false,
      customizable: true,
      config: {
        dataSource: 'tasks_api',
        refreshInterval: 0,
        showHeader: true,
        showFooter: true
      },
      usage: 0,
      rating: 0,
      lastUpdated: '2024-01-12T14:30:00Z',
      createdBy: 'Sarah Wilson'
    },
    {
      id: 'widget5',
      name: 'Activity Feed',
      description: 'Real-time activity updates and notifications',
      type: 'list',
      category: 'social',
      status: 'active',
      size: 'medium',
      responsive: true,
      customizable: true,
      config: {
        dataSource: 'activity_stream',
        refreshInterval: 15,
        showHeader: true,
        showFooter: false
      },
      usage: 567,
      rating: 4.1,
      lastUpdated: '2024-01-11T16:45:00Z',
      createdBy: 'Tom Brown'
    },
    {
      id: 'widget6',
      name: 'Custom Chart',
      description: 'User-defined custom chart widget',
      type: 'custom',
      category: 'custom',
      status: 'active',
      size: 'large',
      responsive: true,
      customizable: true,
      config: {
        dataSource: 'custom_api',
        refreshInterval: 45,
        showHeader: true,
        showFooter: true
      },
      usage: 89,
      rating: 4.5,
      lastUpdated: '2024-01-10T11:15:00Z',
      createdBy: 'Alice Green'
    },
  ];

  const widgetTemplates: WidgetTemplate[] = [
    {
      id: 'template1',
      name: 'Analytics Dashboard',
      description: 'Complete analytics dashboard template',
      category: 'analytics',
      preview: '/templates/analytics.png',
      usage: 450,
      rating: 4.7,
      featured: true
    },
    {
      id: 'template2',
      name: 'CRM Overview',
      description: 'Customer relationship management overview',
      category: 'crm',
      preview: '/templates/crm.png',
      usage: 320,
      rating: 4.5,
      featured: true
    },
    {
      id: 'template3',
      name: 'Project Management',
      description: 'Project tracking and management widgets',
      category: 'project',
      preview: '/templates/project.png',
      usage: 280,
      rating: 4.3,
      featured: false
    },
  ];

  const widgetLayouts: WidgetLayout[] = [
    {
      id: 'layout1',
      name: 'Default Dashboard',
      description: 'Standard dashboard layout with 4 widgets',
      widgets: ['widget1', 'widget2', 'widget3', 'widget5'],
      layout: 'grid',
      responsive: true,
      status: 'active',
      usage: 1250
    },
    {
      id: 'layout2',
      name: 'Mobile Dashboard',
      description: 'Optimized layout for mobile devices',
      widgets: ['widget3', 'widget5'],
      layout: 'flex',
      responsive: true,
      status: 'active',
      usage: 567
    },
    {
      id: 'layout3',
      name: 'Analytics View',
      description: 'Analytics-focused layout',
      widgets: ['widget1', 'widget6'],
      layout: 'custom',
      responsive: false,
      status: 'inactive',
      usage: 89
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'chart':
        return <Grid className="h-4 w-4" />;
      case 'table':
        return <List className="h-4 w-4" />;
      case 'form':
        return <Edit className="h-4 w-4" />;
      case 'card':
        return <Layout className="h-4 w-4" />;
      case 'list':
        return <List className="h-4 w-4" />;
      case 'custom':
        return <Code className="h-4 w-4" />;
      default:
        return <Grid className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'draft':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      inactive: 'destructive',
      draft: 'secondary'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const getSizeBadge = (size: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      small: 'outline',
      medium: 'secondary',
      large: 'default',
      fullscreen: 'destructive'
    };
    return <Badge variant={variants[size] || 'outline'}>{size}</Badge>;
  };

  const activeWidgets = widgets.filter(widget => widget.status === 'active').length;
  const totalUsage = widgets.reduce((acc, widget) => acc + widget.usage, 0);
  const averageRating = widgets.filter(widget => widget.rating > 0)
    .reduce((acc, widget) => acc + widget.rating, 0) / 
  widgets.filter(widget => widget.rating > 0).length;

  const filteredWidgets = widgets.filter(widget => {
    const matchesType = selectedType === 'all' || widget.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || widget.category === selectedCategory;
    const matchesSearch = widget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         widget.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCustom = !showCustom || widget.customizable;
    
    return matchesType && matchesCategory && matchesSearch && matchesCustom;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Widget Management</h1>
          <p className="text-muted-foreground">Create and manage reusable UI widgets</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Widget
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Widgets</p>
                <p className="text-2xl font-bold">{activeWidgets}</p>
              </div>
              <Grid className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Usage</p>
                <p className="text-2xl font-bold">{totalUsage.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Templates</p>
                <p className="text-2xl font-bold">{widgetTemplates.length}</p>
              </div>
              <Layout className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="widgets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="widgets">Widgets</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="layouts">Layouts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="widgets" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Widget Library</CardTitle>
                  <CardDescription>Manage reusable UI components and widgets</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Preview</label>
                    <Switch checked={previewMode} onCheckedChange={setPreviewMode} />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Customizable</label>
                    <Switch checked={showCustom} onCheckedChange={setShowCustom} />
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
                      placeholder="Search widgets..."
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
                    <SelectItem value="chart">Chart</SelectItem>
                    <SelectItem value="table">Table</SelectItem>
                    <SelectItem value="form">Form</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="list">List</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="data">Data</SelectItem>
                    <SelectItem value="navigation">Navigation</SelectItem>
                    <SelectItem value="forms">Forms</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4">
                {filteredWidgets.map(widget => (
                  <div key={widget.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(widget.status)}
                          {getTypeIcon(widget.type)}
                          <h3 className="font-medium">{widget.name}</h3>
                          {getStatusBadge(widget.status)}
                          <Badge variant="outline">{widget.type}</Badge>
                          <Badge variant="secondary">{widget.category}</Badge>
                          {getSizeBadge(widget.size)}
                          {widget.responsive && (
                            <Badge variant="outline" className="text-xs">Responsive</Badge>
                          )}
                          {widget.customizable && (
                            <Badge variant="outline" className="text-xs">Customizable</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{widget.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span>Created by: {widget.createdBy}</span>
                          <span>•</span>
                          <span>Updated: {new Date(widget.lastUpdated).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm mb-2">
                          <span>Usage: {widget.usage}</span>
                          <span>•</span>
                          <span>Rating: {widget.rating > 0 ? `${widget.rating} ⭐` : 'Not rated'}</span>
                          <span>•</span>
                          <span>Refresh: {widget.config.refreshInterval}s</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Data Source: {widget.config.dataSource}</span>
                          <span>•</span>
                          <span>Header: {widget.config.showHeader ? 'Yes' : 'No'}</span>
                          <span>•</span>
                          <span>Footer: {widget.config.showFooter ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm">
                          <Code className="h-4 w-4 mr-2" />
                          Code
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

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Widget Templates</CardTitle>
              <CardDescription>Pre-built widget templates for quick setup</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {widgetTemplates.map(template => (
                  <div key={template.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{template.name}</h3>
                          {template.featured && <Badge variant="default">Featured</Badge>}
                          <Badge variant="outline">{template.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span>Usage: {template.usage}</span>
                          <span>•</span>
                          <span>Rating: {template.rating} ⭐</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
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

        <TabsContent value="layouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Widget Layouts</CardTitle>
              <CardDescription>Predefined widget arrangements and layouts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {widgetLayouts.map(layout => (
                  <div key={layout.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{layout.name}</h3>
                          {getStatusBadge(layout.status)}
                          <Badge variant="outline">{layout.layout}</Badge>
                          {layout.responsive && (
                            <Badge variant="outline" className="text-xs">Responsive</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{layout.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span>Widgets: {layout.widgets.length}</span>
                          <span>•</span>
                          <span>Usage: {layout.usage}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {layout.widgets.map(widgetId => {
                            const widget = widgets.find(w => w.id === widgetId);
                            return widget ? (
                              <Badge key={widgetId} variant="outline" className="text-xs">
                                {widget.name}
                              </Badge>
                            ) : null;
                          })}
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

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Widget Usage</CardTitle>
                <CardDescription>Most used widgets by frequency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {widgets
                    .filter(widget => widget.usage > 0)
                    .sort((a, b) => b.usage - a.usage)
                    .slice(0, 5)
                    .map(widget => (
                      <div key={widget.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(widget.type)}
                          <span className="text-sm">{widget.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${(widget.usage / totalUsage) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{widget.usage}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Widget Ratings</CardTitle>
                <CardDescription>User satisfaction ratings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {widgets
                    .filter(widget => widget.rating > 0)
                    .sort((a, b) => b.rating - a.rating)
                    .slice(0, 5)
                    .map(widget => (
                      <div key={widget.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(widget.type)}
                          <span className="text-sm">{widget.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= Math.floor(widget.rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium">{widget.rating}</span>
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

export default UXEnhancementWidgetsPage;
