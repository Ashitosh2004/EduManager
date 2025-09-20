import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft,
  User,
  Mail,
  Building2,
  Calendar,
  Phone,
  MapPin,
  Edit2,
  Save,
  X
} from 'lucide-react';
import { Link } from 'wouter';

const ProfilePage: React.FC = () => {
  const { user, institute } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: (user as any)?.phoneNumber || '',
    department: (user as any)?.department || '',
    role: user?.role || 'Student'
  });

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      
      // Here you would save profile data to Firebase or your backend
      // await firestoreService.updateUserProfile(user.id, profileData);
      
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
      phone: (user as any)?.phoneNumber || '',
      department: (user as any)?.department || '',
      role: user?.role || 'Student'
    });
    setIsEditing(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="p-2" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Profile</h1>
            <p className="text-muted-foreground">Manage your personal information and preferences</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Profile Header Card */}
        <Card className="relative">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user?.profilePhoto} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground" data-testid="profile-name">
                      {user?.name || 'User Name'}
                    </h2>
                    <p className="text-muted-foreground" data-testid="profile-email">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" data-testid="profile-role">
                      {user?.role || 'Student'}
                    </Badge>
                    {institute?.name && (
                      <Badge variant="secondary" data-testid="profile-institute">
                        {institute.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                data-testid="button-edit-profile"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Personal Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Personal Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isEditing ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Full Name
                    </label>
                    <Input
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                      data-testid="input-name"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email"
                      data-testid="input-email"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter your phone number"
                      data-testid="input-phone"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Department
                    </label>
                    <Input
                      value={profileData.department}
                      onChange={(e) => setProfileData(prev => ({ ...prev, department: e.target.value }))}
                      placeholder="Enter your department"
                      data-testid="input-department"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={loading}
                    data-testid="button-cancel"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveProfile}
                    disabled={loading}
                    data-testid="button-save-profile"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium" data-testid="display-email">
                        {user?.email || 'Not provided'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium" data-testid="display-phone">
                        {(user as any)?.phoneNumber || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p className="font-medium" data-testid="display-department">
                        {(user as any)?.department || 'Not assigned'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Institute</p>
                      <p className="font-medium" data-testid="display-institute">
                        {institute?.name || 'Not assigned'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Account Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Member Since</p>
                <p className="font-medium">
                  {(user as any)?.createdAt ? new Date((user as any).createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Unknown'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Last Login</p>
                <p className="font-medium">
                  {(user as any)?.lastLoginAt ? new Date((user as any).lastLoginAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'Unknown'}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Account Status</p>
                <Badge variant="outline" className="text-green-600">
                  Active
                </Badge>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">User ID</p>
                <p className="font-mono text-sm bg-muted p-2 rounded">
                  {user?.id || 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/settings">
                <Button variant="outline" className="w-full justify-start" data-testid="button-settings-nav">
                  <User className="h-4 w-4 mr-2" />
                  Account Settings
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => toast({
                  title: "Feature Coming Soon",
                  description: "Password change functionality will be available soon.",
                })}
                data-testid="button-change-password"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;