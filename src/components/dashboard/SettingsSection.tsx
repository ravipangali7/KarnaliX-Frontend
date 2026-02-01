import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Settings,
  Bell,
  Shield,
  Lock,
  Globe,
  Moon,
  Sun,
  AlertTriangle,
  Clock,
  Ban,
  Save,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api";

interface UserSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  promotionalEmails: boolean;
  twoFactorAuth: boolean;
  biometricLogin: boolean;
  darkMode: boolean;
  language: string;
  currency: string;
  timezone: string;
  depositLimit: string;
  sessionLimit: string;
  selfExclusion: boolean;
}

export function SettingsSection() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    promotionalEmails: true,
    twoFactorAuth: false,
    biometricLogin: false,
    darkMode: true,
    language: "en",
    currency: "NPR",
    timezone: "Asia/Kathmandu",
    depositLimit: "",
    sessionLimit: "",
    selfExclusion: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getUserSettings();
      setSettings({
        emailNotifications: data.email_notifications ?? true,
        pushNotifications: data.push_notifications ?? true,
        smsNotifications: data.sms_notifications ?? false,
        promotionalEmails: data.promotional_emails ?? true,
        twoFactorAuth: data.two_factor_auth ?? false,
        biometricLogin: data.biometric_login ?? false,
        darkMode: data.dark_mode ?? true,
        language: data.language ?? "en",
        currency: data.currency ?? "NPR",
        timezone: data.timezone ?? "Asia/Kathmandu",
        depositLimit: data.deposit_limit ?? "",
        sessionLimit: data.session_limit?.toString() ?? "",
        selfExclusion: data.self_exclusion ?? false,
      });
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      // Keep default settings on error
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiClient.updateUserSettings({
        email_notifications: settings.emailNotifications,
        push_notifications: settings.pushNotifications,
        sms_notifications: settings.smsNotifications,
        promotional_emails: settings.promotionalEmails,
        two_factor_auth: settings.twoFactorAuth,
        biometric_login: settings.biometricLogin,
        dark_mode: settings.darkMode,
        language: settings.language,
        currency: settings.currency,
        timezone: settings.timezone,
        deposit_limit: settings.depositLimit || null,
        session_limit: settings.sessionLimit ? parseInt(settings.sessionLimit) : null,
        self_exclusion: settings.selfExclusion,
      });
      toast.success("Settings saved successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    // Validate passwords
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      setChangingPassword(true);
      await apiClient.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast.success("Password changed successfully!");
      setPasswordDialogOpen(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleEnable2FA = () => {
    setSettings({ ...settings, twoFactorAuth: !settings.twoFactorAuth });
    toast.success(settings.twoFactorAuth ? "2FA will be disabled on save" : "2FA will be enabled on save");
  };

  const handleSelfExclusion = () => {
    toast.info("Please contact support to request self-exclusion.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Notification Settings */}
      <div className="glass rounded-xl p-4 sm:p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Notification Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-sm">Email Notifications</p>
              <p className="text-xs text-muted-foreground">Receive updates via email</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-sm">Push Notifications</p>
              <p className="text-xs text-muted-foreground">Receive browser push notifications</p>
            </div>
            <Switch
              checked={settings.pushNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-sm">SMS Notifications</p>
              <p className="text-xs text-muted-foreground">Receive important alerts via SMS</p>
            </div>
            <Switch
              checked={settings.smsNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, smsNotifications: checked })}
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-sm">Promotional Emails</p>
              <p className="text-xs text-muted-foreground">Receive bonus offers and promotions</p>
            </div>
            <Switch
              checked={settings.promotionalEmails}
              onCheckedChange={(checked) => setSettings({ ...settings, promotionalEmails: checked })}
            />
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="glass rounded-xl p-4 sm:p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Security Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-sm">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">Add extra security to your account</p>
            </div>
            <Switch
              checked={settings.twoFactorAuth}
              onCheckedChange={handleEnable2FA}
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-sm">Biometric Login</p>
              <p className="text-xs text-muted-foreground">Use fingerprint or face recognition</p>
            </div>
            <Switch
              checked={settings.biometricLogin}
              onCheckedChange={(checked) => setSettings({ ...settings, biometricLogin: checked })}
            />
          </div>
          <div className="pt-4 border-t border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-medium text-sm flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Change Password
                </p>
                <p className="text-xs text-muted-foreground">Update your account password</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setPasswordDialogOpen(true)}>
                Change Password
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="glass rounded-xl p-4 sm:p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Preferences
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Globe className="w-4 h-4" /> Language
            </Label>
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="w-full h-10 px-3 rounded-lg bg-muted border border-border"
            >
              <option value="en">English</option>
              <option value="ne">Nepali</option>
              <option value="hi">Hindi</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <select
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              className="w-full h-10 px-3 rounded-lg bg-muted border border-border"
            >
              <option value="NPR">NPR (₹)</option>
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Timezone</Label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              className="w-full h-10 px-3 rounded-lg bg-muted border border-border"
            >
              <option value="Asia/Kathmandu">Nepal (GMT+5:45)</option>
              <option value="Asia/Kolkata">India (GMT+5:30)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              {settings.darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              Theme
            </Label>
            <div className="flex gap-2">
              <Button
                variant={settings.darkMode ? "default" : "outline"}
                size="sm"
                onClick={() => setSettings({ ...settings, darkMode: true })}
                className="flex-1 gap-2"
              >
                <Moon className="w-4 h-4" /> Dark
              </Button>
              <Button
                variant={!settings.darkMode ? "default" : "outline"}
                size="sm"
                onClick={() => setSettings({ ...settings, darkMode: false })}
                className="flex-1 gap-2"
              >
                <Sun className="w-4 h-4" /> Light
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Responsible Gaming */}
      <div className="glass rounded-xl p-4 sm:p-6 border-accent/30">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-accent" />
          Responsible Gaming
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Set limits to help manage your gaming activity responsibly.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4" /> Daily Deposit Limit
            </Label>
            <Input
              type="number"
              placeholder="e.g., 5000"
              value={settings.depositLimit}
              onChange={(e) => setSettings({ ...settings, depositLimit: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4" /> Session Time Limit (hours)
            </Label>
            <Input
              type="number"
              placeholder="e.g., 4"
              value={settings.sessionLimit}
              onChange={(e) => setSettings({ ...settings, sessionLimit: e.target.value })}
            />
          </div>
        </div>
        <div className="mt-4 p-4 bg-neon-red/10 rounded-lg border border-neon-red/30">
          <div className="flex items-start gap-3">
            <Ban className="w-5 h-5 text-neon-red flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-neon-red">Self-Exclusion</p>
              <p className="text-sm text-muted-foreground mb-3">
                Temporarily or permanently exclude yourself from the platform.
              </p>
              <Button variant="destructive" size="sm" onClick={handleSelfExclusion}>
                Request Self-Exclusion
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <Button 
        variant="neon" 
        size="lg" 
        className="w-full gap-2" 
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Save className="w-5 h-5" />
        )}
        {saving ? "Saving..." : "Save All Settings"}
      </Button>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" /> Change Password
            </DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showPasswords.current ? "text" : "password"}
                  placeholder="Enter current password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPasswords.new ? "text" : "password"}
                  placeholder="Enter new password (min 6 characters)"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showPasswords.confirm ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePasswordChange} disabled={changingPassword}>
              {changingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Changing...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
