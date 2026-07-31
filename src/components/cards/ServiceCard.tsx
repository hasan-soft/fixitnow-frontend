import Link from "next/link";
import { Service } from "@/types/service";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const categoryName =
    typeof service.category === "object" && service.category !== null
      ? (service.category as { name: string }).name
      : service.category;

  return (
    <Card className="flex flex-col justify-between hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <Badge variant="secondary">{categoryName}</Badge>
          <span className="text-lg font-bold text-gray-900">
            ৳{service.price}
          </span>
        </div>
        <CardTitle className="text-xl line-clamp-1">{service.name}</CardTitle>
        <CardDescription className="line-clamp-2 mt-1">
          {service.description}
        </CardDescription>
      </CardHeader>

      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/services/${service.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
