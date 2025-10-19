// Updated sections of CreateCampaign.jsx - Fix the main issues

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Save,
  Send,
  Upload,
  AlertCircle,
  Check,
  DollarSign,
  MapPin,
  Building,
  FileText,
  Image as ImageIcon,
  Video,
  Loader,
} from "lucide-react";
import UnifiedNavbar from "../components/layout/Navbars";
import Footer from "../components/layout/Footer";

const CreateCampaign = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Redirect if not authenticated or not a founder
  React.useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    if (user?.userType !== "founder") {
      navigate("/dashboard");
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    targetAmount: "",
    minimumInvestment: "",
    problemStatement: "",
    solution: "",
    businessPlan: "",
    videoUrl: "",
  });

  // UI state - FIXED: Use consistent naming
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); // FIXED: was using both errors and error
  const [success, setSuccess] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Categories
  const categories = [
    "Technology",
    "Healthcare",
    "Education",
    "Finance",
    "Energy & Green Tech",
    "Agriculture",
    "Real Estate",
    "E-commerce",
    "Transportation",
    "Food & Beverages",
    "Other",
  ];

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: "Image must be less than 10MB" }));
      return;
    }

    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        image: "Only JPG and PNG formats allowed",
      }));
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));

    if (errors.image) {
      setErrors((prev) => ({ ...prev, image: null }));
    }
  };

  // Validate form
  const validateForm = (isDraft = false) => {
    const newErrors = {};

    if (!isDraft) {
      // Required fields for submission
      if (!formData.title.trim()) newErrors.title = "Title is required";
      if (!formData.description.trim())
        newErrors.description = "Description is required";
      if (!formData.category) newErrors.category = "Category is required";
      if (!formData.location.trim())
        newErrors.location = "Location is required";
      if (!formData.targetAmount)
        newErrors.targetAmount = "Target amount is required";
      if (!formData.minimumInvestment)
        newErrors.minimumInvestment = "Minimum investment is required";

      // Validate amounts
      if (formData.targetAmount && parseFloat(formData.targetAmount) <= 0) {
        newErrors.targetAmount = "Target amount must be greater than 0";
      }
      if (
        formData.minimumInvestment &&
        parseFloat(formData.minimumInvestment) <= 0
      ) {
        newErrors.minimumInvestment =
          "Minimum investment must be greater than 0";
      }
      if (
        formData.minimumInvestment &&
        formData.targetAmount &&
        parseFloat(formData.minimumInvestment) >
          parseFloat(formData.targetAmount)
      ) {
        newErrors.minimumInvestment =
          "Minimum investment cannot exceed target amount";
      }
    }

    // ENFORCED: Image is required even for drafts
    if (!selectedImage && !imagePreview) {
      newErrors.image =
        "Please upload a campaign image before saving. You can use a placeholder if needed.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // FIXED: Save as draft function
  const saveDraft = async () => {
    try {
      setAutoSaving(true);
      setErrors({}); // FIXED: was setError({})

      // Check if image is required for drafts
      if (!selectedImage && !imagePreview) {
        setErrors({
          image:
            "Please select an image before saving as draft. You can use a placeholder if needed.",
        });
        return;
      }

      const token = localStorage.getItem("authToken");

      console.log("💾 Saving draft with data:", formData);

      const response = await fetch("http://localhost:5000/api/campaigns", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          isDraft: true,
        }),
      });

      const result = await response.json();
      console.log("💾 Draft save response:", result);

      if (response.ok && result.success) {
        const campaignId = result.data.id;

        // Upload image if selected
        if (selectedImage) {
          console.log("📸 Uploading image to draft...");

          const imageFormData = new FormData();
          imageFormData.append("campaignImage", selectedImage);

          const imageResponse = await fetch(
            `http://localhost:5000/api/campaigns/${campaignId}/image`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: imageFormData,
            }
          );

          if (imageResponse.ok) {
            console.log("✅ Draft image uploaded successfully");
          } else {
            console.warn("⚠️ Draft image upload failed");
          }
        }

        setLastSaved(new Date());
        setSuccess("Draft saved successfully");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setErrors({ general: result.message || "Failed to save draft" });
      }
    } catch (error) {
      console.error("❌ Save draft error:", error);
      setErrors({ general: "Failed to save draft: " + error.message });
    } finally {
      setAutoSaving(false);
    }
  };

  // FIXED: Submit for approval function
  const submitCampaign = async () => {
    if (!validateForm(false)) {
      return;
    }

    try {
      setLoading(true);
      setErrors({}); // FIXED: was setError({})

      const token = localStorage.getItem("authToken");

      console.log("📤 Submitting campaign with data:", formData);
      console.log("📸 Selected image:", selectedImage);

      // Create campaign first
      const response = await fetch("http://localhost:5000/api/campaigns", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          isDraft: false,
        }),
      });

      const result = await response.json();
      console.log("📋 Campaign creation response:", result);

      if (response.ok && result.success) {
        const campaignId = result.data.id;
        console.log(`✅ Campaign created with ID: ${campaignId}`);

        // Upload image if selected
        if (selectedImage) {
          console.log("📸 Uploading image...");

          const imageFormData = new FormData();
          imageFormData.append("campaignImage", selectedImage);

          console.log("📤 FormData for image upload created");

          const imageResponse = await fetch(
            `http://localhost:5000/api/campaigns/${campaignId}/image`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: imageFormData,
            }
          );

          const imageResult = await imageResponse.json();
          console.log("📸 Image upload response:", imageResult);

          if (!imageResponse.ok) {
            console.warn("⚠️ Image upload failed:", imageResult.message);
            setSuccess(
              "Campaign submitted for approval successfully! (Image upload had issues)"
            );
          } else {
            console.log("✅ Image uploaded successfully");
            setSuccess("Campaign submitted for approval successfully!");
          }
        } else {
          setSuccess("Campaign submitted for approval successfully!");
        }

        // Navigate after a short delay
        setTimeout(() => {
          navigate("/my-campaigns");
        }, 2000);
      } else {
        console.error("❌ Campaign creation failed:", result);
        setErrors({ general: result.message || "Failed to submit campaign" });
      }
    } catch (error) {
      console.error("❌ Submit campaign error:", error);
      setErrors({ general: "Failed to submit campaign: " + error.message });
    } finally {
      setLoading(false);
    }
  };

  // Format currency display
  const formatCurrency = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedNavbar variant="dashboard" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-700 to-green-900 rounded-xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Campaign</h1>
          <p className="text-green-100">
            Share your vision with potential investors. Fill out the form below
            to create your campaign.
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-700">
            <Check className="h-5 w-5 mr-2" />
            {success}
          </div>
        )}

        {/* General Error */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
            <AlertCircle className="h-5 w-5 mr-2" />
            {errors.general}
          </div>
        )}

        {/* Auto-save Status */}
        <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              {autoSaving ? (
                <>
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                  Auto-saving...
                </>
              ) : lastSaved ? (
                <>
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  Last saved: {lastSaved.toLocaleTimeString()}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Ready to save
                </>
              )}
            </div>
            {/* REMOVED: Save Draft button from here - only show status */}
            <div className="text-xs text-gray-500">
              {selectedImage ? "✅ Image selected" : "⚠️ Image required"}
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <form className="space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.title ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter a compelling title for your campaign"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.category ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.category}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.location ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="e.g., Lagos, Nigeria"
                    />
                  </div>
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.location}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.description ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Describe your project and what makes it unique..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Financial Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Amount (NGN) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="targetAmount"
                    value={formData.targetAmount}
                    onChange={handleInputChange}
                    min="0"
                    step="1000"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.targetAmount ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="e.g., 5000000"
                  />
                  {formData.targetAmount && (
                    <p className="mt-1 text-sm text-gray-600">
                      {formatCurrency(formData.targetAmount)}
                    </p>
                  )}
                  {errors.targetAmount && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.targetAmount}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Investment (NGN){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="minimumInvestment"
                    value={formData.minimumInvestment}
                    onChange={handleInputChange}
                    min="0"
                    step="1000"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.minimumInvestment
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="e.g., 50000"
                  />
                  {formData.minimumInvestment && (
                    <p className="mt-1 text-sm text-gray-600">
                      {formatCurrency(formData.minimumInvestment)}
                    </p>
                  )}
                  {errors.minimumInvestment && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.minimumInvestment}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Project Details
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Problem Statement
                  </label>
                  <textarea
                    name="problemStatement"
                    value={formData.problemStatement}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="What problem does your project solve? Include market research and user pain points..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Solution
                  </label>
                  <textarea
                    name="solution"
                    value={formData.solution}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="How does your project solve the problem? Explain your approach and competitive advantages..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Plan (Optional)
                  </label>
                  <textarea
                    name="businessPlan"
                    value={formData.businessPlan}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Provide details about your business model, market strategy, financial projections, and growth plans..."
                  />
                </div>
              </div>
            </div>

            {/* Media */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <ImageIcon className="h-5 w-5 mr-2" />
                Media
              </h2>

              <div className="space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Image <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Campaign preview"
                          className="max-h-64 mx-auto rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview(null);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-4">
                          <label className="cursor-pointer">
                            <span className="mt-2 block text-sm font-medium text-gray-900">
                              Upload campaign image
                            </span>
                            <span className="mt-1 block text-sm text-gray-500">
                              PNG, JPG up to 10MB
                            </span>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleImageSelect}
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.image && (
                    <p className="mt-1 text-sm text-red-500">{errors.image}</p>
                  )}
                </div>

                {/* Video URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video URL (Optional)
                  </label>
                  <div className="relative">
                    <Video className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="url"
                      name="videoUrl"
                      value={formData.videoUrl}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Add a YouTube or Vimeo video to showcase your project
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t pt-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={saveDraft}
                    disabled={autoSaving}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    Save as Draft
                  </button>

                  <button
                    type="button"
                    onClick={submitCampaign}
                    disabled={loading}
                    className="px-8 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <Loader className="h-5 w-5 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Submit for Approval
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-4 text-sm text-red-600 text-center">
                <p>
                  Submitted campaigns will be reviewed by our admin team before
                  appearing on the platform.
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CreateCampaign;
