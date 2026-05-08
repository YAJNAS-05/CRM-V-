import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Download,
  Plus,
  Filter,
  Search,
  Eye,
  Calendar,
  Timer,
  Zap,
  Database,
  Globe,
  Server,
  Users,
  FileText,
  LineChart,
  PieChart,
  Target,
  ArrowUp,
  ArrowDown,
  Minus,
  Info,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { integrationApi } from '../../api/integrationApi';

interface AnalyticsMetric {
  id: string;
  name: string;
  description: string;
  category: 'performance' | 'usage' | 'error' | 'business';
  value: number;
  previousValue: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  status: 'good' | 'warning' | 'critical';
  threshold: {
    good: number;
    warning: number;
    critical: number;
  };
  integration: string;
  timeRange: string;
}

interface IntegrationAnalytics {
  id: string;
  integration: string;
  type: 'api' | 'database' | 'webhook' | 'file';
  status: 'active' | 'inactive' | 'error';
  metrics: {
    requests: number;
    successRate: number;
    avgResponseTime: number;
    errorRate: number;
    throughput: number;
    dataVolume: number;
    uptime: number;
  };
  trends: {
    requests: TrendData[];
    responseTime: TrendData[];
    errorRate: TrendData[];
    throughput: TrendData[];
  };
  topEndpoints: EndpointAnalytics[];
  errors: ErrorAnalytics[];
  performance: PerformanceAnalytics;
}

interface TrendData {
  timestamp: string;
  value: number;
}

interface EndpointAnalytics {
  endpoint: string;
  method: string;
  requests: number;
  avgResponseTime: number;
  errorRate: number;
  status: 'healthy' | 'degraded' | 'unhealthy';
}

interface ErrorAnalytics {
  type: string;
  count: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  lastOccurrence: string;
}

interface PerformanceAnalytics {
  p50: number;
  p95: number;
  p99: number;
  max: number;
  min: number;
  avg: number;
}

interface BusinessMetrics {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  progress: number;
  trend: 'up' | 'down' | 'stable';
  integration: string;
}

const IntegrationAnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [searchTerm, setSearchTerm] = useState('');
  const [analyticsMetrics, setAnalyticsMetrics] = useState<AnalyticsMetric[]>([]);
  const [loading, setLoading] = useState(false);

  // Load analytics metrics from API on component mount
  useEffect(() => {
    const loadAnalyticsMetrics = async () => {
      setLoading(true);
      try {
        const metricsData = await integrationApi.getAnalyticsMetrics();
        if (metricsData) {
          setAnalyticsMetrics(metricsData);
        }
      } catch (error) {
        console.error('Failed to load analytics metrics:', error);
        toast.error('Failed to load analytics metrics');
      } finally {
        setLoading(false);
      }
    };
    loadAnalyticsMetrics();
  }, []);
      name: 'Average Response Time',
      description: 'Average response time across all integrations',
      category: 'performance',
      value: 285,
      previousValue: 298,
      unit: 'ms',
      trend: 'down',
      trendPercentage: 4.4,
      status: 'good',
      threshold: { good: 500, warning: 1000, critical: 2000 },
      integration: 'All',
      timeRange: '24h'
    },
    {
      id: 'metric-3',
      name: 'Success Rate',
      description: 'Overall success rate for all integration requests',
      category: 'performance',
      value: 98.7,
      previousValue: 97.9,
      unit: '%',
      trend: 'up',
      trendPercentage: 0.8,
      status: 'good',
      threshold: { good: 95, warning: 90, critical: 85 },
      integration: 'All',
      timeRange: '24h'
    },
    {
      id: 'metric-4',
      name: 'Error Rate',
      description: 'Percentage of failed requests across all integrations',
      category: 'error',
      value: 1.3,
      previousValue: 2.1,
      unit: '%',
      trend: 'down',
      trendPercentage: 38.1,
      status: 'good',
      threshold: { good: 2, warning: 5, critical: 10 },
      integration: 'All',
      timeRange: '24h'
    },
    {
      id: 'metric-5',
      name: 'Data Volume',
      description: 'Total data volume processed by integrations',
      category: 'usage',
      value: 12.4,
      previousValue: 11.8,
      unit: 'GB',
      trend: 'up',
      trendPercentage: 5.1,
      status: 'good',
      threshold: { good: 10, warning: 20, critical: 50 },
      integration: 'All',
      timeRange: '24h'
    },
    {
      id: 'metric-6',
      name: 'System Uptime',
      description: 'Overall system uptime for all integrations',
      category: 'performance',
      value: 99.8,
      previousValue: 99.6,
      unit: '%',
      trend: 'up',
      trendPercentage: 0.2,
      status: 'good',
      threshold: { good: 99, warning: 95, critical: 90 },
      integration: 'All',
      timeRange: '24h'
    }
  ];

  const integrationAnalytics: IntegrationAnalytics[] = [
    {
      id: 'analytics-1',
      integration: 'Salesforce CRM',
      type: 'api',
      status: 'active',
      metrics: {
        requests: 15420,
        successRate: 99.8,
        avgResponseTime: 245,
        errorRate: 0.2,
        throughput: 642,
        dataVolume: 2.3,
        uptime: 99.8
      },
      trends: {
        requests: [
          { timestamp: '2024-01-15 00:00', value: 420 },
          { timestamp: '2024-01-15 01:00', value: 380 },
          { timestamp: '2024-01-15 02:00', value: 350 },
          { timestamp: '2024-01-15 03:00', value: 320 },
          { timestamp: '2024-01-15 04:00', value: 290 },
          { timestamp: '2024-01-15 05:00', value: 310 },
          { timestamp: '2024-01-15 06:00', value: 450 },
          { timestamp: '2024-01-15 07:00', value: 520 },
          { timestamp: '2024-01-15 08:00', value: 680 },
          { timestamp: '2024-01-15 09:00', value: 750 },
          { timestamp: '2024-01-15 10:00', value: 720 },
          { timestamp: '2024-01-15 11:00', value: 690 },
          { timestamp: '2024-01-15 12:00', value: 650 },
          { timestamp: '2024-01-15 13:00', value: 680 },
          { timestamp: '2024-01-15 14:00', value: 710 },
          { timestamp: '2024-01-15 15:00', value: 690 }
        ],
        responseTime: [
          { timestamp: '2024-01-15 00:00', value: 220 },
          { timestamp: '2024-01-15 01:00', value: 235 },
          { timestamp: '2024-01-15 02:00', value: 210 },
          { timestamp: '2024-01-15 03:00', value: 225 },
          { timestamp: '2024-01-15 04:00', value: 215 },
          { timestamp: '2024-01-15 05:00', value: 230 },
          { timestamp: '2024-01-15 06:00', value: 240 },
          { timestamp: '2024-01-15 07:00', value: 250 },
          { timestamp: '2024-01-15 08:00', value: 260 },
          { timestamp: '2024-01-15 09:00', value: 255 },
          { timestamp: '2024-01-15 10:00', value: 245 },
          { timestamp: '2024-01-15 11:00', value: 240 },
          { timestamp: '2024-01-15 12:00', value: 235 },
          { timestamp: '2024-01-15 13:00', value: 245 },
          { timestamp: '2024-01-15 14:00', value: 250 },
          { timestamp: '2024-01-15 15:00', value: 245 }
        ],
        errorRate: [
          { timestamp: '2024-01-15 00:00', value: 0.5 },
          { timestamp: '2024-01-15 01:00', value: 0.3 },
          { timestamp: '2024-01-15 02:00', value: 0.0 },
          { timestamp: '2024-01-15 03:00', value: 0.3 },
          { timestamp: '2024-01-15 04:00', value: 0.0 },
          { timestamp: '2024-01-15 05:00', value: 0.3 },
          { timestamp: '2024-01-15 06:00', value: 0.4 },
          { timestamp: '2024-01-15 07:00', value: 0.6 },
          { timestamp: '2024-01-15 08:00', value: 0.6 },
          { timestamp: '2024-01-15 09:00', value: 0.7 },
          { timestamp: '2024-01-15 10:00', value: 0.4 },
          { timestamp: '2024-01-15 11:00', value: 0.3 },
          { timestamp: '2024-01-15 12:00', value: 0.3 },
          { timestamp: '2024-01-15 13:00', value: 0.4 },
          { timestamp: '2024-01-15 14:00', value: 0.4 },
          { timestamp: '2024-01-15 15:00', value: 0.3 }
        ],
        throughput: [
          { timestamp: '2024-01-15 00:00', value: 420 },
          { timestamp: '2024-01-15 01:00', value: 380 },
          { timestamp: '2024-01-15 02:00', value: 350 },
          { timestamp: '2024-01-15 03:00', value: 320 },
          { timestamp: '2024-01-15 04:00', value: 290 },
          { timestamp: '2024-01-15 05:00', value: 310 },
          { timestamp: '2024-01-15 06:00', value: 450 },
          { timestamp: '2024-01-15 07:00', value: 520 },
          { timestamp: '2024-01-15 08:00', value: 680 },
          { timestamp: '2024-01-15 09:00', value: 750 },
          { timestamp: '2024-01-15 10:00', value: 720 },
          { timestamp: '2024-01-15 11:00', value: 690 },
          { timestamp: '2024-01-15 12:00', value: 650 },
          { timestamp: '2024-01-15 13:00', value: 680 },
          { timestamp: '2024-01-15 14:00', value: 710 },
          { timestamp: '2024-01-15 15:00', value: 690 }
        ]
      },
      topEndpoints: [
        { endpoint: '/accounts', method: 'GET', requests: 5230, avgResponseTime: 220, errorRate: 0.1, status: 'healthy' },
        { endpoint: '/contacts', method: 'POST', requests: 3420, avgResponseTime: 280, errorRate: 0.3, status: 'healthy' },
        { endpoint: '/opportunities', method: 'GET', requests: 6770, avgResponseTime: 235, errorRate: 0.2, status: 'healthy' }
      ],
      errors: [
        { type: 'Authentication Error', count: 15, percentage: 0.1, trend: 'down', lastOccurrence: '2024-01-15 14:30:00' },
        { type: 'Rate Limit Exceeded', count: 8, percentage: 0.05, trend: 'stable', lastOccurrence: '2024-01-15 13:45:00' },
        { type: 'Timeout Error', count: 8, percentage: 0.05, trend: 'down', lastOccurrence: '2024-01-15 12:20:00' }
      ],
      performance: {
        p50: 220,
        p95: 420,
        p99: 650,
        max: 1200,
        min: 120,
        avg: 245
      }
    },
    {
      id: 'analytics-2',
      integration: 'SAP ERP',
      type: 'database',
      status: 'active',
      metrics: {
        requests: 8930,
        successRate: 99.5,
        avgResponseTime: 520,
        errorRate: 0.5,
        throughput: 372,
        dataVolume: 5.7,
        uptime: 99.5
      },
      trends: {
        requests: [
          { timestamp: '2024-01-15 00:00', value: 280 },
          { timestamp: '2024-01-15 01:00', value: 250 },
          { timestamp: '2024-01-15 02:00', value: 220 },
          { timestamp: '2024-01-15 03:00', value: 200 },
          { timestamp: '2024-01-15 04:00', value: 180 },
          { timestamp: '2024-01-15 05:00', value: 210 },
          { timestamp: '2024-01-15 06:00', value: 320 },
          { timestamp: '2024-01-15 07:00', value: 380 },
          { timestamp: '2024-01-15 08:00', value: 420 },
          { timestamp: '2024-01-15 09:00', value: 450 },
          { timestamp: '2024-01-15 10:00', value: 430 },
          { timestamp: '2024-01-15 11:00', value: 410 },
          { timestamp: '2024-01-15 12:00', value: 390 },
          { timestamp: '2024-01-15 13:00', value: 400 },
          { timestamp: '2024-01-15 14:00', value: 420 },
          { timestamp: '2024-01-15 15:00', value: 380 }
        ],
        responseTime: [
          { timestamp: '2024-01-15 00:00', value: 480 },
          { timestamp: '2024-01-15 01:00', value: 490 },
          { timestamp: '2024-01-15 02:00', value: 475 },
          { timestamp: '2024-01-15 03:00', value: 470 },
          { timestamp: '2024-01-15 04:00', value: 485 },
          { timestamp: '2024-01-15 05:00', value: 465 },
          { timestamp: '2024-01-15 06:00', value: 500 },
          { timestamp: '2024-01-15 07:00', value: 510 },
          { timestamp: '2024-01-15 08:00', value: 520 },
          { timestamp: '2024-01-15 09:00', value: 530 },
          { timestamp: '2024-01-15 10:00', value: 525 },
          { timestamp: '2024-01-15 11:00', value: 515 },
          { timestamp: '2024-01-15 12:00', value: 510 },
          { timestamp: '2024-01-15 13:00', value: 520 },
          { timestamp: '2024-01-15 14:00', value: 525 },
          { timestamp: '2024-01-15 15:00', value: 515 }
        ],
        errorRate: [
          { timestamp: '2024-01-15 00:00', value: 0.7 },
          { timestamp: '2024-01-15 01:00', value: 0.4 },
          { timestamp: '2024-01-15 02:00', value: 0.5 },
          { timestamp: '2024-01-15 03:00', value: 0.0 },
          { timestamp: '2024-01-15 04:00', value: 0.6 },
          { timestamp: '2024-01-15 05:00', value: 0.0 },
          { timestamp: '2024-01-15 06:00', value: 0.6 },
          { timestamp: '2024-01-15 07:00', value: 0.8 },
          { timestamp: '2024-01-15 08:00', value: 1.0 },
          { timestamp: '2024-01-15 09:00', value: 1.1 },
          { timestamp: '2024-01-15 10:00', value: 0.9 },
          { timestamp: '2024-01-15 11:00', value: 0.7 },
          { timestamp: '2024-01-15 12:00', value: 0.8 },
          { timestamp: '2024-01-15 13:00', value: 0.8 },
          { timestamp: '2024-01-15 14:00', value: 0.9 },
          { timestamp: '2024-01-15 15:00', value: 0.5 }
        ],
        throughput: [
          { timestamp: '2024-01-15 00:00', value: 280 },
          { timestamp: '2024-01-15 01:00', value: 250 },
          { timestamp: '2024-01-15 02:00', value: 220 },
          { timestamp: '2024-01-15 03:00', value: 200 },
          { timestamp: '2024-01-15 04:00', value: 180 },
          { timestamp: '2024-01-15 05:00', value: 210 },
          { timestamp: '2024-01-15 06:00', value: 320 },
          { timestamp: '2024-01-15 07:00', value: 380 },
          { timestamp: '2024-01-15 08:00', value: 420 },
          { timestamp: '2024-01-15 09:00', value: 450 },
          { timestamp: '2024-01-15 10:00', value: 430 },
          { timestamp: '2024-01-15 11:00', value: 410 },
          { timestamp: '2024-01-15 12:00', value: 390 },
          { timestamp: '2024-01-15 13:00', value: 400 },
          { timestamp: '2024-01-15 14:00', value: 420 },
          { timestamp: '2024-01-15 15:00', value: 380 }
        ]
      },
      topEndpoints: [
        { endpoint: '/financial-data', method: 'POST', requests: 2340, avgResponseTime: 580, errorRate: 0.4, status: 'healthy' },
        { endpoint: '/inventory-status', method: 'GET', requests: 4590, avgResponseTime: 480, errorRate: 0.6, status: 'healthy' },
        { endpoint: '/employee-data', method: 'GET', requests: 2000, avgResponseTime: 500, errorRate: 0.5, status: 'healthy' }
      ],
      errors: [
        { type: 'Connection Timeout', count: 25, percentage: 0.3, trend: 'up', lastOccurrence: '2024-01-15 15:20:00' },
        { type: 'Database Error', count: 12, percentage: 0.1, trend: 'stable', lastOccurrence: '2024-01-15 14:15:00' },
        { type: 'Query Timeout', count: 8, percentage: 0.1, trend: 'down', lastOccurrence: '2024-01-15 13:30:00' }
      ],
      performance: {
        p50: 480,
        p95: 850,
        p99: 1200,
        max: 2500,
        min: 200,
        avg: 520
      }
    },
    {
      id: 'analytics-3',
      integration: 'HubSpot Marketing',
      type: 'webhook',
      status: 'error',
      metrics: {
        requests: 6780,
        successRate: 94.8,
        avgResponseTime: 380,
        errorRate: 5.2,
        throughput: 282,
        dataVolume: 1.2,
        uptime: 94.8
      },
      trends: {
        requests: [
          { timestamp: '2024-01-15 00:00', value: 220 },
          { timestamp: '2024-01-15 01:00', value: 200 },
          { timestamp: '2024-01-15 02:00', value: 180 },
          { timestamp: '2024-01-15 03:00', value: 160 },
          { timestamp: '2024-01-15 04:00', value: 140 },
          { timestamp: '2024-01-15 05:00', value: 150 },
          { timestamp: '2024-01-15 06:00', value: 280 },
          { timestamp: '2024-01-15 07:00', value: 320 },
          { timestamp: '2024-01-15 08:00', value: 350 },
          { timestamp: '2024-01-15 09:00', value: 380 },
          { timestamp: '2024-01-15 10:00', value: 360 },
          { timestamp: '2024-01-15 11:00', value: 340 },
          { timestamp: '2024-01-15 12:00', value: 320 },
          { timestamp: '2024-01-15 13:00', value: 340 },
          { timestamp: '2024-01-15 14:00', value: 360 },
          { timestamp: '2024-01-15 15:00', value: 340 }
        ],
        responseTime: [
          { timestamp: '2024-01-15 00:00', value: 350 },
          { timestamp: '2024-01-15 01:00', value: 360 },
          { timestamp: '2024-01-15 02:00', value: 340 },
          { timestamp: '2024-01-15 03:00', value: 330 },
          { timestamp: '2024-01-15 04:00', value: 325 },
          { timestamp: '2024-01-15 05:00', value: 335 },
          { timestamp: '2024-01-15 06:00', value: 370 },
          { timestamp: '2024-01-15 07:00', value: 380 },
          { timestamp: '2024-01-15 08:00', value: 390 },
          { timestamp: '2024-01-15 09:00', value: 395 },
          { timestamp: '2024-01-15 10:00', value: 385 },
          { timestamp: '2024-01-15 11:00', value: 375 },
          { timestamp: '2024-01-15 12:00', value: 370 },
          { timestamp: '2024-01-15 13:00', value: 380 },
          { timestamp: '2024-01-15 14:00', value: 390 },
          { timestamp: '2024-01-15 15:00', value: 400 }
        ],
        errorRate: [
          { timestamp: '2024-01-15 00:00', value: 6.8 },
          { timestamp: '2024-01-15 01:00', value: 6.0 },
          { timestamp: '2024-01-15 02:00', value: 5.6 },
          { timestamp: '2024-01-15 03:00', value: 5.0 },
          { timestamp: '2024-01-15 04:00', value: 5.0 },
          { timestamp: '2024-01-15 05:00', value: 5.3 },
          { timestamp: '2024-01-15 06:00', value: 6.4 },
          { timestamp: '2024-01-15 07:00', value: 6.9 },
          { timestamp: '2024-01-15 08:00', value: 7.1 },
          { timestamp: '2024-01-15 09:00', value: 7.4 },
          { timestamp: '2024-01-15 10:00', value: 6.7 },
          { timestamp: '2024-01-15 11:00', value: 5.9 },
          { timestamp: '2024-01-15 12:00', value: 5.6 },
          { timestamp: '2024-01-15 13:00', value: 6.5 },
          { timestamp: '2024-01-15 14:00', value: 7.2 },
          { timestamp: '2024-01-15 15:00', value: 8.8 }
        ],
        throughput: [
          { timestamp: '2024-01-15 00:00', value: 220 },
          { timestamp: '2024-01-15 01:00', value: 200 },
          { timestamp: '2024-01-15 02:00', value: 180 },
          { timestamp: '2024-01-15 03:00', value: 160 },
          { timestamp: '2024-01-15 04:00', value: 140 },
          { timestamp: '2024-01-15 05:00', value: 150 },
          { timestamp: '2024-01-15 06:00', value: 280 },
          { timestamp: '2024-01-15 07:00', value: 320 },
          { timestamp: '2024-01-15 08:00', value: 350 },
          { timestamp: '2024-01-15 09:00', value: 380 },
          { timestamp: '2024-01-15 10:00', value: 360 },
          { timestamp: '2024-01-15 11:00', value: 340 },
          { timestamp: '2024-01-15 12:00', value: 320 },
          { timestamp: '2024-01-15 13:00', value: 340 },
          { timestamp: '2024-01-15 14:00', value: 360 },
          { timestamp: '2024-01-15 15:00', value: 340 }
        ]
      },
      topEndpoints: [
        { endpoint: '/contacts', method: 'GET', requests: 2340, avgResponseTime: 420, errorRate: 8.5, status: 'unhealthy' },
        { endpoint: '/deals', method: 'POST', requests: 3220, avgResponseTime: 350, errorRate: 2.1, status: 'healthy' },
        { endpoint: '/campaigns', method: 'GET', requests: 1220, avgResponseTime: 370, errorRate: 5.0, status: 'degraded' }
      ],
      errors: [
        { type: 'Authentication Error', count: 156, percentage: 2.3, trend: 'up', lastOccurrence: '2024-01-15 15:25:00' },
        { type: 'Rate Limit Error', count: 89, percentage: 1.3, trend: 'up', lastOccurrence: '2024-01-15 15:20:00' },
        { type: 'Service Unavailable', count: 108, percentage: 1.6, trend: 'up', lastOccurrence: '2024-01-15 15:15:00' }
      ],
      performance: {
        p50: 350,
        p95: 650,
        p99: 950,
        max: 1800,
        min: 150,
        avg: 380
      }
    }
  ];

  const businessMetrics: BusinessMetrics[] = [
    {
      id: 'biz-1',
      name: 'Customer Data Sync Rate',
      value: 98.5,
      target: 99.0,
      unit: '%',
      progress: 99.5,
      trend: 'up',
      integration: 'Salesforce CRM'
    },
    {
      id: 'biz-2',
      name: 'Financial Data Accuracy',
      value: 99.2,
      target: 99.5,
      unit: '%',
      progress: 99.7,
      trend: 'stable',
      integration: 'SAP ERP'
    },
    {
      id: 'biz-3',
      name: 'Lead Conversion Rate',
      value: 12.3,
      target: 15.0,
      unit: '%',
      progress: 82.0,
      trend: 'up',
      integration: 'HubSpot Marketing'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
      case 'healthy':
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'warning':
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50';
      case 'critical':
      case 'unhealthy':
      case 'error':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'performance':
        return 'text-blue-600 bg-blue-50';
      case 'usage':
        return 'text-green-600 bg-green-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      case 'business':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <ArrowDown className="w-4 h-4 text-red-600" />;
      case 'stable':
        return <Minus className="w-4 h-4 text-gray-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const selectedIntegrationData = integrationAnalytics.find(i => i.id === selectedIntegration);

  const totalRequests = integrationAnalytics.reduce((acc, i) => acc + i.metrics.requests, 0);
  const avgResponseTime = Math.round(
    integrationAnalytics.reduce((acc, i) => acc + i.metrics.avgResponseTime, 0) / integrationAnalytics.length
  );
  const avgSuccessRate = Math.round(
    integrationAnalytics.reduce((acc, i) => acc + i.metrics.successRate, 0) / integrationAnalytics.length * 10
  ) / 10;
  const avgUptime = Math.round(
    integrationAnalytics.reduce((acc, i) => acc + i.metrics.uptime, 0) / integrationAnalytics.length * 10
  ) / 10;

  const handleExportReport = async () => {
    try {
      const report = {
        integrationAnalytics,
        summary: {
          totalRequests,
          avgResponseTime,
          avgSuccessRate,
          avgUptime,
          generatedAt: new Date().toISOString()
        },
        filters: {
          dateRange: selectedDateRange,
          selectedIntegrations: integrationAnalytics.map(i => i.integration)
        }
      };
      
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `integration-analytics-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Analytics report exported successfully');
    } catch (error) {
      console.error('Failed to export report:', error);
      toast.error('Failed to export report');
    }
  };

  const handleFilterAnalytics = () => {
    toast.info('Filter analytics functionality coming soon!');
    // TODO: Implement advanced filtering modal
  };

  const handleCompareIntegrations = () => {
    toast.info('Compare integrations functionality coming soon!');
    // TODO: Implement integration comparison view
  };

  const handleViewDetails = (integration: string) => {
    const integrationData = integrationAnalytics.find(i => i.integration === integration);
    if (integrationData) {
      setSelectedIntegration(integrationData);
      toast.info(`Viewing details for ${integration}`);
    }
  };

  const handleAnalyticsView = (integration: string) => {
    toast.info(`Opening analytics for ${integration}`);
    // TODO: Implement detailed analytics view
  };

  const handleExportData = async () => {
    try {
      if (selectedIntegrationData) {
        const data = {
          integration: selectedIntegrationData.integration,
          metrics: selectedIntegrationData.metrics,
          trends: selectedIntegrationData.trends,
          exportedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedIntegrationData.integration}-analytics-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success('Integration data exported successfully');
      }
    } catch (error) {
      console.error('Failed to export data:', error);
      toast.error('Failed to export data');
    }
  };

  const handleGenerateReport = () => {
    toast.info('Generate report functionality coming soon!');
    // TODO: Implement comprehensive report generation
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integration Analytics</h1>
          <p className="text-muted-foreground">
            Monitor performance metrics and analytics for all integrations
          </p>
        </div>
        <div className="flex gap-2">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              across all integrations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{avgSuccessRate}%</div>
            <p className="text-xs text-muted-foreground">
              average success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Server className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{avgUptime}%</div>
            <p className="text-xs text-muted-foreground">
              average uptime
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="business">Business Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Key Metrics</h3>
              <p className="text-sm text-muted-foreground">
                Overview of important integration metrics
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search metrics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-md text-sm w-64"
                />
              </div>
              <Button variant="outline" size="sm" onClick={handleFilterAnalytics}>
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyticsMetrics
              .filter(metric => 
                metric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                metric.description.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((metric) => (
              <Card key={metric.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  <Badge className={getCategoryColor(metric.category)}>
                    {metric.category}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metric.value.toLocaleString()}{metric.unit}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {metric.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {getTrendIcon(metric.trend)}
                      <span className={`text-sm ${
                        metric.trend === 'up' ? 'text-green-600' : 
                        metric.trend === 'down' ? 'text-red-600' : 
                        'text-gray-600'
                      }`}>
                        {metric.trendPercentage > 0 ? '+' : ''}{metric.trendPercentage}%
                      </span>
                    </div>
                    <Badge className={getStatusColor(metric.status)}>
                      {metric.status}
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <Progress value={(metric.value / metric.threshold.critical) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Integration Performance</h3>
              <p className="text-sm text-muted-foreground">
                Detailed analytics for each integration
              </p>
            </div>
            <Button variant="outline" onClick={handleCompareIntegrations}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Compare Integrations
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Integration List */}
            <div className="space-y-4">
              {integrationAnalytics.map((integration) => (
                <Card 
                  key={integration.id}
                  className={`cursor-pointer transition-colors ${
                    selectedIntegration === integration.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedIntegration(integration.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getStatusColor(integration.status)}`}>
                          {integration.type === 'api' ? <Globe className="w-4 h-4" /> :
                           integration.type === 'database' ? <Database className="w-4 h-4" /> :
                           <Server className="w-4 h-4" />}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{integration.integration}</CardTitle>
                          <CardDescription>{integration.type} integration</CardDescription>
                        </div>
                      </div>
                      <Badge className={getStatusColor(integration.status)}>
                        {integration.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Requests:</span>
                        <p className="font-medium">{integration.metrics.requests.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Success Rate:</span>
                        <p className="font-medium">{integration.metrics.successRate}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Response Time:</span>
                        <p className="font-medium">{integration.metrics.avgResponseTime}ms</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Throughput:</span>
                        <p className="font-medium">{integration.metrics.throughput}/min</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewDetails(analytics.integration)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleAnalyticsView(analytics.integration)}>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Analytics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Integration Details */}
            <div>
              {selectedIntegrationData ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {selectedIntegrationData.integration} Analytics
                      <Button variant="outline" size="sm" onClick={() => setSelectedIntegration(null)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      Detailed performance metrics and trends
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Performance Metrics</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Avg Response Time:</span>
                            <span className="font-medium">{selectedIntegrationData.metrics.avgResponseTime}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Success Rate:</span>
                            <span className="font-medium">{selectedIntegrationData.metrics.successRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Error Rate:</span>
                            <span className="font-medium text-red-600">{selectedIntegrationData.metrics.errorRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Uptime:</span>
                            <span className="font-medium">{selectedIntegrationData.metrics.uptime}%</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Response Time Distribution</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">P50:</span>
                            <span className="font-medium">{selectedIntegrationData.performance.p50}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">P95:</span>
                            <span className="font-medium">{selectedIntegrationData.performance.p95}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">P99:</span>
                            <span className="font-medium">{selectedIntegrationData.performance.p99}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Max:</span>
                            <span className="font-medium">{selectedIntegrationData.performance.max}ms</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Top Endpoints</h4>
                      <div className="space-y-2">
                        {selectedIntegrationData.topEndpoints.map((endpoint, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <div className="font-medium text-sm">
                                {endpoint.method} {endpoint.endpoint}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {endpoint.requests.toLocaleString()} requests • {endpoint.avgResponseTime}ms avg
                              </div>
                            </div>
                            <Badge className={getStatusColor(endpoint.status)}>
                              {endpoint.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Error Analysis</h4>
                      <div className="space-y-2">
                        {selectedIntegrationData.errors.map((error, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <div className="font-medium text-sm">{error.type}</div>
                              <div className="text-xs text-muted-foreground">
                                {error.count} occurrences ({error.percentage}%) • Last: {error.lastOccurrence}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getTrendIcon(error.trend)}
                              <Badge variant="outline">{error.count}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Charts
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleExportData}>
                        <Download className="w-4 h-4 mr-2" />
                        Export Data
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Select an integration to view detailed analytics
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Performance Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Deep dive into performance metrics and trends
              </p>
            </div>
            <Button variant="outline" onClick={handleGenerateReport}>
              <LineChart className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Response Time Trends</CardTitle>
                <CardDescription>
                  Response time trends over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <LineChart className="w-12 h-12" />
                  <p className="ml-2">Response time trend chart would go here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Throughput Analysis</CardTitle>
                <CardDescription>
                  Request throughput patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <BarChart3 className="w-12 h-12" />
                  <p className="ml-2">Throughput analysis chart would go here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="business" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Business Metrics</h3>
              <p className="text-sm text-muted-foreground">
                Track business impact and KPIs
              </p>
            </div>
            <Button>
              <Target className="w-4 h-4 mr-2" />
              Set Targets
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {businessMetrics.map((metric) => (
              <Card key={metric.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{metric.name}</CardTitle>
                    {getTrendIcon(metric.trend)}
                  </div>
                  <CardDescription>{metric.integration}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">
                        {metric.value}{metric.unit}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Target: {metric.target}{metric.unit}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">
                        {metric.progress}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        of target
                      </div>
                    </div>
                  </div>
                  <Progress value={metric.progress} className="h-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationAnalyticsPage;
