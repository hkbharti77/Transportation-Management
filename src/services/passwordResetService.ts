// Password Reset API Service
// This service handles password reset functionality

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

interface ForgotPasswordRequest {
  email: string;
}

interface ForgotPasswordResponse {
  message: string;
}

interface VerifyOtpRequest {
  email: string;
  otp_code: string;
}

interface VerifyOtpResponse {
  message: string;
}

interface ResetPasswordRequest {
  email: string;
  otp_code: string;
  new_password: string;
}

interface ResetPasswordResponse {
  message: string;
}

class PasswordResetService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Send OTP to email for password reset
  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    const response = await fetch(`${API_BASE_URL}/password-reset/forgot-password`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    return this.handleResponse<ForgotPasswordResponse>(response);
  }

  // Verify OTP code
  async verifyOtp(email: string, otpCode: string): Promise<VerifyOtpResponse> {
    const response = await fetch(`${API_BASE_URL}/password-reset/verify-otp`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email, 
        otp_code: otpCode 
      }),
    });

    return this.handleResponse<VerifyOtpResponse>(response);
  }

  // Reset password with OTP
  async resetPassword(email: string, otpCode: string, newPassword: string): Promise<ResetPasswordResponse> {
    const response = await fetch(`${API_BASE_URL}/password-reset/reset-password`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email, 
        otp_code: otpCode,
        new_password: newPassword
      }),
    });

    return this.handleResponse<ResetPasswordResponse>(response);
  }
}

// Export singleton instance
export const passwordResetService = new PasswordResetService();
export type { ForgotPasswordRequest, ForgotPasswordResponse, VerifyOtpRequest, VerifyOtpResponse, ResetPasswordRequest, ResetPasswordResponse };
