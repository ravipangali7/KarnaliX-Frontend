import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { User, Lock, Phone, Mail, Save } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    phone: '',
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await apiClient.updateMasterProfile(profileData);
      toast({ title: 'Success', description: 'Profile updated successfully' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update profile', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await apiClient.changeMasterPassword(
        passwordData.current_password,
        passwordData.new_password
      );
      toast({ title: 'Success', description: 'Password changed successfully' });
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to change password', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Info */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5" /> Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Username</Label>
              <Input
                value={profileData.username}
                onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
                disabled
              />
              <p className="text-xs text-gray-500">Username cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300 flex items-center gap-2">
                <Mail className="h-4 w-4" /> Email
              </Label>
              <Input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300 flex items-center gap-2">
                <Phone className="h-4 w-4" /> Phone
              </Label>
              <Input
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <Button onClick={handleUpdateProfile} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700">
              <Save className="h-4 w-4 mr-2" /> {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Lock className="h-5 w-5" /> Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Current Password</Label>
              <Input
                type="password"
                value={passwordData.current_password}
                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">New Password</Label>
              <Input
                type="password"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Confirm New Password</Label>
              <Input
                type="password"
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Confirm new password"
              />
            </div>
            <Button 
              onClick={handleChangePassword} 
              disabled={loading || !passwordData.current_password || !passwordData.new_password}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              <Lock className="h-4 w-4 mr-2" /> {loading ? 'Changing...' : 'Change Password'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Account Stats */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Account Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-700 rounded-lg">
              <p className="text-gray-400 text-sm">Role</p>
              <p className="text-white font-bold">{user?.role}</p>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg">
              <p className="text-gray-400 text-sm">Wallet Balance</p>
              <p className="text-green-400 font-bold">₹{user?.wallet_balance || '0.00'}</p>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg">
              <p className="text-gray-400 text-sm">Status</p>
              <p className="text-white font-bold">{user?.status || 'ACTIVE'}</p>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg">
              <p className="text-gray-400 text-sm">Member Since</p>
              <p className="text-white font-bold">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
