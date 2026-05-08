import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { 
  Database, 
  Download, 
  Upload, 
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Settings,
  Plus,
  Filter,
  Search,
  Eye,
  Trash2,
  Save,
  Play,
  Pause,
  Square,
  Calendar,
  FileArchive,
  Server,
  Shield,
  Zap,
  BarChart3,
  Activity,
  TrendingUp,
  TrendingDown,
  HardDrive,
  Cloud,
  Wifi,
  WifiOff,
  Terminal,
  Code,
  FileText,
  Copy,
  ExternalLink,
  Info,
  Timer
} from 'lucide-react';
import { toast } from 'sonner';
import { integrationApi } from '../../api/integrationApi';

interface BackupJob {
  id: string;
  name: string;
  description: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'running' | 'completed' | 'failed' | 'scheduled' | 'cancelled';
  integration: string;
  schedule: string;
  lastRun: string;
  nextRun: string;
  duration: number;
  size: number;
  compression: boolean;
  encryption: boolean;
  destination: BackupDestination;
  retention: RetentionPolicy;
  progress: BackupProgress;
  configuration: BackupConfiguration;
}

interface BackupDestination {
  type: 'local' | 's3' | 'azure' | 'gcs' | 'ftp';
  path: string;
  credentials?: Record<string, string>;
  settings: DestinationSettings;
}

interface DestinationSettings {
  compressionLevel: number;
  encryptionEnabled: boolean;
  multipartUpload: boolean;
  retryAttempts: number;
}

interface RetentionPolicy {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
  autoDelete: boolean;
}

interface BackupProgress {
  percentage: number;
  currentFile: string;
  filesProcessed: number;
  totalFiles: number;
  bytesTransferred: number;
  totalBytes: number;
  estimatedTimeRemaining: number;
  speed: number;
}

interface BackupConfiguration {
  includeTables: string[];
  excludeTables: string[];
  includeFiles: boolean;
  includeConfig: boolean;
  parallelThreads: number;
  chunkSize: number;
  timeout: number;
}

interface RestoreJob {
  id: string;
  name: string;
  description: string;
  backupId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  integration: string;
  initiatedAt: string;
  completedAt?: string;
  duration?: number;
  type: 'full' | 'partial';
  targetEnvironment: string;
  progress: RestoreProgress;
  validation: ValidationResults;
}

interface RestoreProgress {
  percentage: number;
  currentStep: string;
  stepsCompleted: number;
  totalSteps: number;
  estimatedTimeRemaining: number;
}

interface ValidationResults {
  checksumValid: boolean;
  schemaValid: boolean;
  dataIntegrityValid: boolean;
  warnings: string[];
  errors: string[];
}

interface BackupStorage {
  id: string;
  name: string;
  type: 'local' | 's3' | 'azure' | 'gcs' | 'ftp';
  location: string;
  capacity: number;
  used: number;
  available: number;
  status: 'online' | 'offline' | 'maintenance';
  lastBackup?: string;
  configuration: StorageConfiguration;
}

interface StorageConfiguration {
  encryptionEnabled: boolean;
  compressionEnabled: boolean;
  redundancy: number;
  accessTier: string;
}

const IntegrationBackupPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('backups');
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [backupJobs, setBackupJobs] = useState<BackupJob[]>([]);
  const [loading, setLoading] = useState(false);

  // Load backup jobs from API on component mount
  useEffect(() => {
    const loadBackupJobs = async () => {
      setLoading(true);
      try {
        const jobsData = await integrationApi.getBackupJobs();
        if (jobsData) {
          setBackupJobs(jobsData);
        }
      } catch (error) {
        console.error('Failed to load backup jobs:', error);
        toast.error('Failed to load backup jobs');
      } finally {
        setLoading(false);
      }
    };
    loadBackupJobs();
  }, []);
      integration: 'SAP ERP',
      schedule: '0 * * * *',
      lastRun: '2024-01-15 14:00:00',
      nextRun: '2024-01-15 15:00:00',
      duration: 900000,
      size: 0.8,
      compression: true,
      encryption: true,
      destination: {
        type: 'azure',
        path: 'azure://backup-storage/sap/',
        credentials: { connectionString: '***' },
        settings: {
          compressionLevel: 5,
          encryptionEnabled: true,
          multipartUpload: false,
          retryAttempts: 5
        }
      },
      retention: {
        daily: 24,
        weekly: 7,
        monthly: 3,
        yearly: 1,
        autoDelete: true
      },
      progress: {
        percentage: 65,
        currentFile: 'financial_transactions_2024_01_15.csv',
        filesProcessed: 3250,
        totalFiles: 5000,
        bytesTransferred: 671088640,
        totalBytes: 1030792151,
        estimatedTimeRemaining: 315,
        speed: 2097152
      },
      configuration: {
        includeTables: ['financial_data', 'inventory', 'transactions'],
        excludeTables: ['archive_tables'],
        includeFiles: false,
        includeConfig: false,
        parallelThreads: 2,
        chunkSize: 524288,
        timeout: 1800000
      }
    },
    {
      id: 'backup-3',
      name: 'HubSpot Marketing Weekly Backup',
      description: 'Weekly full backup of HubSpot marketing data and campaigns',
      type: 'full',
      status: 'failed',
      integration: 'HubSpot Marketing',
      schedule: '0 3 * * 0',
      lastRun: '2024-01-14 03:00:00',
      nextRun: '2024-01-21 03:00:00',
      duration: 0,
      size: 0,
      compression: true,
      encryption: false,
      destination: {
        type: 'gcs',
        path: 'gs://marketing-backups/hubspot/',
        credentials: { keyFile: '***' },
        settings: {
          compressionLevel: 4,
          encryptionEnabled: false,
          multipartUpload: true,
          retryAttempts: 2
        }
      },
      retention: {
        daily: 0,
        weekly: 8,
        monthly: 6,
        yearly: 2,
        autoDelete: true
      },
      progress: {
        percentage: 0,
        currentFile: 'Failed',
        filesProcessed: 0,
        totalFiles: 0,
        bytesTransferred: 0,
        totalBytes: 0,
        estimatedTimeRemaining: 0,
        speed: 0
      },
      configuration: {
        includeTables: ['contacts', 'campaigns', 'deals', 'companies'],
        excludeTables: [],
        includeFiles: true,
        includeConfig: true,
        parallelThreads: 3,
        chunkSize: 2097152,
        timeout: 2400000
      }
    }
  ];

  const restoreJobs: RestoreJob[] = [
    {
      id: 'restore-1',
      name: 'Salesforce CRM Restore - Jan 10',
      description: 'Restore Salesforce CRM data from January 10th backup',
      backupId: 'backup-1-2024-01-10',
      status: 'completed',
      integration: 'Salesforce CRM',
      initiatedAt: '2024-01-15 10:00:00',
      completedAt: '2024-01-15 11:30:00',
      duration: 5400000,
      type: 'full',
      targetEnvironment: 'staging',
      progress: {
        percentage: 100,
        currentStep: 'Validation Complete',
        stepsCompleted: 5,
        totalSteps: 5,
        estimatedTimeRemaining: 0
      },
      validation: {
        checksumValid: true,
        schemaValid: true,
        dataIntegrityValid: true,
        warnings: ['Some custom fields were skipped due to schema differences'],
        errors: []
      }
    },
    {
      id: 'restore-2',
      name: 'SAP ERP Partial Restore',
      description: 'Restore specific financial data from backup',
      backupId: 'backup-2-2024-01-14-14',
      status: 'running',
      integration: 'SAP ERP',
      initiatedAt: '2024-01-15 13:00:00',
      type: 'partial',
      targetEnvironment: 'development',
      progress: {
        percentage: 45,
        currentStep: 'Data Validation',
        stepsCompleted: 2,
        totalSteps: 4,
        estimatedTimeRemaining: 1200
      },
      validation: {
        checksumValid: false,
        schemaValid: true,
        dataIntegrityValid: false,
        warnings: [],
        errors: ['Checksum mismatch for financial_transactions table']
      }
    }
  ];

  const backupStorage: BackupStorage[] = [
    {
      id: 'storage-1',
      name: 'AWS S3 Primary',
      type: 's3',
      location: 'us-east-1',
      capacity: 1000,
      used: 650,
      available: 350,
      status: 'online',
      lastBackup: '2024-01-15 14:30:00',
      configuration: {
        encryptionEnabled: true,
        compressionEnabled: true,
        redundancy: 3,
        accessTier: 'standard'
      }
    },
    {
      id: 'storage-2',
      name: 'Azure Backup Storage',
      type: 'azure',
      location: 'East US',
      capacity: 500,
      used: 280,
      available: 220,
      status: 'online',
      lastBackup: '2024-01-15 14:00:00',
      configuration: {
        encryptionEnabled: true,
        compressionEnabled: true,
        redundancy: 3,
        accessTier: 'hot'
      }
    },
    {
      id: 'storage-3',
      name: 'Local NAS Storage',
      type: 'local',
      location: 'datacenter-1',
      capacity: 200,
      used: 180,
      available: 20,
      status: 'maintenance',
      lastBackup: '2024-01-15 12:00:00',
      configuration: {
        encryptionEnabled: false,
        compressionEnabled: true,
        redundancy: 2,
        accessTier: 'standard'
      }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'online':
        return 'text-green-600 bg-green-50';
      case 'running':
      case 'pending':
        return 'text-blue-600 bg-blue-50';
      case 'failed':
      case 'offline':
        return 'text-red-600 bg-red-50';
      case 'scheduled':
        return 'text-yellow-600 bg-yellow-50';
      case 'cancelled':
      case 'maintenance':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full':
        return 'text-purple-600 bg-purple-50';
      case 'incremental':
        return 'text-blue-600 bg-blue-50';
      case 'differential':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getDestinationIcon = (type: string) => {
    switch (type) {
      case 's3':
        return <Cloud className="w-4 h-4" />;
      case 'azure':
        return <Cloud className="w-4 h-4" />;
      case 'gcs':
        return <Cloud className="w-4 h-4" />;
      case 'ftp':
        return <Server className="w-4 h-4" />;
      case 'local':
        return <HardDrive className="w-4 h-4" />;
      default:
        return <Database className="w-4 h-4" />;
    }
  };

  const filteredBackups = backupJobs.filter(backup => {
    const matchesSearch = backup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         backup.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || backup.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const selectedBackupData = backupJobs.find(b => b.id === selectedBackup);

  const totalBackups = backupJobs.length;
  const runningBackups = backupJobs.filter(b => b.status === 'running').length;
  const failedBackups = backupJobs.filter(b => b.status === 'failed').length;
  const totalStorageUsed = backupStorage.reduce((acc, s) => acc + s.used, 0);
  const totalStorageCapacity = backupStorage.reduce((acc, s) => acc + s.capacity, 0);

  const handleBackupSettings = () => {
    toast.info('Backup settings functionality coming soon!');
    // TODO: Implement backup settings modal
  };

  const handleViewDetails = (backupId: string) => {
    setSelectedBackup(backupId);
    toast.info(`Viewing details for backup ${backupId}`);
  };

  const handleStopBackup = (backupId: string) => {
    toast.info(`Stopping backup ${backupId}`);
    // TODO: Implement backup stop functionality
  };

  const handleRunBackup = (configId: string) => {
    toast.info(`Running backup for configuration ${configId}`);
    // TODO: Implement backup execution
  };

  const handleEditConfiguration = (configId: string) => {
    toast.info(`Editing configuration ${configId}`);
    // TODO: Implement configuration editing
  };

  const handleDownloadLogs = async (configId: string) => {
    try {
      const logs = {
        configId,
        logs: 'Backup logs would be here...',
        downloadedAt: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-logs-${configId}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Backup logs downloaded successfully');
    } catch (error) {
      console.error('Failed to download logs:', error);
      toast.error('Failed to download logs');
    }
  };

  const handleViewRestore = (restoreId: string) => {
    toast.info(`Viewing restore details ${restoreId}`);
    // TODO: Implement restore details view
  };

  const handleConfigure = (configId: string) => {
    toast.info(`Configuring backup ${configId}`);
    // TODO: Implement configuration interface
  };

  const handleEditSchedule = (scheduleId: string) => {
    toast.info(`Editing schedule ${scheduleId}`);
    // TODO: Implement schedule editing
  };

  const handleRunSchedule = (scheduleId: string) => {
    toast.info(`Running schedule ${scheduleId}`);
    // TODO: Implement schedule execution
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integration Backup & Restore</h1>
          <p className="text-muted-foreground">
            Manage backup and restore operations for all integrations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBackupSettings}>
            <Settings className="w-4 h-4 mr-2" />
            Backup Settings
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Backup Job
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBackups}</div>
            <p className="text-xs text-muted-foreground">
              {runningBackups} running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Backups</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{failedBackups}</div>
            <p className="text-xs text-muted-foreground">
              need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalStorageUsed}GB</div>
            <p className="text-xs text-muted-foreground">
              of {totalStorageCapacity}GB total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2h ago</div>
            <p className="text-xs text-muted-foreground">
              Salesforce CRM
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Failed Backup Alert */}
      {failedBackups > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{failedBackups} backup(s)</strong> have failed. 
            Review the failed jobs and resolve issues to ensure data protection.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="backups">Backup Jobs</TabsTrigger>
          <TabsTrigger value="restores">Restore Jobs</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="backups" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Backup Jobs</h3>
              <p className="text-sm text-muted-foreground">
                Monitor and manage backup operations
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search backups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-md text-sm w-64"
                />
              </div>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="running">Running</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Backups List */}
            <div className="space-y-4">
              {filteredBackups.map((backup) => (
                <Card 
                  key={backup.id}
                  className={`cursor-pointer transition-colors ${
                    selectedBackup === backup.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedBackup(backup.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getStatusColor(backup.status)}`}>
                          {backup.status === 'running' ? <Activity className="w-4 h-4" /> :
                           backup.status === 'completed' ? <CheckCircle className="w-4 h-4" /> :
                           backup.status === 'failed' ? <XCircle className="w-4 h-4" /> :
                           <Clock className="w-4 h-4" />}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{backup.name}</CardTitle>
                          <CardDescription>{backup.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeColor(backup.type)}>
                          {backup.type}
                        </Badge>
                        <Badge className={getStatusColor(backup.status)}>
                          {backup.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Integration:</span>
                      <Badge variant="outline">{backup.integration}</Badge>
                      <span className="text-muted-foreground">Destination:</span>
                      <div className="flex items-center gap-1">
                        {getDestinationIcon(backup.destination.type)}
                        <span className="text-xs">{backup.destination.type.toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Size:</span>
                        <p className="font-medium">{backup.size} GB</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <p className="font-medium">{Math.round(backup.duration / 60000)}m</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Run:</span>
                        <p className="font-medium">{backup.lastRun}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Next Run:</span>
                        <p className="font-medium">{backup.nextRun}</p>
                      </div>
                    </div>

                    {backup.status === 'running' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{backup.progress.percentage}%</span>
                        </div>
                        <Progress value={backup.progress.percentage} className="h-2" />
                        <div className="text-xs text-muted-foreground">
                          {backup.progress.currentFile} • {backup.progress.filesProcessed}/{backup.progress.totalFiles} files
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewDetails(backup.id)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      {backup.status === 'running' ? (
                        <Button size="sm" variant="outline" onClick={() => handleStopBackup(backup.id)}>
                          <Square className="w-4 h-4 mr-2" />
                          Stop
                        </Button>
                      ) : (
                        <Button size="sm">
                          <Play className="w-4 h-4 mr-2" />
                          Run Now
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Backup Details */}
            <div>
              {selectedBackupData ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {selectedBackupData.name}
                      <Button variant="outline" size="sm" onClick={() => setSelectedBackup(null)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                    </CardTitle>
                    <CardDescription>{selectedBackupData.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Backup Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <Badge className={getTypeColor(selectedBackupData.type)}>
                              {selectedBackupData.type}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge className={getStatusColor(selectedBackupData.status)}>
                              {selectedBackupData.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Schedule:</span>
                            <span className="font-medium">{selectedBackupData.schedule}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Integration:</span>
                            <span className="font-medium">{selectedBackupData.integration}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Storage Settings</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Destination:</span>
                            <span className="font-medium">{selectedBackupData.destination.type.toUpperCase()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Path:</span>
                            <span className="font-medium text-xs">{selectedBackupData.destination.path}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Compression:</span>
                            <Badge className={selectedBackupData.compression ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'}>
                              {selectedBackupData.compression ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Encryption:</span>
                            <Badge className={selectedBackupData.encryption ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'}>
                              {selectedBackupData.encryption ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Retention Policy</h4>
                      <div className="bg-muted p-3 rounded text-sm">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-muted-foreground">Daily:</span>
                            <span className="ml-2 font-medium">{selectedBackupData.retention.daily} backups</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Weekly:</span>
                            <span className="ml-2 font-medium">{selectedBackupData.retention.weekly} backups</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Monthly:</span>
                            <span className="ml-2 font-medium">{selectedBackupData.retention.monthly} backups</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Yearly:</span>
                            <span className="ml-2 font-medium">{selectedBackupData.retention.yearly} backups</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="text-muted-foreground">Auto Delete:</span>
                          <Badge className={`ml-2 ${selectedBackupData.retention.autoDelete ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'}`}>
                            {selectedBackupData.retention.autoDelete ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Configuration</h4>
                      <div className="bg-muted p-3 rounded text-sm">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-muted-foreground">Parallel Threads:</span>
                            <span className="ml-2 font-medium">{selectedBackupData.configuration.parallelThreads}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Chunk Size:</span>
                            <span className="ml-2 font-medium">{(selectedBackupData.configuration.chunkSize / 1024 / 1024).toFixed(1)} MB</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Include Files:</span>
                            <Badge className={`ml-2 ${selectedBackupData.configuration.includeFiles ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'}`}>
                              {selectedBackupData.configuration.includeFiles ? 'Yes' : 'No'}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Include Config:</span>
                            <Badge className={`ml-2 ${selectedBackupData.configuration.includeConfig ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'}`}>
                              {selectedBackupData.configuration.includeConfig ? 'Yes' : 'No'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleRunBackup(config.id)}>
                        <Play className="w-4 h-4 mr-2" />
                        Run Backup
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEditConfiguration(config.id)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Configuration
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDownloadLogs(config.id)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download Logs
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Select a backup job to view details
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="restores" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Restore Jobs</h3>
              <p className="text-sm text-muted-foreground">
                Monitor and manage data restore operations
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Restore Job
            </Button>
          </div>

          <div className="space-y-4">
            {restoreJobs.map((restore) => (
              <Card key={restore.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${getStatusColor(restore.status)}`}>
                        {restore.status === 'running' ? <Activity className="w-4 h-4" /> :
                         restore.status === 'completed' ? <CheckCircle className="w-4 h-4" /> :
                         restore.status === 'failed' ? <XCircle className="w-4 h-4" /> :
                         <Clock className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-medium">{restore.name}</div>
                        <div className="text-sm text-muted-foreground">{restore.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(restore.status)}>
                        {restore.status}
                      </Badge>
                      <Badge variant="outline">{restore.type}</Badge>
                      <Button size="sm" variant="outline" onClick={() => handleViewRestore(restore.id)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {restore.status === 'running' && (
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{restore.progress.percentage}%</span>
                      </div>
                      <Progress value={restore.progress.percentage} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {restore.progress.currentStep} • Step {restore.progress.stepsCompleted}/{restore.progress.totalSteps}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Integration:</span>
                      <p className="font-medium">{restore.integration}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Target:</span>
                      <p className="font-medium">{restore.targetEnvironment}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Started:</span>
                      <p className="font-medium">{restore.initiatedAt}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <p className="font-medium">{restore.duration ? Math.round(restore.duration / 60000) + 'm' : 'N/A'}</p>
                    </div>
                  </div>

                  {restore.validation.errors.length > 0 && (
                    <div className="mt-4 p-3 bg-red-50 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="font-medium text-sm text-red-800">Validation Issues</span>
                      </div>
                      <div className="text-sm text-red-800">
                        {restore.validation.errors.map((error, index) => (
                          <div key={index}>• {error}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Backup Storage</h3>
              <p className="text-sm text-muted-foreground">
                Monitor storage usage and manage backup destinations
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Storage
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {backupStorage.map((storage) => (
              <Card key={storage.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{storage.name}</CardTitle>
                    <Badge className={getStatusColor(storage.status)}>
                      {storage.status}
                    </Badge>
                  </div>
                  <CardDescription>{storage.type.toUpperCase()} • {storage.location}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Storage Usage</span>
                      <span>{storage.used}GB / {storage.capacity}GB</span>
                    </div>
                    <Progress value={(storage.used / storage.capacity) * 100} className="h-2" />
                    <div className="text-xs text-muted-foreground mt-1">
                      {storage.available}GB available
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Encryption:</span>
                      <Badge className={`ml-1 ${storage.configuration.encryptionEnabled ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'}`}>
                        {storage.configuration.encryptionEnabled ? 'On' : 'Off'}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Redundancy:</span>
                      <span className="ml-1 font-medium">{storage.configuration.redundancy}x</span>
                    </div>
                  </div>

                  {storage.lastBackup && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Last Backup:</span>
                      <p className="font-medium">{storage.lastBackup}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleViewDetails(schedule.id)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleConfigure(schedule.id)}>
                      <Settings className="w-4 h-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Backup Schedule</h3>
              <p className="text-sm text-muted-foreground">
                Configure automated backup schedules
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Schedule
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted">
                    <tr>
                      <th className="text-left p-4 font-medium">Job Name</th>
                      <th className="text-left p-4 font-medium">Integration</th>
                      <th className="text-left p-4 font-medium">Schedule</th>
                      <th className="text-left p-4 font-medium">Type</th>
                      <th className="text-left p-4 font-medium">Next Run</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backupJobs.map((backup) => (
                      <tr key={backup.id} className="border-b hover:bg-muted">
                        <td className="p-4">
                          <div className="font-medium">{backup.name}</div>
                          <div className="text-sm text-muted-foreground">{backup.description}</div>
                        </td>
                        <td className="p-4">{backup.integration}</td>
                        <td className="p-4 font-mono text-sm">{backup.schedule}</td>
                        <td className="p-4">
                          <Badge className={getTypeColor(backup.type)}>
                            {backup.type}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm">{backup.nextRun}</td>
                        <td className="p-4">
                          <Badge className={getStatusColor(backup.status)}>
                            {backup.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditSchedule(schedule.id)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleRunSchedule(schedule.id)}>
                              <Play className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationBackupPage;
