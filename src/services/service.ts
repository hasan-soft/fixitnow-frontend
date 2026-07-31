import { axiosInstance } from "@/lib/axios";
import { ServicesResponse } from "@/types/service";

export const serviceApi = {
  getAllServices: async (
    category?: string,
    search?: string,
  ): Promise<ServicesResponse> => {
    const params: Record<string, string> = {};
    if (category && category !== "All") params.category = category;
    if (search) params.search = search;

    const response = await axiosInstance.get("/services", { params });
    return response.data;
  },
};
