import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Shield, 
  Lock, 
  Key, 
  Clock, 
  Users, 
  Settings,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Upload,
  Save,
  Bell,
  Database,
  Globe,
  Smartphone
} from 'lucide-react';
import { toast } from 'sonner';
import { securityApi } from '../../api/securityApi';

const SecuritySettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    // General Security
    enableBruteForceProtection: true,
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    sessionTimeout: 60,
    enableSessionMonitoring: true,
    
    // Password Policy
    minPasswordLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    passwordExpiryDays: 90,
    preventReuse: 5,
    
    // MFA Settings
    requireMfaForAdmin: true,
    requireMfaForSensitive: true,
    allowMfaBypass: false,
    mfaGracePeriod: 7,
    
    // Session Management
    maxConcurrentSessions: 3,
    allowRememberDevice: true,
    deviceTrustDuration: 30,
    
    // Monitoring & Alerts
    enableRealTimeMonitoring: true,
    enableEmailAlerts: true,
    enableSmsAlerts: false,
    alertThreshold: 3,
    
    // Data Protection
    enableEncryption: true,
    enableAuditLogging: true,
    auditRetentionDays: 365,
    enableDataMasking: false,
    
    // Network Security
    enableIpWhitelisting: false,
    enableGeoBlocking: false,
    allowedCountries: ['US', 'CA', 'UK', 'AU'],
    blockedCountries: ['CN', 'RU', 'KP', 'IR'],
    
    // API Security
    enableApiRateLimit: true,
    apiRateLimit: 1000,
    enableApiKeyAuth: true,
    apiTokenExpiry: 24
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Load settings from API on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsData = await securityApi.getSettings('general');
        if (settingsData) {
          setSettings(settingsData);
        }
      } catch (error) {
        console.error('Failed to load security settings:', error);
        toast.error('Failed to load security settings');
      }
    };
    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Use real securityApi to save settings
      await securityApi.updateSettings('general', settings);
      toast.success('Security settings saved successfully');
    } catch (error) {
      console.error('Failed to save security settings:', error);
      toast.error('Failed to save security settings');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = async () => {
    setLoading(true);
    try {
      // Use real securityApi to reset settings
      await securityApi.resetSettings('general');
      toast.success('Security settings reset to defaults');
      // Reload settings after reset
      const settingsData = await securityApi.getSettings('general');
      if (settingsData) {
        setSettings(settingsData);
      }
    } catch (error) {
      console.error('Failed to reset security settings:', error);
      toast.error('Failed to reset security settings');
    } finally {
      setLoading(false);
    }
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'security-settings.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Security settings exported');
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          setSettings({ ...settings, ...imported });
          toast.success('Security settings imported successfully');
        } catch (error) {
          toast.error('Failed to import security settings');
        }
      };
      reader.readAsText(file);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
          <p className="text-gray-600">Configure global security settings and policies</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExportSettings}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button variant="outline" onClick={() => document.getElementById('import-settings')?.click()}>
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          <input
            id="import-settings"
            type="file"
            accept=".json"
            onChange={handleImportSettings}
            className="hidden"
          />
          <Button variant="outline" onClick={handleResetSettings} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Reset
          </Button>
          <Button onClick={handleSaveSettings} disabled={loading}>
            <Save className="h-4 w-4 mr-1" />
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Status:</strong> Your current security configuration is <span className="text-green-600 font-medium">Strong</span>. 
          Consider enabling additional monitoring features for enhanced protection.
        </AlertDescription>
      </Alert>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center space-x-1">
            <Settings className="h-4 w-4" />
            <span>General</span>
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center space-x-1">
            <Key className="h-4 w-4" />
            <span>Password</span>
          </TabsTrigger>
          <TabsTrigger value="mfa" className="flex items-center space-x-1">
            <Shield className="h-4 w-4" />
            <span>MFA</span>
          </TabsTrigger>
          <TabsTrigger value="session" className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>Session</span>
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center space-x-1">
            <Bell className="h-4 w-4" />
            <span>Monitoring</span>
          </TabsTrigger>
          <TabsTrigger value="network" className="flex items-center space-x-1">
            <Globe className="h-4 w-4" />
            <span>Network</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Brute Force Protection</Label>
                  <p className="text-sm text-gray-600">Protect against repeated login attempts</p>
                </div>
                <Switch
                  checked={settings.enableBruteForceProtection}
                  onCheckedChange={(checked) => updateSetting('enableBruteForceProtection', checked)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Max Login Attempts</Label>
                  <Input
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => updateSetting('maxLoginAttempts', parseInt(e.target.value))}
                    min="3"
                    max="10"
                  />
                </div>
                <div>
                  <Label>Lockout Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={settings.lockoutDuration}
                    onChange={(e) => updateSetting('lockoutDuration', parseInt(e.target.value))}
                    min="5"
                    max="1440"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Session Monitoring</Label>
                  <p className="text-sm text-gray-600">Monitor active user sessions</p>
                </div>
                <Switch
                  checked={settings.enableSessionMonitoring}
                  onCheckedChange={(checked) => updateSetting('enableSessionMonitoring', checked)}
                />
              </div>

              <div>
                <Label>Default Session Timeout (minutes)</Label>
                <Input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                  min="15"
                  max="480"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Password Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Minimum Password Length</Label>
                <Input
                  type="number"
                  value={settings.minPasswordLength}
                  onChange={(e) => updateSetting('minPasswordLength', parseInt(e.target.value))}
                  min="8"
                  max="32"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label>Require Uppercase</Label>
                  <Switch
                    checked={settings.requireUppercase}
                    onCheckedChange={(checked) => updateSetting('requireUppercase', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Require Lowercase</Label>
                  <Switch
                    checked={settings.requireLowercase}
                    onCheckedChange={(checked) => updateSetting('requireLowercase', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Require Numbers</Label>
                  <Switch
                    checked={settings.requireNumbers}
                    onCheckedChange={(checked) => updateSetting('requireNumbers', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Require Special Characters</Label>
                  <Switch
                    checked={settings.requireSpecialChars}
                    onCheckedChange={(checked) => updateSetting('requireSpecialChars', checked)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Password Expiry (days)</Label>
                  <Input
                    type="number"
                    value={settings.passwordExpiryDays}
                    onChange={(e) => updateSetting('passwordExpiryDays', parseInt(e.target.value))}
                    min="0"
                    max="365"
                  />
                </div>
                <div>
                  <Label>Prevent Reuse of Last</Label>
                  <Input
                    type="number"
                    value={settings.preventReuse}
                    onChange={(e) => updateSetting('preventReuse', parseInt(e.target.value))}
                    min="0"
                    max="24"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mfa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Factor Authentication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Require MFA for Admin Users</Label>
                  <p className="text-sm text-gray-600">Enforce MFA for all administrative accounts</p>
                </div>
                <Switch
                  checked={settings.requireMfaForAdmin}
                  onCheckedChange={(checked) => updateSetting('requireMfaForAdmin', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Require MFA for Sensitive Operations</Label>
                  <p className="text-sm text-gray-600">Require MFA for critical system changes</p>
                </div>
                <Switch
                  checked={settings.requireMfaForSensitive}
                  onCheckedChange={(checked) => updateSetting('requireMfaForSensitive', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow MFA Bypass</Label>
                  <p className="text-sm text-gray-600">Allow temporary MFA bypass for trusted scenarios</p>
                </div>
                <Switch
                  checked={settings.allowMfaBypass}
                  onCheckedChange={(checked) => updateSetting('allowMfaBypass', checked)}
                />
              </div>

              <div>
                <Label>MFA Grace Period (days)</Label>
                <Input
                  type="number"
                  value={settings.mfaGracePeriod}
                  onChange={(e) => updateSetting('mfaGracePeriod', parseInt(e.target.value))}
                  min="0"
                  max="30"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="session" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Session Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Maximum Concurrent Sessions</Label>
                <Input
                  type="number"
                  value={settings.maxConcurrentSessions}
                  onChange={(e) => updateSetting('maxConcurrentSessions', parseInt(e.target.value))}
                  min="1"
                  max="10"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Remember Device</Label>
                  <p className="text-sm text-gray-600">Allow users to trust devices for extended periods</p>
                </div>
                <Switch
                  checked={settings.allowRememberDevice}
                  onCheckedChange={(checked) => updateSetting('allowRememberDevice', checked)}
                />
              </div>

              <div>
                <Label>Device Trust Duration (days)</Label>
                <Input
                  type="number"
                  value={settings.deviceTrustDuration}
                  onChange={(e) => updateSetting('deviceTrustDuration', parseInt(e.target.value))}
                  min="1"
                  max="365"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monitoring & Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Real-time Monitoring</Label>
                  <p className="text-sm text-gray-600">Enable real-time security monitoring</p>
                </div>
                <Switch
                  checked={settings.enableRealTimeMonitoring}
                  onCheckedChange={(checked) => updateSetting('enableRealTimeMonitoring', checked)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label>Email Alerts</Label>
                  <Switch
                    checked={settings.enableEmailAlerts}
                    onCheckedChange={(checked) => updateSetting('enableEmailAlerts', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>SMS Alerts</Label>
                  <Switch
                    checked={settings.enableSmsAlerts}
                    onCheckedChange={(checked) => updateSetting('enableSmsAlerts', checked)}
                  />
                </div>
              </div>

              <div>
                <Label>Alert Threshold</Label>
                <Input
                  type="number"
                  value={settings.alertThreshold}
                  onChange={(e) => updateSetting('alertThreshold', parseInt(e.target.value))}
                  min="1"
                  max="10"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Protection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Encryption</Label>
                  <p className="text-sm text-gray-600">Encrypt sensitive data at rest and in transit</p>
                </div>
                <Switch
                  checked={settings.enableEncryption}
                  onCheckedChange={(checked) => updateSetting('enableEncryption', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Audit Logging</Label>
                  <p className="text-sm text-gray-600">Log all security-related events</p>
                </div>
                <Switch
                  checked={settings.enableAuditLogging}
                  onCheckedChange={(checked) => updateSetting('enableAuditLogging', checked)}
                />
              </div>

              <div>
                <Label>Audit Log Retention (days)</Label>
                <Input
                  type="number"
                  value={settings.auditRetentionDays}
                  onChange={(e) => updateSetting('auditRetentionDays', parseInt(e.target.value))}
                  min="30"
                  max="2555"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Network Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>IP Whitelisting</Label>
                  <p className="text-sm text-gray-600">Restrict access to specific IP ranges</p>
                </div>
                <Switch
                  checked={settings.enableIpWhitelisting}
                  onCheckedChange={(checked) => updateSetting('enableIpWhitelisting', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Geographic Blocking</Label>
                  <p className="text-sm text-gray-600">Block access from specific countries</p>
                </div>
                <Switch
                  checked={settings.enableGeoBlocking}
                  onCheckedChange={(checked) => updateSetting('enableGeoBlocking', checked)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>API Rate Limit (requests/hour)</Label>
                  <Input
                    type="number"
                    value={settings.apiRateLimit}
                    onChange={(e) => updateSetting('apiRateLimit', parseInt(e.target.value))}
                    min="100"
                    max="10000"
                  />
                </div>
                <div>
                  <Label>API Token Expiry (hours)</Label>
                  <Input
                    type="number"
                    value={settings.apiTokenExpiry}
                    onChange={(e) => updateSetting('apiTokenExpiry', parseInt(e.target.value))}
                    min="1"
                    max="168"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Security Score */}
      <Card>
        <CardHeader>
          <CardTitle>Security Configuration Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-green-600">85/100</p>
              <p className="text-sm text-gray-600">Your security configuration is strong</p>
            </div>
            <div className="text-right">
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Well Configured
              </Badge>
              <p className="text-xs text-gray-500 mt-1">Last updated: Today</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettingsPage;
