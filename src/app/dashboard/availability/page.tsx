"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  Save,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Cookies from "js-cookie";

type Day =
  | "SATURDAY"
  | "SUNDAY"
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY";

interface TimeSlotUI {
  id: string;
  startTime: string;
  endTime: string;
  isBooked?: boolean;
}

interface DayScheduleUI {
  day: Day;
  isAvailable: boolean;
  slots: TimeSlotUI[];
}

const DAYS_OF_WEEK: Day[] = [
  "SATURDAY",
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
];

const INITIAL_SCHEDULE: DayScheduleUI[] = DAYS_OF_WEEK.map((day) => ({
  day,
  isAvailable: day !== "FRIDAY",
  slots:
    day !== "FRIDAY"
      ? [{ id: crypto.randomUUID(), startTime: "09:00", endTime: "17:00" }]
      : [],
}));

export default function AvailabilityPage() {
  const [schedule, setSchedule] = useState<DayScheduleUI[]>(INITIAL_SCHEDULE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // function for Base API URL
  const getApiUrl = (endpoint: string) => {
    const baseUrl = (
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
    ).replace(/\/$/, "");
    const cleanEndpoint = endpoint.replace(/^\//, "");
    return baseUrl.endsWith("/api")
      ? `${baseUrl}/${cleanEndpoint}`
      : `${baseUrl}/api/${cleanEndpoint}`;
  };

  // Fetch  Availability from Backend API
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const token =
          Cookies.get("accessToken") ||
          Cookies.get("token") ||
          localStorage.getItem("accessToken") ||
          localStorage.getItem("token");

        const res = await fetch(getApiUrl("technicians/profile"), {
          headers: {
            Authorization: token
              ? token.startsWith("Bearer ")
                ? token
                : `Bearer ${token}`
              : "",
          },
          credentials: "include",
        });

        const data = await res.json();

        if (
          data.success &&
          data.data?.availabilitySlots &&
          data.data.availabilitySlots.length > 0
        ) {
          const fetchedSlots: {
            id?: string;
            slot: string;
            isBooked: boolean;
          }[] = data.data.availabilitySlots;

          const newSchedule: DayScheduleUI[] = DAYS_OF_WEEK.map((day) => {
            const daySlots = fetchedSlots
              .filter((s) => s.slot.startsWith(day))
              .map((s) => {
                const times = s.slot.replace(`${day} `, "").split(" - ");
                return {
                  id: s.id || crypto.randomUUID(),
                  startTime: times[0] || "09:00",
                  endTime: times[1] || "17:00",
                  isBooked: s.isBooked,
                };
              });

            return {
              day,
              isAvailable: daySlots.length > 0,
              slots: daySlots,
            };
          });

          setSchedule(newSchedule);
        }
      } catch (err) {
        console.error("Failed to load availability from backend", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailability();
  }, []);

  const toggleDay = (dayIndex: number) => {
    setSchedule((prev) =>
      prev.map((item, idx) => {
        if (idx !== dayIndex) return item;

        const nextAvailable = !item.isAvailable;

        return {
          ...item,
          isAvailable: nextAvailable,
          slots: nextAvailable
            ? item.slots.length > 0
              ? item.slots
              : [
                  {
                    id: crypto.randomUUID(),
                    startTime: "09:00",
                    endTime: "17:00",
                  },
                ]
            : [],
        };
      }),
    );
  };

  // Add Slot
  const addSlot = (dayIndex: number) => {
    setSchedule((prev) => {
      const updated = [...prev];
      updated[dayIndex].slots.push({
        id: crypto.randomUUID(),
        startTime: "10:00",
        endTime: "14:00",
      });
      return updated;
    });
  };

  // Remove Slot
  const removeSlot = (dayIndex: number, slotId: string) => {
    setSchedule((prev) => {
      const updated = [...prev];
      updated[dayIndex].slots = updated[dayIndex].slots.filter(
        (s) => s.id !== slotId,
      );
      if (updated[dayIndex].slots.length === 0) {
        updated[dayIndex].isAvailable = false;
      }
      return updated;
    });
  };

  // Update Slot Time
  const updateSlotTime = (
    dayIndex: number,
    slotId: string,
    field: "startTime" | "endTime",
    value: string,
  ) => {
    setSchedule((prev) => {
      const updated = [...prev];
      const slot = updated[dayIndex].slots.find((s) => s.id === slotId);
      if (slot) {
        slot[field] = value;
      }
      return updated;
    });
  };

  // Save Availability to Backend API
  const handleSaveSchedule = async () => {
    setIsSaving(true);

    try {
      const payloadSlots: { slot: string }[] = [];

      schedule.forEach((dayItem) => {
        if (dayItem.isAvailable) {
          dayItem.slots.forEach((slot) => {
            payloadSlots.push({
              slot: `${dayItem.day} ${slot.startTime} - ${slot.endTime}`,
            });
          });
        }
      });

      const token =
        Cookies.get("accessToken") ||
        Cookies.get("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token");

      const apiUrl = getApiUrl("technicians/availability");

      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token
            ? token.startsWith("Bearer ")
              ? token
              : `Bearer ${token}`
            : "",
        },
        credentials: "include",
        body: JSON.stringify({
          availabilitySlots: payloadSlots,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Availability updated successfully!");
      } else {
        toast.error(
          result.message || "Failed to update availability schedule.",
        );
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Something went wrong while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Clock className="h-6 w-6 text-primary" />
            Manage Availability & Working Hours
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Set your weekly working schedule so clients can book available
            slots.
          </p>
        </div>
        <Button
          onClick={handleSaveSchedule}
          disabled={isSaving}
          className="gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> Save Schedule
            </>
          )}
        </Button>
      </div>

      {/* Schedule Form */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          Weekly Schedule
        </h2>

        <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/60 shadow-sm">
          {schedule.map((dayItem, dayIdx) => (
            <div
              key={dayItem.day}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              {/* Day Checkbox */}
              <div className="flex items-center gap-3 w-36">
                <input
                  type="checkbox"
                  id={`day-${dayItem.day}`}
                  checked={dayItem.isAvailable}
                  onChange={() => toggleDay(dayIdx)}
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                />
                <label
                  htmlFor={`day-${dayItem.day}`}
                  className={`font-semibold text-sm cursor-pointer ${
                    dayItem.isAvailable
                      ? "text-slate-900 dark:text-slate-100"
                      : "text-slate-400 dark:text-slate-500 line-through"
                  }`}
                >
                  {dayItem.day}
                </label>
              </div>

              {/* Time Slots Inputs */}
              <div className="flex-1 space-y-2">
                {dayItem.isAvailable ? (
                  dayItem.slots.length > 0 ? (
                    dayItem.slots.map((slot) => (
                      <div key={slot.id} className="flex items-center gap-2">
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) =>
                            updateSlotTime(
                              dayIdx,
                              slot.id,
                              "startTime",
                              e.target.value,
                            )
                          }
                          disabled={slot.isBooked}
                          className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-md text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 disabled:opacity-50"
                        />
                        <span className="text-slate-400 text-xs">to</span>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) =>
                            updateSlotTime(
                              dayIdx,
                              slot.id,
                              "endTime",
                              e.target.value,
                            )
                          }
                          disabled={slot.isBooked}
                          className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-md text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 disabled:opacity-50"
                        />

                        {slot.isBooked ? (
                          <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
                            Booked
                          </span>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                            onClick={() => removeSlot(dayIdx, slot.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-amber-500 font-medium pt-1">
                      {'No slots added. Click "+ Slot" to add.'}
                    </p>
                  )
                ) : (
                  <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-500">
                    Unavailable
                  </span>
                )}
              </div>

              {/* Add Slot Button */}
              {dayItem.isAvailable && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1 self-start sm:self-auto"
                  onClick={() => addSlot(dayIdx)}
                >
                  <Plus className="h-3.5 w-3.5" /> Slot
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
