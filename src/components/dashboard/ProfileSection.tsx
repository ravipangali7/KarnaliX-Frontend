import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  X,
} from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api";

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
  isKycPending?: boolean;
}

const defaultProfile: UserProfile = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dob: "",
  address: "",
  city: "Kathmandu",
  country: "Nepal",
  avatar: "",
  isEmailVerified: false,
  isPhoneVerified: false,
  isKycVerified: false,
  isKycPending: false,
};

const KYC_DOCUMENT_TYPES = [
  { value: "ID", label: "National ID" },
  { value: "PASSPORT", label: "Passport" },
  { value: "LICENSE", label: "Driving License" },
] as const;

export function ProfileSection() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [showKycForm, setShowKycForm] = useState(false);
  const [kycSubmitting, setKycSubmitting] = useState(false);
  const [kycDocumentType, setKycDocumentType] = useState<string>("ID");
  const [kycDocumentNumber, setKycDocumentNumber] = useState("");
  const [kycFrontFile, setKycFrontFile] = useState<File | null>(null);
  const [kycBackFile, setKycBackFile] = useState<File | null>(null);
  const kycFrontInputRef = useRef<HTMLInputElement>(null);
  const kycBackInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiClient.getUserProfile();
        if (cancelled) return;
        const name = (data.username || "").trim();
        const parts = name.split(/\s+/);
        setProfile((prev) => ({
          ...prev,
          firstName: parts[0] || "",
          lastName: parts.slice(1).join(" ") || "",
          email: data.email || "",
          phone: data.phone || "",
          isKycVerified: Boolean(data.is_kyc_verified),
          isKycPending: Boolean(data.is_kyc_pending),
        }));
      } catch {
        if (!cancelled) setProfile(defaultProfile);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.updateUserProfile({ email: profile.email, phone: profile.phone });
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = () => {
    toast.info("Avatar upload feature coming soon!");
  };

  const refetchProfile = async () => {
    try {
      const data = await apiClient.getUserProfile();
      const name = (data.username || "").trim();
      const parts = name.split(/\s+/);
      setProfile((prev) => ({
        ...prev,
        firstName: parts[0] || "",
        lastName: parts.slice(1).join(" ") || "",
        email: data.email || "",
        phone: data.phone || "",
        isKycVerified: Boolean(data.is_kyc_verified),
        isKycPending: Boolean(data.is_kyc_pending),
      }));
    } catch {
      // keep current state
    }
  };

  const handleKycSubmit = async () => {
    if (!kycDocumentNumber.trim()) {
      toast.error("Please enter your document number.");
      return;
    }
    if (!kycFrontFile) {
      toast.error("Please upload the front of your document.");
      return;
    }
    setKycSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("document_type", kycDocumentType);
      formData.append("document_number", kycDocumentNumber.trim());
      formData.append("document_front", kycFrontFile);
      if (kycBackFile) formData.append("document_back", kycBackFile);
      await apiClient.submitUserKyc(formData);
      toast.success("KYC documents submitted. We will review them shortly.");
      setShowKycForm(false);
      setKycDocumentNumber("");
      setKycFrontFile(null);
      setKycBackFile(null);
      if (kycFrontInputRef.current) kycFrontInputRef.current.value = "";
      if (kycBackInputRef.current) kycBackInputRef.current.value = "";
      await refetchProfile();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to submit KYC");
    } finally {
      setKycSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-muted-foreground p-4">Loading profile...</div>;
  }

  const initials = (profile.firstName[0] || "") + (profile.lastName[0] || "") || (profile.email[0] || "?").toUpperCase();

  return (
    <div className="space-y-4 sm:space-y-6">
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
            disabled={saving}
            className="gap-2"
          >
            {isEditing ? (
              <><Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}</>
            ) : (
              <><User className="w-4 h-4" /> Edit Profile</>
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
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4" /> Phone
              {!profile.isPhoneVerified && (
                <button className="text-xs text-primary hover:underline">Verify</button>
              )}
            </Label>
            <Input
              id="phone"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              disabled={!isEditing}
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={profile.city}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={profile.country}
              onChange={(e) => setProfile({ ...profile, country: e.target.value })}
              disabled={!isEditing}
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
        ) : profile.isKycPending ? (
          <div className="flex items-center gap-3 p-4 bg-accent/10 rounded-lg border border-accent/30">
            <AlertCircle className="w-6 h-6 text-accent flex-shrink-0" />
            <div>
              <p className="font-medium">Pending Review</p>
              <p className="text-sm text-muted-foreground">Your KYC documents are under review. We will notify you once verified.</p>
            </div>
          </div>
        ) : showKycForm ? (
          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg border border-border space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">Submit KYC Documents</p>
                <Button variant="ghost" size="sm" onClick={() => { setShowKycForm(false); setKycFrontFile(null); setKycBackFile(null); }}><X className="w-4 h-4" /></Button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Document Type</Label>
                  <Select value={kycDocumentType} onValueChange={setKycDocumentType}>
                    <SelectTrigger className="bg-background"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {KYC_DOCUMENT_TYPES.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Document Number</Label>
                  <Input value={kycDocumentNumber} onChange={(e) => setKycDocumentNumber(e.target.value)} placeholder="e.g. passport number" className="bg-background" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Front of Document (required)</Label>
                  <input ref={kycFrontInputRef} type="file" accept="image/*" className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary file:text-primary-foreground" onChange={(e) => setKycFrontFile(e.target.files?.[0] ?? null)} />
                </div>
                <div className="space-y-2">
                  <Label>Back of Document (optional)</Label>
                  <input ref={kycBackInputRef} type="file" accept="image/*" className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary file:text-primary-foreground" onChange={(e) => setKycBackFile(e.target.files?.[0] ?? null)} />
                </div>
              </div>
              <Button onClick={handleKycSubmit} disabled={kycSubmitting} className="gap-2">
                {kycSubmitting ? "Submitting…" : "Submit KYC"}
              </Button>
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
                <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => setShowKycForm(true)}>
                  <Upload className="w-4 h-4" /> Upload Document
                </Button>
              </div>
              <div className="p-4 border border-dashed border-border rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <Camera className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Selfie with ID</p>
                    <p className="text-xs text-muted-foreground">Upload front/back; selfie can be added later if required.</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => setShowKycForm(true)}>
                  <Camera className="w-4 h-4" /> Take Photo / Upload
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
