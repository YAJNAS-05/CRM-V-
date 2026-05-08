import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { 
  Play, 
  Save, 
  Plus, 
  Edit, 
  Trash2, 
  Copy,
  Settings,
  GitBranch,
  Zap,
  Mail,
  Phone,
  MessageSquare,
  Database,
  Code,
  Clock,
  Calendar,
  Users,
  FileText,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ArrowDown,
  GripVertical,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';
import { Workflow, WorkflowCategory, WorkflowStatus, ActionType, TriggerType } from '@/types/workflow';
import { toast } from 'sonner';

const WorkflowDesignerPage: React.FC = () => {
  const [workflow, setWorkflow] = useState<Workflow>({
    id: 'new-workflow',
    name: '',
    description: '',
    category: 'AUTOMATION',
    status: 'DRAFT',
    priority: 'MEDIUM',
    version: '1.0.0',
    trigger: {
      id: 'trigger-new',
      type: 'MANUAL',
      config: {},
      enabled: true,
      description: 'Manual trigger'
    },
    actions: [],
    conditions: [],
    variables: [],
    settings: {
      concurrency: {
        maxConcurrent: 5,
        queueSize: 100,
        strategy: 'FIFO'
      },
      logging: {
        enabled: true,
        level: 'INFO',
        includePayloads: false,
        retentionDays: 30,
        destinations: ['DATABASE']
      },
      security: {
        encryption: true,
        authentication: {
          required: false,
          method: 'API_KEY'
        },
        authorization: {
          required: true,
          roles: ['admin'],
          permissions: ['execute']
        },
        audit: true
      },
      notifications: {
        onSuccess: [],
        onFailure: [],
        onTimeout: []
      }
    },
    metadata: {
      version: '1.0.0',
      environment: 'development',
      category: 'AUTOMATION',
      tags: [],
      changelog: [],
      dependencies: []
    },
    statistics: {
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      averageRunTime: 0,
      successRate: 0,
      errorRate: 0,
      runsByStatus: {
        'PENDING': 0,
        'RUNNING': 0,
        'COMPLETED': 0,
        'FAILED': 0,
        'CANCELLED': 0,
        'TIMEOUT': 0
      },
      runsByDate: {},
      performance: {
        averageExecutionTime: 0,
        minExecutionTime: 0,
        maxExecutionTime: 0,
        p95ExecutionTime: 0,
        p99ExecutionTime: 0,
        throughput: 0,
        errorRate: 0
      }
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'current-user',
    updatedBy: 'current-user',
    tags: []
  });

  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [showTriggerDialog, setShowTriggerDialog] = useState(false);
  const [showVariableDialog, setShowVariableDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedAction, setDraggedAction] = useState<string | null>(null);

  const [newAction, setNewAction] = useState({
    name: '',
    description: '',
    type: 'SEND_EMAIL' as ActionType,
    config: {},
    order: 0,
    enabled: true,
    timeout: 300,
    dependencies: [],
    errorHandling: {
      strategy: 'STOP' as const,
      retryOnFailure: true,
      continueOnError: false,
      errorNotifications: []
    }
  });

  const [newTrigger, setNewTrigger] = useState({
    type: 'MANUAL' as TriggerType,
    config: {},
    enabled: true,
    description: ''
  });

  const [newVariable, setNewVariable] = useState({
    name: '',
    type: 'STRING' as const,
    value: '',
    required: false,
    description: '',
    scope: 'WORKFLOW' as const
  });

  const actionTemplates = [
    { type: 'SEND_EMAIL', name: 'Send Email', icon: Mail, description: 'Send email notifications' },
    { type: 'SEND_SMS', name: 'Send SMS', icon: Phone, description: 'Send SMS messages' },
    { type: 'CREATE_TASK', name: 'Create Task', icon: CheckCircle, description: 'Create tasks in system' },
    { type: 'UPDATE_RECORD', name: 'Update Record', icon: Database, description: 'Update database records' },
    { type: 'CALL_API', name: 'Call API', icon: Code, description: 'Make external API calls' },
    { type: 'APPROVAL_REQUEST', name: 'Approval Request', icon: Users, description: 'Request approvals' },
    { type: 'NOTIFICATION', name: 'Send Notification', icon: MessageSquare, description: 'Send system notifications' },
    { type: 'DELAY', name: 'Delay', icon: Clock, description: 'Add delay between steps' }
  ];

  const triggerTemplates = [
    { type: 'MANUAL', name: 'Manual', description: 'Triggered manually by user' },
    { type: 'SCHEDULE', name: 'Schedule', description: 'Triggered on schedule' },
    { type: 'EVENT', name: 'Event', description: 'Triggered by system events' },
    { type: 'WEBHOOK', name: 'Webhook', description: 'Triggered by webhook calls' },
    { type: 'API_CALL', name: 'API Call', description: 'Triggered by API calls' },
    { type: 'FILE_UPLOAD', name: 'File Upload', description: 'Triggered by file uploads' }
  ];

  const handleSaveWorkflow = async () => {
    if (!workflow.name.trim()) {
      toast.error('Workflow name is required');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Workflow saved successfully');
    } catch (error) {
      toast.error('Failed to save workflow');
    } finally {
      setLoading(false);
    }
  };

  const handleTestWorkflow = async () => {
    if (workflow.actions.length === 0) {
      toast.error('Add at least one action to test the workflow');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast.success('Workflow test completed successfully');
    } catch (error) {
      toast.error('Workflow test failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAction = () => {
    if (!newAction.name.trim()) {
      toast.error('Action name is required');
      return;
    }

    const action = {
      id: `action-${Date.now()}`,
      ...newAction,
      order: workflow.actions.length
    };

    setWorkflow({
      ...workflow,
      actions: [...workflow.actions, action]
    });

    setNewAction({
      name: '',
      description: '',
      type: 'SEND_EMAIL',
      config: {},
      order: 0,
      enabled: true,
      timeout: 300,
      dependencies: [],
      errorHandling: {
        strategy: 'STOP',
        retryOnFailure: true,
        continueOnError: false,
        errorNotifications: []
      }
    });

    setShowActionDialog(false);
    toast.success('Action added successfully');
  };

  const handleUpdateTrigger = () => {
    setWorkflow({
      ...workflow,
      trigger: {
        ...workflow.trigger,
        type: newTrigger.type,
        config: newTrigger.config,
        description: newTrigger.description
      }
    });

    setShowTriggerDialog(false);
    toast.success('Trigger updated successfully');
  };

  const handleAddVariable = () => {
    if (!newVariable.name.trim()) {
      toast.error('Variable name is required');
      return;
    }

    const variable = {
      id: `var-${Date.now()}`,
      ...newVariable,
      value: newVariable.type === 'BOOLEAN' ? newVariable.value === 'true' : newVariable.value
    };

    setWorkflow({
      ...workflow,
      variables: [...workflow.variables, variable]
    });

    setNewVariable({
      name: '',
      type: 'STRING',
      value: '',
      required: false,
      description: '',
      scope: 'WORKFLOW'
    });

    setShowVariableDialog(false);
    toast.success('Variable added successfully');
  };

  const handleDeleteAction = (actionId: string) => {
    setWorkflow({
      ...workflow,
      actions: workflow.actions.filter(a => a.id !== actionId)
    });
    toast.success('Action deleted successfully');
  };

  const handleMoveAction = (draggedId: string, targetId: string) => {
    const draggedIndex = workflow.actions.findIndex(a => a.id === draggedId);
    const targetIndex = workflow.actions.findIndex(a => a.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newActions = [...workflow.actions];
    const [draggedAction] = newActions.splice(draggedIndex, 1);
    newActions.splice(targetIndex, 0, draggedAction);

    // Update order
    const reorderedActions = newActions.map((action, index) => ({
      ...action,
      order: index
    }));

    setWorkflow({
      ...workflow,
      actions: reorderedActions
    });
  };

  const handleDragStart = (e: React.DragEvent, actionId: string) => {
    setIsDragging(true);
    setDraggedAction(actionId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedAction && draggedAction !== targetId) {
      handleMoveAction(draggedAction, targetId);
    }
    setIsDragging(false);
    setDraggedAction(null);
  };

  const getActionIcon = (type: ActionType) => {
    const template = actionTemplates.find(t => t.type === type);
    return template ? template.icon : GitBranch;
  };

  const getTriggerIcon = (type: TriggerType) => {
    const template = triggerTemplates.find(t => t.type === type);
    return template ? template.icon : Zap;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflow Designer</h1>
          <p className="text-gray-600">Create and customize automated workflows</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleSaveWorkflow} disabled={loading}>
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
          <Button variant="outline" onClick={handleTestWorkflow} disabled={loading}>
            <Play className="h-4 w-4 mr-1" />
            Test
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Workflow Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Workflow Name *</Label>
              <Input
                placeholder="Enter workflow name"
                value={workflow.name}
                onChange={(e) => setWorkflow({...workflow, name: e.target.value})}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={workflow.category} onValueChange={(value: WorkflowCategory) => setWorkflow({...workflow, category: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AUTOMATION">Automation</SelectItem>
                  <SelectItem value="APPROVAL">Approval</SelectItem>
                  <SelectItem value="NOTIFICATION">Notification</SelectItem>
                  <SelectItem value="DATA_SYNC">Data Sync</SelectItem>
                  <SelectItem value="INTEGRATION">Integration</SelectItem>
                  <SelectItem value="REPORTING">Reporting</SelectItem>
                  <SelectItem value="CLEANUP">Cleanup</SelectItem>
                  <SelectItem value="MONITORING">Monitoring</SelectItem>
                  <SelectItem value="CUSTOM">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe what this workflow does"
                value={workflow.description}
                onChange={(e) => setWorkflow({...workflow, description: e.target.value})}
              />
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={workflow.priority} onValueChange={(value: any) => setWorkflow({...workflow, priority: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={workflow.status} onValueChange={(value: WorkflowStatus) => setWorkflow({...workflow, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PAUSED">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Builder */}
      <Tabs defaultValue="builder" className="space-y-4">
        <TabsList>
          <TabsTrigger value="builder">Workflow Builder</TabsTrigger>
          <TabsTrigger value="trigger">Trigger</TabsTrigger>
          <TabsTrigger value="variables">Variables</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-4">
          {/* Action Palette */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Action Palette</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {actionTemplates.map(template => {
                  const Icon = template.icon;
                  return (
                    <Button
                      key={template.type}
                      variant="outline"
                      className="h-auto p-3 flex flex-col items-center space-y-2"
                      onClick={() => {
                        setNewAction({...newAction, type: template.type});
                        setShowActionDialog(true);
                      }}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="text-xs">{template.name}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Workflow Canvas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Workflow Canvas</span>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Auto Layout
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {workflow.actions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <GitBranch className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No actions added yet</p>
                  <p className="text-sm">Add actions from the palette above to start building your workflow</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Trigger */}
                  <div className="flex items-center justify-center">
                    <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        {getTriggerIcon(workflow.trigger.type)}
                        <div>
                          <p className="font-medium text-blue-800">Trigger</p>
                          <p className="text-sm text-blue-600">{workflow.trigger.type}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <ArrowDown className="h-6 w-6 text-gray-400" />
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    {workflow.actions.map((action, index) => {
                      const Icon = getActionIcon(action.type);
                      return (
                        <div key={action.id}>
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-500 w-8">
                                {index + 1}
                              </span>
                              <ArrowRight className="h-4 w-4 text-gray-400" />
                            </div>
                            
                            <div
                              className={`flex-1 p-4 border-2 rounded-lg cursor-move transition-colors ${
                                selectedAction === action.id 
                                  ? 'border-blue-500 bg-blue-50' 
                                  : 'border-gray-200 bg-white hover:border-gray-300'
                              } ${isDragging ? 'opacity-50' : ''}`}
                              draggable
                              onDragStart={(e) => handleDragStart(e, action.id)}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, action.id)}
                              onClick={() => setSelectedAction(action.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <GripVertical className="h-4 w-4 text-gray-400" />
                                  <Icon className="h-5 w-5 text-gray-600" />
                                  <div>
                                    <p className="font-medium">{action.name}</p>
                                    <p className="text-sm text-gray-600">{action.description}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge variant={action.enabled ? 'default' : 'secondary'}>
                                    {action.enabled ? 'Enabled' : 'Disabled'}
                                  </Badge>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteAction(action.id);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {index < workflow.actions.length - 1 && (
                            <div className="flex justify-center mt-2">
                              <ArrowDown className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trigger" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Trigger Configuration</span>
                <Button variant="outline" onClick={() => setShowTriggerDialog(true)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getTriggerIcon(workflow.trigger.type)}
                    <div>
                      <p className="font-medium">{workflow.trigger.type}</p>
                      <p className="text-sm text-gray-600">{workflow.trigger.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Enabled</Label>
                    <div className="mt-2">
                      <Switch
                        checked={workflow.trigger.enabled}
                        onCheckedChange={(enabled) => 
                          setWorkflow({
                            ...workflow,
                            trigger: {...workflow.trigger, enabled}
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Variables</span>
                <Button variant="outline" onClick={() => setShowVariableDialog(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Variable
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {workflow.variables.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Database className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No variables defined</p>
                  <p className="text-sm">Add variables to store and pass data between actions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {workflow.variables.map(variable => (
                    <div key={variable.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{variable.name}</p>
                          <p className="text-sm text-gray-600">{variable.description}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {variable.type}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {variable.scope}
                            </Badge>
                            {variable.required && (
                              <Badge variant="destructive" className="text-xs">
                                Required
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {variable.type === 'BOOLEAN' 
                              ? (variable.value ? 'True' : 'False')
                              : variable.value || 'Not set'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label>Concurrency Settings</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label>Max Concurrent</Label>
                      <Input
                        type="number"
                        value={workflow.settings.concurrency.maxConcurrent}
                        onChange={(e) => setWorkflow({
                          ...workflow,
                          settings: {
                            ...workflow.settings,
                            concurrency: {
                              ...workflow.settings.concurrency,
                              maxConcurrent: parseInt(e.target.value)
                            }
                          }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Queue Size</Label>
                      <Input
                        type="number"
                        value={workflow.settings.concurrency.queueSize}
                        onChange={(e) => setWorkflow({
                          ...workflow,
                          settings: {
                            ...workflow.settings,
                            concurrency: {
                              ...workflow.settings.concurrency,
                              queueSize: parseInt(e.target.value)
                            }
                          }
                        })}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Logging Settings</Label>
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={workflow.settings.logging.enabled}
                        onCheckedChange={(enabled) => 
                          setWorkflow({
                            ...workflow,
                            settings: {
                              ...workflow.settings,
                              logging: {...workflow.settings.logging, enabled}
                            }
                          })
                        }
                      />
                      <Label>Enable Logging</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={workflow.settings.logging.includePayloads}
                        onCheckedChange={(includePayloads) => 
                          setWorkflow({
                            ...workflow,
                            settings: {
                              ...workflow.settings,
                              logging: {...workflow.settings.logging, includePayloads}
                            }
                          })
                        }
                      />
                      <Label>Include Payloads in Logs</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Security Settings</Label>
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={workflow.settings.security.encryption}
                        onCheckedChange={(encryption) => 
                          setWorkflow({
                            ...workflow,
                            settings: {
                              ...workflow.settings,
                              security: {...workflow.settings.security, encryption}
                            }
                          })
                        }
                      />
                      <Label>Enable Encryption</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={workflow.settings.security.audit}
                        onCheckedChange={(audit) => 
                          setWorkflow({
                            ...workflow,
                            settings: {
                              ...workflow.settings,
                              security: {...workflow.settings.security, audit}
                            }
                          })
                        }
                      />
                      <Label>Enable Audit Trail</Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Action</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Action Name *</Label>
                <Input
                  placeholder="Enter action name"
                  value={newAction.name}
                  onChange={(e) => setNewAction({...newAction, name: e.target.value})}
                />
              </div>
              <div>
                <Label>Action Type</Label>
                <Select value={newAction.type} onValueChange={(value: ActionType) => setNewAction({...newAction, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {actionTemplates.map(template => (
                      <SelectItem key={template.type} value={template.type}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Describe what this action does"
                value={newAction.description}
                onChange={(e) => setNewAction({...newAction, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Timeout (seconds)</Label>
                <Input
                  type="number"
                  value={newAction.timeout}
                  onChange={(e) => setNewAction({...newAction, timeout: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label>Enabled</Label>
                <div className="mt-2">
                  <Switch
                    checked={newAction.enabled}
                    onCheckedChange={(enabled) => setNewAction({...newAction, enabled})}
                  />
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowActionDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddAction} className="flex-1">
                Add Action
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Trigger Dialog */}
      <Dialog open={showTriggerDialog} onOpenChange={setShowTriggerDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure Trigger</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Trigger Type</Label>
              <Select value={newTrigger.type} onValueChange={(value: TriggerType) => setNewTrigger({...newTrigger, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {triggerTemplates.map(template => (
                    <SelectItem key={template.type} value={template.type}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Describe when this trigger fires"
                value={newTrigger.description}
                onChange={(e) => setNewTrigger({...newTrigger, description: e.target.value})}
              />
            </div>
            <div>
              <Label>Enabled</Label>
              <div className="mt-2">
                <Switch
                  checked={newTrigger.enabled}
                  onCheckedChange={(enabled) => setNewTrigger({...newTrigger, enabled})}
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowTriggerDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateTrigger} className="flex-1">
                Update Trigger
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Variable Dialog */}
      <Dialog open={showVariableDialog} onOpenChange={setShowVariableDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Variable</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Variable Name *</Label>
                <Input
                  placeholder="Enter variable name"
                  value={newVariable.name}
                  onChange={(e) => setNewVariable({...newVariable, name: e.target.value})}
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={newVariable.type} onValueChange={(value: any) => setNewVariable({...newVariable, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STRING">String</SelectItem>
                    <SelectItem value="NUMBER">Number</SelectItem>
                    <SelectItem value="BOOLEAN">Boolean</SelectItem>
                    <SelectItem value="DATE">Date</SelectItem>
                    <SelectItem value="ARRAY">Array</SelectItem>
                    <SelectItem value="OBJECT">Object</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Default Value</Label>
              <Input
                placeholder="Enter default value"
                value={newVariable.value}
                onChange={(e) => setNewVariable({...newVariable, value: e.target.value})}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Describe this variable"
                value={newVariable.description}
                onChange={(e) => setNewVariable({...newVariable, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Scope</Label>
                <Select value={newVariable.scope} onValueChange={(value: any) => setNewVariable({...newVariable, scope: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GLOBAL">Global</SelectItem>
                    <SelectItem value="WORKFLOW">Workflow</SelectItem>
                    <SelectItem value="ACTION">Action</SelectItem>
                    <SelectItem value="TEMPORARY">Temporary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Required</Label>
                <div className="mt-2">
                  <Switch
                    checked={newVariable.required}
                    onCheckedChange={(required) => setNewVariable({...newVariable, required})}
                  />
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowVariableDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddVariable} className="flex-1">
                Add Variable
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkflowDesignerPage;
