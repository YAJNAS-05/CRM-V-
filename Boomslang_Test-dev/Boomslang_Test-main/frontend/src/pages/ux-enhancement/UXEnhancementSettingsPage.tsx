import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Separator } from '../../components/ui/separator';
import { Settings, Save, RotateCcw, Download, Upload, Eye, EyeOff, Lock, Unlock, Globe, Palette, Zap, Bell, Shield, Database, Users, Clock, AlertTriangle } from 'lucide-react';

interface SettingCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  settings: SettingItem[];
}

interface SettingItem {
  id: string;
  name: string;
  description: string;
  type: 'boolean' | 'string' | 'number' | 'select' | 'textarea';
  value: any;
  options?: string[];
  category: string;
  sensitive?: boolean;
}

const UXEnhancementSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [showSensitive, setShowSensitive] = useState(false);

  const [settings, setSettings] = useState<SettingItem[]>([
    // General Settings
    { id: 'auto-save', name: 'Auto-save Changes', description: 'Automatically save user preferences', type: 'boolean', value: true, category: 'general' },
    { id: 'session-timeout', name: 'Session Timeout', description: 'Minutes before automatic logout', type: 'number', value: 30, category: 'general' },
    { id: 'language', name: 'Default Language', description: 'Interface language preference', type: 'select', value: 'en', options: ['en', 'es', 'fr', 'de', 'ja'], category: 'general' },
    { id: 'timezone', name: 'Timezone', description: 'User timezone setting', type: 'select', value: 'UTC', options: ['UTC', 'EST', 'PST', 'CET', 'JST'], category: 'general' },
    
    // Appearance Settings
    { id: 'theme', name: 'Theme', description: 'Visual theme for the interface', type: 'select', value: 'light', options: ['light', 'dark', 'auto'], category: 'appearance' },
    { id: 'font-size', name: 'Font Size', description: 'Base font size for text', type: 'select', value: 'medium', options: ['small', 'medium', 'large', 'extra-large'], category: 'appearance' },
    { id: 'animations', name: 'Enable Animations', description: 'Show interface animations', type: 'boolean', value: true, category: 'appearance' },
    { id: 'compact-mode', name: 'Compact Mode', description: 'Reduce spacing between elements', type: 'boolean', value: false, category: 'appearance' },
    
    // Performance Settings
    { id: 'cache-enabled', name: 'Enable Caching', description: 'Cache frequently accessed data', type: 'boolean', value: true, category: 'performance' },
    { id: 'cache-ttl', name: 'Cache TTL', description: 'Cache duration in minutes', type: 'number', value: 60, category: 'performance' },
    { id: 'lazy-loading', name: 'Lazy Loading', description: 'Load components on demand', type: 'boolean', value: true, category: 'performance' },
    { id: 'compression', name: 'Enable Compression', description: 'Compress API responses', type: 'boolean', value: true, category: 'performance' },
    
    // Notification Settings
    { id: 'email-notifications', name: 'Email Notifications', description: 'Receive email updates', type: 'boolean', value: true, category: 'notifications' },
    { id: 'push-notifications', name: 'Push Notifications', description: 'Browser push notifications', type: 'boolean', value: false, category: 'notifications' },
    { id: 'notification-frequency', name: 'Notification Frequency', description: 'How often to send notifications', type: 'select', value: 'daily', options: ['immediate', 'hourly', 'daily', 'weekly'], category: 'notifications' },
    { id: 'notification-types', name: 'Notification Types', description: 'Types of notifications to receive', type: 'textarea', value: 'system, security, updates', category: 'notifications' },
    
    // Security Settings
    { id: 'two-factor', name: 'Two-Factor Authentication', description: 'Require 2FA for all users', type: 'boolean', value: false, category: 'security' },
    { id: 'password-policy', name: 'Password Policy', description: 'Minimum password requirements', type: 'select', value: 'medium', options: ['weak', 'medium', 'strong'], category: 'security' },
    { id: 'session-encryption', name: 'Session Encryption', description: 'Encrypt session data', type: 'boolean', value: true, category: 'security' },
    { id: 'api-key-rotation', name: 'API Key Rotation', description: 'Days between key rotation', type: 'number', value: 90, category: 'security', sensitive: true },
    
    // Data Settings
    { id: 'data-retention', name: 'Data Retention Period', description: 'Days to keep user data', type: 'number', value: 365, category: 'data' },
    { id: 'backup-frequency', name: 'Backup Frequency', description: 'How often to backup data', type: 'select', value: 'daily', options: ['hourly', 'daily', 'weekly'], category: 'data' },
    { id: 'export-format', name: 'Export Format', description: 'Default format for data exports', type: 'select', value: 'json', options: ['json', 'csv', 'xml'], category: 'data' },
    { id: 'analytics-tracking', name: 'Analytics Tracking', description: 'Collect usage analytics', type: 'boolean', value: true, category: 'data' },
  ]);

  const settingCategories: SettingCategory[] = [
    {
      id: 'general',
      name: 'General',
      description: 'Basic application settings',
      icon: <Settings className="h-4 w-4" />,
      settings: settings.filter(s => s.category === 'general')
    },
    {
      id: 'appearance',
      name: 'Appearance',
      description: 'Visual and interface settings',
      icon: <Palette className="h-4 w-4" />,
      settings: settings.filter(s => s.category === 'appearance')
    },
    {
      id: 'performance',
      name: 'Performance',
      description: 'System performance optimization',
      icon: <Zap className="h-4 w-4" />,
      settings: settings.filter(s => s.category === 'performance')
    },
    {
      id: 'notifications',
      name: 'Notifications',
      description: 'Alert and notification preferences',
      icon: <Bell className="h-4 w-4" />,
      settings: settings.filter(s => s.category === 'notifications')
    },
    {
      id: 'security',
      name: 'Security',
      description: 'Security and privacy settings',
      icon: <Shield className="h-4 w-4" />,
      settings: settings.filter(s => s.category === 'security')
    },
    {
      id: 'data',
      name: 'Data Management',
      description: 'Data storage and retention settings',
      icon: <Database className="h-4 w-4" />,
      settings: settings.filter(s => s.category === 'data')
    }
  ];

  const updateSetting = (id: string, value: any) => {
    setSettings(prev => prev.map(setting => 
      setting.id === id ? { ...setting, value } : setting
    ));
    setHasChanges(true);
  };

  const handleSave = () => {
    setHasChanges(false);
  };

  const handleReset = () => {
    setHasChanges(false);
  };

  const handleExport = () => {
    const exportData = settings.reduce((acc, setting) => {
      acc[setting.id] = setting.value;
      return acc;
    }, {} as Record<string, any>);
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ux-settings.json';
    a.click();
  };

  const renderSettingInput = (setting: SettingItem) => {
    if (setting.sensitive && !showSensitive) {
      return (
        <div className="flex items-center gap-2">
          <Input type="password" value="••••••••" disabled />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSensitive(true)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    switch (setting.type) {
      case 'boolean':
        return (
          <Switch
            checked={setting.value}
            onCheckedChange={(checked) => updateSetting(setting.id, checked)}
          />
        );
      case 'string':
        return (
          <Input
            value={setting.value}
            onChange={(e) => updateSetting(setting.id, e.target.value)}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={setting.value}
            onChange={(e) => updateSetting(setting.id, parseInt(e.target.value))}
          />
        );
      case 'select':
        return (
          <Select value={setting.value} onValueChange={(value) => updateSetting(setting.id, value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {setting.options?.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'textarea':
        return (
          <Textarea
            value={setting.value}
            onChange={(e) => updateSetting(setting.id, e.target.value)}
            rows={3}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">UX Enhancement Settings</h1>
          <p className="text-muted-foreground">Configure application preferences and behavior</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {hasChanges && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">You have unsaved changes. Remember to save your settings.</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          {settingCategories.map(category => (
            <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
              {category.icon}
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {settingCategories.map(category => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {category.icon}
                  {category.name}
                </CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {category.settings.map(setting => (
                  <div key={setting.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label htmlFor={setting.id} className="flex items-center gap-2">
                          {setting.name}
                          {setting.sensitive && (
                            <Badge variant="secondary" className="text-xs">
                              <Lock className="h-3 w-3 mr-1" />
                              Sensitive
                            </Badge>
                          )}
                        </Label>
                        <p className="text-sm text-muted-foreground">{setting.description}</p>
                      </div>
                      <div className="w-64">
                        {renderSettingInput(setting)}
                      </div>
                    </div>
                    {category.settings.indexOf(setting) < category.settings.length - 1 && (
                      <Separator />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default UXEnhancementSettingsPage;
