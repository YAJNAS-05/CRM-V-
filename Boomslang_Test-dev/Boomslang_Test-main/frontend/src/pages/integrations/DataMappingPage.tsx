import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { 
  ArrowRightLeft, 
  Database, 
  Code, 
  FileText, 
  Activity,
  CheckCircle,
  AlertTriangle,
  Eye,
  Download,
  Plus,
  Filter,
  Search,
  Settings,
  RefreshCw,
  Zap,
  Key,
  Shield,
  BarChart3,
  Play,
  Pause,
  Square,
  ArrowRight,
  ArrowLeft,
  GitBranch,
  Layers,
  Map,
  Copy,
  Edit,
  Trash2,
  Save
} from 'lucide-react';
import { toast } from 'sonner';
import { integrationApi } from '../../api/integrationApi';

interface DataMapping {
  id: string;
  name: string;
  description: string;
  sourceSystem: string;
  targetSystem: string;
  sourceFormat: 'json' | 'xml' | 'csv' | 'database' | 'api';
  targetFormat: 'json' | 'xml' | 'csv' | 'database' | 'api';
  status: 'active' | 'inactive' | 'error' | 'testing';
  priority: 'low' | 'medium' | 'high' | 'critical';
  lastSync: string;
  syncFrequency: 'real-time' | 'hourly' | 'daily' | 'weekly' | 'manual';
  fieldMappings: FieldMapping[];
  transformations: DataTransformation[];
  validation: ValidationRule[];
  performance: MappingPerformance;
  configuration: MappingConfig;
}

interface FieldMapping {
  id: string;
  sourceField: string;
  targetField: string;
  dataType: 'string' | 'number' | 'date' | 'boolean' | 'object' | 'array';
  required: boolean;
  transformation?: string;
  defaultValue?: string;
  description: string;
  status: 'mapped' | 'unmapped' | 'error' | 'warning';
}

interface DataTransformation {
  id: string;
  name: string;
  type: 'format' | 'calculate' | 'lookup' | 'conditional' | 'custom';
  description: string;
  inputFields: string[];
  outputField: string;
  logic: string;
  status: 'active' | 'inactive' | 'error';
  testResults?: TestResult[];
}

interface ValidationRule {
  id: string;
  name: string;
  type: 'required' | 'format' | 'range' | 'custom' | 'business';
  field: string;
  condition: string;
  errorMessage: string;
  severity: 'error' | 'warning' | 'info';
  status: 'active' | 'inactive';
}

interface MappingPerformance {
  recordsProcessed: number;
  successRate: number;
  errorRate: number;
  avgProcessingTime: number;
  last24h: {
    records: number;
    success: number;
    errors: number;
    avgTime: number;
  };
}

interface MappingConfig {
  batchSize: number;
  timeout: number;
  retryAttempts: number;
  parallelProcessing: boolean;
  errorHandling: 'stop' | 'continue' | 'retry';
  logging: boolean;
  monitoring: boolean;
}

interface TestResult {
  id: string;
  input: any;
  expected: any;
  actual: any;
  status: 'pass' | 'fail';
  timestamp: string;
}

const DataMappingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('mappings');
  const [selectedMapping, setSelectedMapping] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dataMappings, setDataMappings] = useState<DataMapping[]>([]);
  const [loading, setLoading] = useState(false);

  // Load data mappings from API on component mount
  useEffect(() => {
    const loadDataMappings = async () => {
      setLoading(true);
      try {
        const mappingsData = await integrationApi.getDataMappings();
        if (mappingsData) {
          setDataMappings(mappingsData);
      fieldMappings: [
        { id: 'fm-1', sourceField: 'sf_account_id', targetField: 'account_id', dataType: 'string', required: true, description: 'Account identifier', status: 'mapped' },
        { id: 'fm-2', sourceField: 'sf_account_name', targetField: 'account_name', dataType: 'string', required: true, description: 'Account name', status: 'mapped' },
        { id: 'fm-3', sourceField: 'sf_billing_address', targetField: 'billing_address', dataType: 'object', required: false, transformation: 'address_format', description: 'Billing address', status: 'mapped' },
        { id: 'fm-4', sourceField: 'sf_annual_revenue', targetField: 'annual_revenue', dataType: 'number', required: false, transformation: 'currency_convert', description: 'Annual revenue', status: 'mapped' },
        { id: 'fm-5', sourceField: 'sf_created_date', targetField: 'created_at', dataType: 'date', required: true, transformation: 'date_format', description: 'Creation date', status: 'mapped' }
      ],
      transformations: [
        { id: 'tf-1', name: 'Address Format', type: 'format', description: 'Format address to standard format', inputFields: ['sf_billing_address'], outputField: 'billing_address', logic: 'format_address(input)', status: 'active' },
        { id: 'tf-2', name: 'Currency Convert', type: 'calculate', description: 'Convert currency to USD', inputFields: ['sf_annual_revenue'], outputField: 'annual_revenue', logic: 'convert_to_usd(input)', status: 'active' },
        { id: 'tf-3', name: 'Date Format', type: 'format', description: 'Convert date format to ISO', inputFields: ['sf_created_date'], outputField: 'created_at', logic: 'format_date_iso(input)', status: 'active' }
      ],
      validation: [
        { id: 'vr-1', name: 'Required Account ID', type: 'required', field: 'sf_account_id', condition: 'not_null', errorMessage: 'Account ID is required', severity: 'error', status: 'active' },
        { id: 'vr-2', name: 'Valid Email Format', type: 'format', field: 'sf_email', condition: 'email_format', errorMessage: 'Invalid email format', severity: 'error', status: 'active' },
        { id: 'vr-3', name: 'Revenue Range', type: 'range', field: 'sf_annual_revenue', condition: '>= 0', errorMessage: 'Revenue must be positive', severity: 'warning', status: 'active' }
      ],
      performance: {
        recordsProcessed: 45678,
        successRate: 99.2,
        errorRate: 0.8,
        avgProcessingTime: 125,
        last24h: {
          records: 3420,
          success: 3393,
          errors: 27,
          avgTime: 118
        }
      },
      configuration: {
        batchSize: 100,
        timeout: 30000,
        retryAttempts: 3,
        parallelProcessing: true,
        errorHandling: 'continue',
        logging: true,
        monitoring: true
      }
    },
    {
      id: 'mapping-2',
      name: 'ERP to Finance System',
      description: 'Map financial data from ERP to finance system',
      sourceSystem: 'SAP ERP',
      targetSystem: 'QuickBooks',
      sourceFormat: 'database',
      targetFormat: 'api',
      status: 'active',
      priority: 'critical',
      lastSync: '2024-01-15 14:45:00',
      syncFrequency: 'hourly',
      fieldMappings: [
        { id: 'fm-6', sourceField: 'gl_account', targetField: 'account_number', dataType: 'string', required: true, description: 'GL account number', status: 'mapped' },
        { id: 'fm-7', sourceField: 'cost_center', targetField: 'department', dataType: 'string', required: true, description: 'Cost center', status: 'mapped' },
        { id: 'fm-8', sourceField: 'transaction_amount', targetField: 'amount', dataType: 'number', required: true, transformation: 'currency_standardize', description: 'Transaction amount', status: 'mapped' },
        { id: 'fm-9', sourceField: 'posting_date', targetField: 'transaction_date', dataType: 'date', required: true, transformation: 'date_validate', description: 'Posting date', status: 'mapped' },
        { id: 'fm-10', sourceField: 'vendor_id', targetField: 'vendor_ref', dataType: 'string', required: false, description: 'Vendor reference', status: 'unmapped' }
      ],
      transformations: [
        { id: 'tf-4', name: 'Currency Standardize', type: 'format', description: 'Standardize currency format', inputFields: ['transaction_amount'], outputField: 'amount', logic: 'standardize_currency(input)', status: 'active' },
        { id: 'tf-5', name: 'Date Validate', type: 'conditional', description: 'Validate and format dates', inputFields: ['posting_date'], outputField: 'transaction_date', logic: 'validate_date(input)', status: 'active' }
      ],
      validation: [
        { id: 'vr-4', name: 'GL Account Required', type: 'required', field: 'gl_account', condition: 'not_null', errorMessage: 'GL account is required', severity: 'error', status: 'active' },
        { id: 'vr-5', name: 'Valid Amount', type: 'range', field: 'transaction_amount', condition: '!= 0', errorMessage: 'Amount cannot be zero', severity: 'error', status: 'active' },
        { id: 'vr-6', name: 'Date Not Future', type: 'business', field: 'posting_date', condition: '<= today', errorMessage: 'Posting date cannot be in future', severity: 'error', status: 'active' }
      ],
      performance: {
        recordsProcessed: 23456,
        successRate: 98.7,
        errorRate: 1.3,
        avgProcessingTime: 180,
        last24h: {
          records: 1890,
          success: 1865,
          errors: 25,
          avgTime: 175
        }
      },
      configuration: {
        batchSize: 50,
        timeout: 60000,
        retryAttempts: 5,
        parallelProcessing: false,
        errorHandling: 'retry',
        logging: true,
        monitoring: true
      }
    },
    {
      id: 'mapping-3',
      name: 'Marketing Lead Import',
      description: 'Import and map marketing leads from various sources',
      sourceSystem: 'HubSpot',
      targetSystem: 'CRM',
      sourceFormat: 'api',
      targetFormat: 'database',
      status: 'error',
      priority: 'medium',
      lastSync: '2024-01-15 12:00:00',
      syncFrequency: 'daily',
      fieldMappings: [
        { id: 'fm-11', sourceField: 'hubspot_vid', targetField: 'lead_id', dataType: 'string', required: true, description: 'Lead identifier', status: 'mapped' },
        { id: 'fm-12', sourceField: 'email', targetField: 'email_address', dataType: 'string', required: true, description: 'Email address', status: 'mapped' },
        { id: 'fm-13', sourceField: 'firstname', targetField: 'first_name', dataType: 'string', required: false, description: 'First name', status: 'mapped' },
        { id: 'fm-14', sourceField: 'lastname', targetField: 'last_name', dataType: 'string', required: false, description: 'Last name', status: 'mapped' },
        { id: 'fm-15', sourceField: 'lifecyclestage', targetField: 'lead_status', dataType: 'string', required: false, transformation: 'status_map', description: 'Lead status', status: 'error' }
      ],
      transformations: [
        { id: 'tf-6', name: 'Status Map', type: 'lookup', description: 'Map lifecycle stages to lead status', inputFields: ['lifecyclestage'], outputField: 'lead_status', logic: 'lookup_status(input)', status: 'error' }
      ],
      validation: [
        { id: 'vr-7', name: 'Email Required', type: 'required', field: 'email', condition: 'not_null', errorMessage: 'Email is required', severity: 'error', status: 'active' },
        { id: 'vr-8', name: 'Unique Email', type: 'custom', field: 'email', condition: 'unique_in_system', errorMessage: 'Email already exists', severity: 'error', status: 'active' }
      ],
      performance: {
        recordsProcessed: 12345,
        successRate: 95.3,
        errorRate: 4.7,
        avgProcessingTime: 95,
        last24h: {
          records: 890,
          success: 848,
          errors: 42,
          avgTime: 98
        }
      },
      configuration: {
        batchSize: 200,
        timeout: 45000,
        retryAttempts: 2,
        parallelProcessing: true,
        errorHandling: 'continue',
        logging: true,
        monitoring: true
      }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'inactive':
        return 'text-gray-600 bg-gray-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      case 'testing':
        return 'text-blue-600 bg-blue-50';
      case 'mapped':
        return 'text-green-600 bg-green-50';
      case 'unmapped':
        return 'text-yellow-600 bg-yellow-50';
      case 'warning':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getDataTypeColor = (dataType: string) => {
    switch (dataType) {
      case 'string':
        return 'text-blue-600 bg-blue-50';
      case 'number':
        return 'text-green-600 bg-green-50';
      case 'date':
        return 'text-purple-600 bg-purple-50';
      case 'boolean':
        return 'text-orange-600 bg-orange-50';
      case 'object':
        return 'text-indigo-600 bg-indigo-50';
      case 'array':
        return 'text-pink-600 bg-pink-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredMappings = dataMappings.filter(mapping =>
    mapping.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mapping.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedMappingData = dataMappings.find(m => m.id === selectedMapping);

  const totalMappings = dataMappings.length;
  const activeMappings = dataMappings.filter(m => m.status === 'active').length;
  const errorMappings = dataMappings.filter(m => m.status === 'error').length;
  const totalFields = dataMappings.reduce((acc, m) => acc + m.fieldMappings.length, 0);
  const mappedFields = dataMappings.reduce((acc, m) => acc + m.fieldMappings.filter(f => f.status === 'mapped').length, 0);

  const handleExportMapping = async () => {
    try {
      const mapping = {
        dataMappings: dataMappings,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };
      
      const blob = new Blob([JSON.stringify(mapping, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `data-mapping-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Data mapping exported successfully');
    } catch (error) {
      console.error('Failed to export data mapping:', error);
      toast.error('Failed to export data mapping');
    }
  };

  const handleViewMapping = (mappingId: string) => {
    toast.info(`Viewing mapping ${mappingId} details`);
    // TODO: Implement detailed mapping view modal or navigation
  };

  const handleTestMapping = async (mappingId: string) => {
    try {
      toast.loading(`Testing mapping ${mappingId}...`);
      // Simulate mapping test
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`Mapping ${mappingId} test completed successfully`);
    } catch (error) {
      console.error('Failed to test mapping:', error);
      toast.error('Failed to test mapping');
    }
  };

  const handleEditMapping = (mappingId: string) => {
    toast.info(`Editing mapping ${mappingId}`);
    // TODO: Implement mapping edit form or modal
  };

  const handleClearSelection = () => {
    setSelectedMapping(null);
    toast.info('Selection cleared');
  };

  const handleTestSelectedMapping = async () => {
    if (selectedMapping) {
      await handleTestMapping(selectedMapping);
    }
  };

  const handleDuplicateMapping = (mappingId: string) => {
    toast.info(`Duplicating mapping ${mappingId}`);
    // TODO: Implement mapping duplication functionality
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Mapping</h1>
          <p className="text-muted-foreground">
            Configure and manage data field mappings between systems
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportMapping}>
            <Download className="w-4 h-4 mr-2" />
            Export Mapping
          </Button>
          <Button onClick={() => toast.info('New Mapping form coming soon!')}>
            <Plus className="w-4 h-4 mr-2" />
            New Mapping
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mappings</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMappings}</div>
            <p className="text-xs text-muted-foreground">
              data mappings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeMappings}</div>
            <p className="text-xs text-muted-foreground">
              running mappings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Field Coverage</CardTitle>
            <Layers className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{mappedFields}/{totalFields}</div>
            <p className="text-xs text-muted-foreground">
              fields mapped
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{errorMappings}</div>
            <p className="text-xs text-muted-foreground">
              need attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {errorMappings > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{errorMappings} mappings</strong> are experiencing errors. 
            Review field mappings and transformations to resolve issues.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="mappings">Mappings</TabsTrigger>
          <TabsTrigger value="fields">Field Mapping</TabsTrigger>
          <TabsTrigger value="transformations">Transformations</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
        </TabsList>

        <TabsContent value="mappings" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Data Mappings</h3>
              <p className="text-sm text-muted-foreground">
                Manage data mapping configurations between systems
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search mappings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-md text-sm w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mappings List */}
            <div className="space-y-4">
              {filteredMappings.map((mapping) => (
                <Card 
                  key={mapping.id}
                  className={`cursor-pointer transition-colors ${
                    selectedMapping === mapping.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedMapping(mapping.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getStatusColor(mapping.status)}`}>
                          <ArrowRightLeft className="w-4 h-4" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{mapping.name}</CardTitle>
                          <CardDescription>{mapping.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(mapping.priority)}>
                          {mapping.priority}
                        </Badge>
                        <Badge className={getStatusColor(mapping.status)}>
                          {mapping.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Source:</span>
                      <Badge variant="outline">{mapping.sourceSystem}</Badge>
                      <ArrowRight className="w-3 h-3" />
                      <span className="text-muted-foreground">Target:</span>
                      <Badge variant="outline">{mapping.targetSystem}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Fields:</span>
                        <p className="font-medium">
                          {mapping.fieldMappings.filter(f => f.status === 'mapped').length}/{mapping.fieldMappings.length}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Success Rate:</span>
                        <p className="font-medium">{mapping.performance.successRate}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Records:</span>
                        <p className="font-medium">{mapping.performance.recordsProcessed.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg Time:</span>
                        <p className="font-medium">{mapping.performance.avgProcessingTime}ms</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewMapping(mapping.id)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleTestMapping(mapping.id)}>
                        <Play className="w-4 h-4 mr-2" />
                        Test
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEditMapping(mapping.id)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Mapping Details */}
            <div>
              {selectedMappingData ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {selectedMappingData.name}
                      <Button variant="outline" size="sm" onClick={handleClearSelection}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                    </CardTitle>
                    <CardDescription>{selectedMappingData.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">System Mapping</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Source:</span>
                            <Badge variant="outline">{selectedMappingData.sourceSystem}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Target:</span>
                            <Badge variant="outline">{selectedMappingData.targetSystem}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Priority:</span>
                            <Badge className={getPriorityColor(selectedMappingData.priority)}>
                              {selectedMappingData.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge className={getStatusColor(selectedMappingData.status)}>
                              {selectedMappingData.status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Performance</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Success Rate:</span>
                            <span className="font-medium">{selectedMappingData.performance.successRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Error Rate:</span>
                            <span className="font-medium text-red-600">{selectedMappingData.performance.errorRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Records Processed:</span>
                            <span className="font-medium">{selectedMappingData.performance.recordsProcessed.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Avg Processing Time:</span>
                            <span className="font-medium">{selectedMappingData.performance.avgProcessingTime}ms</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Field Mapping Summary</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-medium text-green-600">
                            {selectedMappingData.fieldMappings.filter(f => f.status === 'mapped').length}
                          </div>
                          <div className="text-muted-foreground">Mapped</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-yellow-600">
                            {selectedMappingData.fieldMappings.filter(f => f.status === 'unmapped').length}
                          </div>
                          <div className="text-muted-foreground">Unmapped</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-red-600">
                            {selectedMappingData.fieldMappings.filter(f => f.status === 'error').length}
                          </div>
                          <div className="text-muted-foreground">Errors</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Configuration</h4>
                      <div className="bg-muted p-3 rounded text-sm">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-muted-foreground">Batch Size:</span>
                            <span className="ml-2 font-medium">{selectedMappingData.configuration.batchSize}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Timeout:</span>
                            <span className="ml-2 font-medium">{selectedMappingData.configuration.timeout}ms</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Retry Attempts:</span>
                            <span className="ml-2 font-medium">{selectedMappingData.configuration.retryAttempts}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Parallel Processing:</span>
                            <span className="ml-2 font-medium">{selectedMappingData.configuration.parallelProcessing ? 'Enabled' : 'Disabled'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleTestSelectedMapping}>
                        <Play className="w-4 h-4 mr-2" />
                        Test Mapping
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => selectedMappingData && handleEditMapping(selectedMappingData.id)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Mapping
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => selectedMappingData && handleDuplicateMapping(selectedMappingData.id)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <ArrowRightLeft className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Select a mapping to view details
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="fields" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Field Mapping Details</h3>
              <p className="text-sm text-muted-foreground">
                Configure field mappings and transformations
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Field Mapping
            </Button>
          </div>

          {selectedMappingData && (
            <Card>
              <CardHeader>
                <CardTitle>{selectedMappingData.name} - Field Mappings</CardTitle>
                <CardDescription>
                  Configure how fields are mapped from {selectedMappingData.sourceSystem} to {selectedMappingData.targetSystem}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedMappingData.fieldMappings.map((field) => (
                    <div key={field.id} className="flex items-center justify-between p-4 border rounded">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${getStatusColor(field.status)}`}>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {field.sourceField} → {field.targetField}
                          </div>
                          <div className="text-sm text-muted-foreground">{field.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getDataTypeColor(field.dataType)}>
                          {field.dataType}
                        </Badge>
                        {field.required && (
                          <Badge className="bg-red-50 text-red-600">Required</Badge>
                        )}
                        {field.transformation && (
                          <Badge variant="outline">{field.transformation}</Badge>
                        )}
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="transformations" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Data Transformations</h3>
              <p className="text-sm text-muted-foreground">
                Configure data transformation logic and rules
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Transformation
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedMappingData?.transformations.map((transformation) => (
              <Card key={transformation.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{transformation.name}</CardTitle>
                    <Badge className={getStatusColor(transformation.status)}>
                      {transformation.status}
                    </Badge>
                  </div>
                  <CardDescription>{transformation.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <p className="font-medium capitalize">{transformation.type}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Output Field:</span>
                      <p className="font-medium">{transformation.outputField}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground text-sm">Logic:</span>
                    <div className="bg-muted p-2 rounded mt-1 font-mono text-xs">
                      {transformation.logic}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Test
                    </Button>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Validation Rules</h3>
              <p className="text-sm text-muted-foreground">
                Configure data validation rules and error handling
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Validation Rule
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted">
                    <tr>
                      <th className="text-left p-4 font-medium">Rule Name</th>
                      <th className="text-left p-4 font-medium">Field</th>
                      <th className="text-left p-4 font-medium">Type</th>
                      <th className="text-left p-4 font-medium">Condition</th>
                      <th className="text-left p-4 font-medium">Severity</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedMappingData?.validation.map((rule) => (
                      <tr key={rule.id} className="border-b hover:bg-muted">
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{rule.name}</div>
                            <div className="text-sm text-muted-foreground">{rule.errorMessage}</div>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-sm">{rule.field}</td>
                        <td className="p-4">
                          <Badge variant="outline" className="capitalize">
                            {rule.type}
                          </Badge>
                        </td>
                        <td className="p-4 font-mono text-sm">{rule.condition}</td>
                        <td className="p-4">
                          <Badge className={
                            rule.severity === 'error' ? 'text-red-600 bg-red-50' :
                            rule.severity === 'warning' ? 'text-yellow-600 bg-yellow-50' :
                            'text-blue-600 bg-blue-50'
                          }>
                            {rule.severity}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={rule.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'}>
                            {rule.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              Test
                            </Button>
                            <Button size="sm" variant="outline">
                              Edit
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

export default DataMappingPage;
