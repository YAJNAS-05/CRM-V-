import { useState, useEffect } from 'react'
import { authApi } from '../../api/authApi'
import { Shield, Smartphone, MessageSquare, Key, Copy, Check, AlertCircle, Eye, EyeOff, Download } from 'lucide-react'

interface MfaMethod {
  id: string
  type: 'TOTP' | 'SMS' | 'EMAIL' | 'BACKUP_CODES'
  name: string
  description: string
  enabled: boolean
  createdAt?: string
  lastUsed?: string
}

interface BackupCode {
  code: string
  used: boolean
}

export default function MfaSetupPage() {
  const [methods, setMethods] = useState<MfaMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'totp' | 'sms' | 'backup'>('totp')
  const [setupStep, setSetupStep] = useState<number>(0)
  const [totpSecret, setTotpSecret] = useState<string>('')
  const [totpCode, setTotpCode] = useState<string>('')
  const [phoneNumber, setPhoneNumber] = useState<string>('')
  const [smsCode, setSmsCode] = useState<string>('')
  const [verificationCode, setVerificationCode] = useState<string>('')
  const [backupCodes, setBackupCodes] = useState<BackupCode[]>([])
  const [showSecret, setShowSecret] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')

  useEffect(() => {
    loadMfaMethods()
  }, [])

  const loadMfaMethods = async () => {
    try {
      setLoading(true)
      const response = await authApi.getMfaMethods()
      setMethods(response.data.data || [])
    } catch (error) {
      console.error('Failed to load MFA methods:', error)
    } finally {
      setLoading(false)
    }
  }

  const setupTotp = async () => {
    try {
      setError('')
      const response = await authApi.setupTotp()
      setTotpSecret(response.data.data?.secret || '')
      setSetupStep(1)
    } catch (error) {
      setError('Failed to initiate TOTP setup')
    }
  }

  const verifyAndEnableTotp = async () => {
    try {
      setError('')
      await authApi.verifyAndEnableTotp(totpCode, totpSecret)
      setSuccess('TOTP authenticator enabled successfully!')
      setSetupStep(0)
      loadMfaMethods()
    } catch (error) {
      setError('Invalid verification code')
    }
  }

  const setupSms = async () => {
    try {
      setError('')
      await authApi.sendSmsVerification(phoneNumber)
      setSetupStep(1)
      setSuccess('Verification code sent to your phone')
    } catch (error) {
      setError('Failed to send verification code')
    }
  }

  const verifyAndEnableSms = async () => {
    try {
      setError('')
      await authApi.verifyAndEnableSms(phoneNumber, smsCode)
      setSuccess('SMS verification enabled successfully!')
      setSetupStep(0)
      loadMfaMethods()
    } catch (error) {
      setError('Invalid verification code')
    }
  }

  const generateBackupCodes = async () => {
    try {
      setError('')
      const response = await authApi.generateBackupCodes()
      setBackupCodes(response.data.data || [])
      setSetupStep(1)
    } catch (error) {
      setError('Failed to generate backup codes')
    }
  }

  const disableMethod = async (methodId: string) => {
    try {
      setError('')
      await authApi.disableMfaMethod(methodId)
      setSuccess('MFA method disabled')
      loadMfaMethods()
    } catch (error) {
      setError('Failed to disable MFA method')
    }
  }

  const copyBackupCodes = () => {
    const codes = backupCodes.map(c => c.code).join('\n')
    navigator.clipboard.writeText(codes)
    setSuccess('Backup codes copied to clipboard')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Multi-Factor Authentication</h1>
        <p className="text-sm text-gray-500 mt-1">Secure your account with additional authentication methods</p>
      </div>

      {/* Enabled Methods */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Active Methods</h2>
        </div>
        <div className="p-4">
          {methods.filter(m => m.enabled).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No MFA methods enabled</p>
              <p className="text-sm">Set up at least one method to secure your account</p>
            </div>
          ) : (
            <div className="space-y-3">
              {methods.filter(m => m.enabled).map((method) => (
                <div key={method.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {method.type === 'TOTP' && <Smartphone className="w-5 h-5 text-green-600" />}
                    {method.type === 'SMS' && <MessageSquare className="w-5 h-5 text-green-600" />}
                    {method.type === 'BACKUP_CODES' && <Key className="w-5 h-5 text-green-600" />}
                    <div>
                      <p className="font-medium text-gray-900">{method.name}</p>
                      <p className="text-xs text-gray-500">{method.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => disableMethod(method.id)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Disable
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Setup Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => { setActiveTab('totp'); setSetupStep(0); setError(''); }}
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'totp' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Smartphone className="w-4 h-4 inline-block mr-2" />
              Authenticator App
            </button>
            <button
              onClick={() => { setActiveTab('sms'); setSetupStep(0); setError(''); }}
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'sms' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <MessageSquare className="w-4 h-4 inline-block mr-2" />
              SMS Verification
            </button>
            <button
              onClick={() => { setActiveTab('backup'); setSetupStep(0); setError(''); }}
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'backup' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Key className="w-4 h-4 inline-block mr-2" />
              Backup Codes
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
              <Check className="w-4 h-4" />
              {success}
            </div>
          )}

          {/* TOTP Setup */}
          {activeTab === 'totp' && (
            <div>
              {setupStep === 0 ? (
                <div className="text-center">
                  <Smartphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Set up Authenticator App</h3>
                  <p className="text-gray-500 mb-6">
                    Use an authenticator app like Google Authenticator, Authy, or 1Password to generate verification codes
                  </p>
                  <button
                    onClick={setupTotp}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Start Setup
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Scan this QR code with your authenticator app:</p>
                    <div className="bg-white p-4 inline-block rounded">
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(totpSecret)}`} alt="QR Code" className="w-48 h-48" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Or enter this secret key manually:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-gray-100 rounded font-mono text-sm">
                        {showSecret ? totpSecret : '••••••••••••••••'}
                      </code>
                      <button
                        onClick={() => setShowSecret(!showSecret)}
                        className="p-2 text-gray-500 hover:text-gray-700"
                      >
                        {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter verification code
                    </label>
                    <input
                      type="text"
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-center text-2xl tracking-widest font-mono"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSetupStep(0)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={verifyAndEnableTotp}
                      disabled={totpCode.length !== 6}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      Verify & Enable
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SMS Setup */}
          {activeTab === 'sms' && (
            <div>
              {setupStep === 0 ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <button
                    onClick={setupSms}
                    disabled={!phoneNumber}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Send Verification Code
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter verification code
                    </label>
                    <input
                      type="text"
                      value={smsCode}
                      onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-center text-2xl tracking-widest font-mono"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSetupStep(0)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={verifyAndEnableSms}
                      disabled={smsCode.length !== 6}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      Verify & Enable
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Backup Codes */}
          {activeTab === 'backup' && (
            <div>
              {setupStep === 0 ? (
                <div className="text-center">
                  <Key className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Generate Backup Codes</h3>
                  <p className="text-gray-500 mb-6">
                    Get a set of one-time backup codes to use when you don't have access to your other devices
                  </p>
                  <button
                    onClick={generateBackupCodes}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Generate Codes
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Store these codes safely. Each code can only be used once.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((code, index) => (
                      <code key={index} className="p-2 bg-gray-100 rounded text-sm font-mono">
                        {code.code}
                      </code>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={copyBackupCodes}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Codes
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                  <button
                    onClick={() => setSetupStep(0)}
                    className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Generate New Codes
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
