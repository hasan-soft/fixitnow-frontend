"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { serviceApi } from "@/services/service";
import ServiceCard from "@/components/cards/ServiceCard";
import ServiceCardSkeleton from "@/components/skeletons/ServiceCardSkeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CATEGORIES = ["All", "Appliance", "Cleaning", "Electrical", "Plumbing"];

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["services", selectedCategory, searchQuery],
    queryFn: () => serviceApi.getAllServices(selectedCategory, searchQuery),
  });

  const services = data?.data || [];

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Explore All <span className="text-primary">FixItNow</span> Services
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Find certified experts for home maintenance, electrical repairs,
            deep cleaning, and appliance servicing.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-4 sm:p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="w-full md:max-w-md">
              <Input
                type="text"
                placeholder="Search services (e.g. AC repair, plumbing)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Buttons */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className="rounded-full text-xs"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <ServiceCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <Card className="text-center py-12 border-destructive/20 bg-destructive/5">
            <CardContent className="text-destructive font-medium">
              Failed to connect to backend server. Please check if your backend
              API is running!
            </CardContent>
          </Card>
        )}

        {/* Services Grid */}
        {!isLoading && !isError && (
          <>
            {services.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              /* Empty State */
              <Card className="text-center py-16 border-dashed">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-slate-600">
                    No services found
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Try searching for something else or reset your filters.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                    }}
                  >
                    Reset Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
