"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axiosInstance";
import StatCard from "./components/StatCard";
import SalesCategoryChart from "./components/SalesCategoryChart";
import CustomSelect from "./components/CustomSelect";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  Loader2,
  Calendar,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import TopProductsCard from "./components/TopProductsCard";
import TopCustomersCard from "./components/TopCustomersCard";

const GraphSkeleton = () => {
  const barHeights = [
    "h-1/3",
    "h-2/3",
    "h-1/2",
    "h-3/4",
    "h-full",
    "h-2/3",
    "h-1/4",
  ];

  return (
    <div className="h-full w-full flex flex-col justify-end animate-pulse">
      <div className="h-1 w-full bg-blue-100/50 rounded-full mb-8" />

      <div className="flex items-end justify-between h-64 px-2 gap-2 opacity-10">
        {barHeights.map((height, i) => (
          <div
            key={i}
            className={`${height} w-full bg-slate-400 rounded-t-3xl`}
          />
        ))}
      </div>

      <div className="h-4 w-full bg-slate-100/50 mt-4 rounded" />
    </div>
  );
};

export default function DashboardOverview() {
  const [activeMetric, setActiveMetric] = useState<
    "revenue" | "orders" | "customers" | "products"
  >("revenue");

  const [mainRange, setMainRange] = useState<string>("weekly");
  const currentYear = new Date().getFullYear();
  const [startYear, setStartYear] = useState(currentYear - 1);
  const endYear = currentYear;
  const [categoryRange, setCategoryRange] = useState<string>("weekly");

  const availableYears = [];
  for (let y = currentYear; y >= 2021; y--) {
    availableYears.push(y);
  }

  const rangeOptions = [
    { label: "This Week", value: "weekly" },
    { label: "This Month", value: "monthly" },
    { label: "This Year", value: "yearly" },
    { label: "Custom Range", value: "custom" },
  ];

  const { data: cardData, isLoading: cardsLoading } = useQuery({
    queryKey: ["dashboard-cards"],
    queryFn: async () =>
      (await axiosInstance.get("/api/analytics/overview?range=weekly")).data,
    staleTime: 30000,
  });

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
  });

  if (cardsLoading || !cardData)
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
      </div>
    );

  const getMetricLabel = () => {
    switch (activeMetric) {
      case "revenue":
        return "Revenue";
      case "orders":
        return "Orders";
      case "customers":
        return "New Customers";
      case "products":
        return "New Products";
      default:
        return "Value";
    }
  };

  const getRangeText = () => {
    if (mainRange === "weekly") return "last 7 days";
    if (mainRange === "monthly") return "last 30 days";
    if (mainRange === "yearly") return "last 12 months";
    return `from ${startYear} to ${endYear}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* 1. STAT CARDS (Now with Animation & Gradient) */}
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
        {/* 2. MAIN CHART */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-950 p-8 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white capitalize flex items-center gap-2">
                {getMetricLabel()} Overview
                {isMainFetching && !mainLoading && (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                )}
              </h3>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Performance over the {getRangeText()}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2 z-20">
              {/* Custom Dropdown */}
              <CustomSelect
                value={mainRange}
                onChange={setMainRange}
                options={rangeOptions}
              />

              {mainRange === "custom" && (
                <div className="flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center bg-blue-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-slate-700">
                    <Calendar size={14} className="text-blue-600 mr-2" />
                    <select
                      value={startYear}
                      onChange={(e) => setStartYear(Number(e.target.value))}
                      className="bg-transparent text-xs font-bold text-blue-700 dark:text-blue-400 outline-none cursor-pointer"
                    >
                      {availableYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                    <span className="mx-2 text-xs text-gray-400">to</span>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      {endYear}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="h-80 w-full">
            {mainLoading ? (
              <GraphSkeleton />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={
                    mainChartData ? mainChartData[activeMetric].history : []
                  }
                >
                  <defs>
                    <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
                    dy={10}
                    interval={
                      mainRange === "custom" || mainRange === "monthly"
                        ? "preserveStartEnd"
                        : 0
                    }
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)",
                      padding: "12px 16px",
                    }}
                    itemStyle={{ color: "#1e293b", fontWeight: 700 }}
                    labelStyle={{
                      color: "#64748b",
                      marginBottom: "4px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number | undefined) => [
                      activeMetric === "revenue"
                        ? `Rs. ${(value ?? 0).toLocaleString()}`
                        : (value ?? 0).toLocaleString(),
                      getMetricLabel(),
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorMain)"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 3. CATEGORY CHART */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col h-[480px]">
          <div className="flex justify-between items-center mb-2 z-20">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              Sales by Category
            </h3>
            {/* Custom Dropdown (Reduced options for Category) */}
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

      {/* 🛑 4. NEW ROW: Top Products & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Top Selling Product (1 Column) */}
        <div className="h-auto">
          <TopProductsCard />
        </div>

        {/* RIGHT: Top Buyers (2 Columns) */}
        <div className="lg:col-span-2 h-auto">
          {" "}
          {/* Changed to auto height to match sibling */}
          <TopCustomersCard />
        </div>
      </div>
    </div>
  );
}
