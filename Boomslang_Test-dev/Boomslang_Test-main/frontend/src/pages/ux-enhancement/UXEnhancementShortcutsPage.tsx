import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Separator } from '../../components/ui/separator';
import { Keyboard, Plus, Edit, Trash2, Search, Filter, Download, Upload, Eye, EyeOff, Settings, Zap, Save, Play, Pause, RotateCcw, CheckCircle, XCircle, AlertTriangle, Users, TrendingUp, Clock, Star, Command, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface KeyboardShortcut {
  id: string;
  name: string;
  description: string;
  category: string;
  keys: string[];
  action: string;
  status: 'active' | 'inactive' | 'confcustom';
  scope: 'global' | 'page' | 'component';
  usage: number;
  satisfaction: number;
  lastUsed: string;
  customizable: boolean;
}

interface ShortcutCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  shortcuts: number;
  usage: number;
}

interface UserShortcut {
  id: string;
  userId: string;
  userName: string;
  shortcutId: string;
  shortcutName: string;
  customKeys: string[];
  createdAt: string;
  usage: number;
}

const UXEnhancementShortcutsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedScope, setSelectedScope] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [enableTooltips, setEnableTooltips] = useState(true);

  const keyboardShortcuts: KeyboardShortcut[] = [
    {
      id: 'shortcut1',
      name: 'Save',
      description: 'Save current work or form',
      category: 'file',
      keys: ['Ctrl', 'S'],
      action: 'save()',
      status: 'active',
      scope: 'global',
      usage: 3450,
      satisfaction: 95,
      lastUsed: '2024-01-15T10:30:00Z',
      customizable: true
    },
    {
      id: 'shortcut2',
      name: 'Copy',
      description: 'Copy selected content',
      category: 'edit',
      keys: ['Ctrl', 'C'],
      action: 'copy()',
      status: 'active',
      scope: 'global',
      usage: 2890,
      satisfaction: 98,
      lastUsed: '2024-01-15T10:25:00Z',
      customizable: false
    },
    {
      id: 'shortcut3',
      name: 'New Dashboard',
      description: 'Create new dashboard',
      category: 'navigation',
      keys: ['Ctrl', 'Shift', 'D'],
      action: 'createDashboard()',
      status: 'active',
      scope: 'page',
      usage: 567,
      satisfaction: 82,
      lastUsed: '2024-01-15T09:45:00Z',
      customizable: true
    },
    {
      id: 'shortcut4',
      name: 'Search',
      description: 'Open global search',
      category: 'navigation',
      keys: ['Ctrl', 'K'],
      action: 'openSearch()',
      status: 'active',
      scope: 'global',
      usage: 1234,
      satisfaction: 89,
      lastUsed: '2024-01-15T10:15:00Z',
      customizable: true
    },
    {
      id: 'shortcut5',
      name: 'Toggle Sidebar',
      description: 'Show/hide sidebar',
      category: 'view',
      keys: ['Ctrl', 'B'],
      action: 'toggleSidebar()',
      status: 'active',
      scope: 'page',
      usage: 890,
      satisfaction: 76,
      lastUsed: '2024-01-15T08:30:00Z',
      customizable: true
    },
    {
      id: 'shortcut6',
      name: 'Quick Add',
      description: 'Add new item quickly',
      category: 'actions',
      keys: ['Ctrl', 'N'],
      action: 'quickAdd()',
      status: 'inactive',
      scope: 'global',
      usage: 0,
      satisfaction: 0,
      lastUsed: '',
      customizable: true
    },
    {
      id: 'shortcut7',
      name: 'Export Data',
      description: 'Export current data',
      category: 'file',
      keys: ['Ctrl', 'E'],
      action: 'export()',
      status: 'active',
      scope: 'page',
      usage: 234,
      satisfaction: 71,
      lastUsed: '2024-01-14T16:20:00Z',
      customizable: true
    },
    {
      id: 'shortcut8',
      name: 'Custom Theme',
      description: 'User-defined custom shortcut',
      category: 'custom',
      keys: ['Ctrl', 'Shift', 'T'],
      action: 'customTheme()',
      status: 'custom',
      scope: 'global',
      usage: 45,
      satisfaction: 85,
      lastUsed: '2024-01-13T11:45:00Z',
      customizable: true
    },
  ];

  const shortcutCategories: ShortcutCategory[] = [
    {
      id: 'cat1',
      name: 'File Operations',
      description: 'File and document operations',
      icon: <Save className="h-5 w-5" />,
      shortcuts: 2,
      usage: 3684
    },
    {
      id: 'cat2',
      name: 'Edit',
      description: 'Text editing and manipulation',
      icon: <Edit className="h-5 w-5" />,
      shortcuts: 1,
      usage: 2890
    },
    {
      id: 'cat3',
      name: 'Navigation',
      description: 'Navigation and movement',
      icon: <ArrowUp className="h-5 w-5" />,
      shortcuts: 2,
      usage: 1801
    },
    {
      id: 'cat4',
      name: 'View',
      description: 'View and display options',
      icon: <Eye className="h-5 w-5" />,
      shortcuts: 1,
      usage: 890
    },
    {
      id: 'cat5',
      name: 'Actions',
      description: 'Quick actions and commands',
      icon: <Zap className="h-5 w-5" />,
      shortcuts: 1,
      usage: 0
    },
    {
      id: 'cat6',
      name: 'Custom',
      description: 'User-defined shortcuts',
      icon: <Settings className="h-5 w-5" />,
      shortcuts: 1,
      usage: 45
    },
  ];

  const userShortcuts: UserShortcut[] = [
    {
      id: 'user1',
      userId: 'user1',
      userName: 'John Doe',
      shortcutId: 'shortcut8',
      shortcutName: 'Custom Theme',
      customKeys: ['Ctrl', 'Shift', 'T'],
      createdAt: '2024-01-10T14:30:00Z',
      usage: 45
    },
    {
      id: 'user2',
      userId: 'user2',
      userName: 'Jane Smith',
      shortcutId: 'shortcut3',
      shortcutName: 'New Dashboard',
      customKeys: ['Ctrl', 'Alt', 'D'],
      createdAt: '2024-01-08T09:15:00Z',
      usage: 23
    },
    {
      id: 'user3',
      userId: 'user3',
      userName: 'Mike Johnson',
      shortcutId: 'shortcut4',
      shortcutName: 'Search',
      customKeys: ['Ctrl', 'Shift', 'K'],
      createdAt: '2024-01-12T16:45:00Z',
      usage: 67
    },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'file':
        return <Save className="h-4 w-4" />;
      case 'edit':
        return <Edit className="h-4 w-4" />;
      case 'navigation':
        return <ArrowUp className="h-4 w-4" />;
      case 'view':
        return <Eye className="h-4 w-4" />;
      case 'actions':
        return <Zap className="h-4 w-4" />;
      case 'custom':
        return <Settings className="h-4 w-4" />;
      default:
        return <Keyboard className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'custom':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      inactive: 'destructive',
      custom: 'secondary'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const activeShortcuts = keyboardShortcuts.filter(shortcut => shortcut.status === 'active').length;
  const totalUsage = keyboardShortcuts.reduce((acc, shortcut) => acc + shortcut.usage, 0);
  const averageSatisfaction = keyboardShortcuts.filter(shortcut => shortcut.satisfaction > 0)
    .reduce((acc, shortcut) => acc + shortcut.satisfaction, 0) / 
  keyboardShortcuts.filter(shortcut => shortcut.satisfaction > 0).length;

  const filteredShortcuts = keyboardShortcuts.filter(shortcut => {
    const matchesCategory = selectedCategory === 'all' || shortcut.category === selectedCategory;
    const matchesScope = selectedScope === 'all' || shortcut.scope === selectedScope;
    const matchesSearch = shortcut.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shortcut.keys.some(key => key.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCustom = !showCustom || shortcut.customizable;
    
    return matchesCategory && matchesScope && matchesSearch && matchesCustom;
  });

  const renderKeys = (keys: string[]) => {
    return (
      <div className="flex items-center gap-1">
        {keys.map((key, index) => (
          <React.Fragment key={index}>
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">
              {key}
            </kbd>
            {index < keys.length - 1 && <span className="text-xs text-gray-500">+</span>}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Keyboard Shortcuts</h1>
          <p className="text-muted-foreground">Configure and manage keyboard shortcuts for power users</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Shortcut
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Shortcuts</p>
                <p className="text-2xl font-bold">{activeShortcuts}</p>
              </div>
              <Keyboard className="h-8 w-8 text-blue-500" />
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
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Satisfaction</p>
                <p className="text-2xl font-bold">{Math.round(averageSatisfaction)}%</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Custom Shortcuts</p>
                <p className="text-2xl font-bold">{userShortcuts.length}</p>
              </div>
              <Settings className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="shortcuts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="shortcuts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Keyboard Shortcuts</CardTitle>
                  <CardDescription>Manage keyboard shortcuts and hotkeys</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Show Customizable</label>
                    <Switch checked={showCustom} onCheckedChange={setShowCustom} />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Tooltips</label>
                    <Switch checked={enableTooltips} onCheckedChange={setEnableTooltips} />
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
                      placeholder="Search shortcuts..."
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
                    {shortcutCategories.map(category => (
                      <SelectItem key={category.id} value={category.id.replace('cat', '').toLowerCase()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedScope} onValueChange={setSelectedScope}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Scopes</SelectItem>
                    <SelectItem value="global">Global</SelectItem>
                    <SelectItem value="page">Page</SelectItem>
                    <SelectItem value="component">Component</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {filteredShortcuts.map(shortcut => (
                  <div key={shortcut.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(shortcut.status)}
                          {getCategoryIcon(shortcut.category)}
                          <h3 className="font-medium">{shortcut.name}</h3>
                          {getStatusBadge(shortcut.status)}
                          <Badge variant="outline">{shortcut.category}</Badge>
                          <Badge variant="secondary">{shortcut.scope}</Badge>
                          {shortcut.customizable && (
                            <Badge variant="outline" className="text-xs">Customizable</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{shortcut.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span>Keys: {renderKeys(shortcut.keys)}</span>
                          <span>•</span>
                          <span>Action: {shortcut.action}</span>
                        </div>
                        {shortcut.usage > 0 && (
                          <div className="flex items-center gap-4 text-sm">
                            <span>Usage: {shortcut.usage}</span>
                            <span>•</span>
                            <span>Satisfaction: {shortcut.satisfaction}%</span>
                            <span>•</span>
                            <span>Last used: {new Date(shortcut.lastUsed).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {shortcut.customizable && (
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Customize
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Test
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
              <CardTitle>Shortcut Categories</CardTitle>
              <CardDescription>Organize shortcuts by functional categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {shortcutCategories.map(category => (
                  <div key={category.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {category.icon}
                          <h3 className="font-medium">{category.name}</h3>
                          <Badge variant="outline">{category.shortcuts} shortcuts</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                        <div className="text-sm text-muted-foreground mt-2">
                          Total usage: {category.usage.toLocaleString()}
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

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Shortcuts</CardTitle>
              <CardDescription>User-defined keyboard shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userShortcuts.map(userShortcut => (
                  <div key={userShortcut.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Settings className="h-4 w-4" />
                          <h3 className="font-medium">{userShortcut.shortcutName}</h3>
                          <Badge variant="outline">{userShortcut.userName}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span>Custom Keys: {renderKeys(userShortcut.customKeys)}</span>
                          <span>•</span>
                          <span>Usage: {userShortcut.usage}</span>
                          <span>•</span>
                          <span>Created: {new Date(userShortcut.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Test
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
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
                <CardTitle>Most Used Shortcuts</CardTitle>
                <CardDescription>Keyboard shortcuts by usage frequency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {keyboardShortcuts
                    .filter(shortcut => shortcut.usage > 0)
                    .sort((a, b) => b.usage - a.usage)
                    .slice(0, 5)
                    .map(shortcut => (
                      <div key={shortcut.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(shortcut.category)}
                          <span className="text-sm">{shortcut.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${(shortcut.usage / totalUsage) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{shortcut.usage}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Usage</CardTitle>
                <CardDescription>Usage distribution by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shortcutCategories.map(category => (
                    <div key={category.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {category.icon}
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${(category.usage / totalUsage) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{category.usage}</span>
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

export default UXEnhancementShortcutsPage;
