"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import { passwordResetService } from "@/services/passwordResetService";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

// Password reset flow states
type PasswordResetStep = 'email' | 'otp' | 'newPassword' | 'success';

interface FieldErrors {
  resetEmail?: string;
  otpCode?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export default function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [passwordResetStep, setPasswordResetStep] = useState<PasswordResetStep>('email');
  const [resetEmail, setResetEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Field-level validation functions
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

  const validateOtp = (otp: string): string => {
    if (!otp.trim()) {
      return "OTP code is required";
    }
    if (otp.length < 4) {
      return "OTP code must be at least 4 digits";
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

  const handleInputChange = (field: string, value: string) => {
    switch (field) {
      case 'resetEmail':
        setResetEmail(value);
        break;
      case 'otpCode':
        setOtpCode(value);
        break;
      case 'newPassword':
        setNewPassword(value);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
    }

    // Clear field error when user starts typing
    if (fieldErrors[field as keyof FieldErrors]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleBlur = (field: string, value: string) => {
    let error = "";

    switch (field) {
      case 'resetEmail':
        error = validateEmail(value);
        break;
      case 'otpCode':
        error = validateOtp(value);
        break;
      case 'newPassword':
        error = validatePassword(value);
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(value, newPassword);
        break;
    }

    setFieldErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  // Pre-fill email from URL parameters and skip to OTP step if coming from sign-in
  useEffect(() => {
    const emailFromUrl = searchParams.get('email');
    if (emailFromUrl) {
      setResetEmail(emailFromUrl);
      setPasswordResetStep('otp');
      setSuccess("OTP has been sent to your email. Please enter the code below.");
    }
  }, [searchParams]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email field
    const emailError = validateEmail(resetEmail);
    setFieldErrors(prev => ({
      ...prev,
      resetEmail: emailError
    }));
    
    if (emailError) {
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await passwordResetService.forgotPassword(resetEmail);
      setSuccess(data.message || "OTP sent successfully to your email.");
      setPasswordResetStep('otp');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate OTP field
    const otpError = validateOtp(otpCode);
    setFieldErrors(prev => ({
      ...prev,
      otpCode: otpError
    }));
    
    if (otpError) {
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await passwordResetService.verifyOtp(resetEmail, otpCode);
      setSuccess(data.message || "OTP verified successfully. You can now reset your password.");
      setPasswordResetStep('newPassword');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password fields
    const passwordError = validatePassword(newPassword);
    const confirmPasswordError = validateConfirmPassword(confirmPassword, newPassword);
    
    setFieldErrors(prev => ({
      ...prev,
      newPassword: passwordError,
      confirmPassword: confirmPasswordError
    }));
    
    if (passwordError || confirmPasswordError) {
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await passwordResetService.resetPassword(resetEmail, otpCode, newPassword);
      setSuccess(data.message || "Password reset successfully.");
      setPasswordResetStep('success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPasswordResetForm = () => {
    switch (passwordResetStep) {
      case 'email':
        return (
          <form onSubmit={handleSendOtp}>
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Forgot Password</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                  Enter your email address and we&#39;ll send you an OTP to reset your password.
                </p>
                
                <Label>
                  Email <span className="text-error-500">*</span>
                </Label>
                <Input 
                  placeholder="Enter your email" 
                  type="email"
                  value={resetEmail}
                  onChange={(e) => handleInputChange('resetEmail', e.target.value)}
                  onBlur={(e) => handleBlur('resetEmail', e.target.value)}
                  error={!!fieldErrors.resetEmail}
                  hint={fieldErrors.resetEmail}
                />
              </div>
              
              <div>
                <Button 
                  className="w-full" 
                  size="sm"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending OTP..." : "Send OTP"}
                </Button>
              </div>
            </div>
          </form>
        );
      
      case 'otp':
        return (
          <form onSubmit={handleVerifyOtp}>
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Verify OTP</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                  We&#39;ve sent a 6-digit code to {resetEmail}. Enter the code below to verify your identity.
                </p>
                
                <Label>
                  OTP Code <span className="text-error-500">*</span>
                </Label>
                <Input 
                  placeholder="Enter 6-digit OTP" 
                  type="text"
                  value={otpCode}
                  onChange={(e) => handleInputChange('otpCode', e.target.value)}
                  onBlur={(e) => handleBlur('otpCode', e.target.value)}
                  error={!!fieldErrors.otpCode}
                  hint={fieldErrors.otpCode}
                />
              </div>
              
              <div className="flex gap-3">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setPasswordResetStep('email')}
                >
                  Back
                </Button>
                <Button 
                  className="flex-1" 
                  size="sm"
                  type="submit"
                  disabled={isLoading || otpCode.length !== 6}
                >
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </Button>
              </div>
            </div>
          </form>
        );
      
      case 'newPassword':
        return (
          <form onSubmit={handleResetPassword}>
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Reset Password</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                  Create a new password for your account.
                </p>
                
                <Label>
                  New Password <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    onBlur={(e) => handleBlur('newPassword', e.target.value)}
                    error={!!fieldErrors.newPassword}
                    hint={fieldErrors.newPassword}
                  />
                  <span
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showNewPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                    )}
                  </span>
                </div>
                
                <Label className="mt-4">
                  Confirm Password <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    onBlur={(e) => handleBlur('confirmPassword', e.target.value)}
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
              
              <div className="flex gap-3">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setPasswordResetStep('otp')}
                >
                  Back
                </Button>
                <Button 
                  className="flex-1" 
                  size="sm"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </div>
            </div>
          </form>
        );
      
      case 'success':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Password Reset Successful</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
            <Link href="/signin">
              <Button className="w-full">
                Go to Sign In
              </Button>
            </Link>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Reset Password
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Follow the steps to reset your password
            </p>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 border border-red-400 rounded-lg dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}
          {success && passwordResetStep !== 'success' && (
            <div className="mb-4 p-3 text-sm text-green-700 bg-green-100 border border-green-400 rounded-lg dark:bg-green-900/20 dark:text-green-400">
              {success}
            </div>
          )}

          <div>
            {renderPasswordResetForm()}
            
            {passwordResetStep !== 'success' && (
              <div className="mt-6 text-center">
                <Link 
                  href="/signin" 
                  className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  ← Back to Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}