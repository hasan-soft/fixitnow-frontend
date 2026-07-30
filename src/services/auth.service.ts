import { axiosInstance } from "@/lib/axios";
import { LoginInput, RegisterInput } from "@/lib/validations/auth";
import { AuthResponse } from "@/types/auth";

export const authService = {
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/auth/login", data);
    return response.data;
  },

  register: async (data: RegisterInput): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/auth/register", data);
    return response.data;
  },
};
