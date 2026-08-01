export interface TimeSlot {
  id?: string;
  startTime: string;
  endTime: string;
  isBooked?: boolean;
}

export interface DayAvailability {
  day:
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY";
  isAvailable: boolean;
  slots: TimeSlot[];
}

export interface TechnicianAvailabilityResponse {
  weeklySchedule: DayAvailability[];
  blockedDates?: string[];
}
