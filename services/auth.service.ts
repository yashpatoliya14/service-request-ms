import { apiClient } from "@/lib/apiClient";
import { UserProfile } from "@/types/common";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  Email: string;
  Password: string;
  FullName: string;
  Username: string;
}

export interface UpdateProfileData {
  FullName?: string;
  ProfilePhoto?: string;
}

// Auth Service
export class AuthService {
  private static readonly BASE_PATH = "/api/auth";

  // Get current user profile
  static async getProfile() {
    try {
      const response = await apiClient.get<UserProfile[]>(`${this.BASE_PATH}/me`);
      return response;
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      throw error;
    }
  }

  // Update user profile
  static async updateProfile(data: UpdateProfileData): Promise<UserProfile | null> {
    try {
      const response = await apiClient.post<UserProfile[]>(`${this.BASE_PATH}/me`, data);
      return response.success && response.data?.[0] ? response.data[0] : null;
    } catch (error) {
      console.error("Failed to update profile:", error);
      return null;
    }
  }

  // Login user
  static async login(credentials: LoginCredentials) {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}/login`, credentials);
      return response;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }

  // Signup user
  static async signup(data: SignupData) {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}/signup`, data);
      return response;
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  }

  // Verify OTP
  static async verifyOTP(data: { Email: string; Otp: string; isForgotPassword?: boolean }) {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}/verify_otp`, data);
      return response;
    } catch (error) {
      console.error("OTP verification failed:", error);
      throw error;
    }
  }

  // Create request
  static async createRequest(data: {
    ServiceRequestTypeID: string;
    RequestorID: string;
    Title: string;
    Description: string;
    Priority: string;
    ServiceDepartmentID: string;
  }) {
    try {
      const response = await apiClient.post("/api/portal/requestor", data);
      return response;
    } catch (error) {
      console.error("Failed to create request:", error);
      throw error;
    }
  }

  // Logout user
  static async logout() {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}/logout`);
      return response;
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  }
}
