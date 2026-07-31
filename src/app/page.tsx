"use client";

import { useQuery } from "@tanstack/react-query";
import { serviceApi } from "@/services/service";
import ServiceCard from "@/components/cards/ServiceCard";
import ServiceCardSkeleton from "@/components/skeletons/ServiceCardSkeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["featured-services"],
    queryFn: () => serviceApi.getAllServices(),
  });

  const services = data?.data || [];

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Hero Section */}
      <section className="bg-linear-to-b from-blue-50/60 to-slate-50/50 py-16 md:py-24 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900">
            Reliable Home Services <br />
            <span className="text-primary">On Demand</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Book top-rated technicians for plumbing, electrical work, appliance
            repair, and more in just a few clicks.
          </p>
          <div className="pt-2 flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/services">Explore All Services</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/register">Become a Provider</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Popular Services
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Check out our most requested expert home repair solutions
            </p>
          </div>
          <Button variant="link" asChild className="hidden sm:inline-flex px-0">
            <Link href="/services">View All Services →</Link>
          </Button>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <ServiceCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <Card className="text-center py-12 border-destructive/20 bg-destructive/5">
            <CardContent className="text-destructive font-medium p-0">
              Failed to load services. Please check your connection or backend
              URL!
            </CardContent>
          </Card>
        )}

        {/* Service Cards Display */}
        {!isLoading && !isError && (
          <>
            {services.length === 0 ? (
              <Card className="text-center py-12 border-dashed">
                <CardContent className="text-muted-foreground p-0">
                  No services found. Add services from the backend or admin
                  panel!
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.slice(0, 6).map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
