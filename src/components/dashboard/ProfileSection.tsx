import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import apiClient from "@/lib/api";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Camera,
  Save,
  Shield,
  Check,
  AlertCircle,
  FileText,
  Upload,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  city: string;
  country: string;
  avatar: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isKycVerified: boolean;
  kycRejectReason: string;
}

interface KYCStatus {
  is_verified: boolean;
  kyc_document: any;
  reject_reason: string;
  status: string;
}

export function ProfileSection() {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  const [kycDialogOpen, setKycDialogOpen] = useState(false);
  const [kycUploading, setKycUploading] = useState(false);
  const [kycForm, setKycForm] = useState({
    document_type: "passport",
    document_number: "",
    document_url: "",
  });
  const [profile, setProfile] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    address: "",
    city: "",
    country: "",
    avatar: "",
    isEmailVerified: false,
    isPhoneVerified: false,
    isKycVerified: false,
    kycRejectReason: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch KYC status
        const kycData = await apiClient.getKYCStatus();
        setKycStatus(kycData);

        // Parse user data from context
        if (user) {
          const nameParts = (user.full_name || user.username || '').split(' ');
          setProfile({
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            email: user.email || '',
            phone: '',  // Will need to be fetched from user details
            dob: '',
            address: '',
            city: '',
            country: '',
            avatar: '',
            isEmailVerified: true, // Assume verified if logged in
            isPhoneVerified: false,
            isKycVerified: kycData.is_verified,
            kycRejectReason: kycData.reject_reason || '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      await apiClient.updateUser(user.id, {
        name: `${profile.firstName} ${profile.lastName}`.trim(),
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        country: profile.country,
      });
      
      await refreshUser();
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = () => {
    toast.info("Avatar upload feature coming soon!");
  };

  const handleKYCUpload = () => {
    setKycDialogOpen(true);
  };

  const submitKYCUpload = async () => {
    if (!kycForm.document_type || !kycForm.document_number) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setKycUploading(true);
      await apiClient.uploadKYC({
        document_type: kycForm.document_type,
        document_number: kycForm.document_number,
        document_url: kycForm.document_url || `${kycForm.document_type}_${Date.now()}`,
      });
      toast.success("KYC documents submitted successfully! Verification pending.");
      setKycDialogOpen(false);
      setKycForm({ document_type: "passport", document_number: "", document_url: "" });
      
      // Refresh KYC status
      const kycData = await apiClient.getKYCStatus();
      setKycStatus(kycData);
      setProfile(prev => ({ ...prev, isKycVerified: kycData.is_verified }));
    } catch (error: any) {
      toast.error(error.message || "Failed to submit KYC documents");
    } finally {
      setKycUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const initials = `${profile.firstName[0] || ''}${profile.lastName[0] || ''}`.toUpperCase() || 'U';

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Profile Header */}
      <div className="glass rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl sm:text-3xl font-bold text-primary-foreground">
              {initials}
            </div>
            <button
              onClick={handleAvatarUpload}
              className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-background"
            >
              <Camera className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-xl sm:text-2xl font-bold">{profile.firstName} {profile.lastName}</h2>
            <p className="text-muted-foreground">{profile.email}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
              <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                profile.isEmailVerified ? "bg-neon-green/10 text-neon-green" : "bg-muted text-muted-foreground"
              }`}>
                {profile.isEmailVerified ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                Email
              </span>
              <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                profile.isPhoneVerified ? "bg-neon-green/10 text-neon-green" : "bg-accent/10 text-accent"
              }`}>
                {profile.isPhoneVerified ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                Phone
              </span>
              <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                profile.isKycVerified ? "bg-neon-green/10 text-neon-green" : "bg-accent/10 text-accent"
              }`}>
                {profile.isKycVerified ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                KYC
              </span>
            </div>
          </div>
          <Button
            variant={isEditing ? "neon" : "outline"}
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className="gap-2"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : isEditing ? (
              <>
                <Save className="w-4 h-4" /> Save Changes
              </>
            ) : (
              <>
                <User className="w-4 h-4" /> Edit Profile
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Personal Information */}
      <div className="glass rounded-xl p-4 sm:p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Personal Information
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={profile.firstName}
              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={profile.lastName}
              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email
              {profile.isEmailVerified && <Check className="w-3 h-3 text-neon-green" />}
            </Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              disabled={true} // Email should not be editable
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" /> Phone
              {!profile.isPhoneVerified && isEditing && (
                <button 
                  onClick={() => toast.info("Phone verification will be sent via SMS after saving.")}
                  className="text-xs text-primary hover:underline"
                >
                  Verify
                </button>
              )}
            </Label>
            <Input
              id="phone"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              disabled={!isEditing}
              placeholder="+91 98765 43210"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Date of Birth
            </Label>
            <Input
              id="dob"
              type="date"
              value={profile.dob}
              onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="glass rounded-xl p-4 sm:p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Address Information
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              disabled={!isEditing}
              placeholder="Enter your street address"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={profile.city}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
              disabled={!isEditing}
              placeholder="Enter your city"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={profile.country}
              onChange={(e) => setProfile({ ...profile, country: e.target.value })}
              disabled={!isEditing}
              placeholder="Enter your country"
            />
          </div>
        </div>
      </div>

      {/* KYC Verification */}
      <div className="glass rounded-xl p-4 sm:p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          KYC Verification
        </h3>
        {profile.isKycVerified ? (
          <div className="flex items-center gap-3 p-4 bg-neon-green/10 rounded-lg border border-neon-green/30">
            <Check className="w-6 h-6 text-neon-green" />
            <div>
              <p className="font-medium text-neon-green">Verified</p>
              <p className="text-sm text-muted-foreground">Your identity has been verified</p>
            </div>
          </div>
        ) : profile.kycRejectReason ? (
          <div className="space-y-4">
            <div className="p-4 bg-neon-red/10 rounded-lg border border-neon-red/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-neon-red flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-neon-red">Verification Rejected</p>
                  <p className="text-sm text-muted-foreground">
                    {profile.kycRejectReason}
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={handleKYCUpload} className="gap-2">
              <Upload className="w-4 h-4" /> Re-submit Documents
            </Button>
          </div>
        ) : kycStatus?.kyc_document && Object.keys(kycStatus.kyc_document).length > 0 ? (
          <div className="flex items-center gap-3 p-4 bg-accent/10 rounded-lg border border-accent/30">
            <AlertCircle className="w-6 h-6 text-accent" />
            <div>
              <p className="font-medium">Verification Pending</p>
              <p className="text-sm text-muted-foreground">Your documents are being reviewed. This usually takes 1-2 business days.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-accent/10 rounded-lg border border-accent/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Verification Required</p>
                  <p className="text-sm text-muted-foreground">
                    Complete KYC to unlock higher withdrawal limits and exclusive features.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 border border-dashed border-border rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Government ID</p>
                    <p className="text-xs text-muted-foreground">Passport, License, or National ID</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full gap-2" onClick={handleKYCUpload}>
                  <Upload className="w-4 h-4" /> Upload Document
                </Button>
              </div>
              <div className="p-4 border border-dashed border-border rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <Camera className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Selfie with ID</p>
                    <p className="text-xs text-muted-foreground">Hold your ID next to your face</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full gap-2" onClick={handleKYCUpload}>
                  <Camera className="w-4 h-4" /> Take Photo
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KYC Upload Dialog */}
      <Dialog open={kycDialogOpen} onOpenChange={setKycDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" /> KYC Verification
            </DialogTitle>
            <DialogDescription>
              Submit your identity documents for verification.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="document_type">Document Type</Label>
              <select
                id="document_type"
                value={kycForm.document_type}
                onChange={(e) => setKycForm({ ...kycForm, document_type: e.target.value })}
                className="w-full h-10 px-3 rounded-lg bg-muted border border-border"
              >
                <option value="passport">Passport</option>
                <option value="drivers_license">Driver's License</option>
                <option value="national_id">National ID Card</option>
                <option value="voter_id">Voter ID</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="document_number">Document Number</Label>
              <Input
                id="document_number"
                placeholder="Enter your document number"
                value={kycForm.document_number}
                onChange={(e) => setKycForm({ ...kycForm, document_number: e.target.value })}
              />
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
              <p className="font-medium mb-2">Requirements:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Document must be valid and not expired</li>
                <li>All information must be clearly visible</li>
                <li>Document must show your full name and photo</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setKycDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitKYCUpload} disabled={kycUploading}>
              {kycUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Submit for Verification
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
