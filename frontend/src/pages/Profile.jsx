import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UnifiedNavbar from "../components/layout/Navbars";
import Footer from "../components/layout/Footer";
import { buildApiUrl, buildImageUrl } from '../config/apiUrl';
import toast from 'react-hot-toast';

import {
  User,
  Mail,
  Phone,
  Globe,
  Building,
  Shield,
  Lock,
  Save,
  Upload,
  Eye,
  EyeOff,
  Camera,
  Trash2,
  CreditCard,
  MapPin,
  CheckCircle,
  XCircle,
} from "lucide-react";

// ── Password strength helpers ────────────────────────────────────────────────
const passwordStrength = (pw) => {
  const checks = {
    length:    pw.length >= 8,
    uppercase: /[A-Z]/.test(pw),
    lowercase: /[a-z]/.test(pw),
    number:    /\d/.test(pw),
    special:   /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw),
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { checks, score };
};

const StrengthBar = ({ score }) => {
  const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'];
  const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1,2,3,4,5].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= score ? colors[score-1] : 'bg-gray-200'}`} />
        ))}
      </div>
      {score > 0 && <p className={`text-xs ${score < 3 ? 'text-red-500' : score < 5 ? 'text-yellow-600' : 'text-green-600'}`}>{labels[score-1]}</p>}
    </div>
  );
};

const Profile = () => {
  const { user, updateUserContext, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Profile data state
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    companyName: "",
    userType: "",
    bvn: "",
    cacNumber: "",
    accountNumber: "",
    bankName: "",
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Email change state
  const [emailData, setEmailData] = useState({
    newEmail: "",
    currentPassword: "",
  });

  // UI state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEmailPassword, setShowEmailPassword] = useState(false);

  // Status states
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Image state
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);

  // Load user data on mount
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    fetchUserProfile();
  }, [isAuthenticated, navigate]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("authToken");
      const response = await fetch(buildApiUrl('/users/profile'), {
          headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        const userData = result.data;

        console.log("Fetched user data:", userData);
        console.log("Raw profileImageUrl:", userData.profileImageUrl);

        setProfileData({
          fullName: userData.fullName || "",
          email: userData.email || "",
          phoneNumber: userData.phoneNumber || "",
          address: userData.address || "",
          companyName: userData.companyName || "",
          userType: userData.userType || "",
          bvn: userData.bvn || "",
          cacNumber: userData.cacNumber || "",
          accountNumber: userData.accountNumber || "",
          bankName: userData.bankName || "",
        });

        // Handle profile image URL
        if (userData.profileImageUrl) {
          let imageUrl;

          if (userData.profileImageUrl.startsWith("http")) {
            imageUrl = userData.profileImageUrl;
          } else if (userData.profileImageUrl.startsWith("/uploads")) {
            imageUrl = buildImageUrl(userData.profileImageUrl);
          } else {
            imageUrl = buildImageUrl(`/uploads/profiles/${userData.profileImageUrl}`);
}
          console.log("Constructed image URL:", imageUrl);

          // Test if the image actually loads
          const img = new Image();
          img.onload = () => {
            console.log("✅ Image verified, setting preview");
            setImagePreview(imageUrl);
          };
          img.onerror = () => {
            console.error("❌ Image failed to load, clearing preview");
            setImagePreview(null);
          };
          img.src = imageUrl;
        } else {
          console.log("No profile image URL found");
          setImagePreview(null);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setErrors({ fetch: "Failed to load profile data" });
    } finally {
      setLoading(false);
    }
  };

  // Handle profile form changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Handle password form changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Handle email form changes
  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log("Selected file:", file);

    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: "Image must be less than 5MB" }));
      return;
    }

    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        image: "Only JPG and PNG formats are allowed",
      }));
      return;
    }

    setProfileImage(file);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    console.log("Created preview URL:", previewUrl);
    setImagePreview(previewUrl);

    if (errors.image) {
      setErrors((prev) => ({ ...prev, image: null }));
    }
  };

  // Upload profile image
  const uploadProfileImage = async () => {
    if (!profileImage) return;

    try {
      setImageUploading(true);
      setErrors((prev) => ({ ...prev, image: null }));

      console.log("🚀 Starting upload for:", profileImage.name);

      const formData = new FormData();
      formData.append("profileImage", profileImage);

      const token = localStorage.getItem("authToken");
      const response = await fetch(
          buildApiUrl('/users/profile-image'),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();
      console.log("📡 Upload response:", result);

      if (response.ok && result.success) {
        const newImageUrl = buildImageUrl(result.data.profileImageUrl);
        console.log("🎯 New image URL:", newImageUrl);

        // Update local preview
        setImagePreview(newImageUrl);
        setProfileImage(null);

        // *** CRITICAL: Update user context with new data ***
        if (result.data.user) {
          console.log("🔄 Updating user context with:", result.data.user);
          await updateUserContext({ ...result.data.user, profileImageTimestamp: Date.now() });
        }

        toast.success("Profile image updated!");

        // *** FORCE REFRESH TO VERIFY PERSISTENCE ***
        console.log("🔄 Refreshing profile data to verify save...");
        setTimeout(() => {
          fetchUserProfile();
        }, 1000);
      } else {
        console.error("❌ Upload failed:", result);
        toast.error(result.message || "Upload failed");
        setErrors((prev) => ({ ...prev, image: result.message || "Upload failed" }));
      }
    } catch (error) {
      console.error("❌ Upload error:", error);
      setErrors((prev) => ({ ...prev, image: "Failed to upload image" }));
    } finally {
      setImageUploading(false);
    }
  };

  const isFounder = user?.userType?.toLowerCase() === "founder";

  useEffect(() => {
    if (user && user.profileImageUrl && !imagePreview) {
      const imageUrl = buildImageUrl(user.profileImageUrl);
      console.log("Syncing profile image from context:", imageUrl);
      setImagePreview(imageUrl);
    }
  }, [user, user?.profileImageUrl]);

  useEffect(() => {
    console.log("=== IMAGE DEBUG ===");
    console.log("imagePreview:", imagePreview);
    console.log("user.profileImageUrl:", user?.profileImageUrl);
    console.log("profileData.profileImageUrl:", profileData.profileImageUrl);
    console.log("==================");
  }, [imagePreview, user?.profileImageUrl, profileData.profileImageUrl]);

  // Add this function to test image URLs
  const testImageUrl = (url) => {
    console.log("Testing image URL:", url);
    const img = new Image();
    img.onload = () => console.log("✅ Image loads successfully:", url);
    img.onerror = () => console.error("❌ Image failed to load:", url);
    img.src = url;
  };

  // Delete profile image
  const deleteProfileImage = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        buildApiUrl('/users/profile-image'),
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();
      console.log("Delete response:", result);

      if (response.ok && result.success) {
        setImagePreview(null);
        setProfileImage(null);
        await updateUserContext({ profileImageUrl: null, profileImageTimestamp: Date.now() });
        toast.success("Profile image removed.");
      } else {
        toast.error(result.message || "Failed to delete image");
        setErrors((prev) => ({
          ...prev,
          image: result.message || "Failed to delete image",
        }));
      }
    } catch (error) {
      console.error("Delete error:", error);
      setErrors((prev) => ({ ...prev, image: "Failed to delete image" }));
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setErrors({});

      const token = localStorage.getItem("authToken");
      buildApiUrl('/users/profile-image'), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      };

      const result = await response.json();

      if (response.ok) {
        await updateUserContext(result.data);
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      } else {
        if (result.errors) {
          const errorObj = {};
          result.errors.forEach((error) => {
            errorObj.general = error;
          });
          setErrors(errorObj);
          toast.error(result.errors[0] || "Failed to update profile");
        } else {
          setErrors({ general: result.message });
          toast.error(result.message || "Failed to update profile");
        }
      }
    } catch (error) {
      setErrors({ general: "Failed to update profile" });
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Handle password update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    const { score } = passwordStrength(passwordData.newPassword);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    if (score < 4) {
      toast.error("New password is too weak. Please meet all requirements.");
      setErrors({ password: "New password is too weak. Please meet all requirements." });
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const token = localStorage.getItem("authToken");
      const response = await fetch(buildApiUrl('/users/password'), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Password updated successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setErrors({ password: result.message });
        toast.error(result.message || "Failed to update password");
      }
    } catch (error) {
      setErrors({ password: "Failed to update password" });
      toast.error("Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  // Handle email update
  const handleEmailUpdate = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setErrors({});

      const token = localStorage.getItem("authToken");
      const response = await fetch(buildApiUrl('/users/email'), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Email updated successfully! Please verify your new email address.");
        setEmailData({ newEmail: "", currentPassword: "" });
        // Refresh profile data
        await fetchUserProfile();
      } else {
        setErrors({ email: result.message });
        toast.error(result.message || "Failed to update email");
      }
    } catch (error) {
      setErrors({ email: "Failed to update email" });
      toast.error("Failed to update email");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profileData.email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-700 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedNavbar variant="profile" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Profile Settings
        </h1>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {["profile", "security", "account"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === "security" && " & Password"}
                {tab === "account" && " & Email"}
              </button>
            ))}
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              {/* Profile Image Section */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                    {imagePreview ? (
                      <>
                        <img
                          src={imagePreview}
                          alt="Profile"
                          className="h-full w-full object-cover"
                          style={{ display: "block" }}
                          onLoad={(e) => {
                            console.log("✅ Image loaded in UI:", imagePreview);
                            e.target.style.display = "block";
                            e.target.nextElementSibling.style.display = "none";
                          }}
                          onError={(e) => {
                            console.error(
                              "❌ Image failed in UI:",
                              imagePreview
                            );
                            e.target.style.display = "none";
                            e.target.nextElementSibling.style.display = "flex";
                          }}
                        />
                        {/* Hidden fallback that shows if image fails */}
                        <span
                          className="text-4xl font-medium text-gray-500 absolute inset-0 flex items-center justify-center"
                          style={{ display: "none" }}
                        >
                          {profileData.fullName?.charAt(0)?.toUpperCase() ||
                            "U"}
                        </span>
                      </>
                    ) : (
                      <span className="text-4xl font-medium text-gray-500">
                        {profileData.fullName?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="absolute bottom-0 right-0 flex space-x-1">
                    <label className="bg-green-700 text-white p-2 rounded-full cursor-pointer hover:bg-green-800 transition-colors shadow-md">
                      <Camera className="h-4 w-4" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={handleImageSelect}
                      />
                    </label>

                    {imagePreview && (
                      <button
                        onClick={deleteProfileImage}
                        className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors shadow-md"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Upload button for selected image */}
                {profileImage && (
                  <button
                    onClick={uploadProfileImage}
                    disabled={imageUploading}
                    className="mb-4 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:opacity-50 flex items-center"
                  >
                    {imageUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                      </>
                    )}
                  </button>
                )}

                {errors.image && (
                  <p className="text-sm text-red-500 mb-2 text-center">
                    {errors.image}
                  </p>
                )}

                <h2 className="text-xl font-bold text-gray-900">
                  {profileData.fullName}
                </h2>
                <p className="text-gray-500 mb-2">{profileData.email}</p>

                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 mb-4">
                  {profileData.userType === "founder"
                    ? "Founder"
                    : profileData.userType === "investor"
                    ? "Investor"
                    : profileData.userType === "admin"
                    ? "Admin"
                    : "User"}
                </div>
              </div>

              {/* Account Info */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-medium text-gray-900 mb-4">
                  Account Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600">
                      Member since{" "}
                      {new Date(
                        user?.createdAt || Date.now()
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600">{profileData.email}</span>
                  </div>
                  {profileData.phoneNumber && (
                    <div className="flex items-center text-sm">
                      <Phone className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-600">
                        {profileData.phoneNumber}
                      </span>
                    </div>
                  )}
                  {profileData.address && (
                    <div className="flex items-center text-sm">
                      <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-600">
                        {profileData.address}
                      </span>
                    </div>
                  )}
                  {profileData.companyName && (
                    <div className="flex items-center text-sm">
                      <Building className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-600">
                        {profileData.companyName}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Personal Information
                  </h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <form onSubmit={handleProfileUpdate}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Basic Information */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={profileData.fullName}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
                        placeholder="Your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        User Type
                      </label>
                      <select
                        name="userType"
                        value={profileData.userType}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
                      >
                        <option value="">Select type</option>
                        <option value="founder">Founder</option>
                        <option value="investor">Investor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={profileData.phoneNumber}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
                        placeholder="Your phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={profileData.companyName}
                        onChange={handleProfileChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
                        placeholder="Your company name"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={profileData.address}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
                      placeholder="Your full address"
                    />
                  </div>

                  {/* Financial Information - Only show if not 'admin' user type */}
                  {profileData.userType !== "admin" && (
                    <div className="border-t border-gray-200 pt-6 mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <CreditCard className="h-5 w-5 mr-2" />
                        Financial Information
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            BVN (Bank Verification Number)
                          </label>
                          <input
                            type="text"
                            name="bvn"
                            value={profileData.bvn}
                            onChange={handleProfileChange}
                            disabled={!isEditing}
                            maxLength="11"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
                            placeholder="11-digit BVN"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            CAC Registration Number
                          </label>
                          <input
                            type="text"
                            name="cacNumber"
                            value={profileData.cacNumber}
                            onChange={handleProfileChange}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
                            placeholder="CAC registration number"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bank Name
                          </label>
                          <select
                            name="bankName"
                            value={profileData.bankName}
                            onChange={handleProfileChange}
                            disabled={!isEditing}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
                          >
                            <option value="">Select your bank</option>
                            <option value="Access Bank">Access Bank</option>
                            <option value="GT Bank">GT Bank</option>
                            <option value="First Bank">First Bank</option>
                            <option value="Zenith Bank">Zenith Bank</option>
                            <option value="UBA">UBA</option>
                            <option value="Fidelity Bank">Fidelity Bank</option>
                            <option value="FCMB">FCMB</option>
                            <option value="Sterling Bank">Sterling Bank</option>
                            <option value="Stanbic IBTC">Stanbic IBTC</option>
                            <option value="Union Bank">Union Bank</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Account Number
                          </label>
                          <input
                            type="text"
                            name="accountNumber"
                            value={profileData.accountNumber}
                            onChange={handleProfileChange}
                            disabled={!isEditing}
                            maxLength="10"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
                            placeholder="10-digit account number"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {isEditing && (
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 flex items-center"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-5 w-5 mr-2" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Security & Password
                </h2>

                <form onSubmit={handlePasswordUpdate}>
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {passwordData.newPassword && (() => {
                        const { checks, score } = passwordStrength(passwordData.newPassword);
                        return (
                          <>
                            <StrengthBar score={score} />
                            <ul className="mt-2 space-y-1">
                              {[
                                { key: 'length',    label: 'At least 8 characters' },
                                { key: 'uppercase', label: 'One uppercase letter' },
                                { key: 'lowercase', label: 'One lowercase letter' },
                                { key: 'number',    label: 'One number' },
                                { key: 'special',   label: 'One special character (!@#$…)' },
                              ].map(({ key, label }) => (
                                <li key={key} className={`flex items-center gap-1.5 text-xs ${checks[key] ? 'text-green-600' : 'text-gray-400'}`}>
                                  {checks[key] ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                                  {label}
                                </li>
                              ))}
                            </ul>
                          </>
                        );
                      })()}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                            errors.confirmPassword ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword && (
                        <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Passwords match
                        </p>
                      )}
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">

                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 flex items-center"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Lock className="h-5 w-5 mr-2" />
                          Update Password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === "account" && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Account & Email Settings
                </h2>

                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Current Email
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {profileData.email}
                      </p>
                      <p className="text-sm text-gray-500">
                        {user?.isVerified ? (
                          <span className="flex items-center text-green-600">
                            <Check className="h-4 w-4 mr-1" />
                            Verified
                          </span>
                        ) : (
                          <span className="flex items-center text-yellow-600">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Not verified
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleEmailUpdate}>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Change Email Address
                  </h3>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Email Address{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="newEmail"
                        value={emailData.newEmail}
                        onChange={handleEmailChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter new email address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showEmailPassword ? "text" : "password"}
                          name="currentPassword"
                          value={emailData.currentPassword}
                          onChange={handleEmailChange}
                          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          onClick={() =>
                            setShowEmailPassword(!showEmailPassword)
                          }
                        >
                          {showEmailPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">
                          Important Notice
                        </h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Changing your email address will require verification
                          of your new email. You'll need to verify the new email
                          before it becomes active.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 flex items-center"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Mail className="h-5 w-5 mr-2" />
                          Update Email
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
