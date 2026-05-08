import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { 
  FileText, 
  Book, 
  Code, 
  Download, 
  Eye,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Save,
  ExternalLink,
  Copy,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  Settings,
  HelpCircle,
  Terminal,
  Database,
  Globe,
  Server,
  Shield,
  Zap,
  BarChart3,
  Users,
  Calendar,
  Tag,
  Folder,
  File,
  FileCode,
  FileImage,
  FileVideo,
  FileArchive,
  Link,
  Lock,
  Unlock
} from 'lucide-react';
import { toast } from 'sonner';
import { integrationApi } from '../../api/integrationApi';

interface DocumentationItem {
  id: string;
  title: string;
  description: string;
  type: 'api' | 'guide' | 'tutorial' | 'reference' | 'faq' | 'troubleshooting';
  category: string;
  integration: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  version: string;
  lastUpdated: string;
  updatedBy: string;
  tags: string[];
  content: string;
  attachments: Attachment[];
  relatedDocs: string[];
  metadata: DocumentationMetadata;
}

interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'video' | 'code' | 'archive';
  size: number;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

interface DocumentationMetadata {
  readingTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  format: 'markdown' | 'html' | 'pdf';
  views: number;
  rating: number;
  reviews: number;
}

interface DocumentationTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  sections: TemplateSection[];
  variables: TemplateVariable[];
}

interface TemplateSection {
  id: string;
  name: string;
  content: string;
  required: boolean;
}

interface TemplateVariable {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  defaultValue?: string;
  options?: string[];
  required: boolean;
}

interface DocumentationCategory {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  order: number;
  icon: string;
  color: string;
  documentCount: number;
}

const IntegrationDocumentationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('documentation');
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [documentationItems, setDocumentationItems] = useState<DocumentationItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadDocumentationItems = async () => {
      setLoading(true);
      try {
        const docsData = await integrationApi.getDocumentationItems();
        if (docsData) {
          setDocumentationItems(docsData);
- \`POST /api/v1/accounts\` - Create new account
- \`GET /api/v1/accounts/{id}\` - Get account details
- \`PUT /api/v1/accounts/{id}\` - Update account
- \`DELETE /api/v1/accounts/{id}\` - Delete account

### Contacts
- \`GET /api/v1/contacts\` - List all contacts
- \`POST /api/v1/contacts\` - Create new contact
- \`GET /api/v1/contacts/{id}\` - Get contact details
- \`PUT /api/v1/contacts/{id}\` - Update contact
- \`DELETE /api/v1/contacts/{id}\` - Delete contact

## Rate Limiting
- 1000 requests per hour per API key
- Burst limit of 100 requests per minute

## Error Handling
All errors return appropriate HTTP status codes and detailed error messages in the response body.`,
      attachments: [
        {
          id: 'att-1',
          name: 'salesforce-api-schema.json',
          type: 'code',
          size: 15360,
          url: '/docs/salesforce-api-schema.json',
          uploadedAt: '2024-01-15 14:30:00',
          uploadedBy: 'John Smith'
        },
        {
          id: 'att-2',
          name: 'api-flow-diagram.png',
          type: 'image',
          size: 51200,
          url: '/docs/api-flow-diagram.png',
          uploadedAt: '2024-01-15 14:30:00',
          uploadedBy: 'John Smith'
        }
      ],
      relatedDocs: ['doc-2', 'doc-3'],
      metadata: {
        readingTime: 15,
        difficulty: 'intermediate',
        language: 'en',
        format: 'markdown',
        views: 1250,
        rating: 4.8,
        reviews: 23
      }
    },
    {
      id: 'doc-2',
      title: 'Integration Setup Guide',
      description: 'Step-by-step guide for setting up integrations',
      type: 'guide',
      category: 'Getting Started',
      integration: 'All',
      status: 'published',
      version: '1.0.0',
      lastUpdated: '2024-01-14 16:45:00',
      updatedBy: 'Jane Doe',
      tags: ['setup', 'guide', 'integration', 'configuration'],
      content: `# Integration Setup Guide

## Prerequisites
Before setting up integrations, ensure you have:
- Valid API credentials for each service
- Network connectivity to all endpoints
- Required permissions in each system

## Step 1: Configure Authentication
1. Navigate to Integration Settings
2. Select the integration type
3. Enter API credentials
4. Test connection

## Step 2: Map Data Fields
1. Define source and target fields
2. Set transformation rules
3. Configure validation
4. Test mapping

## Step 3: Set Up Synchronization
1. Choose sync frequency
2. Configure conflict resolution
3. Set up error handling
4. Enable monitoring

## Troubleshooting
Common issues and their solutions...`,
      attachments: [
        {
          id: 'att-3',
          name: 'setup-checklist.pdf',
          type: 'document',
          size: 102400,
          url: '/docs/setup-checklist.pdf',
          uploadedAt: '2024-01-14 16:45:00',
          uploadedBy: 'Jane Doe'
        }
      ],
      relatedDocs: ['doc-1', 'doc-4'],
      metadata: {
        readingTime: 20,
        difficulty: 'beginner',
        language: 'en',
        format: 'markdown',
        views: 890,
        rating: 4.6,
        reviews: 15
      }
    },
    {
      id: 'doc-3',
      title: 'Error Handling Best Practices',
      description: 'Comprehensive guide to handling integration errors',
      type: 'troubleshooting',
      category: 'Best Practices',
      integration: 'All',
      status: 'review',
      version: '0.9.0',
      lastUpdated: '2024-01-15 10:20:00',
      updatedBy: 'Bob Johnson',
      tags: ['error', 'handling', 'troubleshooting', 'best-practices'],
      content: `# Error Handling Best Practices

## Types of Errors
- Network errors
- Authentication errors
- Data validation errors
- Business logic errors

## Error Response Format
\`\`\`json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Request validation failed",
    "details": {
      "field": "email",
      "issue": "Invalid format"
    }
  }
}
\`\`\`

## Retry Strategies
- Exponential backoff
- Circuit breaker pattern
- Dead letter queues

## Monitoring and Alerting
Set up alerts for:
- High error rates
- Service unavailability
- Performance degradation`,
      attachments: [],
      relatedDocs: ['doc-5', 'doc-6'],
      metadata: {
        readingTime: 12,
        difficulty: 'advanced',
        language: 'en',
        format: 'markdown',
        views: 450,
        rating: 4.7,
        reviews: 8
      }
    },
    {
      id: 'doc-4',
      title: 'SAP ERP Integration Tutorial',
      description: 'Hands-on tutorial for SAP ERP integration',
      type: 'tutorial',
      category: 'Tutorials',
      integration: 'SAP ERP',
      status: 'published',
      version: '1.2.0',
      lastUpdated: '2024-01-13 11:30:00',
      updatedBy: 'Alice Wilson',
      tags: ['tutorial', 'sap', 'erp', 'database'],
      content: `# SAP ERP Integration Tutorial

## Introduction
This tutorial walks through integrating with SAP ERP system using our platform.

## Prerequisites
- SAP ERP system access
- Database credentials
- Basic understanding of SAP data structures

## Step 1: Database Connection
Configure database connection to SAP ERP system.

## Step 2: Data Extraction
Set up data extraction from SAP tables.

## Step 3: Data Transformation
Transform SAP data to match our system format.

## Step 4: Data Loading
Load transformed data into target system.

## Code Examples
\`\`\`python
# Example SAP connection
import pyrfc

conn = pyrfc.Connection(
    user='username',
    passwd='password',
    ashost='sap.server.com',
    sysnr='00',
    client='100'
)
\`\`\``,
      attachments: [
        {
          id: 'att-4',
          name: 'sap-integration-code.zip',
          type: 'archive',
          size: 20480,
          url: '/docs/sap-integration-code.zip',
          uploadedAt: '2024-01-13 11:30:00',
          uploadedBy: 'Alice Wilson'
        }
      ],
      relatedDocs: ['doc-1', 'doc-2'],
      metadata: {
        readingTime: 30,
        difficulty: 'intermediate',
        language: 'en',
        format: 'markdown',
        views: 670,
        rating: 4.9,
        reviews: 12
      }
    },
    {
      id: 'doc-5',
      title: 'Frequently Asked Questions',
      description: 'Common questions about integrations',
      type: 'faq',
      category: 'Support',
      integration: 'All',
      status: 'published',
      version: '1.0.0',
      lastUpdated: '2024-01-12 09:15:00',
      updatedBy: 'Support Team',
      tags: ['faq', 'questions', 'support', 'help'],
      content: `# Frequently Asked Questions

## General Questions

**Q: How do I reset my API key?**
A: Navigate to Settings > API Keys and click "Regenerate".

**Q: What are the rate limits?**
A: Rate limits vary by integration type. Check the specific API documentation.

**Q: How do I troubleshoot connection issues?**
A: Check our troubleshooting guide for step-by-step instructions.

## Technical Questions

**Q: What authentication methods are supported?**
A: We support OAuth 2.0, API keys, and basic authentication.

**Q: How do I handle large data sets?**
A: Use pagination and batch processing for large datasets.

**Q: Can I customize error messages?**
A: Yes, error messages can be customized in the integration settings.`,
      attachments: [],
      relatedDocs: ['doc-2', 'doc-3'],
      metadata: {
        readingTime: 8,
        difficulty: 'beginner',
        language: 'en',
        format: 'markdown',
        views: 2100,
        rating: 4.4,
        reviews: 35
      }
    }
  ];

  const documentationCategories: DocumentationCategory[] = [
    {
      id: 'cat-1',
      name: 'Getting Started',
      description: 'Basic setup and introduction guides',
      order: 1,
      icon: 'Book',
      color: 'blue',
      documentCount: 2
    },
    {
      id: 'cat-2',
      name: 'API Reference',
      description: 'Detailed API documentation',
      order: 2,
      icon: 'Code',
      color: 'green',
      documentCount: 3
    },
    {
      id: 'cat-3',
      name: 'Tutorials',
      description: 'Step-by-step tutorials',
      order: 3,
      icon: 'Terminal',
      color: 'purple',
      documentCount: 4
    },
    {
      id: 'cat-4',
      name: 'Best Practices',
      description: 'Recommended practices and patterns',
      order: 4,
      icon: 'Shield',
      color: 'orange',
      documentCount: 2
    },
    {
      id: 'cat-5',
      name: 'Troubleshooting',
      description: 'Common issues and solutions',
      order: 5,
      icon: 'AlertTriangle',
      color: 'red',
      documentCount: 3
    },
    {
      id: 'cat-6',
      name: 'Support',
      description: 'FAQ and support resources',
      order: 6,
      icon: 'HelpCircle',
      color: 'gray',
      documentCount: 1
    }
  ];

  const documentationTemplates: DocumentationTemplate[] = [
    {
      id: 'template-1',
      name: 'API Documentation Template',
      description: 'Template for API reference documentation',
      type: 'api',
      sections: [
        {
          id: 'section-1',
          name: 'Overview',
          content: '## Overview\n\nBrief description of the API...',
          required: true
        },
        {
          id: 'section-2',
          name: 'Authentication',
          content: '## Authentication\n\nAuthentication requirements...',
          required: true
        },
        {
          id: 'section-3',
          name: 'Endpoints',
          content: '## Endpoints\n\nList of available endpoints...',
          required: true
        }
      ],
      variables: [
        {
          name: 'api_name',
          type: 'text',
          required: true
        },
        {
          name: 'base_url',
          type: 'text',
          required: true
        },
        {
          name: 'version',
          type: 'text',
          required: false
        }
      ]
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'api':
        return 'text-blue-600 bg-blue-50';
      case 'guide':
        return 'text-green-600 bg-green-50';
      case 'tutorial':
        return 'text-purple-600 bg-purple-50';
      case 'reference':
        return 'text-orange-600 bg-orange-50';
      case 'faq':
        return 'text-yellow-600 bg-yellow-50';
      case 'troubleshooting':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'text-green-600 bg-green-50';
      case 'draft':
        return 'text-gray-600 bg-gray-50';
      case 'review':
        return 'text-yellow-600 bg-yellow-50';
      case 'archived':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-600 bg-green-50';
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-50';
      case 'advanced':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <FileImage className="w-4 h-4" />;
      case 'document':
        return <FileText className="w-4 h-4" />;
      case 'video':
        return <FileVideo className="w-4 h-4" />;
      case 'code':
        return <FileCode className="w-4 h-4" />;
      case 'archive':
        return <FileArchive className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  const filteredDocs = documentationItems.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || doc.type === filterType;
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const selectedDocData = documentationItems.find(d => d.id === selectedDoc);

  const totalDocs = documentationItems.length;
  const publishedDocs = documentationItems.filter(d => d.status === 'published').length;
  const draftDocs = documentationItems.filter(d => d.status === 'draft').length;
  const totalViews = documentationItems.reduce((acc, d) => acc + d.metadata.views, 0);

  const handleExportAll = async () => {
    try {
      const allDocs = {
        documentation: documentationItems,
        templates: documentationTemplates,
        summary: {
          totalDocs,
          publishedDocs,
          draftDocs,
          totalViews,
          exportedAt: new Date().toISOString()
        }
      };
      
      const blob = new Blob([JSON.stringify(allDocs, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `integration-documentation-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('All documentation exported successfully');
    } catch (error) {
      console.error('Failed to export documentation:', error);
      toast.error('Failed to export documentation');
    }
  };

  const handleViewDocument = (docId: string) => {
    setSelectedDoc(docId);
    toast.info(`Viewing document ${docId}`);
  };

  const handleEditDocument = (docId: string) => {
    toast.info(`Editing document ${docId}`);
    // TODO: Implement document editing
  };

  const handleExportDocument = async (docId: string) => {
    try {
      const doc = documentationItems.find(d => d.id === docId);
      if (doc) {
        const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${doc.title.replace(/\s+/g, '-')}-${docId}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success('Document exported successfully');
      }
    } catch (error) {
      console.error('Failed to export document:', error);
      toast.error('Failed to export document');
    }
  };

  const handleDownloadAsset = async (assetId: string) => {
    try {
      const asset = selectedDocData?.assets.find(a => a.id === assetId);
      if (asset) {
        const blob = new Blob([JSON.stringify(asset, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${asset.name}-${assetId}.${asset.type}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success('Asset downloaded successfully');
      }
    } catch (error) {
      console.error('Failed to download asset:', error);
      toast.error('Failed to download asset');
    }
  };

  const handleViewDocuments = (integrationId: string) => {
    toast.info(`Viewing documents for integration ${integrationId}`);
    // TODO: Filter and show documents for specific integration
  };

  const handleEditTemplate = (templateId: string) => {
    toast.info(`Editing template ${templateId}`);
    // TODO: Implement template editing
  };

  const handleUseTemplate = (templateId: string) => {
    toast.info(`Using template ${templateId}`);
    // TODO: Implement template usage
  };

  const handleExportAnalytics = async () => {
    try {
      const analytics = {
        documentationStats: {
          totalDocs,
          publishedDocs,
          draftDocs,
          totalViews
        },
        documentTypes: documentationItems.reduce((acc, doc) => {
          acc[doc.type] = (acc[doc.type] || 0) + 1;
          return acc;
        }, {}),
        integrationCoverage: documentationItems.reduce((acc, doc) => {
          acc[doc.integration] = (acc[doc.integration] || 0) + 1;
          return acc;
        }, {}),
        exportedAt: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(analytics, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `documentation-analytics-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Documentation analytics exported successfully');
    } catch (error) {
      console.error('Failed to export analytics:', error);
      toast.error('Failed to export analytics');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integration Documentation</h1>
          <p className="text-muted-foreground">
            Comprehensive documentation for all integrations and APIs
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportAll}>
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Document
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDocs}</div>
            <p className="text-xs text-muted-foreground">
              {publishedDocs} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              across all documents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Edit className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{draftDocs}</div>
            <p className="text-xs text-muted-foreground">
              awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Folder className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{documentationCategories.length}</div>
            <p className="text-xs text-muted-foreground">
              documentation categories
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="documentation" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Documentation Library</h3>
              <p className="text-sm text-muted-foreground">
                Browse and manage integration documentation
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search documentation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-md text-sm w-64"
                />
              </div>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Types</option>
                <option value="api">API Reference</option>
                <option value="guide">Guides</option>
                <option value="tutorial">Tutorials</option>
                <option value="faq">FAQ</option>
                <option value="troubleshooting">Troubleshooting</option>
              </select>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="review">In Review</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Documents List */}
            <div className="space-y-4">
              {filteredDocs.map((doc) => (
                <Card 
                  key={doc.id}
                  className={`cursor-pointer transition-colors ${
                    selectedDoc === doc.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedDoc(doc.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getTypeColor(doc.type)}`}>
                          {doc.type === 'api' ? <Code className="w-4 h-4" /> :
                           doc.type === 'guide' ? <Book className="w-4 h-4" /> :
                           doc.type === 'tutorial' ? <Terminal className="w-4 h-4" /> :
                           doc.type === 'faq' ? <HelpCircle className="w-4 h-4" /> :
                           <FileText className="w-4 h-4" />}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{doc.title}</CardTitle>
                          <CardDescription>{doc.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeColor(doc.type)}>
                          {doc.type}
                        </Badge>
                        <Badge className={getStatusColor(doc.status)}>
                          {doc.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Integration:</span>
                      <Badge variant="outline">{doc.integration}</Badge>
                      <span className="text-muted-foreground">Category:</span>
                      <Badge variant="outline">{doc.category}</Badge>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {doc.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Reading Time:</span>
                        <p className="font-medium">{doc.metadata.readingTime}m</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Views:</span>
                        <p className="font-medium">{doc.metadata.views}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rating:</span>
                        <p className="font-medium">⭐ {doc.metadata.rating}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Updated by {doc.updatedBy}</span>
                      <span>{doc.lastUpdated}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewDocument(doc.id)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEditDocument(doc.id)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleExportDocument(doc.id)}>
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Document Preview */}
            <div>
              {selectedDocData ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {selectedDocData.title}
                      <Button variant="outline" size="sm" onClick={() => setSelectedDoc(null)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                    </CardTitle>
                    <CardDescription>{selectedDocData.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Document Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <Badge className={getTypeColor(selectedDocData.type)}>
                              {selectedDocData.type}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge className={getStatusColor(selectedDocData.status)}>
                              {selectedDocData.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Version:</span>
                            <span className="font-medium">{selectedDocData.version}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Difficulty:</span>
                            <Badge className={getDifficultyColor(selectedDocData.metadata.difficulty)}>
                              {selectedDocData.metadata.difficulty}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Statistics</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Reading Time:</span>
                            <span className="font-medium">{selectedDocData.metadata.readingTime} minutes</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Views:</span>
                            <span className="font-medium">{selectedDocData.metadata.views}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Rating:</span>
                            <span className="font-medium">⭐ {selectedDocData.metadata.rating} ({selectedDocData.metadata.reviews} reviews)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Format:</span>
                            <span className="font-medium">{selectedDocData.metadata.format}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Content Preview</h4>
                      <div className="bg-muted p-4 rounded text-sm max-h-64 overflow-y-auto">
                        <pre className="whitespace-pre-wrap font-sans">{selectedDocData.content.substring(0, 500)}...</pre>
                      </div>
                    </div>

                    {selectedDocData.attachments.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Attachments</h4>
                        <div className="space-y-2">
                          {selectedDocData.attachments.map((attachment) => (
                            <div key={attachment.id} className="flex items-center justify-between p-2 border rounded">
                              <div className="flex items-center gap-2">
                                {getAttachmentIcon(attachment.type)}
                                <div>
                                  <div className="text-sm font-medium">{attachment.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {(attachment.size / 1024).toFixed(1)} KB • {attachment.uploadedBy}
                                  </div>
                                </div>
                              </div>
                              <Button size="sm" variant="outline" onClick={() => handleDownloadAsset(asset.id)}>
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Full View
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEditDocument(selectedDocData.id)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Document
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleExportDocument(selectedDocData.id)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Select a document to preview
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Documentation Categories</h3>
              <p className="text-sm text-muted-foreground">
                Organize documentation by categories
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Category
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentationCategories.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <Badge className={`text-${category.color}-600 bg-${category.color}-50`}>
                      {category.documentCount} docs
                    </Badge>
                  </div>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Order: {category.order}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleViewDocuments(integration.id)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Documents
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEditTemplate(integration.id)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Documentation Templates</h3>
              <p className="text-sm text-muted-foreground">
                Create documents using predefined templates
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documentationTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant="outline">
                      {template.type}
                    </Badge>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h5 className="font-medium text-sm mb-2">Sections:</h5>
                    <div className="space-y-1">
                      {template.sections.map((section) => (
                        <div key={section.id} className="flex items-center justify-between text-sm">
                          <span>{section.name}</span>
                          {section.required && (
                            <Badge variant="secondary" className="text-xs">Required</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleUseTemplate(template.id)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Use Template
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEditTemplate(template.id)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Documentation Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Track usage and engagement metrics
              </p>
            </div>
            <Button variant="outline" onClick={handleExportAnalytics}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Export Analytics
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Most Viewed Documents</CardTitle>
                <CardDescription>
                  Top documents by view count
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documentationItems
                    .sort((a, b) => b.metadata.views - a.metadata.views)
                    .slice(0, 5)
                    .map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{doc.title}</div>
                          <div className="text-xs text-muted-foreground">{doc.integration}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{doc.metadata.views}</div>
                          <div className="text-xs text-muted-foreground">views</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Rated Documents</CardTitle>
                <CardDescription>
                  Highest rated documentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documentationItems
                    .sort((a, b) => b.metadata.rating - a.metadata.rating)
                    .slice(0, 5)
                    .map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{doc.title}</div>
                          <div className="text-xs text-muted-foreground">{doc.integration}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">⭐ {doc.metadata.rating}</div>
                          <div className="text-xs text-muted-foreground">{doc.metadata.reviews} reviews</div>
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

export default IntegrationDocumentationPage;
