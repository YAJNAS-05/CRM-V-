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
import { Palette, Eye, EyeOff, Download, Upload, Plus, Edit, Trash2, Search, Filter, Settings, Zap, Moon, Sun, Monitor, Smartphone, Tablet, CheckCircle, XCircle, AlertTriangle, Star, Users, TrendingUp, Copy, Save } from 'lucide-react';

interface Theme {
  id: string;
  name: string;
  description: string;
  type: 'light' | 'dark' | 'auto' | 'custom';
  status: 'active' | 'inactive' | 'draft';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  typography: {
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
  };
  spacing: {
    small: string;
    medium: string;
    large: string;
  };
  usage: number;
  rating: number;
  lastUpdated: string;
  createdBy: string;
}

interface ThemeVariable {
  id: string;
  name: string;
  category: 'color' | 'typography' | 'spacing' | 'shadow' | 'border';
  value: string;
  description: string;
  usage: number;
}

interface ThemePreview {
  id: string;
  themeId: string;
  device: 'desktop' | 'tablet' | 'mobile';
  component: string;
  screenshot?: string;
}

const UXEnhancementThemesPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [showVariables, setShowVariables] = useState(false);

  const themes: Theme[] = [
    {
      id: 'theme1',
      name: 'Default Light',
      description: 'Clean and modern light theme',
      type: 'light',
      status: 'active',
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
        accent: '#10b981',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#1e293b'
      },
      typography: {
        fontFamily: 'Inter',
        fontSize: '14px',
        fontWeight: '400'
      },
      spacing: {
        small: '4px',
        medium: '8px',
        large: '16px'
      },
      usage: 1250,
      rating: 4.6,
      lastUpdated: '2024-01-15T10:30:00Z',
      createdBy: 'John Doe'
    },
    {
      id: 'theme2',
      name: 'Dark Mode',
      description: 'Easy on the eyes dark theme',
      type: 'dark',
      status: 'active',
      colors: {
        primary: '#60a5fa',
        secondary: '#94a3b8',
        accent: '#34d399',
        background: '#0f172a',
        surface: '#1e293b',
        text: '#f1f5f9'
      },
      typography: {
        fontFamily: 'Inter',
        fontSize: '14px',
        fontWeight: '400'
      },
      spacing: {
        small: '4px',
        medium: '8px',
        large: '16px'
      },
      usage: 890,
      rating: 4.8,
      lastUpdated: '2024-01-14T15:45:00Z',
      createdBy: 'Jane Smith'
    },
    {
      id: 'theme3',
      name: 'High Contrast',
      description: 'Accessibility focused high contrast theme',
      type: 'custom',
      status: 'active',
      colors: {
        primary: '#000000',
        secondary: '#ffffff',
        accent: '#ffff00',
        background: '#ffffff',
        surface: '#f0f0f0',
        text: '#000000'
      },
      typography: {
        fontFamily: 'Arial',
        fontSize: '16px',
        fontWeight: '600'
      },
      spacing: {
        small: '6px',
        medium: '12px',
        large: '24px'
      },
      usage: 156,
      rating: 4.2,
      lastUpdated: '2024-01-13T09:20:00Z',
      createdBy: 'Mike Johnson'
    },
    {
      id: 'theme4',
      name: 'Corporate Blue',
      description: 'Professional corporate theme',
      type: 'custom',
      status: 'draft',
      colors: {
        primary: '#1e40af',
        secondary: '#3b82f6',
        accent: '#059669',
        background: '#ffffff',
        surface: '#eff6ff',
        text: '#1f2937'
      },
      typography: {
        fontFamily: 'Roboto',
        fontSize: '14px',
        fontWeight: '400'
      },
      spacing: {
        small: '4px',
        medium: '8px',
        large: '16px'
      },
      usage: 0,
      rating: 0,
      lastUpdated: '2024-01-12T14:30:00Z',
      createdBy: 'Sarah Wilson'
    },
    {
      id: 'theme5',
      name: 'Auto Theme',
      description: 'Automatically switches between light and dark',
      type: 'auto',
      status: 'active',
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
        accent: '#10b981',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#1e293b'
      },
      typography: {
        fontFamily: 'Inter',
        fontSize: '14px',
        fontWeight: '400'
      },
      spacing: {
        small: '4px',
        medium: '8px',
        large: '16px'
      },
      usage: 567,
      rating: 4.5,
      lastUpdated: '2024-01-11T16:45:00Z',
      createdBy: 'Tom Brown'
    },
  ];

  const themeVariables: ThemeVariable[] = [
    { id: 'var1', name: '--color-primary', category: 'color', value: '#3b82f6', description: 'Primary brand color', usage: 245 },
    { id: 'var2', name: '--color-secondary', category: 'color', value: '#64748b', description: 'Secondary color', usage: 189 },
    { id: 'var3', name: '--font-family-base', category: 'typography', value: 'Inter', description: 'Base font family', usage: 156 },
    { id: 'var4', name: '--spacing-md', category: 'spacing', value: '8px', description: 'Medium spacing', usage: 234 },
    { id: 'var5', name: '--shadow-sm', category: 'shadow', value: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', description: 'Small shadow', usage: 89 },
  ];

  const themePreviews: ThemePreview[] = [
    { id: 'preview1', themeId: 'theme1', device: 'desktop', component: 'Dashboard' },
    { id: 'preview2', themeId: 'theme1', device: 'mobile', component: 'Login' },
    { id: 'preview3', themeId: 'theme2', device: 'desktop', component: 'Dashboard' },
    { id: 'preview4', themeId: 'theme2', device: 'tablet', component: 'Settings' },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'auto':
        return <Monitor className="h-4 w-4" />;
      case 'custom':
        return <Palette className="h-4 w-4" />;
      default:
        return <Palette className="h-4 w-4" />;
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

  const activeThemes = themes.filter(theme => theme.status === 'active').length;
  const totalUsage = themes.reduce((acc, theme) => acc + theme.usage, 0);
  const averageRating = themes.filter(theme => theme.rating > 0)
    .reduce((acc, theme) => acc + theme.rating, 0) / 
  themes.filter(theme => theme.rating > 0).length;

  const filteredThemes = themes.filter(theme => {
    const matchesType = selectedType === 'all' || theme.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || theme.status === selectedStatus;
    const matchesSearch = theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         theme.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Theme Management</h1>
          <p className="text-muted-foreground">Create and manage visual themes for the application</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Theme
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Themes</p>
                <p className="text-2xl font-bold">{activeThemes}</p>
              </div>
              <Palette className="h-8 w-8 text-blue-500" />
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
                <p className="text-sm font-medium text-muted-foreground">Variables</p>
                <p className="text-2xl font-bold">{themeVariables.length}</p>
              </div>
              <Settings className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="themes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="themes">Themes</TabsTrigger>
          <TabsTrigger value="variables">Variables</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="themes" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Theme Library</CardTitle>
                  <CardDescription>Manage visual themes and color schemes</CardDescription>
                </div>
                <div className="flex items-center gap-2">
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
                      placeholder="Search themes..."
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
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
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

              <div className="grid gap-4">
                {filteredThemes.map(theme => (
                  <div key={theme.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(theme.status)}
                          {getTypeIcon(theme.type)}
                          <h3 className="font-medium">{theme.name}</h3>
                          {getStatusBadge(theme.status)}
                          <Badge variant="outline">{theme.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{theme.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span>Created by: {theme.createdBy}</span>
                          <span>•</span>
                          <span>Updated: {new Date(theme.lastUpdated).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm mb-3">
                          <span>Usage: {theme.usage}</span>
                          <span>•</span>
                          <span>Rating: {theme.rating > 0 ? `${theme.rating} ⭐` : 'Not rated'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Colors:</span>
                          {Object.entries(theme.colors).slice(0, 4).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-1">
                              <div 
                                className="w-4 h-4 rounded border border-gray-300" 
                                style={{ backgroundColor: value }}
                              />
                              <span className="text-xs text-muted-foreground">{key}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm">
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
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

        <TabsContent value="variables" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Theme Variables</CardTitle>
                  <CardDescription>Global design tokens and CSS variables</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {themeVariables.map(variable => (
                  <div key={variable.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium font-mono">{variable.name}</h3>
                          <Badge variant="outline">{variable.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{variable.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span>Value: <code className="bg-gray-100 px-2 py-1 rounded">{variable.value}</code></span>
                          <span>Usage: {variable.usage}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
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

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Theme Previews</CardTitle>
              <CardDescription>Preview themes across different devices and components</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {themePreviews.map(preview => {
                  const theme = themes.find(t => t.id === preview.themeId);
                  if (!theme) return null;
                  
                  return (
                    <div key={preview.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium">{theme.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{preview.device}</Badge>
                          <Badge variant="secondary">{preview.component}</Badge>
                        </div>
                      </div>
                      <div 
                        className="border rounded-lg p-4 mb-4"
                        style={{ 
                          backgroundColor: theme.colors.background,
                          color: theme.colors.text,
                          fontFamily: theme.typography.fontFamily
                        }}
                      >
                        <div className="space-y-2">
                          <div 
                            className="px-3 py-2 rounded"
                            style={{ backgroundColor: theme.colors.primary, color: '#ffffff' }}
                          >
                            Primary Button
                          </div>
                          <div 
                            className="px-3 py-2 rounded border"
                            style={{ 
                              backgroundColor: theme.colors.surface,
                              borderColor: theme.colors.secondary,
                              color: theme.colors.text
                            }}
                          >
                            Secondary Button
                          </div>
                          <div style={{ color: theme.colors.text }}>
                            Sample text content with {theme.typography.fontSize} font size
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          Full Preview
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme Usage</CardTitle>
                <CardDescription>Active users per theme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {themes.filter(theme => theme.usage > 0).map(theme => (
                    <div key={theme.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(theme.type)}
                        <span className="text-sm">{theme.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(theme.usage / totalUsage) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{theme.usage}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Theme Ratings</CardTitle>
                <CardDescription>User satisfaction ratings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {themes.filter(theme => theme.rating > 0).map(theme => (
                    <div key={theme.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(theme.type)}
                        <span className="text-sm">{theme.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= Math.floor(theme.rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{theme.rating}</span>
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

export default UXEnhancementThemesPage;
