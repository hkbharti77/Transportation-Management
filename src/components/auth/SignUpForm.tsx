"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";

interface SignUpFormData {
  // Step 1: Contact Info
  name: string;
  email: string;
  phone: string;
  
  // Step 2: Business Info
  company_name: string;
  company_address: string;
  business_license_number: string;
  tax_id: string;
  website: string;
  business_phone: string;
  business_email: string;
  
  // Step 3: Security & Legal
  role: string;
  password: string;
  confirmPassword: string;
}

interface FieldErrors {
  name?: string;
  email?: string;
  phone?: string;
  company_name?: string;
  company_address?: string;
  business_license_number?: string;
  tax_id?: string;
  website?: string;
  business_phone?: string;
  business_email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function SignUpForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  
  const [formData, setFormData] = useState<SignUpFormData>({
    // Step 1: Contact Info
    name: "",
    email: "",
    phone: "",
    
    // Step 2: Business Info
    company_name: "",
    company_address: "",
    business_license_number: "",
    tax_id: "",
    website: "",
    business_phone: "",
    business_email: "",
    
    // Step 3: Security & Legal
    role: "admin", // Default role
    password: "",
    confirmPassword: ""
  });

  // Field-level validation functions
  const validateName = (name: string): string => {
    if (!name.trim()) {
      return "Name is required";
    }
    if (name.trim().length < 2) {
      return "Name must be at least 2 characters";
    }
    return "";
  };

  const validateEmail = (email: string): string => {
    if (!email.trim()) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePhone = (phone: string): string => {
    if (!phone.trim()) {
      return "Phone number is required";
    }
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return "Please enter a valid phone number";
    }
    return "";
  };

  const validatePassword = (password: string): string => {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }
    return "";
  };

  const validateConfirmPassword = (confirmPassword: string, password: string): string => {
    if (!confirmPassword) {
      return "Please confirm your password";
    }
    if (confirmPassword !== password) {
      return "Passwords do not match";
    }
    return "";
  };

  const validateRequired = (value: string, fieldName: string): string => {
    if (!value.trim()) {
      return `${fieldName} is required`;
    }
    return "";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field error when user starts typing
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let error = "";

    switch (name) {
      case "name":
        error = validateName(value);
        break;
      case "email":
        error = validateEmail(value);
        break;
      case "phone":
        error = validatePhone(value);
        break;
      case "company_name":
        error = validateRequired(value, "Company name");
        break;
      case "company_address":
        error = validateRequired(value, "Company address");
        break;
      case "password":
        error = validatePassword(value);
        break;
      case "confirmPassword":
        error = validateConfirmPassword(value, formData.password);
        break;
    }

    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const nextStep = () => {
    // Validate fields for current step
    let hasErrors = false;
    const newFieldErrors: FieldErrors = { ...fieldErrors };

    if (currentStep === 1) {
      const nameError = validateName(formData.name);
      const emailError = validateEmail(formData.email);
      const phoneError = validatePhone(formData.phone);
      
      newFieldErrors.name = nameError;
      newFieldErrors.email = emailError;
      newFieldErrors.phone = phoneError;
      
      hasErrors = !!(nameError || emailError || phoneError);
    }
    
    if (currentStep === 2) {
      const companyNameError = validateRequired(formData.company_name, "Company name");
      const companyAddressError = validateRequired(formData.company_address, "Company address");
      
      newFieldErrors.company_name = companyNameError;
      newFieldErrors.company_address = companyAddressError;
      
      hasErrors = !!(companyNameError || companyAddressError);
    }
    
    setFieldErrors(newFieldErrors);
    
    if (hasErrors) {
      return;
    }
    
    setError("");
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setError("");
    setCurrentStep(prev => prev - 1);
  };

  const isStepOneValid = () => {
    return formData.name.trim() !== "" && 
           formData.email.trim() !== "" && 
           formData.phone.trim() !== "";
  };

  const isStepTwoValid = () => {
    return formData.company_name.trim() !== "" && 
           formData.company_address.trim() !== "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only check terms and conditions in the final step (step 3)
    if (!isChecked) {
      setError("Please accept the terms and conditions");
      return;
    }

    // Validate all fields for current step
    let hasErrors = false;
    const newFieldErrors: FieldErrors = { ...fieldErrors };

    if (currentStep === 1) {
      const nameError = validateName(formData.name);
      const emailError = validateEmail(formData.email);
      const phoneError = validatePhone(formData.phone);
      
      newFieldErrors.name = nameError;
      newFieldErrors.email = emailError;
      newFieldErrors.phone = phoneError;
      
      hasErrors = !!(nameError || emailError || phoneError);
    }
    
    if (currentStep === 2) {
      const companyNameError = validateRequired(formData.company_name, "Company name");
      const companyAddressError = validateRequired(formData.company_address, "Company address");
      
      newFieldErrors.company_name = companyNameError;
      newFieldErrors.company_address = companyAddressError;
      
      hasErrors = !!(companyNameError || companyAddressError);
    }

    if (currentStep === 3) {
      const passwordError = validatePassword(formData.password);
      const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);
      
      newFieldErrors.password = passwordError;
      newFieldErrors.confirmPassword = confirmPasswordError;
      
      hasErrors = !!(passwordError || confirmPasswordError);
    }
    
    setFieldErrors(newFieldErrors);
    
    if (hasErrors) {
      return;
    }

    // If not on final step, go to next step
    if (currentStep < 3) {
      nextStep();
      return;
    }

    // Final step submission (step 3)
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Prepare data for submission (exclude confirmPassword)
      const submitData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company_name: formData.company_name,
        company_address: formData.company_address,
        business_license_number: formData.business_license_number,
        tax_id: formData.tax_id,
        website: formData.website,
        business_phone: formData.business_phone,
        business_email: formData.business_email,
        role: formData.role,
        password: formData.password
      };
      
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(`Account created successfully! Welcome ${data.name}. Redirecting to sign in...`);
        
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          company_name: "",
          company_address: "",
          business_license_number: "",
          tax_id: "",
          website: "",
          business_phone: "",
          business_email: "",
          role: "admin",
          password: "",
          confirmPassword: ""
        });
        setCurrentStep(1);
        setIsChecked(false);
        
        // Redirect to sign-in page after 2 seconds
        setTimeout(() => {
          window.location.href = '/signin';
        }, 2000);
      } else {
        // Improved error handling for non-JSON responses
        let errorMessage = 'Registration failed. Please try again.';
        
        // Try to parse JSON, but handle cases where response is not JSON
        try {
          const errorData = await response.json();
          
          if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else if (Array.isArray(errorData.detail)) {
            // Handle array of errors (common in validation)
            errorMessage = errorData.detail.map((err: unknown) => {
              if (typeof err === 'string') {
                return err;
              } else if (typeof err === 'object' && err !== null && 'msg' in err) {
                return (err as { msg: string }).msg;
              } else if (typeof err === 'object' && err !== null && 'loc' in err && 'msg' in err) {
                const errorObj = err as { loc: string[], msg: string };
                return `${errorObj.loc.join('.')}: ${errorObj.msg}`;
              }
              return JSON.stringify(err);
            }).join(', ');
          } else if (typeof errorData.detail === 'object' && errorData.detail !== null) {
            // Handle object errors
            if ('msg' in errorData.detail && typeof (errorData.detail as { msg: string }).msg === 'string') {
              errorMessage = (errorData.detail as { msg: string }).msg;
            } else {
              // Try to extract field-specific errors
              const errorMessages: string[] = [];
              for (const [key, value] of Object.entries(errorData.detail)) {
                if (typeof value === 'string') {
                  errorMessages.push(`${key}: ${value}`);
                } else if (Array.isArray(value)) {
                  errorMessages.push(`${key}: ${value.join(', ')}`);
                } else if (typeof value === 'object' && value !== null && 'msg' in value) {
                  errorMessages.push(`${key}: ${(value as { msg: string }).msg}`);
                }
              }
              if (errorMessages.length > 0) {
                errorMessage = errorMessages.join(', ');
              } else {
                errorMessage = JSON.stringify(errorData.detail);
              }
            }
          } else {
            errorMessage = 'Registration failed with an unknown error.';
          }
        } catch (jsonError) {
          // Intentionally unused, but required for error handling
          console.debug('JSON parsing error:', jsonError);
          // If JSON parsing fails, try to get text content
          try {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = errorText;
            } else {
              errorMessage = `Registration failed with status: ${response.status} ${response.statusText}`;
            }
          } catch (textError) {
            // Intentionally unused, but required for error handling
            console.debug('Text parsing error:', textError);
            errorMessage = `Registration failed with status: ${response.status} ${response.statusText}`;
          }
        }
        
        setError(errorMessage);
      }
    } catch (error) {
      // Handle network errors
      if (error instanceof Error) {
        setError(error.message || 'Network error. Please check your connection and try again.');
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Contact Information</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Please provide your personal details</p>
            </div>
            
            {/* Full Name */}
            <div className="mb-4">
              <Label>
                Full Name<span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter your full name"
                error={!!fieldErrors.name}
                hint={fieldErrors.name}
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <Label>
                Email<span className="text-error-500">*</span>
              </Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter your email"
                error={!!fieldErrors.email}
                hint={fieldErrors.email}
              />
            </div>

            {/* Phone */}
            <div className="mb-4">
              <Label>
                Phone Number<span className="text-error-500">*</span>
              </Label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter your phone number"
                error={!!fieldErrors.phone}
                hint={fieldErrors.phone}
              />
            </div>
          </>
        );
      case 2:
        return (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Business Information</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tell us about your company</p>
            </div>
            
            {/* Company Name */}
            <div className="mb-4">
              <Label>
                Company Name<span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                id="company_name"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter your company name"
                error={!!fieldErrors.company_name}
                hint={fieldErrors.company_name}
              />
            </div>

            {/* Company Address */}
            <div className="mb-4">
              <Label>
                Company Address<span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                id="company_address"
                name="company_address"
                value={formData.company_address}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Enter your company address"
                error={!!fieldErrors.company_address}
                hint={fieldErrors.company_address}
              />
            </div>

            {/* Business License Number */}
            <div className="mb-4">
              <Label>
                Business License Number
              </Label>
              <Input
                type="text"
                id="business_license_number"
                name="business_license_number"
                value={formData.business_license_number}
                onChange={handleInputChange}
                placeholder="Enter business license number"
              />
            </div>

            {/* Tax ID */}
            <div className="mb-4">
              <Label>
                Tax ID
              </Label>
              <Input
                type="text"
                id="tax_id"
                name="tax_id"
                value={formData.tax_id}
                onChange={handleInputChange}
                placeholder="Enter tax identification number"
              />
            </div>

            {/* Website */}
            <div className="mb-4">
              <Label>
                Website
              </Label>
              <Input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://example.com"
              />
            </div>

            {/* Business Phone */}
            <div className="mb-4">
              <Label>
                Business Phone
              </Label>
              <Input
                type="tel"
                id="business_phone"
                name="business_phone"
                value={formData.business_phone}
                onChange={handleInputChange}
                placeholder="Enter business phone number"
              />
            </div>

            {/* Business Email */}
            <div className="mb-4">
              <Label>
                Business Email
              </Label>
              <Input
                type="email"
                id="business_email"
                name="business_email"
                value={formData.business_email}
                onChange={handleInputChange}
                placeholder="Enter business email"
              />
            </div>
          </>
        );
      case 3:
        return (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Security & Legal</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Set your password and agree to terms</p>
            </div>
            
            {/* Password */}
            <div className="mb-4">
              <Label>
                Password<span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  error={!!fieldErrors.password}
                  hint={fieldErrors.password}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                >
                  {showPassword ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                  )}
                </span>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="mb-4">
              <Label>
                Confirm Password<span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Confirm your password"
                  type={showConfirmPassword ? "text" : "password"}
                  error={!!fieldErrors.confirmPassword}
                  hint={fieldErrors.confirmPassword}
                />
                <span
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                >
                  {showConfirmPassword ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                  )}
                </span>
              </div>
            </div>

            {/* Checkbox */}
            <div className="flex items-center gap-3 mb-6">
              <Checkbox
                className="w-5 h-5"
                checked={isChecked}
                onChange={setIsChecked}
              />
              <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
                By creating an account means you agree to the{" "}
                <span className="text-gray-800 dark:text-white/90">
                  Terms and Conditions,
                </span>{" "}
                and our{" "}
                <span className="text-gray-800 dark:text-white">
                  Privacy Policy
                </span>
              </p>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign Up
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Create your account in three simple steps
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center mb-8">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= step ? 'bg-blue-500' : 'bg-gray-300'} text-white`}>
                  <span className="text-sm font-medium">{step}</span>
                </div>
                {step < 3 && <div className={`flex-1 h-1 mx-2 ${currentStep > step ? 'bg-blue-500' : 'bg-gray-300'}`}></div>}
              </React.Fragment>
            ))}
          </div>

          {/* Step labels */}
          <div className="flex justify-between mb-6">
            <div className={`text-sm font-medium ${currentStep === 1 ? 'text-blue-600' : 'text-gray-500'}`}>
              Contact
            </div>
            <div className={`text-sm font-medium ${currentStep === 2 ? 'text-blue-600' : 'text-gray-500'}`}>
              Business
            </div>
            <div className={`text-sm font-medium ${currentStep === 3 ? 'text-blue-600' : 'text-gray-500'}`}>
              Security
            </div>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 border border-red-400 rounded-lg dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 text-sm text-green-700 bg-green-100 border border-green-400 rounded-lg dark:bg-green-900/20 dark:text-green-400">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              {renderStepContent()}
              
              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                  >
                    Previous
                  </button>
                )}
                
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={
                      (currentStep === 1 && !isStepOneValid()) || 
                      (currentStep === 2 && !isStepTwoValid())
                    }
                    className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${
                      (currentStep === 1 && !isStepOneValid()) || 
                      (currentStep === 2 && !isStepTwoValid())
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                    }`}
                  >
                    Next
                  </button>
                ) : (
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Creating..." : "Sign Up"}
                  </button>
                )}
              </div>
            </div>
          </form>

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}