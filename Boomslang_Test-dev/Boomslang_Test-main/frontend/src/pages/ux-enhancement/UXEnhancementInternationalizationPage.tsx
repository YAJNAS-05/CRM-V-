import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Separator } from '../../components/ui/separator';
import { Globe, Languages, Download, Upload, Eye, EyeOff, Settings, CheckCircle, XCircle, AlertTriangle, RefreshCw, Plus, Edit, Trash2, Search, Filter, BarChart3, Users, Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  region: string;
  status: 'active' | 'inactive' | 'testing';
  completion: number;
  translators: number;
  lastUpdated: string;
  rtl: boolean;
}

interface Translation {
  id: string;
  key: string;
  sourceText: string;
  translations: Record<string, string>;
  status: 'translated' | 'pending' | 'missing';
  category: string;
  context: string;
  lastModified: string;
}

interface Locale {
  id: string;
  language: string;
  country: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
  status: 'active' | 'inactive';
}

const UXEnhancementInternationalizationPage: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyMissing, setShowOnlyMissing] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(false);

  const languages: Language[] = [
    { id: 'en', code: 'en-US', name: 'English', nativeName: 'English', region: 'Americas', status: 'active', completion: 100, translators: 5, lastUpdated: '2024-01-15T10:30:00Z', rtl: false },
    { id: 'es', code: 'es-ES', name: 'Spanish', nativeName: 'Español', region: 'Europe', status: 'active', completion: 95, translators: 3, lastUpdated: '2024-01-14T15:45:00Z', rtl: false },
    { id: 'fr', code: 'fr-FR', name: 'French', nativeName: 'Français', region: 'Europe', status: 'active', completion: 88, translators: 2, lastUpdated: '2024-01-13T09:20:00Z', rtl: false },
    { id: 'de', code: 'de-DE', name: 'German', nativeName: 'Deutsch', region: 'Europe', status: 'testing', completion: 72, translators: 2, lastUpdated: '2024-01-12T14:30:00Z', rtl: false },
    { id: 'ja', code: 'ja-JP', name: 'Japanese', nativeName: '日本語', region: 'Asia', status: 'inactive', completion: 45, translators: 1, lastUpdated: '2024-01-10T11:15:00Z', rtl: false },
    { id: 'ar', code: 'ar-SA', name: 'Arabic', nativeName: 'العربية', region: 'Middle East', status: 'testing', completion: 60, translators: 1, lastUpdated: '2024-01-11T16:45:00Z', rtl: true },
    { id: 'zh', code: 'zh-CN', name: 'Chinese', nativeName: '中文', region: 'Asia', status: 'active', completion: 82, translators: 2, lastUpdated: '2024-01-14T08:30:00Z', rtl: false },
    { id: 'pt', code: 'pt-BR', name: 'Portuguese', nativeName: 'Português', region: 'Americas', status: 'inactive', completion: 35, translators: 0, lastUpdated: '2024-01-09T13:20:00Z', rtl: false },
  ];

  const translations: Translation[] = [
    { id: 't1', key: 'welcome.title', sourceText: 'Welcome to our platform', translations: { 'en-US': 'Welcome to our platform', 'es-ES': 'Bienvenido a nuestra plataforma', 'fr-FR': 'Bienvenue sur notre plateforme' }, status: 'translated', category: 'navigation', context: 'Homepage welcome message', lastModified: '2024-01-15T10:30:00Z' },
    { id: 't2', key: 'button.save', sourceText: 'Save', translations: { 'en-US': 'Save', 'es-ES': 'Guardar', 'fr-FR': 'Enregistrer', 'de-DE': 'Speichern' }, status: 'translated', category: 'actions', context: 'Form submit button', lastModified: '2024-01-14T15:45:00Z' },
    { id: 't3', key: 'error.network', sourceText: 'Network error occurred', translations: { 'en-US': 'Network error occurred', 'es-ES': 'Error de red', 'fr-FR': 'Erreur réseau' }, status: 'pending', category: 'errors', context: 'Error message', lastModified: '2024-01-13T09:20:00Z' },
    { id: 't4', key: 'menu.dashboard', sourceText: 'Dashboard', translations: { 'en-US': 'Dashboard', 'es-ES': 'Panel', 'fr-FR': 'Tableau de bord' }, status: 'translated', category: 'navigation', context: 'Main navigation', lastModified: '2024-01-12T14:30:00Z' },
    { id: 't5', key: 'form.required', sourceText: 'This field is required', translations: { 'en-US': 'This field is required', 'es-ES': 'Este campo es obligatorio' }, status: 'missing', category: 'validation', context: 'Form validation', lastModified: '2024-01-11T16:45:00Z' },
  ];

  const locales: Locale[] = [
    { id: 'locale1', language: 'English', country: 'United States', currency: 'USD', dateFormat: 'MM/DD/YYYY', timeFormat: '12h', numberFormat: '1,234.56', status: 'active' },
    { id: 'locale2', language: 'Spanish', country: 'Spain', currency: 'EUR', dateFormat: 'DD/MM/YYYY', timeFormat: '24h', numberFormat: '1.234,56', status: 'active' },
    { id: 'locale3', language: 'French', country: 'France', currency: 'EUR', dateFormat: 'DD/MM/YYYY', timeFormat: '24h', numberFormat: '1 234,56', status: 'active' },
    { id: 'locale4', language: 'German', country: 'Germany', currency: 'EUR', dateFormat: 'DD.MM.YYYY', timeFormat: '24h', numberFormat: '1.234,56', status: 'testing' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'translated':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
      case 'missing':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'testing':
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      inactive: 'destructive',
      testing: 'secondary',
      translated: 'default',
      pending: 'secondary',
      missing: 'destructive'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const activeLanguages = languages.filter(lang => lang.status === 'active').length;
  const totalTranslations = translations.length;
  const translatedCount = translations.filter(t => t.status === 'translated').length;
  const missingCount = translations.filter(t => t.status === 'missing').length;
  const averageCompletion = Math.round(languages.reduce((acc, lang) => acc + lang.completion, 0) / languages.length);

  const filteredTranslations = translations.filter(translation => {
    const matchesLanguage = selectedLanguage === 'all' || translation.translations[selectedLanguage];
    const matchesStatus = selectedStatus === 'all' || translation.status === selectedStatus;
    const matchesSearch = translation.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         translation.sourceText.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMissing = !showOnlyMissing || translation.status === 'missing';
    
    return matchesLanguage && matchesStatus && matchesSearch && matchesMissing;
  });

  const handleExport = () => {
    // Export translations logic
  };

  const handleImport = () => {
    // Import translations logic
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Internationalization</h1>
          <p className="text-muted-foreground">Manage translations and localization settings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImport}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Language
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Languages</p>
                <p className="text-2xl font-bold">{activeLanguages}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Translation Progress</p>
                <p className="text-2xl font-bold">{averageCompletion}%</p>
              </div>
              <Languages className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={averageCompletion} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Translated</p>
                <p className="text-2xl font-bold">{translatedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Missing</p>
                <p className="text-2xl font-bold">{missingCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="languages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="languages">Languages</TabsTrigger>
          <TabsTrigger value="translations">Translations</TabsTrigger>
          <TabsTrigger value="locales">Locales</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="languages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Supported Languages</CardTitle>
              <CardDescription>Manage language support and translation progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {languages.map(language => (
                  <div key={language.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(language.status)}
                          <h3 className="font-medium">{language.name} ({language.nativeName})</h3>
                          {getStatusBadge(language.status)}
                          <Badge variant="outline">{language.code}</Badge>
                          {language.rtl && <Badge variant="secondary">RTL</Badge>}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span>Region: {language.region}</span>
                          <span>•</span>
                          <span>Translators: {language.translators}</span>
                          <span>•</span>
                          <span>Updated: {new Date(language.lastUpdated).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Completion:</span>
                          <Progress value={language.completion} className="flex-1 max-w-32" />
                          <span className="text-sm font-medium">{language.completion}%</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button size="sm">
                          <Globe className="h-4 w-4 mr-2" />
                          Manage
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="translations" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Translation Keys</CardTitle>
                  <CardDescription>Manage translation strings and their values</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Auto Translate</label>
                    <Switch checked={autoTranslate} onCheckedChange={setAutoTranslate} />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Missing Only</label>
                    <Switch checked={showOnlyMissing} onCheckedChange={setShowOnlyMissing} />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search translations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Languages</SelectItem>
                    {languages.map(lang => (
                      <SelectItem key={lang.id} value={lang.code}>{lang.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="translated">Translated</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="missing">Missing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {filteredTranslations.map(translation => (
                  <div key={translation.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(translation.status)}
                          <h3 className="font-medium">{translation.key}</h3>
                          {getStatusBadge(translation.status)}
                          <Badge variant="outline">{translation.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{translation.sourceText}</p>
                        <p className="text-xs text-muted-foreground mb-2">Context: {translation.context}</p>
                        <div className="text-xs text-muted-foreground">
                          Last modified: {new Date(translation.lastModified).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button size="sm">
                          <Languages className="h-4 w-4 mr-2" />
                          Translate
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Locale Settings</CardTitle>
              <CardDescription>Regional formatting and localization preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {locales.map(locale => (
                  <div key={locale.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{locale.language} - {locale.country}</h3>
                          {getStatusBadge(locale.status)}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Currency:</span>
                            <span className="ml-2 font-medium">{locale.currency}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Date:</span>
                            <span className="ml-2 font-medium">{locale.dateFormat}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Time:</span>
                            <span className="ml-2 font-medium">{locale.timeFormat}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Number:</span>
                            <span className="ml-2 font-medium">{locale.numberFormat}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Translation Progress</CardTitle>
                <CardDescription>Overall translation completion by language</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {languages.filter(lang => lang.status === 'active').map(language => (
                    <div key={language.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span>{language.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${language.completion}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{language.completion}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Translation Activity</CardTitle>
                <CardDescription>Recent translation updates and activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Translations Added Today</span>
                    <span className="font-medium">24</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Translations Updated</span>
                    <span className="font-medium">18</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Active Translators</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Pending Review</span>
                    <span className="font-medium">7</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UXEnhancementInternationalizationPage;
