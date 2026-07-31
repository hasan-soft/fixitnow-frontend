import { axiosInstance } from "@/lib/axios";
import { LoginInput, RegisterInput } from "@/lib/validations/auth";
import { AuthResponse, User } from "@/types/auth";

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: User;
}

export const authService = {
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/auth/login", data);
    return response.data;
  },

  register: async (data: RegisterInput): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/auth/register", data);
    return response.data;
  },

  getMe: async (): Promise<ProfileResponse> => {
    const response = await axiosInstance.get("/auth/me");
    return response.data;
  },
};
