import type { Metadata } from "next";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import React from "react";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import DemographicCard from "@/components/ecommerce/DemographicCard";
import { FleetSummary } from "@/components/ecommerce/FleetSummary";
import VehicleStatsSummary from "@/components/ecommerce/VehicleStatsSummary";

export const metadata: Metadata = {
  title:
    "Next.js E-commerce Dashboard | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Home for TailAdmin Dashboard Template",
};

export default function Ecommerce() {
  return (
    <div className="space-y-6">
      {/* Vehicle Statistics Summary - Critical LCP element */}
      <VehicleStatsSummary />
      
      {/* Fleet Summary */}
      <FleetSummary />
    </div>
  );
}