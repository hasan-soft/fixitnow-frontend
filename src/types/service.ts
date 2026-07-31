export interface Category {
  id?: string;
  _id?: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Service {
  id?: string;
  _id?: string;
  name: string;
  description: string;
  price: number;
  category: string | Category;
  imageUrl?: string;
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServicesResponse {
  success: boolean;
  message: string;
  data: Service[];
}
