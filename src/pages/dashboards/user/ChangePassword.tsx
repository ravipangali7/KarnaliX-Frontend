import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Eye, EyeOff, Shield, Check } from 'lucide-react';
import apiClient from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

export const ChangePassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const { toast } = useToast();

  const passwordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = passwordStrength(formData.new_password);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong', 'Excellent'][strength];
  const strengthColor = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500'][strength];

  const handleSubmit = async () => {
    if (formData.new_password !== formData.confirm_password) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (formData.new_password.length < 8) {
      toast({ title: 'Error', description: 'Password must be at least 8 characters', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await apiClient.changeUserPassword({
        old_password: formData.current_password,
        new_password: formData.new_password,
        confirm_password: formData.confirm_password,
      });
      toast({ title: 'Success', description: 'Password changed successfully' });
      setFormData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to change password', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-white">Change Password</h1>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Lock className="h-5 w-5" /> Update Your Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Password */}
          <div className="space-y-2">
            <Label className="text-gray-300">Current Password</Label>
            <div className="relative">
              <Input
                type={showCurrent ? 'text' : 'password'}
                value={formData.current_password}
                onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white pr-10"
                placeholder="Enter current password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                onClick={() => setShowCurrent(!showCurrent)}
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label className="text-gray-300">New Password</Label>
            <div className="relative">
              <Input
                type={showNew ? 'text' : 'password'}
                value={formData.new_password}
                onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white pr-10"
                placeholder="Enter new password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                onClick={() => setShowNew(!showNew)}
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {/* Password Strength */}
            {formData.new_password && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded ${i <= strength ? strengthColor : 'bg-gray-600'}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-400">Strength: <span className="text-white">{strengthLabel}</span></p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label className="text-gray-300">Confirm New Password</Label>
            <div className="relative">
              <Input
                type={showConfirm ? 'text' : 'password'}
                value={formData.confirm_password}
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white pr-10"
                placeholder="Confirm new password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {formData.confirm_password && formData.new_password === formData.confirm_password && (
              <p className="text-sm text-green-400 flex items-center gap-1">
                <Check className="h-4 w-4" /> Passwords match
              </p>
            )}
            {formData.confirm_password && formData.new_password !== formData.confirm_password && (
              <p className="text-sm text-red-400">Passwords do not match</p>
            )}
          </div>

          {/* Password Requirements */}
          <Card className="bg-gray-700 border-gray-600">
            <CardContent className="pt-4">
              <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" /> Password Requirements
              </h4>
              <ul className="space-y-1 text-sm">
                <li className={formData.new_password.length >= 8 ? 'text-green-400' : 'text-gray-400'}>
                  {formData.new_password.length >= 8 ? '✓' : '○'} At least 8 characters
                </li>
                <li className={/[A-Z]/.test(formData.new_password) ? 'text-green-400' : 'text-gray-400'}>
                  {/[A-Z]/.test(formData.new_password) ? '✓' : '○'} One uppercase letter
                </li>
                <li className={/[a-z]/.test(formData.new_password) ? 'text-green-400' : 'text-gray-400'}>
                  {/[a-z]/.test(formData.new_password) ? '✓' : '○'} One lowercase letter
                </li>
                <li className={/[0-9]/.test(formData.new_password) ? 'text-green-400' : 'text-gray-400'}>
                  {/[0-9]/.test(formData.new_password) ? '✓' : '○'} One number
                </li>
                <li className={/[^A-Za-z0-9]/.test(formData.new_password) ? 'text-green-400' : 'text-gray-400'}>
                  {/[^A-Za-z0-9]/.test(formData.new_password) ? '✓' : '○'} One special character (recommended)
                </li>
              </ul>
            </CardContent>
          </Card>

          <Button
            onClick={handleSubmit}
            disabled={loading || !formData.current_password || !formData.new_password || formData.new_password !== formData.confirm_password}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <Lock className="h-4 w-4 mr-2" /> {loading ? 'Changing...' : 'Change Password'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangePassword;
