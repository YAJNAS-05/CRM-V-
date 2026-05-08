import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { 
  Shield, 
  Smartphone, 
  Mail, 
  Key, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertTriangle,
  QrCode,
  Eye,
  EyeOff,
  Clock,
  Settings
} from 'lucide-react';
import { MFAMethod, MFASetupRequest, MFAVerificationRequest } from '@/types/security';
import { toast } from 'sonner';
import { securityApi } from '../../api/securityApi';

const TwoFactorAuthPage: React.FC = () => {
  const [mfaMethods, setMfaMethods] = useState<MFAMethod[]>([]);
    {
      id: '3',
      type: 'EMAIL',
      name: 'Email Verification',
      description: 'Email codes sent to your inbox',
      enabled: true,
      isPrimary: false,
      setupDate: new Date('2024-01-12'),
      lastUsed: new Date('2024-01-18'),
      metadata: { email: 'user@example.com' }
    }
  ]);

  const [setupDialog, setSetupDialog] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'TOTP' | 'SMS' | 'EMAIL' | 'PUSH'>('TOTP');
  const [setupData, setSetupData] = useState<MFASetupRequest>({ method: 'TOTP' });
  const [verificationCode, setVerificationCode] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [qrCode, setQrCode] = useState('otpauth://totp/CRMPlatform:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=CRMPlatform');
  const [loading, setLoading] = useState(false);

  // Load MFA methods from API on component mount
  useEffect(() => {
    const loadMFAMethods = async () => {
      try {
        const methods = await securityApi.get2FAMethods();
        if (methods) {
          setMfaMethods(methods);
        }
      } catch (error) {
        console.error('Failed to load MFA methods:', error);
        toast.error('Failed to load MFA methods');
      }
    };
    loadMFAMethods();
  }, []);

  const handleSetupMFA = async () => {
    setLoading(true);
    try {
      // Use real securityApi to setup MFA
      const setupResponse = await securityApi.setup2FA(setupData);
      
      // Update QR code if TOTP setup
      if (setupResponse.qrCode) {
        setQrCode(setupResponse.qrCode);
      }
      
      const newMethod: MFAMethod = {
        id: Date.now().toString(),
        type: selectedMethod,
        name: getMethodName(selectedMethod),
        description: getMethodDescription(selectedMethod),
        enabled: true,
        isPrimary: mfaMethods.length === 0,
        setupDate: new Date(),
        metadata: setupData
      };

      setMfaMethods([...mfaMethods, newMethod]);
      setSetupDialog(false);
      setSetupData({ method: 'TOTP' });
      setVerificationCode('');
      toast.success('MFA method setup successfully');
    } catch (error) {
      toast.error('Failed to setup MFA method');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      toast.error('Please enter verification code');
      return;
    }

    setLoading(true);
    try {
      // Use real securityApi to verify MFA code
      await securityApi.verify2FACode(verificationCode);
      toast.success('MFA method verified and enabled');
      setSetupDialog(false);
      setVerificationCode('');
    } catch (error) {
      console.error('Failed to verify MFA code:', error);
      toast.error('Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMethod = async (methodId: string) => {
    setLoading(true);
    try {
      // Use real securityApi to remove MFA method
      await securityApi.removeMFAMethod(methodId);
      setMfaMethods(mfaMethods.filter(m => m.id !== methodId));
      toast.success('MFA method removed successfully');
    } catch (error) {
      console.error('Failed to remove MFA method:', error);
      toast.error('Failed to remove MFA method');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPrimary = async (methodId: string) => {
    setLoading(true);
    try {
      // Use real securityApi to set primary MFA method
      await securityApi.setPrimaryMFAMethod(methodId);
      setMfaMethods(mfaMethods.map(m => ({
        ...m,
        isPrimary: m.id === methodId
      })));
      toast.success('Primary MFA method updated');
    } catch (error) {
      console.error('Failed to update primary MFA method:', error);
      toast.error('Failed to update primary MFA method');
    } finally {
      setLoading(false);
    }
  };

  const getMethodName = (type: string): string => {
    const names: Record<string, string> = {
      'TOTP': 'Authenticator App',
      'SMS': 'SMS Verification',
      'EMAIL': 'Email Verification',
      'PUSH': 'Push Notification'
    };
    return names[type] || type;
  };

  const getMethodDescription = (type: string): string => {
    const descriptions: Record<string, string> = {
      'TOTP': 'Authenticator app on your mobile device',
      'SMS': 'SMS codes sent to your phone',
      'EMAIL': 'Email codes sent to your inbox',
      'PUSH': 'Push notifications to your mobile device'
    };
    return descriptions[type] || type;
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'TOTP': return <Smartphone className="h-5 w-5" />;
      case 'SMS': return <Smartphone className="h-5 w-5" />;
      case 'EMAIL': return <Mail className="h-5 w-5" />;
      case 'PUSH': return <Smartphone className="h-5 w-5" />;
      default: return <Key className="h-5 w-5" />;
    }
  };

  const enabledMethods = mfaMethods.filter(m => m.enabled);
  const mfaEnabled = enabledMethods.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h1>
          <p className="text-gray-600">Manage your multi-factor authentication methods</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={mfaEnabled ? "default" : "secondary"} className="bg-green-100 text-green-800">
            {mfaEnabled ? 'MFA Enabled' : 'MFA Disabled'}
          </Badge>
          <Dialog open={setupDialog} onOpenChange={setSetupDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-1" />
                Add Method
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Setup MFA Method</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Select Method</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {(['TOTP', 'SMS', 'EMAIL', 'PUSH'] as const).map(method => (
                      <Button
                        key={method}
                        variant={selectedMethod === method ? "default" : "outline"}
                        onClick={() => setSelectedMethod(method)}
                        className="h-12"
                      >
                        <div className="flex flex-col items-center space-y-1">
                          {getMethodIcon(method)}
                          <span className="text-xs">{getMethodName(method)}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {selectedMethod === 'TOTP' && (
                  <div className="space-y-4">
                    <Alert>
                      <QrCode className="h-4 w-4" />
                      <AlertDescription>
                        Scan this QR code with your authenticator app
                      </AlertDescription>
                    </Alert>
                    <div className="flex justify-center">
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="w-32 h-32 bg-gray-200 flex items-center justify-center">
                          <QrCode className="h-16 w-16 text-gray-400" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label>Secret Key</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          type={showSecret ? "text" : "password"}
                          value="JBSWY3DPEHPK3PXP"
                          readOnly
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSecret(!showSecret)}
                        >
                          {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {selectedMethod === 'SMS' && (
                  <div>
                    <Label>Phone Number</Label>
                    <Input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={setupData.phoneNumber || ''}
                      onChange={(e) => setSetupData({ ...setupData, phoneNumber: e.target.value })}
                    />
                  </div>
                )}

                {selectedMethod === 'EMAIL' && (
                  <div>
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      placeholder="user@example.com"
                      value={setupData.email || ''}
                      onChange={(e) => setSetupData({ ...setupData, email: e.target.value })}
                    />
                  </div>
                )}

                <div>
                  <Label>Verification Code</Label>
                  <Input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setSetupDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleVerifyCode} disabled={loading} className="flex-1">
                    {loading ? 'Verifying...' : 'Verify & Enable'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Security Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                mfaEnabled ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {mfaEnabled ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div>
                <p className="font-medium">MFA Status</p>
                <p className="text-sm text-gray-600">
                  {mfaEnabled ? `${enabledMethods.length} method(s) enabled` : 'No methods enabled'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Key className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Primary Method</p>
                <p className="text-sm text-gray-600">
                  {mfaMethods.find(m => m.isPrimary)?.name || 'Not set'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Last Used</p>
                <p className="text-sm text-gray-600">
                  {enabledMethods.length > 0 
                    ? new Date(Math.max(...enabledMethods.map(m => m.lastUsed?.getTime() || 0))).toLocaleDateString()
                    : 'Never'
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MFA Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication Methods</CardTitle>
        </CardHeader>
        <CardContent>
          {mfaMethods.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No MFA methods configured</p>
              <p className="text-sm">Add a method to enhance your account security</p>
            </div>
          ) : (
            <div className="space-y-4">
              {mfaMethods.map(method => (
                <div
                  key={method.id}
                  className={`flex items-center justify-between p-4 border rounded-lg ${
                    method.enabled ? 'border-green-200 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      method.enabled ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {getMethodIcon(method.type)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{method.name}</p>
                        {method.isPrimary && (
                          <Badge variant="default" className="text-xs bg-blue-100 text-blue-800">
                            Primary
                          </Badge>
                        )}
                        {method.enabled && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{method.description}</p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span>Setup: {method.setupDate.toLocaleDateString()}</span>
                        {method.lastUsed && (
                          <span>Last used: {method.lastUsed.toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {method.enabled && !method.isPrimary && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetPrimary(method.id)}
                        disabled={loading}
                      >
                        Set Primary
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveMethod(method.id)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Security Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <strong>Good:</strong> You have MFA enabled for enhanced security
              </AlertDescription>
            </Alert>
            {!mfaEnabled && (
              <Alert>
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription>
                  <strong>Recommendation:</strong> Enable at least one MFA method to protect your account
                </AlertDescription>
              </Alert>
            )}
            {enabledMethods.length === 1 && (
              <Alert>
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription>
                  <strong>Recommendation:</strong> Consider adding a backup MFA method for account recovery
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TwoFactorAuthPage;
