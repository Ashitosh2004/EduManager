import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft,
  Bell,
  Moon,
  Sun,
  Globe,
  Shield,
  Database,
  Download,
  Trash2,
  UserCheck,
  Mail,
  Phone,
  Save
} from 'lucide-react';
import { Link } from 'wouter';

interface SettingsData {
  notifications: {
    email: boolean;
    push: boolean;
    timetableUpdates: boolean;
    systemAlerts: boolean;
  };
  display: {
    theme: string;
    language: string;
    dateFormat: string;
    timeFormat: string;
  };
  privacy: {
    profileVisibility: string;
    dataSharing: boolean;
    analyticsOptIn: boolean;
  };
  backup: {
    autoBackup: boolean;
    backupFrequency: string;
  };
}

const SettingsPage: React.FC = () => {
  const { user, institute } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    notifications: {
      email: true,
      push: true,
      timetableUpdates: true,
      systemAlerts: true,
    },
    display: {
      theme: 'system',
      language: 'en',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
    },
    privacy: {
      profileVisibility: 'institute',
      dataSharing: false,
      analyticsOptIn: true,
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'weekly',
    },
  });

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      // Here you would save settings to Firebase or your backend
      // await firestoreService.updateUserSettings(user.id, settings);
      
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Your data export will be ready shortly. You'll receive an email when it's complete.",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account Deletion",
      description: "Please contact your institute administrator to delete your account.",
      variant: "destructive",
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/more">
            <Button variant="ghost" size="sm" className="p-2" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Customize your experience and preferences</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5" />
              <span>Account Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Display Name
                </label>
                <Input
                  value={user?.name || ''}
                  placeholder="Your display name"
                  data-testid="input-display-name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Email Address
                </label>
                <Input
                  value={user?.email || ''}
                  placeholder="your.email@example.com"
                  type="email"
                  data-testid="input-email"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Email Notifications</h4>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
              <Switch
                checked={settings.notifications.email}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, email: checked }
                  }))
                }
                data-testid="switch-email-notifications"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Push Notifications</h4>
                <p className="text-sm text-muted-foreground">Receive push notifications on your device</p>
              </div>
              <Switch
                checked={settings.notifications.push}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, push: checked }
                  }))
                }
                data-testid="switch-push-notifications"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Timetable Updates</h4>
                <p className="text-sm text-muted-foreground">Get notified when timetables are updated</p>
              </div>
              <Switch
                checked={settings.notifications.timetableUpdates}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, timetableUpdates: checked }
                  }))
                }
                data-testid="switch-timetable-notifications"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">System Alerts</h4>
                <p className="text-sm text-muted-foreground">Important system notifications and updates</p>
              </div>
              <Switch
                checked={settings.notifications.systemAlerts}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, systemAlerts: checked }
                  }))
                }
                data-testid="switch-system-notifications"
              />
            </div>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Display & Language</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Theme
                </label>
                <Select 
                  value={settings.display.theme} 
                  onValueChange={(value) =>
                    setSettings(prev => ({
                      ...prev,
                      display: { ...prev.display, theme: value }
                    }))
                  }
                >
                  <SelectTrigger data-testid="select-theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Language
                </label>
                <Select 
                  value={settings.display.language} 
                  onValueChange={(value) =>
                    setSettings(prev => ({
                      ...prev,
                      display: { ...prev.display, language: value }
                    }))
                  }
                >
                  <SelectTrigger data-testid="select-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Date Format
                </label>
                <Select 
                  value={settings.display.dateFormat} 
                  onValueChange={(value) =>
                    setSettings(prev => ({
                      ...prev,
                      display: { ...prev.display, dateFormat: value }
                    }))
                  }
                >
                  <SelectTrigger data-testid="select-date-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Time Format
                </label>
                <Select 
                  value={settings.display.timeFormat} 
                  onValueChange={(value) =>
                    setSettings(prev => ({
                      ...prev,
                      display: { ...prev.display, timeFormat: value }
                    }))
                  }
                >
                  <SelectTrigger data-testid="select-time-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12 Hour</SelectItem>
                    <SelectItem value="24h">24 Hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Privacy & Security</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Profile Visibility
              </label>
              <Select 
                value={settings.privacy.profileVisibility} 
                onValueChange={(value) =>
                  setSettings(prev => ({
                    ...prev,
                    privacy: { ...prev.privacy, profileVisibility: value }
                  }))
                }
              >
                <SelectTrigger data-testid="select-profile-visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="institute">Institute Only</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Data Sharing</h4>
                <p className="text-sm text-muted-foreground">Share usage data to help improve the app</p>
              </div>
              <Switch
                checked={settings.privacy.dataSharing}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({
                    ...prev,
                    privacy: { ...prev.privacy, dataSharing: checked }
                  }))
                }
                data-testid="switch-data-sharing"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Analytics</h4>
                <p className="text-sm text-muted-foreground">Help us improve by sharing anonymous analytics</p>
              </div>
              <Switch
                checked={settings.privacy.analyticsOptIn}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({
                    ...prev,
                    privacy: { ...prev.privacy, analyticsOptIn: checked }
                  }))
                }
                data-testid="switch-analytics"
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Data Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Auto Backup</h4>
                <p className="text-sm text-muted-foreground">Automatically backup your data</p>
              </div>
              <Switch
                checked={settings.backup.autoBackup}
                onCheckedChange={(checked) =>
                  setSettings(prev => ({
                    ...prev,
                    backup: { ...prev.backup, autoBackup: checked }
                  }))
                }
                data-testid="switch-auto-backup"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Backup Frequency
              </label>
              <Select 
                value={settings.backup.backupFrequency} 
                onValueChange={(value) =>
                  setSettings(prev => ({
                    ...prev,
                    backup: { ...prev.backup, backupFrequency: value }
                  }))
                }
                disabled={!settings.backup.autoBackup}
              >
                <SelectTrigger data-testid="select-backup-frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-4 pt-4">
              <Button variant="outline" onClick={handleExportData} data-testid="button-export-data">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteAccount}
                data-testid="button-delete-account"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Settings */}
        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} disabled={loading} data-testid="button-save-settings">
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;