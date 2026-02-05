"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axiosInstance";
import { DollarSign, ShoppingBag, Users, Package, Loader2 } from "lucide-react";

// Components
import StatCard from "./components/StatCard";
import SalesCategoryChart from "./components/SalesCategoryChart";
import CustomSelect from "./components/CustomSelect"; // Ensure this path is correct
import TopProductsCard from "./components/TopProductsCard";
import TopCustomersCard from "./components/TopCustomersCard";
import MainAnalyticsChart from "./components/MainAnalyticsChart";

export default function DashboardOverview() {
  // 1. STATE MANAGEMENT
  const [activeMetric, setActiveMetric] = useState<
    "revenue" | "orders" | "customers" | "products"
  >("revenue");

  // Date & Range State
  const [mainRange, setMainRange] = useState<string>("weekly");
  const currentYear = new Date().getFullYear();
  const [startYear, setStartYear] = useState(currentYear - 1);
  const endYear = currentYear;
  const [categoryRange, setCategoryRange] = useState<string>("weekly");

  // Generate Year Options
  const availableYears = [];
  for (let y = currentYear; y >= 2021; y--) {
    availableYears.push(y);
  }

  // A. Stat Cards Data
  const { data: cardData, isLoading: cardsLoading } = useQuery({
    queryKey: ["dashboard-cards"],
    queryFn: async () =>
      (await axiosInstance.get("/api/analytics/overview?range=weekly")).data,
    staleTime: 30000,
  });

  // B. Main Chart Data
  const {
    data: mainChartData,
    isLoading: mainLoading,
    isFetching: isMainFetching,
  } = useQuery({
    queryKey: ["dashboard-area-chart", mainRange, startYear],
    queryFn: async () => {
      let url = `/api/analytics/overview?range=${mainRange}`;
      if (mainRange === "custom")
        url += `&startYear=${startYear}&endYear=${endYear}`;
      return (await axiosInstance.get(url)).data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30000,
  });

  // C. Category Chart Data
  const {
    data: categoryData,
    isLoading: categoryLoading,
    isFetching: isCategoryFetching,
  } = useQuery({
    queryKey: ["dashboard-category-chart", categoryRange],
    queryFn: async () =>
      (
        await axiosInstance.get(
          `/api/analytics/overview?range=${categoryRange}`,
        )
      ).data,
    placeholderData: keepPreviousData,
    staleTime: 30000,
  });

  // 3. LOADING STATE (Full Screen Spinner)
  if (cardsLoading || !cardData) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600 h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={cardData.revenue.value}
          prefix="Rs. "
          icon={DollarSign}
          trend={cardData.revenue.trend}
          data={cardData.revenue.history}
          isActive={activeMetric === "revenue"}
          onClick={() => setActiveMetric("revenue")}
        />
        <StatCard
          title="Total Orders"
          value={cardData.orders.value}
          icon={ShoppingBag}
          trend={cardData.orders.trend}
          data={cardData.orders.history}
          isActive={activeMetric === "orders"}
          onClick={() => setActiveMetric("orders")}
        />
        <StatCard
          title="Total Products"
          value={cardData.products.value}
          icon={Package}
          trend={cardData.products.trend}
          data={cardData.products.history}
          isActive={activeMetric === "products"}
          onClick={() => setActiveMetric("products")}
        />
        <StatCard
          title="Active Customers"
          value={cardData.customers.value}
          icon={Users}
          trend={cardData.customers.trend}
          data={cardData.customers.history}
          isActive={activeMetric === "customers"}
          onClick={() => setActiveMetric("customers")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <MainAnalyticsChart
            data={mainChartData ? mainChartData[activeMetric].history : []}
            isLoading={mainLoading}
            isFetching={isMainFetching}
            activeMetric={activeMetric}
            range={mainRange}
            setRange={setMainRange}
            startYear={startYear}
            setStartYear={setStartYear}
            endYear={endYear}
            availableYears={availableYears}
          />
        </div>

        {/* RIGHT: Category Chart (Takes 1 Column) */}
        {/* 🎨 STYLE MATCH: Uses exact same classes as TopProducts/MainChart for consistency */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col h-[500px] lg:h-[600px] transition-all duration-300">
          <div className="flex justify-between items-center mb-4 z-20">
            <div>
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                Sales by Category
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Distribution
              </p>
            </div>

            <div className="w-32 scale-90 origin-right">
              <CustomSelect
                value={categoryRange}
                onChange={setCategoryRange}
                options={[
                  { label: "This Week", value: "weekly" },
                  { label: "This Month", value: "monthly" },
                  { label: "This Year", value: "yearly" },
                ]}
              />
            </div>
          </div>

          <SalesCategoryChart
            data={categoryData?.salesByCategory || []}
            periodTotal={categoryData?.periodTotal || 0}
            periodTrend={categoryData?.periodTrend || 0}
            lifetimeTotal={categoryData?.lifetimeTotal || 0}
            isLoading={categoryLoading || isCategoryFetching}
            timeRange={categoryRange}
          />
        </div>
      </div>

      {/* =====================================================================================
          ROW 3: LEADERBOARDS (Top Products + Top Customers)
          Responsive: Stacked on Mobile, 1:2 Ratio on Desktop
      ===================================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Top Selling Product (1 Column) */}
        <div className="h-auto">
          <TopProductsCard />
        </div>

        {/* RIGHT: Top Buyers (2 Columns) */}
        <div className="lg:col-span-2 h-auto">
          <TopCustomersCard />
        </div>
      </div>
    </div>
  );
}
