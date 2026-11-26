"use client";

import React, { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import type { AnalyticsDashboardData } from "@/lib/supabase/analytics";
import styles from "./analytics.module.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AnalyticsDashboardProps {
  initialData: AnalyticsDashboardData;
}

/**
 * Lightweight vector SVG sparkline component for individual metric cards.
 * Renders instantaneously with smooth gradient fills or vertical bars.
 */
function Sparkline({
  data,
  color = "#38bdf8",
  type = "line",
  height = 36,
}: {
  data: number[];
  color?: string;
  type?: "line" | "bars";
  height?: number;
}) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const width = 120;

  if (type === "bars") {
    const barWidth = 7;
    const gap = Math.max(3, (width - data.length * barWidth) / Math.max(1, data.length - 1));
    return (
      <div className={styles.sparklineContainer}>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          {data.map((val, i) => {
            const barHeight = Math.max(4, ((val - min) / range) * (height - 6));
            const x = i * (barWidth + gap);
            const y = height - barHeight;
            const isLatest = i === data.length - 1;
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={2}
                fill={color}
                opacity={isLatest ? 1 : 0.35 + (i / data.length) * 0.45}
              />
            );
          })}
        </svg>
      </div>
    );
  }

  // Smooth line sparkline
  const points = data.map((val, i) => {
    const x = (i / Math.max(1, data.length - 1)) * (width - 8) + 4;
    const y = height - 4 - ((val - min) / range) * (height - 10);
    return { x, y };
  });

  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cpX = (prev.x + p.x) / 2;
    return `${acc} C ${cpX} ${prev.y}, ${cpX} ${p.y}, ${p.x} ${p.y}`;
  }, "");

  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  const fillD = `${pathD} L ${lastPoint.x} ${height} L ${firstPoint.x} ${height} Z`;
  const gradientId = `spark-grad-${color.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div className={styles.sparklineContainer}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={fillD} fill={`url(#${gradientId})`} />
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <circle cx={lastPoint.x} cy={lastPoint.y} r="2.8" fill={color} />
        <circle cx={lastPoint.x} cy={lastPoint.y} r="5" fill="none" stroke={color} strokeWidth="1.2" opacity="0.6" />
      </svg>
    </div>
  );
}

export default function AnalyticsDashboard({ initialData }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsDashboardData>(initialData);
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(30);
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/analytics/stats?days=30`);
      if (res.ok) {
        const fresh = await res.json();
        setData(fresh);
      }
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const { summary, trends, topPages = [], visitorSplit, isDemo } = data;

  // Filter trends by selected time range
  const visibleTrends = trends.slice(-timeRange);

  // Format numbers
  const formatNumber = (num: number) => num.toLocaleString();

  // Trends Line chart datasets
  const lineChartData = {
    labels: visibleTrends.map((t) => t.date),
    datasets: [
      {
        label: "Total Page Views",
        data: visibleTrends.map((t) => t.pageViews),
        borderColor: "#38bdf8",
        backgroundColor: "rgba(56, 189, 248, 0.12)",
        borderWidth: 2.5,
        pointBackgroundColor: "#38bdf8",
        pointBorderColor: "#090d16",
        pointHoverBackgroundColor: "#ffffff",
        pointHoverBorderColor: "#38bdf8",
        pointRadius: visibleTrends.length <= 14 ? 4 : 2.5,
        pointHoverRadius: 6,
        tension: 0.38,
        fill: true,
      },
      {
        label: "Unique Visitors",
        data: visibleTrends.map((t) => t.uniqueVisitors),
        borderColor: "#a855f7",
        backgroundColor: "rgba(168, 85, 247, 0.08)",
        borderWidth: 2,
        pointBackgroundColor: "#a855f7",
        pointBorderColor: "#090d16",
        pointHoverBackgroundColor: "#ffffff",
        pointHoverBorderColor: "#a855f7",
        pointRadius: visibleTrends.length <= 14 ? 4 : 2.5,
        pointHoverRadius: 6,
        borderDash: [4, 4],
        tension: 0.38,
        fill: false,
      },
    ],
  };

  // Trends Bar chart datasets
  const barChartData = {
    labels: visibleTrends.map((t) => t.date),
    datasets: [
      {
        label: "Total Page Views",
        data: visibleTrends.map((t) => t.pageViews),
        backgroundColor: "rgba(56, 189, 248, 0.75)",
        borderColor: "#38bdf8",
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: "Unique Visitors",
        data: visibleTrends.map((t) => t.uniqueVisitors),
        backgroundColor: "rgba(168, 85, 247, 0.65)",
        borderColor: "#a855f7",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const chartOptions: ChartOptions<"line" | "bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
        align: "end",
        labels: {
          color: "#94a3b8",
          boxWidth: 12,
          boxHeight: 12,
          usePointStyle: true,
          pointStyle: "circle",
          padding: 16,
          font: {
            size: 12,
            weight: 500,
            family: "inherit",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(10, 14, 23, 0.94)",
        titleColor: "#ffffff",
        bodyColor: "#e2e8f0",
        borderColor: "rgba(255, 255, 255, 0.15)",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 10,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || "";
            const value = context.parsed.y ?? 0;
            return `  ${label}: ${value.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
        },
        ticks: {
          color: "#64748b",
          font: {
            size: 11,
          },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 12,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
        },
        ticks: {
          color: "#64748b",
          font: {
            size: 11,
          },
          precision: 0,
        },
      },
    },
  };

  // Donut chart configuration for Admin vs Public visitor split
  const donutData = {
    labels: ["Admin Visits", "Public Visitors"],
    datasets: [
      {
        data: [visitorSplit?.adminVisits || 0, visitorSplit?.publicVisits || 0],
        backgroundColor: ["#6366f1", "#38bdf8"],
        borderColor: ["#090d16", "#090d16"],
        borderWidth: 3,
        hoverOffset: 6,
      },
    ],
  };

  const donutOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(10, 14, 23, 0.94)",
        titleColor: "#ffffff",
        bodyColor: "#e2e8f0",
        borderColor: "rgba(255, 255, 255, 0.15)",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      },
    },
    cutout: "74%",
  };

  const isGrowthPositive = summary.growthPercentage >= 0;
  const sparklines = summary.sparklines || {
    uniqueVisitors: [1, 1, 1, 1, 1, 1, summary.totalUniqueVisitors],
    pageViews: [1, 2, 2, 4, 5, 6, summary.totalPageViews],
    todayTraffic: [1, 2, 3, 4, 5, 6, summary.todayTraffic],
    avgTraffic: [0.1, 0.2, 0.2, 0.2, 0.3, 0.3, summary.averageDailyTraffic],
    growth: [10, 20, 30, 50, 70, 90, summary.growthPercentage],
    adminVisits: [1, 2, 2, 3, 4, 5, summary.adminVisits],
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Demo Data Indicator Banner */}
      {isDemo && (
        <div className={styles.demoBanner}>
          <div className={styles.demoBannerContent}>
            <span className={styles.demoBadge}>Demo Data – Database Unavailable</span>
            <p className={styles.demoText}>
              Displaying simulated traffic values. The <code>website_analytics</code> table has not yet been migrated in Supabase.
              Execute <code>supabase/migrations/027_website_analytics.sql</code> in your Supabase SQL Editor to start recording live visitor traffic.
            </p>
          </div>
        </div>
      )}

      {/* 6 Metric Cards Grid with Individual Mini Sparkline Graphs */}
      <section className={styles.metricGrid} aria-label="Website Traffic Metrics">
        {/* 1. Total Unique Visitors */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricIcon}>👥</span>
            <span className={styles.metricLabel}>Total Unique Visitors</span>
          </div>
          <div className={styles.metricMainRow}>
            <div className={styles.metricValue}>{formatNumber(summary.totalUniqueVisitors)}</div>
            <Sparkline data={sparklines.uniqueVisitors} color="#a855f7" type="line" height={32} />
          </div>
          <div className={styles.metricSubtext}>Distinct visitors tracked</div>
        </div>

        {/* 2. Total Page Views */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricIcon}>📊</span>
            <span className={styles.metricLabel}>Total Page Views</span>
          </div>
          <div className={styles.metricMainRow}>
            <div className={styles.metricValue}>{formatNumber(summary.totalPageViews)}</div>
            <Sparkline data={sparklines.pageViews} color="#38bdf8" type="bars" height={32} />
          </div>
          <div className={styles.metricSubtext}>Recorded page views</div>
        </div>

        {/* 3. Today's Traffic */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricIcon}>⚡</span>
            <span className={styles.metricLabel}>Today's Traffic</span>
          </div>
          <div className={styles.metricMainRow}>
            <div className={styles.metricValue}>{formatNumber(summary.todayTraffic)}</div>
            <Sparkline data={sparklines.todayTraffic} color="#fbbf24" type="line" height={32} />
          </div>
          <div className={styles.metricSubtext}>Views recorded today</div>
        </div>

        {/* 4. Average Daily Traffic */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricIcon}>📈</span>
            <span className={styles.metricLabel}>Average Daily Traffic</span>
          </div>
          <div className={styles.metricMainRow}>
            <div className={styles.metricValue}>{summary.averageDailyTraffic.toFixed(1)}</div>
            <Sparkline data={sparklines.avgTraffic} color="#06b6d4" type="line" height={32} />
          </div>
          <div className={styles.metricSubtext}>Views / active day</div>
        </div>

        {/* 5. Growth Percentage */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricIcon}>🚀</span>
            <span className={styles.metricLabel}>Growth Percentage</span>
          </div>
          <div className={styles.metricMainRow}>
            <div className={styles.metricValueRow}>
              <span
                className={`${styles.metricValue} ${
                  isGrowthPositive ? styles.growthPositive : styles.growthNegative
                }`}
              >
                {isGrowthPositive ? `+${summary.growthPercentage}%` : `${summary.growthPercentage}%`}
              </span>
              <span
                className={`${styles.growthPill} ${
                  isGrowthPositive ? styles.growthPillPositive : styles.growthPillNegative
                }`}
              >
                {isGrowthPositive ? "▲ 7d" : "▼ 7d"}
              </span>
            </div>
            <Sparkline
              data={sparklines.growth}
              color={isGrowthPositive ? "#34d399" : "#f87171"}
              type="line"
              height={32}
            />
          </div>
          <div className={styles.metricSubtext}>
            {summary.current7DayTraffic} views vs {summary.previous7DayTraffic} (prev 7d)
          </div>
        </div>

        {/* 6. Total Admin Visits */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricIcon}>🛡️</span>
            <span className={styles.metricLabel}>Total Admin Visits</span>
          </div>
          <div className={styles.metricMainRow}>
            <div className={styles.metricValue}>{formatNumber(summary.adminVisits)}</div>
            <Sparkline data={sparklines.adminVisits} color="#6366f1" type="bars" height={32} />
          </div>
          <div className={styles.metricSubtext}>
            <span className={styles.includedTag}>
              Included in overall totals ({visitorSplit?.adminPercentage || 0}%)
            </span>
          </div>
        </div>
      </section>

      {/* Traffic Trends Chart Card */}
      <section className={styles.chartSection}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h2 className={styles.chartTitle}>Traffic Trends</h2>
              <p className={styles.chartSubtitle}>
                Daily page views and unique visitors over the last {timeRange} days
              </p>
            </div>

            <div className={styles.chartControls}>
              {/* Chart Type Toggle: Line vs Bar */}
              <div className={styles.typeButtons}>
                <button
                  type="button"
                  onClick={() => setChartType("line")}
                  className={`${styles.rangeBtn} ${chartType === "line" ? styles.rangeBtnActive : ""}`}
                  title="Line Chart View"
                >
                  📈 Line
                </button>
                <button
                  type="button"
                  onClick={() => setChartType("bar")}
                  className={`${styles.rangeBtn} ${chartType === "bar" ? styles.rangeBtnActive : ""}`}
                  title="Bar Chart View"
                >
                  📊 Bar
                </button>
              </div>

              {/* Range Selector */}
              <div className={styles.rangeButtons}>
                {([7, 14, 30] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setTimeRange(r)}
                    className={`${styles.rangeBtn} ${timeRange === r ? styles.rangeBtnActive : ""}`}
                  >
                    {r}D
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={styles.refreshBtn}
                title="Refresh Analytics Data"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  className={isRefreshing ? styles.spinning : ""}
                >
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
              </button>
            </div>
          </div>

          <div className={styles.chartWrapper}>
            {visibleTrends.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>📉</span>
                <p>No traffic recorded for this time range yet.</p>
              </div>
            ) : chartType === "line" ? (
              <Line data={lineChartData} options={chartOptions as any} />
            ) : (
              <Bar data={barChartData} options={chartOptions as any} />
            )}
          </div>

          <div className={styles.chartFooter}>
            <div className={styles.legendIndicator}>
              <span className={styles.legendColorBoxViews} />
              <span>Page Views (Cumulative hits & route switches)</span>
            </div>
            <div className={styles.legendIndicator}>
              <span className={styles.legendColorBoxUnique} />
              <span>Unique Visitors (Distinct visitor sessions)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Analytics Breakdown Row: Visitor Split + Top Pages */}
      <section className={styles.breakdownGrid}>
        {/* 1. Visitor Composition (Admin vs Public) Donut Graph */}
        <div className={styles.breakdownCard}>
          <div className={styles.breakdownHeader}>
            <h3 className={styles.breakdownTitle}>Visitor Composition</h3>
            <span className={styles.breakdownBadge}>Session Types</span>
          </div>

          <div className={styles.donutContainer}>
            <div className={styles.donutCanvasWrapper}>
              <Doughnut data={donutData} options={donutOptions} />
              <div className={styles.donutCenterLabel}>
                <span className={styles.donutCenterValue}>{summary.totalPageViews}</span>
                <span className={styles.donutCenterSub}>Total Views</span>
              </div>
            </div>

            <div className={styles.donutLegendList}>
              <div className={styles.donutLegendItem}>
                <div className={styles.donutLegendLeft}>
                  <span className={styles.donutDotAdmin} />
                  <span>Admin Sessions</span>
                </div>
                <div className={styles.donutLegendRight}>
                  <strong>{visitorSplit?.adminVisits || 0}</strong>
                  <span className={styles.donutLegendPct}>({visitorSplit?.adminPercentage || 0}%)</span>
                </div>
              </div>

              <div className={styles.donutLegendItem}>
                <div className={styles.donutLegendLeft}>
                  <span className={styles.donutDotPublic} />
                  <span>Public Visitors</span>
                </div>
                <div className={styles.donutLegendRight}>
                  <strong>{visitorSplit?.publicVisits || 0}</strong>
                  <span className={styles.donutLegendPct}>({visitorSplit?.publicPercentage || 0}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Top Visited Pages Horizontal Graph */}
        <div className={styles.breakdownCard}>
          <div className={styles.breakdownHeader}>
            <h3 className={styles.breakdownTitle}>Most Visited Sections</h3>
            <span className={styles.breakdownBadge}>By URL Path</span>
          </div>

          <div className={styles.pageListContainer}>
            {topPages.length === 0 ? (
              <div className={styles.emptyPages}>No page views recorded yet.</div>
            ) : (
              topPages.map((page, idx) => (
                <div key={idx} className={styles.pageRow}>
                  <div className={styles.pageInfoRow}>
                    <span className={styles.pagePath} title={page.path}>
                      {page.path === "/" ? "Home (/) - Portfolio Landing" : page.path}
                    </span>
                    <span className={styles.pageCount}>
                      {page.views} {page.views === 1 ? "view" : "views"}
                    </span>
                  </div>
                  <div className={styles.pageProgressBarTrack}>
                    <div
                      className={styles.pageProgressBarFill}
                      style={{
                        width: `${Math.max(8, page.percentage)}%`,
                        background:
                          idx === 0
                            ? "linear-gradient(90deg, #38bdf8, #818cf8)"
                            : idx === 1
                            ? "linear-gradient(90deg, #a855f7, #c084fc)"
                            : "linear-gradient(90deg, #34d399, #10b981)",
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
