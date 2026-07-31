import { Badge } from "@/components/ui/badge";
import { BookingStatus } from "@/types/booking";

interface StatusBadgeProps {
  status: BookingStatus;
}

export default function BookingStatusBadge({ status }: StatusBadgeProps) {
  const getVariantAndClass = () => {
    switch (status) {
      case "REQUESTED":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "ACCEPTED":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "DECLINED":
        return "bg-red-100 text-red-800 border-red-300";
      case "PAID":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "IN_PROGRESS":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "CANCELLED":
        return "bg-rose-100 text-rose-800 border-rose-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Badge
      variant="outline"
      className={`font-semibold uppercase text-[11px] ${getVariantAndClass()}`}
    >
      {status.replace("_", " ")}
    </Badge>
  );
}
