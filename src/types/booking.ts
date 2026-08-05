export type BookingStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "DECLINED"
  | "PAID"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface Booking {
  id: string;
  _id?: string;
  serviceId: string;
  service?: {
    name: string;
    price: number;
  };
  technicianId?: string;
  technicianProfileId?: string;
  technician?: {
    name: string;
    phone?: string;
  };
  bookingDate: string;
  timeSlot: string; 
  status: BookingStatus;

  totalAmount?: number;
  createdAt: string;
}

export interface BookingsResponse {
  success: boolean;
  message: string;
  data: Booking[];
}
