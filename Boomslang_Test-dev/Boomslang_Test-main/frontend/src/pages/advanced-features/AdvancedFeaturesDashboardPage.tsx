import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { 
  Zap, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Copy,
  Download,
  Upload,
  Play,
  Pause,
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Users,
  Database,
  Shield,
  Globe,
  Cpu,
  HardDrive,
  Wifi,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  RefreshCw,
  Star,
  Package,
  Rocket,
  Target,
  Layers,
  GitBranch,
  Code,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Cloud,
  Server,
  Lock,
  Key,
  Fingerprint,
  UserCheck,
  Crown,
  Gem,
  Award,
  Trophy,
  Medal,
  Flag,
  Bookmark,
  Heart,
  ThumbsUp,
  MessageSquare,
  Share2,
  Link,
  ExternalLink,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Minus,
  PlusCircle,
  MinusCircle,
  Info,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  XCircle2,
  Loader2,
  Timer,
  Calendar,
  MapPin,
  Navigation,
  Compass,
  Map,
  Globe2,
  Earth,
  Smartphone,
  Tablet,
  Monitor,
  Laptop,
  Watch,
  Headphones,
  Camera,
  Mic,
  Speaker,
  Volume2,
  VolumeX,
  Battery,
  BatteryCharging,
  Signal,
  SignalHigh,
  SignalLow,
  SignalZero,
  WifiOff,
  Bluetooth,
  BluetoothConnected,
  Usb,
  UsbPort,
  Ethernet,
  Router,
  Switch,
  Hub,
  Modem,
  Antenna,
  Satellite,
  Radar,
  Radio,
  Tv,
  RadioTower,
  Broadcast,
  Podcast,
  Stream,
  Live,
  Record,
  PauseCircle,
  SkipBack,
  SkipForward,
  Rewind,
  FastForward,
  Repeat,
  RepeatOne,
  Shuffle,
  PlayCircle,
  StopCircle,
  Square,
  Circle,
  Triangle,
  Pentagon,
  Hexagon,
  Octagon,
  Diamond,
  Cross,
  PlusSquare,
  MinusSquare,
  XSquare,
  CheckSquare,
  AlertSquare,
  InfoSquare,
  HelpSquare,
  StarSquare,
  HeartSquare,
  ThumbsUpSquare,
  ThumbsDownSquare,
  ShareSquare,
  DownloadSquare,
  UploadSquare,
  RefreshSquare,
  SettingsSquare,
  TrashSquare,
  EditSquare,
  CopySquare,
  EyeSquare,
  LockSquare,
  UnlockSquare,
  KeySquare,
  ShieldSquare,
  Sword,
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  ShieldOff,
  ShieldHalf,
  ShieldPlus,
  ShieldMinus,
  User,
  UserPlus,
  UserMinus,
  UserX,
  UserCheck,
  UserCog,
  UserSearch,
  Users2,
  UsersRound,
  UsersSquare,
  UsersCheck,
  UsersX,
  UsersPlus,
  UsersMinus,
  UserCircle,
  UserSquare,
  UserTriangle,
  UserDiamond,
  UserHexagon,
  UserOctagon,
  UserPentagon,
  UserCross,
  UserStar,
  UserHeart,
  UserThumbsUp,
  UserThumbsDown,
  UserShare,
  UserLink,
  UserExternalLink,
  UserBookmark,
  UserFlag,
  UserAward,
  UserTrophy,
  UserMedal,
  UserGem,
  UserCrown,
  UserRocket,
  UserTarget,
  UserCompass,
  UserNavigation,
  UserMap,
  UserGlobe,
  UserEarth,
  UserSmartphone,
  UserTablet,
  UserMonitor,
  UserLaptop,
  UserWatch,
  UserHeadphones,
  UserCamera,
  UserMic,
  UserSpeaker,
  UserVolume2,
  UserVolumeX,
  UserBattery,
  UserBatteryCharging,
  UserSignal,
  UserSignalHigh,
  UserSignalLow,
  UserSignalZero,
  UserWifiOff,
  UserBluetooth,
  UserBluetoothConnected,
  UserUsb,
  UserUsbPort,
  UserEthernet,
  UserRouter,
  UserSwitch,
  UserHub,
  UserModem,
  UserAntenna,
  UserSatellite,
  UserRadar,
  UserRadio,
  UserTv,
  UserRadioTower,
  UserBroadcast,
  UserPodcast,
  UserStream,
  UserLive,
  UserRecord,
  UserPauseCircle,
  UserSkipBack,
  UserSkipForward,
  UserRewind,
  UserFastForward,
  UserRepeat,
  UserRepeatOne,
  UserShuffle,
  UserPlayCircle,
  UserStopCircle,
  UserSquare,
  UserCircle,
  UserTriangle,
  UserPentagon,
  UserHexagon,
  UserOctagon,
  UserDiamond,
  UserCross,
  UserPlusSquare,
  UserMinusSquare,
  UserXSquare,
  UserCheckSquare,
  UserAlertSquare,
  UserInfoSquare,
  UserHelpSquare,
  UserStarSquare,
  UserHeartSquare,
  UserThumbsUpSquare,
  UserThumbsDownSquare,
  UserShareSquare,
  UserDownloadSquare,
  UserUploadSquare,
  UserRefreshSquare,
  UserSettingsSquare,
  UserTrashSquare,
  UserEditSquare,
  UserCopySquare,
  UserEyeSquare,
  UserLockSquare,
  UserUnlockSquare,
  UserKeySquare,
  UserShieldSquare,
  UserSword,
  UserShieldCheck,
  UserShieldX,
  UserShieldAlert,
  UserShieldOff,
  UserShieldHalf,
  UserShieldPlus,
  UserShieldMinus
} from 'lucide-react';
import { AdvancedFeature, FeatureCategory, FeatureStatus, FeatureType } from '@/types/advancedFeatures';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const AdvancedFeaturesDashboardPage: React.FC = () => {
  const [features, setFeatures] = useState<AdvancedFeature[]>([
    {
      id: 'ai-analytics',
      name: 'AI-Powered Analytics',
      description: 'Advanced machine learning analytics with predictive insights and automated recommendations',
      category: 'AI_ML',
      type: 'MODULE',
      status: 'PRODUCTION',
      priority: 'HIGH',
      version: '2.4.1',
      configuration: {
        schema: {
          properties: {
            modelType: { type: 'string', title: 'Model Type', enum: ['regression', 'classification', 'clustering'] },
            accuracy: { type: 'number', title: 'Accuracy Threshold', minimum: 0, maximum: 1 },
            features: { type: 'array', title: 'Features', items: { type: 'string' } }
          },
          required: ['modelType', 'accuracy'],
          uiSchema: {
            order: ['modelType', 'accuracy', 'features'],
            groups: [
              { id: 'basic', title: 'Basic Settings', fields: ['modelType', 'accuracy'], collapsible: false },
              { id: 'advanced', title: 'Advanced Settings', fields: ['features'], collapsible: true }
            ],
            layouts: [
              { type: 'GRID', columns: 2, fields: ['modelType', 'accuracy'] }
            ],
            widgets: []
          }
        },
        defaults: {
          modelType: 'regression',
          accuracy: 0.85,
          features: ['revenue', 'customers', 'engagement']
        },
        validation: [],
        dependencies: [],
        requirements: []
      },
      settings: {
        enabled: true,
        autoUpdate: true,
        logging: {
          enabled: true,
          level: 'INFO',
          destinations: ['DATABASE'],
          retention: { enabled: true, days: 30, compression: true, archive: false },
          format: 'JSON'
        },
        caching: {
          enabled: true,
          strategy: 'LRU',
          ttl: 3600,
          eviction: 'LRU',
          invalidation: 'TIMEOUT'
        },
        security: {
          authentication: { required: true, methods: ['API_KEY', 'JWT'], multiFactor: false, sessionTimeout: 3600 },
          authorization: { required: true, roles: ['admin', 'analyst'], permissions: [], policies: [] },
          encryption: { enabled: true, algorithm: 'AES-256', keySize: 256, fields: ['data'], transport: true, atRest: true },
          audit: { enabled: true, events: [], retention: { enabled: true, days: 90, compression: true, archive: false }, format: 'JSON', destinations: ['DATABASE'] },
          rateLimit: { enabled: true, requests: 1000, window: 3600, strategy: 'FIXED', whitelist: [], blacklist: [] }
        },
        performance: {
          timeout: 30000,
          retries: { enabled: true, maxAttempts: 3, backoff: 'EXPONENTIAL', initialDelay: 1000, maxDelay: 10000, multiplier: 2 },
          circuitBreaker: { enabled: true, failureThreshold: 5, timeout: 60000, resetTimeout: 30000, monitoring: { enabled: true, metrics: [], alerts: [] } },
          bulkhead: { enabled: true, maxConcurrent: 10, maxQueue: 100, timeout: 30000 },
          compression: { enabled: true, algorithm: 'GZIP', level: 'MEDIUM', threshold: 1024 }
        },
        notifications: {
          enabled: true,
          channels: [],
          events: [],
          templates: []
        }
      },
      permissions: {
        view: { roles: ['admin', 'analyst', 'viewer'], users: [], groups: [], conditions: [] },
        use: { roles: ['admin', 'analyst'], users: [], groups: [], conditions: [] },
        configure: { roles: ['admin'], users: [], groups: [], conditions: [] },
        manage: { roles: ['admin'], users: [], groups: [], conditions: [] },
        deploy: { roles: ['admin'], users: [], groups: [], conditions: [] }
      },
      usage: {
        totalUsage: 15420,
        dailyUsage: [
          { date: '2024-01-20', requests: 1250, users: 45, errors: 12, avgResponseTime: 245, dataVolume: 2.5 },
          { date: '2024-01-19', requests: 1180, users: 42, errors: 8, avgResponseTime: 238, dataVolume: 2.3 },
          { date: '2024-01-18', requests: 1320, users: 48, errors: 15, avgResponseTime: 252, dataVolume: 2.7 }
        ],
        users: [
          { userId: 'user-1', userName: 'John Doe', usage: 450, lastUsed: new Date('2024-01-20T14:30:00'), features: ['ai-analytics'], performance: { avgResponseTime: 245, errorRate: 0.96, successRate: 99.04, requests: 450 } },
          { userId: 'user-2', userName: 'Jane Smith', usage: 380, lastUsed: new Date('2024-01-20T13:15:00'), features: ['ai-analytics'], performance: { avgResponseTime: 238, errorRate: 0.68, successRate: 99.32, requests: 380 } }
        ],
        performance: { avgResponseTime: 245, p95ResponseTime: 380, p99ResponseTime: 520, errorRate: 0.96, throughput: 52.1, availability: 99.04 },
        trends: [
          { period: '7d', metric: 'usage', trend: 'UP', change: 12.5, data: [] },
          { period: '7d', metric: 'performance', trend: 'STABLE', change: -2.1, data: [] }
        ],
        quotas: [
          { type: 'REQUESTS', limit: 50000, current: 15420, resetPeriod: 'monthly', nextReset: new Date('2024-02-01') },
          { type: 'USERS', limit: 100, current: 45, resetPeriod: 'monthly', nextReset: new Date('2024-02-01') }
        ]
      },
      performance: {
        responseTime: { average: 245, median: 238, p90: 320, p95: 380, p99: 520, min: 120, max: 850, standardDeviation: 85 },
        throughput: { requestsPerSecond: 52.1, requestsPerMinute: 3126, requestsPerHour: 187560, requestsPerDay: 4501440, peakThroughput: 85.2, averageThroughput: 52.1 },
        errorRate: { totalErrors: 148, errorRate: 0.96, criticalErrors: 3, warningErrors: 145, errorsByType: {}, errorsByEndpoint: {} },
        availability: { uptime: 99.04, downtime: 0.96, availability: 99.04, mttr: 15.2, mtbf: 1580.5, incidents: { total: 3, critical: 1, major: 1, minor: 1, resolved: 2, open: 1, averageResolutionTime: 15.2 }, sla: { target: 99.5, current: 99.04, compliance: false, penalties: 0, credits: 0 } },
        resourceUsage: {
          cpu: { usage: 65, available: 35, total: 100, percentage: 65, threshold: 80, status: 'NORMAL', trend: 'STABLE' },
          memory: { usage: 78, available: 22, total: 100, percentage: 78, threshold: 85, status: 'NORMAL', trend: 'UP' },
          disk: { usage: 45, available: 55, total: 100, percentage: 45, threshold: 90, status: 'NORMAL', trend: 'STABLE' },
          network: { usage: 25, available: 75, total: 100, percentage: 25, threshold: 80, status: 'NORMAL', trend: 'STABLE' },
          cache: { hitRate: 85.2, missRate: 14.8, size: 512, evictions: 1250, ttl: 3600 },
          connections: { active: 25, idle: 15, total: 40, max: 100, waiting: 0, averageWaitTime: 2.5 }
        },
        scalability: {
          horizontalScaling: { minInstances: 2, maxInstances: 10, currentInstances: 3, scalingEvents: [], averageScaleTime: 45 },
          verticalScaling: { cpuScaling: true, memoryScaling: true, storageScaling: false, scalingEvents: [], averageScaleTime: 30 },
          loadBalancing: { algorithm: 'ROUND_ROBIN', distribution: {}, healthChecks: { enabled: true, interval: 30, timeout: 5, healthyEndpoints: 3, totalEndpoints: 3, averageResponseTime: 45 }, failover: { events: [], averageFailoverTime: 12, successfulFailovers: 8, failedFailovers: 0 } },
          autoScaling: { enabled: true, policies: [], events: [], averageScaleTime: 45, cost: { totalCost: 1250, averageCostPerInstance: 416.67, costSavings: 180, projectedCost: 1430 } }
        }
      },
      metadata: {
        version: '2.4.1',
        environment: 'production',
        category: 'AI_ML',
        tags: ['ai', 'analytics', 'machine-learning', 'predictive'],
        documentation: 'https://docs.company.com/ai-analytics',
        changelog: [
          { version: '2.4.1', date: new Date('2024-01-15'), author: 'ai-team', changes: ['Improved model accuracy', 'Added new features'], type: 'MINOR', breaking: false }
        ],
        dependencies: [],
        requirements: [],
        compatibility: { minVersion: '1.0.0', platforms: ['linux', 'windows'], browsers: ['chrome', 'firefox', 'safari'], dependencies: [] },
        support: {
          level: 'PREMIUM',
          team: 'AI Team',
          contact: [
            { type: 'EMAIL', value: 'ai-support@company.com', description: 'Primary support contact', hours: '24/7' },
            { type: 'SLACK', value: '#ai-support', description: 'Slack channel for quick questions' }
          ],
          sla: { responseTime: 60, resolutionTime: 240, availability: 99.5, escalation: [] },
          documentation: 'https://docs.company.com/ai-analytics',
          training: [
            { id: 'ai-101', name: 'AI Analytics Basics', type: 'VIDEO', url: 'https://training.company.com/ai-101', duration: 45, difficulty: 'BEGINNER', prerequisites: [], description: 'Introduction to AI Analytics' }
          ]
        },
        licensing: {
          type: 'COMMERCIAL',
          provider: 'Company Inc',
          key: 'AI-ANALYTICS-2024',
          expiry: new Date('2024-12-31'),
          limits: [
            { type: 'USERS', value: 100, description: 'Maximum concurrent users' },
            { type: 'REQUESTS', value: 50000, description: 'Monthly API requests' }
          ],
          features: [
            { name: 'Predictive Analytics', enabled: true, description: 'Advanced predictive analytics' },
            { name: 'Real-time Processing', enabled: true, description: 'Real-time data processing' }
          ],
          compliance: { compliant: true, violations: [], lastChecked: new Date('2024-01-20'), nextCheck: new Date('2024-01-27') }
        }
      },
      createdAt: new Date('2023-06-15T00:00:00'),
      updatedAt: new Date('2024-01-15T10:30:00'),
      createdBy: 'ai-team',
      updatedBy: 'ai-team',
      publishedAt: new Date('2023-08-01T00:00:00'),
      publishedBy: 'ai-team',
      tags: ['ai', 'analytics', 'machine-learning', 'predictive']
    },
    {
      id: 'workflow-automation',
      name: 'Advanced Workflow Automation',
      description: 'Intelligent workflow automation with AI-powered decision making and adaptive routing',
      category: 'AUTOMATION',
      type: 'MODULE',
      status: 'PRODUCTION',
      priority: 'HIGH',
      version: '3.2.0',
      configuration: {
        schema: {
          properties: {
            maxConcurrent: { type: 'number', title: 'Max Concurrent Workflows', minimum: 1, maximum: 100 },
            timeout: { type: 'number', title: 'Default Timeout (seconds)', minimum: 30, maximum: 3600 },
            retryAttempts: { type: 'number', title: 'Max Retry Attempts', minimum: 0, maximum: 10 }
          },
          required: ['maxConcurrent', 'timeout'],
          uiSchema: {
            order: ['maxConcurrent', 'timeout', 'retryAttempts'],
            groups: [
              { id: 'performance', title: 'Performance Settings', fields: ['maxConcurrent', 'timeout'], collapsible: false },
              { id: 'reliability', title: 'Reliability Settings', fields: ['retryAttempts'], collapsible: true }
            ],
            layouts: [
              { type: 'GRID', columns: 2, fields: ['maxConcurrent', 'timeout'] }
            ],
            widgets: []
          }
        },
        defaults: {
          maxConcurrent: 10,
          timeout: 300,
          retryAttempts: 3
        },
        validation: [],
        dependencies: [],
        requirements: []
      },
      settings: {
        enabled: true,
        autoUpdate: true,
        logging: {
          enabled: true,
          level: 'INFO',
          destinations: ['DATABASE'],
          retention: { enabled: true, days: 30, compression: true, archive: false },
          format: 'JSON'
        },
        caching: {
          enabled: true,
          strategy: 'LRU',
          ttl: 1800,
          eviction: 'LRU',
          invalidation: 'TIMEOUT'
        },
        security: {
          authentication: { required: true, methods: ['API_KEY', 'JWT'], multiFactor: false, sessionTimeout: 3600 },
          authorization: { required: true, roles: ['admin', 'workflow-manager'], permissions: [], policies: [] },
          encryption: { enabled: true, algorithm: 'AES-256', keySize: 256, fields: ['data'], transport: true, atRest: true },
          audit: { enabled: true, events: [], retention: { enabled: true, days: 90, compression: true, archive: false }, format: 'JSON', destinations: ['DATABASE'] },
          rateLimit: { enabled: true, requests: 5000, window: 3600, strategy: 'FIXED', whitelist: [], blacklist: [] }
        },
        performance: {
          timeout: 300000,
          retries: { enabled: true, maxAttempts: 3, backoff: 'EXPONENTIAL', initialDelay: 1000, maxDelay: 10000, multiplier: 2 },
          circuitBreaker: { enabled: true, failureThreshold: 5, timeout: 60000, resetTimeout: 30000, monitoring: { enabled: true, metrics: [], alerts: [] } },
          bulkhead: { enabled: true, maxConcurrent: 20, maxQueue: 200, timeout: 30000 },
          compression: { enabled: true, algorithm: 'GZIP', level: 'MEDIUM', threshold: 1024 }
        },
        notifications: {
          enabled: true,
          channels: [],
          events: [],
          templates: []
        }
      },
      permissions: {
        view: { roles: ['admin', 'workflow-manager', 'viewer'], users: [], groups: [], conditions: [] },
        use: { roles: ['admin', 'workflow-manager'], users: [], groups: [], conditions: [] },
        configure: { roles: ['admin'], users: [], groups: [], conditions: [] },
        manage: { roles: ['admin'], users: [], groups: [], conditions: [] },
        deploy: { roles: ['admin'], users: [], groups: [], conditions: [] }
      },
      usage: {
        totalUsage: 28950,
        dailyUsage: [
          { date: '2024-01-20', requests: 2150, users: 28, errors: 18, avgResponseTime: 180, dataVolume: 1.8 },
          { date: '2024-01-19', requests: 2080, users: 26, errors: 12, avgResponseTime: 175, dataVolume: 1.7 },
          { date: '2024-01-18', requests: 2220, users: 30, errors: 22, avgResponseTime: 185, dataVolume: 1.9 }
        ],
        users: [
          { userId: 'user-3', userName: 'Mike Johnson', usage: 680, lastUsed: new Date('2024-01-20T16:45:00'), features: ['workflow-automation'], performance: { avgResponseTime: 180, errorRate: 0.84, successRate: 99.16, requests: 680 } },
          { userId: 'user-4', userName: 'Sarah Wilson', usage: 520, lastUsed: new Date('2024-01-20T15:30:00'), features: ['workflow-automation'], performance: { avgResponseTime: 175, errorRate: 0.58, successRate: 99.42, requests: 520 } }
        ],
        performance: { avgResponseTime: 180, p95ResponseTime: 280, p99ResponseTime: 420, errorRate: 0.84, throughput: 35.8, availability: 99.16 },
        trends: [
          { period: '7d', metric: 'usage', trend: 'UP', change: 8.3, data: [] },
          { period: '7d', metric: 'performance', trend: 'UP', change: 5.2, data: [] }
        ],
        quotas: [
          { type: 'REQUESTS', limit: 100000, current: 28950, resetPeriod: 'monthly', nextReset: new Date('2024-02-01') },
          { type: 'USERS', limit: 50, current: 28, resetPeriod: 'monthly', nextReset: new Date('2024-02-01') }
        ]
      },
      performance: {
        responseTime: { average: 180, median: 175, p90: 240, p95: 280, p99: 420, min: 95, max: 680, standardDeviation: 65 },
        throughput: { requestsPerSecond: 35.8, requestsPerMinute: 2148, requestsPerHour: 128880, requestsPerDay: 3093120, peakThroughput: 58.5, averageThroughput: 35.8 },
        errorRate: { totalErrors: 243, errorRate: 0.84, criticalErrors: 5, warningErrors: 238, errorsByType: {}, errorsByEndpoint: {} },
        availability: { uptime: 99.16, downtime: 0.84, availability: 99.16, mttr: 12.8, mtbf: 1520.3, incidents: { total: 5, critical: 1, major: 2, minor: 2, resolved: 4, open: 1, averageResolutionTime: 12.8 }, sla: { target: 99.0, current: 99.16, compliance: true, penalties: 0, credits: 0 } },
        resourceUsage: {
          cpu: { usage: 58, available: 42, total: 100, percentage: 58, threshold: 80, status: 'NORMAL', trend: 'STABLE' },
          memory: { usage: 72, available: 28, total: 100, percentage: 72, threshold: 85, status: 'NORMAL', trend: 'STABLE' },
          disk: { usage: 38, available: 62, total: 100, percentage: 38, threshold: 90, status: 'NORMAL', trend: 'DOWN' },
          network: { usage: 32, available: 68, total: 100, percentage: 32, threshold: 80, status: 'NORMAL', trend: 'STABLE' },
          cache: { hitRate: 78.5, missRate: 21.5, size: 256, evictions: 890, ttl: 1800 },
          connections: { active: 18, idle: 12, total: 30, max: 50, waiting: 0, averageWaitTime: 1.8 }
        },
        scalability: {
          horizontalScaling: { minInstances: 2, maxInstances: 8, currentInstances: 3, scalingEvents: [], averageScaleTime: 35 },
          verticalScaling: { cpuScaling: true, memoryScaling: true, storageScaling: false, scalingEvents: [], averageScaleTime: 25 },
          loadBalancing: { algorithm: 'LEAST_CONNECTIONS', distribution: {}, healthChecks: { enabled: true, interval: 30, timeout: 5, healthyEndpoints: 3, totalEndpoints: 3, averageResponseTime: 35 }, failover: { events: [], averageFailoverTime: 8, successfulFailovers: 6, failedFailovers: 0 } },
          autoScaling: { enabled: true, policies: [], events: [], averageScaleTime: 35, cost: { totalCost: 980, averageCostPerInstance: 326.67, costSavings: 120, projectedCost: 1100 } }
        }
      },
      metadata: {
        version: '3.2.0',
        environment: 'production',
        category: 'AUTOMATION',
        tags: ['automation', 'workflow', 'ai', 'routing'],
        documentation: 'https://docs.company.com/workflow-automation',
        changelog: [
          { version: '3.2.0', date: new Date('2024-01-10'), author: 'workflow-team', changes: ['Added AI routing', 'Improved performance'], type: 'MINOR', breaking: false }
        ],
        dependencies: [],
        requirements: [],
        compatibility: { minVersion: '1.0.0', platforms: ['linux', 'windows'], browsers: ['chrome', 'firefox', 'safari'], dependencies: [] },
        support: {
          level: 'PREMIUM',
          team: 'Workflow Team',
          contact: [
            { type: 'EMAIL', value: 'workflow-support@company.com', description: 'Primary support contact', hours: '24/7' },
            { type: 'SLACK', value: '#workflow-support', description: 'Slack channel for quick questions' }
          ],
          sla: { responseTime: 60, resolutionTime: 240, availability: 99.0, escalation: [] },
          documentation: 'https://docs.company.com/workflow-automation',
          training: [
            { id: 'wf-101', name: 'Workflow Automation Basics', type: 'VIDEO', url: 'https://training.company.com/wf-101', duration: 60, difficulty: 'BEGINNER', prerequisites: [], description: 'Introduction to Workflow Automation' }
          ]
        },
        licensing: {
          type: 'COMMERCIAL',
          provider: 'Company Inc',
          key: 'WORKFLOW-AUTO-2024',
          expiry: new Date('2024-12-31'),
          limits: [
            { type: 'USERS', value: 50, description: 'Maximum concurrent users' },
            { type: 'REQUESTS', value: 100000, description: 'Monthly API requests' }
          ],
          features: [
            { name: 'AI Routing', enabled: true, description: 'AI-powered workflow routing' },
            { name: 'Adaptive Learning', enabled: true, description: 'Self-learning workflow optimization' }
          ],
          compliance: { compliant: true, violations: [], lastChecked: new Date('2024-01-20'), nextCheck: new Date('2024-01-27') }
        }
      },
      createdAt: new Date('2023-08-20T00:00:00'),
      updatedAt: new Date('2024-01-10T14:20:00'),
      createdBy: 'workflow-team',
      updatedBy: 'workflow-team',
      publishedAt: new Date('2023-10-01T00:00:00'),
      publishedBy: 'workflow-team',
      tags: ['automation', 'workflow', 'ai', 'routing']
    },
    {
      id: 'security-enhancement',
      name: 'Advanced Security Enhancement',
      description: 'Next-generation security features with biometric authentication and zero-trust architecture',
      category: 'SECURITY',
      type: 'MODULE',
      status: 'STAGING',
      priority: 'CRITICAL',
      version: '1.8.0-beta',
      configuration: {
        schema: {
          properties: {
            authMethods: { type: 'array', title: 'Authentication Methods', items: { type: 'string' } },
            sessionTimeout: { type: 'number', title: 'Session Timeout (minutes)', minimum: 5, maximum: 480 },
            maxAttempts: { type: 'number', title: 'Max Login Attempts', minimum: 3, maximum: 10 }
          },
          required: ['authMethods', 'sessionTimeout'],
          uiSchema: {
            order: ['authMethods', 'sessionTimeout', 'maxAttempts'],
            groups: [
              { id: 'auth', title: 'Authentication Settings', fields: ['authMethods', 'sessionTimeout'], collapsible: false },
              { id: 'security', title: 'Security Settings', fields: ['maxAttempts'], collapsible: true }
            ],
            layouts: [
              { type: 'GRID', columns: 2, fields: ['sessionTimeout', 'maxAttempts'] }
            ],
            widgets: []
          }
        },
        defaults: {
          authMethods: ['password', 'mfa'],
          sessionTimeout: 60,
          maxAttempts: 5
        },
        validation: [],
        dependencies: [],
        requirements: []
      },
      settings: {
        enabled: true,
        autoUpdate: false,
        logging: {
          enabled: true,
          level: 'WARN',
          destinations: ['DATABASE', 'FILE'],
          retention: { enabled: true, days: 90, compression: true, archive: true },
          format: 'JSON'
        },
        caching: {
          enabled: false,
          strategy: 'LRU',
          ttl: 300,
          eviction: 'LRU',
          invalidation: 'TIMEOUT'
        },
        security: {
          authentication: { required: true, methods: ['OAUTH', 'MFA'], multiFactor: true, sessionTimeout: 3600 },
          authorization: { required: true, roles: ['admin', 'security-admin'], permissions: [], policies: [] },
          encryption: { enabled: true, algorithm: 'AES-256-GCM', keySize: 256, fields: ['passwords', 'tokens', 'pii'], transport: true, atRest: true },
          audit: { enabled: true, events: [], retention: { enabled: true, days: 365, compression: true, archive: true }, format: 'JSON', destinations: ['DATABASE', 'FILE'] },
          rateLimit: { enabled: true, requests: 100, window: 300, strategy: 'TOKEN_BUCKET', whitelist: [], blacklist: [] }
        },
        performance: {
          timeout: 15000,
          retries: { enabled: false, maxAttempts: 1, backoff: 'FIXED', initialDelay: 1000, maxDelay: 5000, multiplier: 1 },
          circuitBreaker: { enabled: true, failureThreshold: 3, timeout: 30000, resetTimeout: 60000, monitoring: { enabled: true, metrics: [], alerts: [] } },
          bulkhead: { enabled: true, maxConcurrent: 5, maxQueue: 25, timeout: 15000 },
          compression: { enabled: false, algorithm: 'GZIP', level: 'LOW', threshold: 2048 }
        },
        notifications: {
          enabled: true,
          channels: [],
          events: [],
          templates: []
        }
      },
      permissions: {
        view: { roles: ['admin', 'security-admin'], users: [], groups: [], conditions: [] },
        use: { roles: ['admin', 'security-admin'], users: [], groups: [], conditions: [] },
        configure: { roles: ['admin', 'security-admin'], users: [], groups: [], conditions: [] },
        manage: { roles: ['admin'], users: [], groups: [], conditions: [] },
        deploy: { roles: ['admin'], users: [], groups: [], conditions: [] }
      },
      usage: {
        totalUsage: 2450,
        dailyUsage: [
          { date: '2024-01-20', requests: 85, users: 8, errors: 2, avgResponseTime: 320, dataVolume: 0.4 },
          { date: '2024-01-19', requests: 78, users: 7, errors: 1, avgResponseTime: 315, dataVolume: 0.3 },
          { date: '2024-01-18', requests: 92, users: 9, errors: 3, avgResponseTime: 325, dataVolume: 0.5 }
        ],
        users: [
          { userId: 'user-5', userName: 'Security Admin', usage: 320, lastUsed: new Date('2024-01-20T17:20:00'), features: ['security-enhancement'], performance: { avgResponseTime: 320, errorRate: 2.35, successRate: 97.65, requests: 320 } }
        ],
        performance: { avgResponseTime: 320, p95ResponseTime: 480, p99ResponseTime: 650, errorRate: 2.35, throughput: 3.5, availability: 97.65 },
        trends: [
          { period: '7d', metric: 'usage', trend: 'UP', change: 15.2, data: [] },
          { period: '7d', metric: 'performance', trend: 'DOWN', change: -8.5, data: [] }
        ],
        quotas: [
          { type: 'USERS', limit: 20, current: 8, resetPeriod: 'monthly', nextReset: new Date('2024-02-01') },
          { type: 'FEATURE_USES', limit: 10000, current: 2450, resetPeriod: 'monthly', nextReset: new Date('2024-02-01') }
        ]
      },
      performance: {
        responseTime: { average: 320, median: 315, p90: 420, p95: 480, p99: 650, min: 180, max: 920, standardDeviation: 95 },
        throughput: { requestsPerSecond: 3.5, requestsPerMinute: 210, requestsPerHour: 12600, requestsPerDay: 302400, peakThroughput: 8.2, averageThroughput: 3.5 },
        errorRate: { totalErrors: 58, errorRate: 2.35, criticalErrors: 12, warningErrors: 46, errorsByType: {}, errorsByEndpoint: {} },
        availability: { uptime: 97.65, downtime: 2.35, availability: 97.65, mttr: 25.5, mtbf: 1080.2, incidents: { total: 8, critical: 3, major: 3, minor: 2, resolved: 6, open: 2, averageResolutionTime: 25.5 }, sla: { target: 99.9, current: 97.65, compliance: false, penalties: 0, credits: 0 } },
        resourceUsage: {
          cpu: { usage: 45, available: 55, total: 100, percentage: 45, threshold: 70, status: 'NORMAL', trend: 'STABLE' },
          memory: { usage: 68, available: 32, total: 100, percentage: 68, threshold: 80, status: 'NORMAL', trend: 'UP' },
          disk: { usage: 25, available: 75, total: 100, percentage: 25, threshold: 85, status: 'NORMAL', trend: 'STABLE' },
          network: { usage: 15, available: 85, total: 100, percentage: 15, threshold: 70, status: 'NORMAL', trend: 'STABLE' },
          cache: { hitRate: 92.5, missRate: 7.5, size: 128, evictions: 45, ttl: 300 },
          connections: { active: 8, idle: 4, total: 12, max: 20, waiting: 0, averageWaitTime: 0.8 }
        },
        scalability: {
          horizontalScaling: { minInstances: 1, maxInstances: 5, currentInstances: 2, scalingEvents: [], averageScaleTime: 60 },
          verticalScaling: { cpuScaling: true, memoryScaling: true, storageScaling: false, scalingEvents: [], averageScaleTime: 45 },
          loadBalancing: { algorithm: 'ROUND_ROBIN', distribution: {}, healthChecks: { enabled: true, interval: 15, timeout: 3, healthyEndpoints: 2, totalEndpoints: 2, averageResponseTime: 15 }, failover: { events: [], averageFailoverTime: 5, successfulFailovers: 3, failedFailovers: 0 } },
          autoScaling: { enabled: false, policies: [], events: [], averageScaleTime: 60, cost: { totalCost: 450, averageCostPerInstance: 225, costSavings: 0, projectedCost: 450 } }
        }
      },
      metadata: {
        version: '1.8.0-beta',
        environment: 'staging',
        category: 'SECURITY',
        tags: ['security', 'authentication', 'biometric', 'zero-trust'],
        documentation: 'https://docs.company.com/security-enhancement',
        changelog: [
          { version: '1.8.0-beta', date: new Date('2024-01-18'), author: 'security-team', changes: ['Added biometric auth', 'Enhanced encryption'], type: 'MAJOR', breaking: true }
        ],
        dependencies: [],
        requirements: [],
        compatibility: { minVersion: '2.0.0', platforms: ['linux'], browsers: ['chrome', 'firefox'], dependencies: [] },
        support: {
          level: 'ENTERPRISE',
          team: 'Security Team',
          contact: [
            { type: 'EMAIL', value: 'security-support@company.com', description: 'Primary support contact', hours: '24/7' },
            { type: 'PHONE', value: '+1-555-SECURITY', description: 'Emergency security hotline', hours: '24/7' }
          ],
          sla: { responseTime: 15, resolutionTime: 60, availability: 99.9, escalation: [] },
          documentation: 'https://docs.company.com/security-enhancement',
          training: [
            { id: 'sec-101', name: 'Advanced Security Features', type: 'WORKSHOP', url: 'https://training.company.com/sec-101', duration: 120, difficulty: 'ADVANCED', prerequisites: ['basic-security'], description: 'Deep dive into advanced security features' }
          ]
        },
        licensing: {
          type: 'ENTERPRISE',
          provider: 'Company Inc',
          key: 'SECURITY-ADV-2024',
          expiry: new Date('2024-12-31'),
          limits: [
            { type: 'USERS', value: 20, description: 'Maximum concurrent users' },
            { type: 'FEATURE_USES', value: 10000, description: 'Monthly feature uses' }
          ],
          features: [
            { name: 'Biometric Authentication', enabled: true, description: 'Fingerprint and face recognition' },
            { name: 'Zero-Trust Architecture', enabled: true, description: 'Complete zero-trust security model' }
          ],
          compliance: { compliant: true, violations: [], lastChecked: new Date('2024-01-20'), nextCheck: new Date('2024-01-21') }
        }
      },
      createdAt: new Date('2023-11-10T00:00:00'),
      updatedAt: new Date('2024-01-18T16:45:00'),
      createdBy: 'security-team',
      updatedBy: 'security-team',
      tags: ['security', 'authentication', 'biometric', 'zero-trust']
    }
  ]);

  const [selectedFeature, setSelectedFeature] = useState<AdvancedFeature | null>(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<FeatureCategory | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<FeatureStatus | 'ALL'>('ALL');
  const [filterType, setFilterType] = useState<FeatureType | 'ALL'>('ALL');

  const handleToggleFeature = async (featureId: string, enabled: boolean) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setFeatures(features.map(f => 
        f.id === featureId 
          ? { ...f, settings: { ...f.settings, enabled } }
          : f
      ));
      toast.success(`Feature ${enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      toast.error('Failed to toggle feature');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: FeatureStatus) => {
    switch (status) {
      case 'PRODUCTION': return 'bg-green-100 text-green-800';
      case 'STAGING': return 'bg-blue-100 text-blue-800';
      case 'DEVELOPMENT': return 'bg-yellow-100 text-yellow-800';
      case 'TESTING': return 'bg-purple-100 text-purple-800';
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'DEPRECATED': return 'bg-orange-100 text-orange-800';
      case 'DISABLED': return 'bg-red-100 text-red-800';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: FeatureStatus) => {
    switch (status) {
      case 'PRODUCTION': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'STAGING': return <Upload className="h-4 w-4 text-blue-600" />;
      case 'DEVELOPMENT': return <Code className="h-4 w-4 text-yellow-600" />;
      case 'TESTING': return <Activity className="h-4 w-4 text-purple-600" />;
      case 'DRAFT': return <FileText className="h-4 w-4 text-gray-600" />;
      case 'DEPRECATED': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'DISABLED': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'ARCHIVED': return <Archive className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: FeatureCategory) => {
    switch (category) {
      case 'AI_ML': return <Zap className="h-4 w-4 text-purple-600" />;
      case 'ANALYTICS': return <BarChart3 className="h-4 w-4 text-blue-600" />;
      case 'AUTOMATION': return <Settings className="h-4 w-4 text-green-600" />;
      case 'INTEGRATION': return <Link className="h-4 w-4 text-cyan-600" />;
      case 'SECURITY': return <Shield className="h-4 w-4 text-red-600" />;
      case 'COLLABORATION': return <Users className="h-4 w-4 text-indigo-600" />;
      case 'CUSTOMIZATION': return <Settings className="h-4 w-4 text-orange-600" />;
      case 'PERFORMANCE': return <Activity className="h-4 w-4 text-yellow-600" />;
      case 'MOBILITY': return <Smartphone className="h-4 w-4 text-pink-600" />;
      case 'ENTERPRISE': return <Crown className="h-4 w-4 text-amber-600" />;
      default: return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: FeatureType) => {
    switch (type) {
      case 'MODULE': return <Package className="h-4 w-4 text-blue-600" />;
      case 'COMPONENT': return <Layers className="h-4 w-4 text-green-600" />;
      case 'API': return <Globe className="h-4 w-4 text-purple-600" />;
      case 'WORKFLOW': return <GitBranch className="h-4 w-4 text-orange-600" />;
      case 'DASHBOARD': return <BarChart3 className="h-4 w-4 text-red-600" />;
      case 'REPORT': return <FileText className="h-4 w-4 text-indigo-600" />;
      case 'INTEGRATION': return <Link className="h-4 w-4 text-cyan-600" />;
      case 'AUTOMATION': return <Settings className="h-4 w-4 text-yellow-600" />;
      case 'TEMPLATE': return <Copy className="h-4 w-4 text-pink-600" />;
      case 'PLUGIN': return <Zap className="h-4 w-4 text-amber-600" />;
      default: return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredFeatures = features.filter(feature => {
    const matchesSearch = feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         feature.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         feature.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = filterCategory === 'ALL' || feature.category === filterCategory;
    const matchesStatus = filterStatus === 'ALL' || feature.status === filterStatus;
    const matchesType = filterType === 'ALL' || feature.type === filterType;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesType;
  });

  const activeFeatures = features.filter(f => f.settings.enabled);
  const productionFeatures = features.filter(f => f.status === 'PRODUCTION');
  const totalUsage = features.reduce((sum, f) => sum + f.usage.totalUsage, 0);
  const averagePerformance = features.reduce((sum, f) => sum + f.performance.availability.availability, 0) / features.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Features Dashboard</h1>
          <p className="text-gray-600">Manage and monitor advanced enterprise features</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-1" />
            Add Feature
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{features.length}</p>
                <p className="text-sm text-gray-600">Total Features</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Play className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeFeatures.length}</p>
                <p className="text-sm text-gray-600">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Activity className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(totalUsage / 1000).toFixed(1)}K</p>
                <p className="text-sm text-gray-600">Total Usage</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{averagePerformance.toFixed(1)}%</p>
                <p className="text-sm text-gray-600">Avg Performance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search features by name, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
              >
                <option value="ALL">All Categories</option>
                <option value="AI_ML">AI & ML</option>
                <option value="ANALYTICS">Analytics</option>
                <option value="AUTOMATION">Automation</option>
                <option value="INTEGRATION">Integration</option>
                <option value="SECURITY">Security</option>
                <option value="COLLABORATION">Collaboration</option>
                <option value="CUSTOMIZATION">Customization</option>
                <option value="PERFORMANCE">Performance</option>
                <option value="MOBILITY">Mobility</option>
                <option value="ENTERPRISE">Enterprise</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="ALL">All Status</option>
                <option value="PRODUCTION">Production</option>
                <option value="STAGING">Staging</option>
                <option value="DEVELOPMENT">Development</option>
                <option value="TESTING">Testing</option>
                <option value="DRAFT">Draft</option>
                <option value="DEPRECATED">Deprecated</option>
                <option value="DISABLED">Disabled</option>
                <option value="ARCHIVED">Archived</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
              >
                <option value="ALL">All Types</option>
                <option value="MODULE">Module</option>
                <option value="COMPONENT">Component</option>
                <option value="API">API</option>
                <option value="WORKFLOW">Workflow</option>
                <option value="DASHBOARD">Dashboard</option>
                <option value="REPORT">Report</option>
                <option value="INTEGRATION">Integration</option>
                <option value="AUTOMATION">Automation</option>
                <option value="TEMPLATE">Template</option>
                <option value="PLUGIN">Plugin</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Overview Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
          <TabsTrigger value="resources">Resource Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredFeatures.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No features found</p>
                <p className="text-sm">Create your first advanced feature to get started</p>
              </div>
            ) : (
              filteredFeatures.map(feature => (
                <Card key={feature.id} className={
                  feature.status === 'DISABLED' ? 'border-red-200' : 
                  feature.status === 'DEPRECATED' ? 'border-orange-200' : ''
                }>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          feature.settings.enabled ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          {feature.settings.enabled ? 
                            <Play className="h-5 w-5 text-green-600" /> : 
                            <Pause className="h-5 w-5 text-gray-600" />
                          }
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{feature.name}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{feature.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge className={getStatusColor(feature.status)}>
                              {feature.status}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              {getCategoryIcon(feature.category)}
                              <span className="text-sm text-gray-600">{feature.category}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              {getTypeIcon(feature.type)}
                              <span className="text-sm text-gray-600">{feature.type}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              v{feature.version}
                            </Badge>
                            <Badge className={getPriorityColor(feature.priority)}>
                              {feature.priority}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold">{feature.performance.availability.availability.toFixed(1)}%</p>
                        <p className="text-sm text-gray-600">Availability</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold">{feature.performance.responseTime.average.toFixed(0)}ms</p>
                        <p className="text-sm text-gray-600">Avg Response</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold">{(feature.usage.totalUsage / 1000).toFixed(1)}K</p>
                        <p className="text-sm text-gray-600">Total Usage</p>
                      </div>
                    </div>

                    {/* Resource Usage */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Resource Usage</span>
                        <span className="text-sm text-gray-500">
                          CPU: {feature.performance.resourceUsage.cpu.percentage}% | 
                          Memory: {feature.performance.resourceUsage.memory.percentage}%
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs">CPU</span>
                            <span className="text-xs">{feature.performance.resourceUsage.cpu.percentage}%</span>
                          </div>
                          <Progress value={feature.performance.resourceUsage.cpu.percentage} className="h-1" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs">Memory</span>
                            <span className="text-xs">{feature.performance.resourceUsage.memory.percentage}%</span>
                          </div>
                          <Progress value={feature.performance.resourceUsage.memory.percentage} className="h-1" />
                        </div>
                      </div>
                    </div>

                    {/* Last Updated */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>
                        Updated: {formatDistanceToNow(feature.updatedAt, { addSuffix: true })}
                      </span>
                      <span>
                        Created by {feature.createdBy}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedFeature(feature);
                          setDetailsDialog(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleFeature(feature.id, !feature.settings.enabled)}
                        disabled={loading}
                      >
                        {feature.settings.enabled ? 
                          <><Pause className="h-4 w-4 mr-1" />Disable</> : 
                          <><Play className="h-4 w-4 mr-1" />Enable</>
                        }
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Top Performing Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {features
                    .sort((a, b) => b.performance.availability.availability - a.performance.availability.availability)
                    .slice(0, 5)
                    .map(feature => (
                      <div key={feature.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium">{feature.name}</h4>
                          <p className="text-sm text-gray-600">{feature.usage.totalUsage} uses</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            {feature.performance.availability.availability.toFixed(1)}%
                          </p>
                          <p className="text-xs text-gray-500">
                            {feature.performance.responseTime.average.toFixed(0)}ms avg
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  <span>Features Needing Attention</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {features
                    .filter(f => f.performance.availability.availability < 98)
                    .sort((a, b) => a.performance.availability.availability - b.performance.availability.availability)
                    .slice(0, 5)
                    .map(feature => (
                      <div key={feature.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-red-800">{feature.name}</h4>
                          <p className="text-sm text-red-600">{feature.performance.availability.incidents.total} incidents</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-600">
                            {feature.performance.availability.availability.toFixed(1)}%
                          </p>
                          <p className="text-xs text-red-500">
                            {feature.performance.errorRate.errorRate.toFixed(2)}% error rate
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(
                    features.reduce((acc, feature) => {
                      acc[feature.category] = (acc[feature.category] || 0) + feature.usage.totalUsage;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([category, usage]) => (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(category as FeatureCategory)}
                        <span className="text-sm font-medium">{category}</span>
                      </div>
                      <span className="text-sm font-bold">{(usage / 1000).toFixed(1)}K</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Most Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {features
                    .flatMap(f => f.usage.users)
                    .sort((a, b) => b.usage - a.usage)
                    .slice(0, 5)
                    .map((user, index) => (
                      <div key={user.userId} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{index + 1}. {user.userName}</span>
                        </div>
                        <span className="text-sm font-bold">{user.usage}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Usage Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {features
                    .filter(f => f.usage.trends.length > 0)
                    .map(feature => (
                      <div key={feature.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{feature.name}</span>
                          <div className="flex items-center space-x-1">
                            {feature.usage.trends[0].trend === 'UP' ? 
                              <TrendingUp className="h-3 w-3 text-green-600" /> : 
                              <TrendingDown className="h-3 w-3 text-red-600" />
                            }
                            <span className="text-xs">
                              {feature.usage.trends[0].change > 0 ? '+' : ''}{feature.usage.trends[0].change}%
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">Last 7 days</p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Resource Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Cpu className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium">CPU Usage</span>
                      </div>
                      <span className="text-sm">
                        {features.reduce((sum, f) => sum + f.performance.resourceUsage.cpu.usage, 0) / features.length}%
                      </span>
                    </div>
                    <Progress 
                      value={features.reduce((sum, f) => sum + f.performance.resourceUsage.cpu.usage, 0) / features.length} 
                      className="h-2" 
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <HardDrive className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium">Memory Usage</span>
                      </div>
                      <span className="text-sm">
                        {features.reduce((sum, f) => sum + f.performance.resourceUsage.memory.usage, 0) / features.length}%
                      </span>
                    </div>
                    <Progress 
                      value={features.reduce((sum, f) => sum + f.performance.resourceUsage.memory.usage, 0) / features.length} 
                      className="h-2" 
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Wifi className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium">Network Usage</span>
                      </div>
                      <span className="text-sm">
                        {features.reduce((sum, f) => sum + f.performance.resourceUsage.network.usage, 0) / features.length}%
                      </span>
                    </div>
                    <Progress 
                      value={features.reduce((sum, f) => sum + f.performance.resourceUsage.network.usage, 0) / features.length} 
                      className="h-2" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Scalability Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Total Instances</span>
                      <span className="text-sm font-bold">
                        {features.reduce((sum, f) => sum + f.performance.scalability.horizontalScaling.currentInstances, 0)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Across all features</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Auto-scaling Enabled</span>
                      <span className="text-sm font-bold">
                        {features.filter(f => f.performance.scalability.autoScaling.enabled).length}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Features with auto-scaling</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Load Balancing</span>
                      <span className="text-sm font-bold">
                        {features.filter(f => f.performance.scalability.loadBalancing.algorithm).length}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Features with load balancing</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Feature Details Dialog */}
      <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Feature Details</DialogTitle>
          </DialogHeader>
          {selectedFeature && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Feature Name</Label>
                  <p className="font-medium">{selectedFeature.name}</p>
                </div>
                <div>
                  <Label>Category</Label>
                  <p className="font-medium">{selectedFeature.category}</p>
                </div>
                <div>
                  <Label>Type</Label>
                  <p className="font-medium">{selectedFeature.type}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedFeature.status)}>
                    {selectedFeature.status}
                  </Badge>
                </div>
                <div>
                  <Label>Version</Label>
                  <p className="font-medium">{selectedFeature.version}</p>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Badge className={getPriorityColor(selectedFeature.priority)}>
                    {selectedFeature.priority}
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <p className="text-sm text-gray-600">{selectedFeature.description}</p>
              </div>

              <div>
                <Label>Performance Metrics</Label>
                <div className="mt-2 grid grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold">{selectedFeature.performance.availability.availability.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">Availability</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold">{selectedFeature.performance.responseTime.average.toFixed(0)}ms</p>
                    <p className="text-sm text-gray-600">Avg Response Time</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold">{selectedFeature.performance.errorRate.errorRate.toFixed(2)}%</p>
                    <p className="text-sm text-gray-600">Error Rate</p>
                  </div>
                </div>
              </div>

              <div>
                <Label>Resource Usage</Label>
                <div className="mt-2 grid grid-cols-4 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold">{selectedFeature.performance.resourceUsage.cpu.percentage}%</p>
                    <p className="text-sm text-gray-600">CPU</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold">{selectedFeature.performance.resourceUsage.memory.percentage}%</p>
                    <p className="text-sm text-gray-600">Memory</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold">{selectedFeature.performance.resourceUsage.disk.percentage}%</p>
                    <p className="text-sm text-gray-600">Disk</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold">{selectedFeature.performance.resourceUsage.network.percentage}%</p>
                    <p className="text-sm text-gray-600">Network</p>
                  </div>
                </div>
              </div>

              <div>
                <Label>Usage Statistics</Label>
                <div className="mt-2 grid grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold">{selectedFeature.usage.totalUsage.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Total Usage</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold">{selectedFeature.usage.users.length}</p>
                    <p className="text-sm text-gray-600">Active Users</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold">{selectedFeature.usage.performance.throughput.requestsPerSecond.toFixed(1)}</p>
                    <p className="text-sm text-gray-600">Requests/sec</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Export Configuration
                </Button>
                <Button variant="outline">
                  <Copy className="h-4 w-4 mr-1" />
                  Duplicate Feature
                </Button>
                <Button onClick={() => handleToggleFeature(selectedFeature.id, !selectedFeature.settings.enabled)} disabled={loading}>
                  {selectedFeature.settings.enabled ? 
                    <><Pause className="h-4 w-4 mr-1" />Disable</> : 
                    <><Play className="h-4 w-4 mr-1" />Enable</>
                  }
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdvancedFeaturesDashboardPage;
