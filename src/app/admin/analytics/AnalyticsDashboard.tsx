"use client";

import React, { useState, useEffect } from "react";
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
import type { AnalyticsDashboardData, RecentVisit } from "@/lib/supabase/analytics";
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

type AudienceSegment = "others" | "me" | "all";

/**
 * Vector SVG sparkline component for individual metric cards.
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

/**
 * Formats visited_at into visitor's actual browser/device local time (e.g. 07:14 AM IST • Nov 27, 2026),
 * recalculating relative time ("Just now", "25m ago", etc.) dynamically in the client.
 */
function FormattedTimestamp({
  isoString,
  fallbackTimeAgo,
}: {
  isoString: string;
  fallbackTimeAgo: string;
}) {
  const [clientTime, setClientTime] = useState<{
    time: string;
    date: string;
    tz: string;
    relative: string;
  } | null>(null);

  useEffect(() => {
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return;

      const time = d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const date = d.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      let tz = "";
      try {
        const parts = new Intl.DateTimeFormat([], { timeZoneName: "short" }).formatToParts(d);
        tz = parts.find((p) => p.type === "timeZoneName")?.value || "";
      } catch {}

      const diffSec = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
      let relative = fallbackTimeAgo;
      if (diffSec < 60) relative = "Just now";
      else if (diffSec < 3600) relative = `${Math.floor(diffSec / 60)}m ago`;
      else if (diffSec < 86400) relative = `${Math.floor(diffSec / 3600)}h ago`;
      else if (diffSec < 172800) relative = "Yesterday";
      else relative = `${Math.floor(diffSec / 86400)}d ago`;

      setClientTime({ time, date, tz, relative });
    } catch {}
  }, [isoString, fallbackTimeAgo]);

  if (!clientTime) {
    return (
      <div className={styles.feedExactTimeBlock}>
        <div className={styles.exactTimeLine}>
          <span className={styles.clockIcon}>🕒</span>
          <span className={styles.exactTimeText}>{fallbackTimeAgo}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.feedExactTimeBlock}>
      <div className={styles.exactTimeLine}>
        <span className={styles.clockIcon}>🕒</span>
        <span className={styles.exactTimeText}>
          {clientTime.time} {clientTime.tz ? <span className={styles.tzPill}>{clientTime.tz}</span> : null} • {clientTime.date}
        </span>
      </div>
      <span className={styles.relativeTimeText}>{clientTime.relative}</span>
    </div>
  );
}

export default function AnalyticsDashboard({ initialData }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsDashboardData>(initialData);
  const [segment, setSegment] = useState<AudienceSegment>("others");
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

  const {
    summary,
    trends,
    topPages = [],
    visitorSplit,
    recentVisits = [],
    topCountries = [],
    topReferrers = [],
    isDemo,
  } = data;

  const [feedFilter, setFeedFilter] = useState<"all" | "others" | "me">("all");

  // Filter recent visits based on selected feed filter
  const filteredVisits = recentVisits.filter((v) => {
    if (feedFilter === "others") return !v.isAdmin;
    if (feedFilter === "me") return v.isAdmin;
    return true;
  });

  // Helper to get friendly referrer details
  const getReferrerBadge = (source: string) => {
    const s = (source || "").toLowerCase();
    if (s.includes("linkedin")) return { icon: "💼", label: "LinkedIn", color: "#0a66c2", bg: "rgba(10, 102, 194, 0.15)", border: "rgba(10, 102, 194, 0.35)" };
    if (s.includes("github")) return { icon: "🐙", label: "GitHub", color: "#a855f7", bg: "rgba(168, 85, 247, 0.15)", border: "rgba(168, 85, 247, 0.35)" };
    if (s.includes("resume") || s.includes("cv")) return { icon: "📄", label: "Resume PDF", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.35)" };
    if (s.includes("google") || s.includes("search")) return { icon: "🔍", label: "Search Engine", color: "#10b981", bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.35)" };
    if (s.includes("direct")) return { icon: "🔗", label: "Direct Visit", color: "#94a3b8", bg: "rgba(148, 163, 184, 0.12)", border: "rgba(148, 163, 184, 0.25)" };
    return { icon: "🌐", label: source || "External", color: "#38bdf8", bg: "rgba(56, 189, 248, 0.15)", border: "rgba(56, 189, 248, 0.35)" };
  };

  // Helper to resolve exact project, section, and report titles from paths
  const getProjectOrPageDetails = (path: string) => {
    const raw = (path || "").trim();
    const p = raw.toLowerCase();

    // Check action flags
    const isReportModal = p.includes("[full report modal]") || p.includes("[report modal]") || p.includes("#report");
    const isReportDownload = p.includes("[download") || p.includes("[print");

    // Section browsing on Homepage
    if (p === "/#projects" || p === "#projects") {
      return {
        title: "Projects Showcase Section",
        type: "Section Viewed",
        badge: "📁 Projects",
        badgeColor: "#38bdf8",
        icon: "📁",
        cleanPath: "/#projects",
      };
    }
    if (p === "/#skills" || p === "#skills") {
      return {
        title: "Skills & Technical Stack Section",
        type: "Section Viewed",
        badge: "⚡ Skills",
        badgeColor: "#38bdf8",
        icon: "⚡",
        cleanPath: "/#skills",
      };
    }
    if (p === "/#experience" || p === "#experience") {
      return {
        title: "Work Experience & Career Timeline",
        type: "Section Viewed",
        badge: "💼 Experience",
        badgeColor: "#38bdf8",
        icon: "💼",
        cleanPath: "/#experience",
      };
    }
    if (p === "/#about" || p === "#about") {
      return {
        title: "About Shreyas Section",
        type: "Section Viewed",
        badge: "👤 About",
        badgeColor: "#38bdf8",
        icon: "👤",
        cleanPath: "/#about",
      };
    }
    if (p === "/#contact" || p === "#contact") {
      return {
        title: "Contact & Recruiter Inquiry Form",
        type: "Section Viewed",
        badge: "✉️ Contact",
        badgeColor: "#38bdf8",
        icon: "✉️",
        cleanPath: "/#contact",
      };
    }
    if (p === "/" || p === "" || p === "/#home" || p === "#home") {
      return {
        title: "Portfolio Landing Overview",
        type: "Homepage View",
        badge: "🏠 Hero & Bio",
        badgeColor: "#38bdf8",
        icon: "🏠",
        cleanPath: "/",
      };
    }

    // Projects deep-dives & reports
    if (p.includes("reactor-temperature-control")) {
      return {
        title: "Reactor Temperature Control System",
        type: isReportModal ? "Read Full Engineering Report" : isReportDownload ? "Downloaded Project PDF" : "Explored Project",
        badge: isReportModal ? "📄 Report Opened" : isReportDownload ? "📥 PDF Saved" : "🔬 Project",
        badgeColor: isReportModal ? "#10b981" : "#38bdf8",
        icon: "🔬",
        cleanPath: "/projects/reactor-temperature-control",
      };
    }

    if (p.includes("arduino-hospital-robot") || p.includes("hospital-robot")) {
      return {
        title: "Arduino Hospital Robot",
        type: isReportModal ? "Read Full Engineering Report" : isReportDownload ? "Downloaded Project PDF" : "Explored Project",
        badge: isReportModal ? "📄 Report Opened" : isReportDownload ? "📥 PDF Saved" : "🤖 Project",
        badgeColor: isReportModal ? "#10b981" : "#38bdf8",
        icon: "🤖",
        cleanPath: "/projects/arduino-hospital-robot",
      };
    }

    if (p.includes("frequency-selective")) {
      return {
        title: "Frequency-Selective Circuit",
        type: isReportModal ? "Read Analog Filter Report" : isReportDownload ? "Downloaded Project PDF" : "Explored Project",
        badge: isReportModal ? "📄 Report Opened" : isReportDownload ? "📥 PDF Saved" : "📻 Project",
        badgeColor: isReportModal ? "#10b981" : "#38bdf8",
        icon: "📻",
        cleanPath: "/projects/frequency-selective-circuit",
      };
    }

    if (p.includes("fifo-buffer")) {
      return {
        title: "FIFO Buffer Design & SystemVerilog",
        type: isReportModal ? "Read Verification Report" : isReportDownload ? "Downloaded Project PDF" : "Explored Project",
        badge: isReportModal ? "📄 Report Opened" : isReportDownload ? "📥 PDF Saved" : "💾 Project",
        badgeColor: isReportModal ? "#10b981" : "#38bdf8",
        icon: "💾",
        cleanPath: "/projects/fifo-buffer",
      };
    }

    if (p.startsWith("/projects/")) {
      const slug = raw.replace("/projects/", "").replace(/\s*\[.*\]/, "").replace(/#.*/, "");
      const cleanTitle = slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      return {
        title: cleanTitle || "Project Details",
        type: isReportModal ? "Read Full Report" : "Viewed Project",
        badge: isReportModal ? "📄 Report Opened" : "📁 Project",
        badgeColor: isReportModal ? "#10b981" : "#818cf8",
        icon: "📁",
        cleanPath: `/projects/${slug}`,
      };
    }

    // Admin pages
    if (p.startsWith("/admin/analytics")) {
      return {
        title: "Website Traffic Analytics Dashboard",
        type: "Admin Analytics",
        badge: "📊 Analytics",
        badgeColor: "#a855f7",
        icon: "📊",
        cleanPath: "/admin/analytics",
      };
    }

    if (p.startsWith("/admin/messages")) {
      return {
        title: "Contact Messages & Inquiries Inbox",
        type: "Admin Messages",
        badge: "📬 Messages",
        badgeColor: "#a855f7",
        icon: "📬",
        cleanPath: "/admin/messages",
      };
    }

    if (p.startsWith("/admin/guide")) {
      return {
        title: "Guide AI Assistant Settings",
        type: "AI Management",
        badge: "💡 Guide AI",
        badgeColor: "#a855f7",
        icon: "💡",
        cleanPath: "/admin/guide",
      };
    }

    if (p.startsWith("/admin/projects")) {
      return {
        title: "Project Management Editor",
        type: "Admin Editor",
        badge: "🛠️ Projects CMS",
        badgeColor: "#a855f7",
        icon: "🛠️",
        cleanPath: "/admin/projects",
      };
    }

    if (p.startsWith("/admin")) {
      return {
        title: "Portfolio Admin Control Center",
        type: "Admin Session",
        badge: "🛡️ Admin Portal",
        badgeColor: "#a855f7",
        icon: "⚙️",
        cleanPath: "/admin",
      };
    }

    return {
      title: raw,
      type: "Portfolio Page",
      badge: "Route",
      badgeColor: "#64748b",
      icon: "🌐",
      cleanPath: raw,
    };
  };

  // Helper to render clean, professional location pills (avoids raw text or missing flag issues)
  const renderLocationBadge = (visit: RecentVisit) => {
    const isUnknown =
      !visit.country ||
      visit.country === "Location Not Detected" ||
      visit.country === "Direct / Unknown" ||
      visit.country.includes("Direct") ||
      visit.country === "Unknown";

    if (isUnknown) {
      return (
        <div className={styles.feedLocation}>
          <span className={styles.locationPillMuted}>
            <span>🌐</span> Location not detected
          </span>
        </div>
      );
    }

    const isLocal = visit.country === "Local Development" || visit.country === "LOCAL";
    if (isLocal) {
      return (
        <div className={styles.feedLocation}>
          <span className={styles.locationPillLocal}>
            <span>💻</span> Localhost Dev Session
          </span>
        </div>
      );
    }

    const cleanCity =
      visit.city &&
      visit.city !== "Unknown" &&
      !visit.city.includes("Direct") &&
      !visit.city.includes("Unknown")
        ? visit.city
        : "";

    return (
      <div className={styles.feedLocation}>
        <span className={styles.locationCountryTag}>
          <span className={styles.flagEmoji}>{visit.countryFlag || "🌐"}</span>
          <span className={styles.countryNameBold}>{visit.country}</span>
        </span>
        {cleanCity ? <span className={styles.cityNameSub}>• {cleanCity}</span> : null}
      </div>
    );
  };

  // Filter trends by selected time range
  const visibleTrends = trends.slice(-timeRange);

  // Format numbers
  const formatNumber = (num: number) => num.toLocaleString();

  // Active metrics based on selected segment (others vs me vs all)
  const activeMetrics =
    segment === "others"
      ? summary.publicMetrics || summary
      : segment === "me"
      ? summary.adminMetrics || summary
      : summary;

  const isGrowthPositive = activeMetrics.growthPercentage >= 0;

  // Trends Line chart datasets
  const lineChartData = {
    labels: visibleTrends.map((t) => t.date),
    datasets: [
      {
        label: "🌐 Public Visitors (Others)",
        data: visibleTrends.map((t) => t.publicViews),
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
        label: "🛡️ My Admin Visits (Me)",
        data: visibleTrends.map((t) => t.adminViews),
        borderColor: "#818cf8",
        backgroundColor: "rgba(129, 140, 248, 0.08)",
        borderWidth: 2,
        pointBackgroundColor: "#818cf8",
        pointBorderColor: "#090d16",
        pointHoverBackgroundColor: "#ffffff",
        pointHoverBorderColor: "#818cf8",
        pointRadius: visibleTrends.length <= 14 ? 4 : 2.5,
        pointHoverRadius: 6,
        borderDash: [5, 4],
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
        label: "🌐 Public Visitors (Others)",
        data: visibleTrends.map((t) => t.publicViews),
        backgroundColor: "rgba(56, 189, 248, 0.8)",
        borderColor: "#38bdf8",
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: "🛡️ My Admin Visits (Me)",
        data: visibleTrends.map((t) => t.adminViews),
        backgroundColor: "rgba(129, 140, 248, 0.75)",
        borderColor: "#818cf8",
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
            return `  ${label}: ${value.toLocaleString()} views`;
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
    labels: ["Public Visitors (Others)", "Admin Visits (Me)"],
    datasets: [
      {
        data: [visitorSplit?.publicVisits || 0, visitorSplit?.adminVisits || 0],
        backgroundColor: ["#38bdf8", "#818cf8"],
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

      {/* Primary Audience Segment Selector: Separate Me vs Others */}
      <section className={styles.segmentSection} aria-label="Audience Filter">
        <div className={styles.segmentHeaderRow}>
          <div>
            <span className={styles.segmentSubtitle}>Segment Traffic:</span>
            <h2 className={styles.segmentTitle}>Who are you analyzing?</h2>
          </div>

          <div className={styles.audienceTabs} role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={segment === "others"}
              onClick={() => setSegment("others")}
              className={`${styles.audienceTab} ${segment === "others" ? styles.audienceTabOthersActive : ""}`}
            >
              <span className={styles.audienceDotOthers} />
              <span className={styles.audienceTabLabel}>Others (Real Audience)</span>
              <span className={styles.audienceTabBadge}>{summary.publicVisits} views</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={segment === "me"}
              onClick={() => setSegment("me")}
              className={`${styles.audienceTab} ${segment === "me" ? styles.audienceTabMeActive : ""}`}
            >
              <span className={styles.audienceDotMe} />
              <span className={styles.audienceTabLabel}>Me (Admin Activity)</span>
              <span className={styles.audienceTabBadge}>{summary.adminVisits} views</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={segment === "all"}
              onClick={() => setSegment("all")}
              className={`${styles.audienceTab} ${segment === "all" ? styles.audienceTabAllActive : ""}`}
            >
              <span className={styles.audienceTabLabel}>All Traffic (Combined)</span>
              <span className={styles.audienceTabBadge}>{summary.totalPageViews} views</span>
            </button>
          </div>
        </div>

        {/* Informative Guidance Banner */}
        <div className={styles.segmentNotice}>
          {segment === "others" && (
            <p>
              <strong>🌐 Filtered to External Visitors:</strong> Excludes your own visits. This reflects actual recruiters, engineers, and outside guests exploring your portfolio.
            </p>
          )}
          {segment === "me" && (
            <p>
              <strong>🛡️ Filtered to Your Admin Activity:</strong> Tracks your own visits while signed in as administrator (editing projects, testing features, viewing analytics).
            </p>
          )}
          {segment === "all" && (
            <p>
              <strong>📊 Combined Traffic Overview:</strong> Displays total traffic encompassing both outside visitors and your personal admin sessions.
            </p>
          )}
        </div>
      </section>

      {/* 6 Metric Cards Grid tailored to current segment */}
      <section className={styles.metricGrid} aria-label="Website Traffic Metrics">
        {/* 1. Unique Visitors */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricIcon}>{segment === "others" ? "🌐" : segment === "me" ? "🛡️" : "👥"}</span>
            <span className={styles.metricLabel}>
              {segment === "others" ? "Real Unique Visitors" : segment === "me" ? "My Admin Devices" : "Total Unique Visitors"}
            </span>
          </div>
          <div className={styles.metricMainRow}>
            <div className={styles.metricValue}>{formatNumber(activeMetrics.totalUniqueVisitors)}</div>
            <Sparkline
              data={activeMetrics.sparklines?.uniqueVisitors || [1, 1, 1, 1, 1, 1, activeMetrics.totalUniqueVisitors]}
              color="#38bdf8"
              type="line"
              height={32}
            />
          </div>
          <div className={styles.metricSubtext}>
            {segment === "others"
              ? "Distinct external people tracked"
              : segment === "me"
              ? "Your authenticated sessions"
              : "All distinct visitors"}
          </div>
        </div>

        {/* 2. Page Views */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricIcon}>📊</span>
            <span className={styles.metricLabel}>
              {segment === "others" ? "Public Page Views" : segment === "me" ? "My Admin Views" : "Total Page Views"}
            </span>
          </div>
          <div className={styles.metricMainRow}>
            <div className={styles.metricValue}>{formatNumber(activeMetrics.totalPageViews)}</div>
            <Sparkline
              data={activeMetrics.sparklines?.pageViews || [1, 2, 2, 4, 5, 6, activeMetrics.totalPageViews]}
              color="#a855f7"
              type="bars"
              height={32}
            />
          </div>
          <div className={styles.metricSubtext}>
            {segment === "others"
              ? "Recorded views from others"
              : segment === "me"
              ? "Your testing & admin page views"
              : "Total recorded page views"}
          </div>
        </div>

        {/* 3. Today's Traffic */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricIcon}>⚡</span>
            <span className={styles.metricLabel}>
              {segment === "others" ? "Others' Views Today" : segment === "me" ? "My Views Today" : "Today's Traffic"}
            </span>
          </div>
          <div className={styles.metricMainRow}>
            <div className={styles.metricValue}>{formatNumber(activeMetrics.todayTraffic)}</div>
            <Sparkline
              data={activeMetrics.sparklines?.todayTraffic || [1, 2, 3, 4, 5, 6, activeMetrics.todayTraffic]}
              color="#fbbf24"
              type="line"
              height={32}
            />
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
            <div className={styles.metricValue}>{activeMetrics.averageDailyTraffic.toFixed(1)}</div>
            <Sparkline
              data={activeMetrics.sparklines?.avgTraffic || [0.1, 0.2, 0.2, 0.3, 0.3, activeMetrics.averageDailyTraffic]}
              color="#06b6d4"
              type="line"
              height={32}
            />
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
                {isGrowthPositive ? `+${activeMetrics.growthPercentage}%` : `${activeMetrics.growthPercentage}%`}
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
              data={activeMetrics.sparklines?.growth || [10, 20, 30, 50, 70, activeMetrics.growthPercentage]}
              color={isGrowthPositive ? "#34d399" : "#f87171"}
              type="line"
              height={32}
            />
          </div>
          <div className={styles.metricSubtext}>
            {activeMetrics.current7DayTraffic} views vs {activeMetrics.previous7DayTraffic} (prev 7d)
          </div>
        </div>

        {/* 6. Ratio / Share */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricIcon}>🎯</span>
            <span className={styles.metricLabel}>
              {segment === "others" ? "Public Traffic Share" : segment === "me" ? "My Admin Share" : "Traffic Split"}
            </span>
          </div>
          <div className={styles.metricMainRow}>
            <div className={styles.metricValue}>
              {segment === "others"
                ? `${visitorSplit.publicPercentage}%`
                : segment === "me"
                ? `${visitorSplit.adminPercentage}%`
                : `${visitorSplit.publicPercentage}% / ${visitorSplit.adminPercentage}%`}
            </div>
            <Sparkline
              data={
                segment === "others"
                  ? [20, 25, 25, 30, 30, visitorSplit.publicPercentage]
                  : [70, 75, 75, 70, 70, visitorSplit.adminPercentage]
              }
              color={segment === "others" ? "#38bdf8" : "#818cf8"}
              type="bars"
              height={32}
            />
          </div>
          <div className={styles.metricSubtext}>
            <span className={styles.includedTag}>
              {segment === "others"
                ? `${summary.publicVisits} of ${summary.totalPageViews} total views are Others`
                : segment === "me"
                ? `${summary.adminVisits} of ${summary.totalPageViews} total views are You`
                : `${summary.publicVisits} Public • ${summary.adminVisits} Admin`}
            </span>
          </div>
        </div>
      </section>

      {/* Visual Side-by-Side Comparison: Me (Left) vs Others (Right) */}
      <section className={styles.comparisonGrid} aria-label="Side-by-Side Comparison">
        {/* LEFT COLUMN: OTHERS (REAL AUDIENCE) */}
        <div className={`${styles.comparisonCard} ${styles.comparisonCardOthers}`}>
          <div className={styles.comparisonBadgeRow}>
            <span className={styles.badgeOthers}>🌐 OTHERS (REAL VISITORS)</span>
            <span className={styles.comparisonPctPill}>{visitorSplit.publicPercentage}% of total traffic</span>
          </div>

          <h3 className={styles.comparisonTitle}>External Audience & Recruiters</h3>
          <p className={styles.comparisonDesc}>
            People who found your portfolio from GitHub, LinkedIn, resumes, or search engines.
          </p>

          <div className={styles.comparisonStatGrid}>
            <div className={styles.comparisonStatBox}>
              <span className={styles.comparisonStatNum}>{visitorSplit.publicUniqueCount}</span>
              <span className={styles.comparisonStatLbl}>Unique People</span>
            </div>
            <div className={styles.comparisonStatBox}>
              <span className={styles.comparisonStatNum}>{visitorSplit.publicVisits}</span>
              <span className={styles.comparisonStatLbl}>Page Views</span>
            </div>
            <div className={styles.comparisonStatBox}>
              <span className={styles.comparisonStatNum}>
                {visitorSplit.publicUniqueCount > 0
                  ? (visitorSplit.publicVisits / visitorSplit.publicUniqueCount).toFixed(1)
                  : "0"}
              </span>
              <span className={styles.comparisonStatLbl}>Views / Visitor</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ME (ADMIN / OWNER) */}
        <div className={`${styles.comparisonCard} ${styles.comparisonCardMe}`}>
          <div className={styles.comparisonBadgeRow}>
            <span className={styles.badgeMe}>🛡️ ME (OWNER / ADMIN)</span>
            <span className={styles.comparisonPctPill}>{visitorSplit.adminPercentage}% of total traffic</span>
          </div>

          <h3 className={styles.comparisonTitle}>My Personal Admin Activity</h3>
          <p className={styles.comparisonDesc}>
            Your own views while testing projects, updating skills, viewing reports, and checking analytics.
          </p>

          <div className={styles.comparisonStatGrid}>
            <div className={styles.comparisonStatBox}>
              <span className={styles.comparisonStatNum}>{visitorSplit.adminUniqueCount}</span>
              <span className={styles.comparisonStatLbl}>Admin Device(s)</span>
            </div>
            <div className={styles.comparisonStatBox}>
              <span className={styles.comparisonStatNum}>{visitorSplit.adminVisits}</span>
              <span className={styles.comparisonStatLbl}>Testing Views</span>
            </div>
            <div className={styles.comparisonStatBox}>
              <span className={styles.comparisonStatNum}>
                {visitorSplit.adminVisits > 0 ? "Active" : "None"}
              </span>
              <span className={styles.comparisonStatLbl}>Session State</span>
            </div>
          </div>
        </div>
      </section>

      {/* Traffic Trends Chart Card */}
      <section className={styles.chartSection}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h2 className={styles.chartTitle}>Traffic Trends: Me vs Others</h2>
              <p className={styles.chartSubtitle}>
                Clear visual comparison of outside visitors vs. your own admin testing over the last {timeRange} days
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
              <span className={styles.legendColorBoxOthers} />
              <span>🌐 Public Visitors (Others) - Cyan Curve</span>
            </div>
            <div className={styles.legendIndicator}>
              <span className={styles.legendColorBoxMe} />
              <span>🛡️ My Admin Visits (Me) - Indigo Dashed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Analytics Breakdown Row: Visitor Split + Top Pages */}
      <section className={styles.breakdownGrid}>
        {/* 1. Visitor Composition (Me vs Others) Donut Graph */}
        <div className={styles.breakdownCard}>
          <div className={styles.breakdownHeader}>
            <h3 className={styles.breakdownTitle}>Traffic Ratio: Me vs Others</h3>
            <span className={styles.breakdownBadge}>Volume Split</span>
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
                  <span className={styles.donutDotPublic} />
                  <span>🌐 Public Visitors (Others)</span>
                </div>
                <div className={styles.donutLegendRight}>
                  <strong>{visitorSplit?.publicVisits || 0}</strong>
                  <span className={styles.donutLegendPct}>({visitorSplit?.publicPercentage || 0}%)</span>
                </div>
              </div>

              <div className={styles.donutLegendItem}>
                <div className={styles.donutLegendLeft}>
                  <span className={styles.donutDotAdmin} />
                  <span>🛡️ My Admin Visits (Me)</span>
                </div>
                <div className={styles.donutLegendRight}>
                  <strong>{visitorSplit?.adminVisits || 0}</strong>
                  <span className={styles.donutLegendPct}>({visitorSplit?.adminPercentage || 0}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Top Visited Pages with Me vs Others Breakdown */}
        <div className={styles.breakdownCard}>
          <div className={styles.breakdownHeader}>
            <h3 className={styles.breakdownTitle}>Pages Viewed: Me vs Others</h3>
            <span className={styles.breakdownBadge}>By Route</span>
          </div>

          <div className={styles.pageListContainer}>
            {topPages.length === 0 ? (
              <div className={styles.emptyPages}>No page views recorded yet.</div>
            ) : (
              topPages.map((page, idx) => {
                const pageDetails = getProjectOrPageDetails(page.path);
                return (
                  <div key={idx} className={styles.pageRow}>
                    <div className={styles.pageInfoRow}>
                      <span className={styles.pagePath} title={page.path}>
                        <span style={{ marginRight: "6px" }}>{pageDetails.icon}</span>
                        {pageDetails.title}
                      </span>
                      <span className={styles.pageCount}>
                        <strong>{page.views}</strong> views{" "}
                        <span className={styles.pageCountBreakdown}>
                          ({page.publicViews} others • {page.adminViews} me)
                        </span>
                      </span>
                    </div>
                    <div className={styles.pageProgressBarTrack}>
                      <div
                        className={styles.pageProgressBarFill}
                        style={{
                          width: `${Math.max(8, page.percentage)}%`,
                          background:
                            page.publicViews > page.adminViews
                              ? "linear-gradient(90deg, #38bdf8, #818cf8)"
                              : "linear-gradient(90deg, #818cf8, #a855f7)",
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Traffic Sources & Geographic Origin Row */}
      <section className={styles.breakdownGrid}>
        {/* 1. Traffic Sources & Referrers */}
        <div className={styles.breakdownCard}>
          <div className={styles.breakdownHeader}>
            <div>
              <h3 className={styles.breakdownTitle}>Traffic Sources</h3>
              <p className={styles.cardSubtitle}>Where visitors found your portfolio</p>
            </div>
            <span className={styles.breakdownBadge}>Acquisition</span>
          </div>

          <div className={styles.sourceListContainer}>
            {topReferrers.length === 0 ? (
              <div className={styles.emptyPages}>No referral traffic recorded yet.</div>
            ) : (
              topReferrers.map((ref, idx) => {
                const badge = getReferrerBadge(ref.source);
                return (
                  <div key={idx} className={styles.sourceRow}>
                    <div className={styles.sourceInfoRow}>
                      <div className={styles.sourceLabelGroup}>
                        <span className={styles.sourceIcon}>{badge.icon}</span>
                        <span className={styles.sourceName}>{badge.label}</span>
                      </div>
                      <span className={styles.sourceCount}>
                        <strong>{ref.views.toLocaleString()}</strong> views ({ref.percentage}%)
                      </span>
                    </div>
                    <div className={styles.pageProgressBarTrack}>
                      <div
                        className={styles.pageProgressBarFill}
                        style={{
                          width: `${Math.max(6, ref.percentage)}%`,
                          background: badge.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className={styles.cardFooterNote}>
            <span>💡 Tip: Share links with <code>?ref=resume</code> or <code>?ref=linkedin</code> to track exact application sources.</span>
          </div>
        </div>

        {/* 2. Geographic Visitor Locations */}
        <div className={styles.breakdownCard}>
          <div className={styles.breakdownHeader}>
            <div>
              <h3 className={styles.breakdownTitle}>Visitor Geography</h3>
              <p className={styles.cardSubtitle}>Countries & regions visiting your site</p>
            </div>
            <span className={styles.breakdownBadge}>Location</span>
          </div>

          <div className={styles.sourceListContainer}>
            {topCountries.length === 0 ? (
              <div className={styles.emptyPages}>No geographic data recorded yet.</div>
            ) : (
              topCountries.map((c, idx) => (
                <div key={idx} className={styles.sourceRow}>
                  <div className={styles.sourceInfoRow}>
                    <div className={styles.sourceLabelGroup}>
                      <span className={styles.countryFlag}>{c.flag}</span>
                      <span className={styles.countryName}>{c.country}</span>
                      <span className={styles.countryCodeBadge}>{c.code}</span>
                    </div>
                    <span className={styles.sourceCount}>
                      <strong>{c.views.toLocaleString()}</strong> views ({c.percentage}%)
                    </span>
                  </div>
                  <div className={styles.pageProgressBarTrack}>
                    <div
                      className={styles.pageProgressBarFill}
                      style={{
                        width: `${Math.max(6, c.percentage)}%`,
                        background: "linear-gradient(90deg, #10b981, #38bdf8)",
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
          <div className={styles.cardFooterNote}>
            <span>🌐 Resolved at the edge via server IP geolocation headers (zero personal IP storage).</span>
          </div>
        </div>
      </section>

      {/* Live Visitor Activity Feed */}
      <section className={styles.feedCard}>
        <div className={styles.feedHeader}>
          <div className={styles.feedTitleBlock}>
            <div className={styles.feedTitleRow}>
              <h3 className={styles.feedTitle}>Live Visitor Activity Feed</h3>
              <span className={styles.feedLiveBadge}>
                <span className={styles.liveDot} />
                Recent Sessions
              </span>
            </div>
            <p className={styles.cardSubtitle}>
              Stream of recent visits showing who browsed, where they arrived from, exact arrival date &amp; time, and exact projects or reports read.
            </p>
          </div>

          <div className={styles.feedFilterTabs} role="tablist">
            <button
              type="button"
              className={`${styles.feedFilterTab} ${feedFilter === "all" ? styles.feedFilterTabActive : ""}`}
              onClick={() => setFeedFilter("all")}
            >
              All ({recentVisits.length})
            </button>
            <button
              type="button"
              className={`${styles.feedFilterTab} ${feedFilter === "others" ? styles.feedFilterTabActive : ""}`}
              onClick={() => setFeedFilter("others")}
            >
              🌐 Guests Only ({recentVisits.filter((v) => !v.isAdmin).length})
            </button>
            <button
              type="button"
              className={`${styles.feedFilterTab} ${feedFilter === "me" ? styles.feedFilterTabActive : ""}`}
              onClick={() => setFeedFilter("me")}
            >
              🛡️ Admin Only ({recentVisits.filter((v) => v.isAdmin).length})
            </button>
          </div>
        </div>

        <div className={styles.feedTableWrapper}>
          {filteredVisits.length === 0 ? (
            <div className={styles.emptyFeed}>
              <span className={styles.emptyIcon}>📡</span>
              <p>No visitor activity matches this filter yet.</p>
            </div>
          ) : (
            <div className={styles.feedList}>
              {filteredVisits.map((visit) => {
                const refBadge = getReferrerBadge(visit.referrer);
                const pageDetails = getProjectOrPageDetails(visit.pagePath);

                return (
                  <div
                    key={visit.id}
                    className={`${styles.feedCardItem} ${visit.isAdmin ? styles.feedItemAdmin : styles.feedItemPublic}`}
                  >
                    {/* Top Row: Visitor Identity, Location, Traffic Source, Device */}
                    <div className={styles.feedCardTopRow}>
                      <div className={styles.feedAudienceAndLocation}>
                        {visit.isAdmin ? (
                          <span className={styles.badgeAdmin}>
                            <span>🛡️</span> You (Admin Session)
                          </span>
                        ) : (
                          <span className={styles.badgePublic}>
                            <span>🌐</span> Real External Guest / Recruiter
                          </span>
                        )}

                        {renderLocationBadge(visit)}
                      </div>

                      <div className={styles.feedMetaTags}>
                        <span
                          className={styles.feedSourceBadge}
                          style={{
                            backgroundColor: refBadge.bg,
                            borderColor: refBadge.border,
                            color: refBadge.color,
                          }}
                        >
                          <span>{refBadge.icon}</span>
                          <span>{refBadge.label}</span>
                        </span>

                        <span className={styles.feedDeviceBadge}>
                          {visit.deviceType.toLowerCase().includes("mobile") ? "📱 Mobile" : "💻 Desktop"}
                        </span>
                      </div>
                    </div>

                    {/* Mid Row: Exact Project / Page Explored + Exact Arrival Date & Time */}
                    <div className={styles.feedCardMidRow}>
                      <div className={styles.pageDetailsBlock}>
                        <span className={styles.pageIcon}>{pageDetails.icon}</span>
                        <div className={styles.pageTextGroup}>
                          <div className={styles.pageTitleLine}>
                            <strong className={styles.pageTitle}>{pageDetails.title}</strong>
                            <span
                              className={styles.pageTypeBadge}
                              style={{
                                backgroundColor: `${pageDetails.badgeColor}18`,
                                borderColor: `${pageDetails.badgeColor}40`,
                                color: pageDetails.badgeColor,
                              }}
                            >
                              {pageDetails.badge}
                            </span>
                          </div>
                          <span className={styles.pageCleanPath}>{pageDetails.cleanPath}</span>
                        </div>
                      </div>

                      {/* Exact Arrival Date & Time formatted dynamically in visitor's local system timezone */}
                      <FormattedTimestamp
                        isoString={visit.visitedAt}
                        fallbackTimeAgo={visit.timeAgo}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
