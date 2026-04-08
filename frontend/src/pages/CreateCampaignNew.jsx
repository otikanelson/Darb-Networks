import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { buildApiUrl } from '../config/apiUrl';
import RichTextEditor from '../components/ui/RichTextEditor';
import {
  Save, Send, Upload, AlertCircle, Check, DollarSign, MapPin,
  Building, FileText, Image as ImageIcon, Video, Loader,
  ChevronRight, ChevronLeft, Plus, X, Users, Target
} from "lucide-react";
import UnifiedNavbar from "../components/layout/Navbars";
import Footer from "../components/layout/Footer";

const CreateCampaignNew = () => {
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

  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

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

  // Milestones state
  const [milestones, setMilestones] = useState([]);

  // Collaborators state
  const [collaborators, setCollaborators] = useState([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Categories
  const categories = [
    "Technology", "Healthcare", "Education", "Finance",
    "Energy & Green Tech", "Agriculture", "Real Estate",
    "E-commerce", "Transportation", "Food & Beverages", "Other"
  ];

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Handle rich text changes
  const handleRichTextChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: "Image must be less than 10MB" }));
      return;
    }

    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      setErrors((prev) => ({ ...prev, image: "Only JPG and PNG formats allowed" }));
      return;
    }

    setSelectedImage(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setErrors((prev) => ({ ...prev, image: null }));
  };

  // Milestone functions
  const addMilestone = () => {
    setMilestones([...milestones, {
      title: "",
      description: "",
      targetAmount: "",
      videoUrl: "",
      imageUrl: ""
    }]);
  };

  const removeMilestone = (index) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const updateMilestone = (index, field, value) => {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);
  };

  // Collaborator functions
  const addCollaborator = () => {
    setCollaborators([...collaborators, {
      name: "",
      role: "",
      description: "",
      email: "",
      phoneNumber: ""
    }]);
  };

  const removeCollaborator = (index) => {
    setCollaborators(collaborators.filter((_, i) => i !== index));
  };

  const updateCollaborator = (index, field, value) => {
    const updated = [...collaborators];
    updated[index][field] = value;
    setCollaborators(updated);
  };

  // Step navigation
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(Math.min(currentStep + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(Math.max(currentStep - 1, 1));
  };

  const skipStep = () => {
    setCurrentStep(Math.min(currentStep + 1, totalSteps));
  };

  // Validation
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.title) newErrors.title = "Title is required";
      if (!formData.category) newErrors.category = "Category is required";
      if (!formData.location) newErrors.location = "Location is required";
    }

    if (step === 2) {
      if (!formData.targetAmount) newErrors.targetAmount = "Target amount is required";
      if (!formData.minimumInvestment) newErrors.minimumInvestment = "Minimum investment is required";
      if (parseFloat(formData.minimumInvestment) > parseFloat(formData.targetAmount)) {
        newErrors.minimumInvestment = "Cannot exceed target amount";
      }
    }

    if (step === 3) {
      if (!formData.description) newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit campaign
  const handleSubmit = async (isDraft = false) => {
    if (!isDraft && !validateStep(currentStep)) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const formDataToSend = new FormData();
      
      // Basic fields
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      // Image
      if (selectedImage) {
        formDataToSend.append("mainImage", selectedImage);
      }

      // Milestones
      formDataToSend.append("milestones", JSON.stringify(milestones));

      // Collaborators
      formDataToSend.append("collaborators", JSON.stringify(collaborators));

      formDataToSend.append("isDraft", isDraft);

      const token = localStorage.getItem("authToken");
      const response = await fetch(buildApiUrl('/campaigns'), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(isDraft ? "Campaign saved as draft!" : "Campaign submitted successfully!");
        setTimeout(() => {
          navigate("/my-campaigns");
        }, 2000);
      } else {
        setErrors({ submit: result.message || "Failed to create campaign" });
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      setErrors({ submit: "An error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfo();
      case 2:
        return renderFinancialInfo();
      case 3:
        return renderDetailedInfo();
      case 4:
        return renderMilestones();
      case 5:
        return renderCollaborators();
      default:
        return null;
    }
  };

  // Step 1: Basic Information
  const renderBasicInfo = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Campaign Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter a compelling campaign title"
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
            errors.category ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
            errors.location ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., Lagos, Nigeria"
        />
        {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Campaign Image
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-green-500 transition-colors">
          <div className="space-y-1 text-center">
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="mx-auto h-48 w-auto rounded-lg" />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setSelectedImage(null);
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500">
                    <span>Upload a file</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageSelect}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
              </>
            )}
          </div>
        </div>
        {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Video URL (YouTube)
        </label>
        <input
          type="url"
          name="videoUrl"
          value={formData.videoUrl}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          placeholder="https://www.youtube.com/watch?v=..."
        />
      </div>
    </div>
  );

  // Step 2: Financial Information
  const renderFinancialInfo = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Financial Information</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Target Amount (₦) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="targetAmount"
          value={formData.targetAmount}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
            errors.targetAmount ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="50000000"
        />
        {errors.targetAmount && <p className="mt-1 text-sm text-red-600">{errors.targetAmount}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Minimum Investment (₦) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="minimumInvestment"
          value={formData.minimumInvestment}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
            errors.minimumInvestment ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="500000"
        />
        {errors.minimumInvestment && <p className="mt-1 text-sm text-red-600">{errors.minimumInvestment}</p>}
      </div>
    </div>
  );

  // Continue in next part...

  // Step 3: Detailed Information
  const renderDetailedInfo = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Detailed Information</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <RichTextEditor
          value={formData.description}
          onChange={(value) => handleRichTextChange('description', value)}
          placeholder="Describe your campaign in detail..."
          height="250px"
          error={errors.description}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Problem Statement
        </label>
        <RichTextEditor
          value={formData.problemStatement}
          onChange={(value) => handleRichTextChange('problemStatement', value)}
          placeholder="What problem are you solving?"
          height="200px"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Solution
        </label>
        <RichTextEditor
          value={formData.solution}
          onChange={(value) => handleRichTextChange('solution', value)}
          placeholder="How does your solution address the problem?"
          height="200px"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business Plan
        </label>
        <RichTextEditor
          value={formData.businessPlan}
          onChange={(value) => handleRichTextChange('businessPlan', value)}
          placeholder="Outline your business model and strategy..."
          height="250px"
        />
      </div>
    </div>
  );

  // Step 4: Milestones (Optional)
  const renderMilestones = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campaign Milestones</h2>
          <p className="text-sm text-gray-600 mt-1">Optional: Add milestones to show your progress plan</p>
        </div>
        <button
          type="button"
          onClick={addMilestone}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Milestone
        </button>
      </div>

      {milestones.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Target className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">No milestones added yet</p>
          <p className="text-xs text-gray-500">Click "Add Milestone" to create your first milestone</p>
        </div>
      ) : (
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <div key={index} className="p-4 border border-gray-300 rounded-lg bg-white">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Milestone {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeMilestone(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={milestone.title}
                    onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Milestone title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={milestone.description}
                    onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows="3"
                    placeholder="Describe this milestone"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount (₦)</label>
                  <input
                    type="number"
                    value={milestone.targetAmount}
                    onChange={(e) => updateMilestone(index, 'targetAmount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Amount needed for this milestone"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Video URL (Optional)</label>
                  <input
                    type="url"
                    value={milestone.videoUrl}
                    onChange={(e) => updateMilestone(index, 'videoUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Step 5: Collaborators (Optional)
  const renderCollaborators = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Members</h2>
          <p className="text-sm text-gray-600 mt-1">Optional: Add your team members and collaborators</p>
        </div>
        <button
          type="button"
          onClick={addCollaborator}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Team Member
        </button>
      </div>

      {collaborators.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">No team members added yet</p>
          <p className="text-xs text-gray-500">Click "Add Team Member" to introduce your team</p>
        </div>
      ) : (
        <div className="space-y-4">
          {collaborators.map((collab, index) => (
            <div key={index} className="p-4 border border-gray-300 rounded-lg bg-white">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Team Member {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeCollaborator(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={collab.name}
                    onChange={(e) => updateCollaborator(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <input
                    type="text"
                    value={collab.role}
                    onChange={(e) => updateCollaborator(index, 'role', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., CEO, CTO, CFO"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={collab.description}
                    onChange={(e) => updateCollaborator(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows="2"
                    placeholder="Brief bio or expertise"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={collab.email}
                    onChange={(e) => updateCollaborator(index, 'email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={collab.phoneNumber}
                    onChange={(e) => updateCollaborator(index, 'phoneNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="08012345678"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedNavbar variant="profile" />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((step) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step === currentStep
                        ? 'bg-green-600 text-white'
                        : step < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {step < currentStep ? <Check className="h-5 w-5" /> : step}
                  </div>
                  <span className="text-xs mt-1 text-gray-600">
                    {step === 1 && 'Basic'}
                    {step === 2 && 'Financial'}
                    {step === 3 && 'Details'}
                    {step === 4 && 'Milestones'}
                    {step === 5 && 'Team'}
                  </span>
                </div>
                {step < 5 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step < currentStep ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-700">
              <Check className="h-5 w-5 mr-2" />
              <p>{success}</p>
            </div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p>{errors.submit}</p>
            </div>
          )}

          {/* Step Content */}
          <form onSubmit={(e) => e.preventDefault()}>
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-200">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    <ChevronLeft className="h-5 w-5 mr-2" />
                    Previous
                  </button>
                )}
              </div>

              <div className="flex space-x-3">
                {/* Skip button for optional steps */}
                {(currentStep === 4 || currentStep === 5) && (
                  <button
                    type="button"
                    onClick={skipStep}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Skip
                  </button>
                )}

                {/* Save as Draft */}
                <button
                  type="button"
                  onClick={() => handleSubmit(true)}
                  disabled={loading}
                  className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  <Save className="h-5 w-5 mr-2" />
                  Save Draft
                </button>

                {/* Next or Submit */}
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Next
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSubmit(false)}
                    disabled={loading}
                    className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader className="h-5 w-5 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Submit Campaign
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CreateCampaignNew;
