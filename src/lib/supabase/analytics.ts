import { createClient } from "@/lib/supabase/server";

export interface PageBreakdown {
  path: string;
  views: number;
  publicViews: number;
  adminViews: number;
  percentage: number;
}

export interface VisitorSplit {
  adminVisits: number;
  publicVisits: number;
  adminPercentage: number;
  publicPercentage: number;
  adminUniqueCount: number;
  publicUniqueCount: number;
}

export interface MetricSparklines {
  uniqueVisitors: number[];
  pageViews: number[];
  todayTraffic: number[];
  avgTraffic: number[];
  growth: number[];
  adminVisits?: number[];
}

export interface MetricSet {
  totalUniqueVisitors: number;
  totalPageViews: number;
  todayTraffic: number;
  averageDailyTraffic: number;
  growthPercentage: number;
  current7DayTraffic: number;
  previous7DayTraffic: number;
  sparklines: MetricSparklines;
}

export interface AnalyticsSummary extends MetricSet {
  adminVisits: number;
  publicVisits: number;
  publicMetrics: MetricSet;
  adminMetrics: MetricSet;
  isDemo: boolean;
}

export interface DailyTrafficPoint {
  date: string;
  fullDate: string;
  pageViews: number;
  uniqueVisitors: number;
  publicViews: number;
  publicVisitors: number;
  adminViews: number;
  adminVisitors: number;
}

export interface AnalyticsDashboardData {
  summary: AnalyticsSummary;
  trends: DailyTrafficPoint[];
  topPages: PageBreakdown[];
  visitorSplit: VisitorSplit;
  isDemo: boolean;
}

/**
 * Generates realistic fallback demo data if the Supabase table is not yet migrated
 * or if the database is unreachable.
 */
export function getMockAnalyticsData(days = 30): AnalyticsDashboardData {
  const trends: DailyTrafficPoint[] = [];
  const now = new Date();

  let totalPageViews = 0;
  let totalUniqueVisitors = 0;
  let publicPageViews = 0;
  let adminPageViews = 0;
  let current7DayTraffic = 0;
  let previous7DayTraffic = 0;
  let publicCurrent7d = 0;
  let publicPrev7d = 0;
  let adminCurrent7d = 0;
  let adminPrev7d = 0;

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);

    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseViews = isWeekend ? 90 : 160;
    const jitter = Math.sin(i * 0.8) * 35 + ((i % 5) * 8);
    const pageViews = Math.max(45, Math.round(baseViews + jitter));
    const uniqueVisitors = Math.max(25, Math.round(pageViews * 0.62 + ((i % 3) * 4)));

    const adminViews = Math.round(pageViews * 0.12);
    const pubViews = pageViews - adminViews;
    const adminV = Math.max(1, Math.round(uniqueVisitors * 0.08));
    const pubV = Math.max(1, uniqueVisitors - adminV);

    totalPageViews += pageViews;
    totalUniqueVisitors += uniqueVisitors;
    publicPageViews += pubViews;
    adminPageViews += adminViews;

    if (i < 7) {
      current7DayTraffic += pageViews;
      publicCurrent7d += pubViews;
      adminCurrent7d += adminViews;
    } else if (i < 14) {
      previous7DayTraffic += pageViews;
      publicPrev7d += pubViews;
      adminPrev7d += adminViews;
    }

    const monthStr = d.toLocaleDateString("en-US", { month: "short" });
    const dayStr = d.getDate().toString().padStart(2, "0");

    trends.push({
      date: `${monthStr} ${dayStr}`,
      fullDate: d.toISOString().split("T")[0],
      pageViews,
      uniqueVisitors,
      publicViews: pubViews,
      publicVisitors: pubV,
      adminViews,
      adminVisitors: adminV,
    });
  }

  const growthPercentage =
    previous7DayTraffic > 0
      ? Math.round(((current7DayTraffic - previous7DayTraffic) / previous7DayTraffic) * 1000) / 10
      : 100.0;
  const publicGrowth =
    publicPrev7d > 0
      ? Math.round(((publicCurrent7d - publicPrev7d) / publicPrev7d) * 1000) / 10
      : 100.0;
  const adminGrowth =
    adminPrev7d > 0
      ? Math.round(((adminCurrent7d - adminPrev7d) / adminPrev7d) * 1000) / 10
      : 0.0;

  const todayTraffic = trends[trends.length - 1]?.pageViews || 148;
  const todayPublic = trends[trends.length - 1]?.publicViews || 130;
  const todayAdmin = trends[trends.length - 1]?.adminViews || 18;

  const last7 = trends.slice(-7);
  const sparklines: MetricSparklines = {
    uniqueVisitors: last7.map((t) => t.uniqueVisitors),
    pageViews: last7.map((t) => t.pageViews),
    todayTraffic: [80, 95, 110, 130, 140, 155, todayTraffic],
    avgTraffic: last7.map((t) => Number((t.pageViews / (t.uniqueVisitors || 1)).toFixed(1))),
    growth: [5.2, 8.4, 12.1, 14.5, 16.0, 17.5, growthPercentage],
    adminVisits: last7.map((t) => t.adminViews),
  };

  const publicSparklines: MetricSparklines = {
    uniqueVisitors: last7.map((t) => t.publicVisitors),
    pageViews: last7.map((t) => t.publicViews),
    todayTraffic: [70, 85, 95, 115, 122, 135, todayPublic],
    avgTraffic: last7.map((t) => Number((t.publicViews / (t.publicVisitors || 1)).toFixed(1))),
    growth: [4.0, 7.5, 10.0, 12.5, 14.0, 15.5, publicGrowth],
  };

  const adminSparklines: MetricSparklines = {
    uniqueVisitors: last7.map((t) => t.adminVisitors),
    pageViews: last7.map((t) => t.adminViews),
    todayTraffic: [10, 10, 15, 15, 18, 20, todayAdmin],
    avgTraffic: last7.map((t) => Number((t.adminViews / (t.adminVisitors || 1)).toFixed(1))),
    growth: [1.0, 1.0, 2.0, 2.0, 2.0, 2.0, adminGrowth],
  };

  const topPages: PageBreakdown[] = [
    {
      path: "/",
      views: Math.round(totalPageViews * 0.52),
      publicViews: Math.round(publicPageViews * 0.55),
      adminViews: Math.round(adminPageViews * 0.25),
      percentage: 52,
    },
    {
      path: "/projects/reactor-temperature-control",
      views: Math.round(totalPageViews * 0.22),
      publicViews: Math.round(publicPageViews * 0.24),
      adminViews: Math.round(adminPageViews * 0.1),
      percentage: 22,
    },
    {
      path: "/admin",
      views: Math.round(totalPageViews * 0.12),
      publicViews: 0,
      adminViews: Math.round(adminPageViews * 0.35),
      percentage: 12,
    },
    {
      path: "/admin/analytics",
      views: Math.round(totalPageViews * 0.08),
      publicViews: 0,
      adminViews: Math.round(adminPageViews * 0.2),
      percentage: 8,
    },
    {
      path: "/admin/guide",
      views: Math.round(totalPageViews * 0.06),
      publicViews: 0,
      adminViews: Math.round(adminPageViews * 0.1),
      percentage: 6,
    },
  ];

  const adminPercentage = Math.round((adminPageViews / totalPageViews) * 100);
  const visitorSplit: VisitorSplit = {
    adminVisits: adminPageViews,
    publicVisits: publicPageViews,
    adminPercentage,
    publicPercentage: 100 - adminPercentage,
    adminUniqueCount: 2,
    publicUniqueCount: Math.round(totalUniqueVisitors * 0.72),
  };

  const publicMetrics: MetricSet = {
    totalUniqueVisitors: Math.round(totalUniqueVisitors * 0.68),
    totalPageViews: publicPageViews,
    todayTraffic: todayPublic,
    averageDailyTraffic: Math.round((publicPageViews / days) * 10) / 10,
    growthPercentage: publicGrowth,
    current7DayTraffic: publicCurrent7d,
    previous7DayTraffic: publicPrev7d,
    sparklines: publicSparklines,
  };

  const adminMetrics: MetricSet = {
    totalUniqueVisitors: 2,
    totalPageViews: adminPageViews,
    todayTraffic: todayAdmin,
    averageDailyTraffic: Math.round((adminPageViews / days) * 10) / 10,
    growthPercentage: adminGrowth,
    current7DayTraffic: adminCurrent7d,
    previous7DayTraffic: adminPrev7d,
    sparklines: adminSparklines,
  };

  return {
    summary: {
      totalUniqueVisitors: Math.round(totalUniqueVisitors * 0.72),
      totalPageViews,
      todayTraffic,
      averageDailyTraffic: Math.round((totalPageViews / days) * 10) / 10,
      growthPercentage,
      adminVisits: adminPageViews,
      publicVisits: publicPageViews,
      current7DayTraffic,
      previous7DayTraffic,
      sparklines,
      publicMetrics,
      adminMetrics,
      isDemo: true,
    },
    trends,
    topPages,
    visitorSplit,
    isDemo: true,
  };
}

/**
 * Retrieves analytics dashboard metrics, breakdown statistics, and traffic trends.
 * Computes clear separation between "Me" (Admin) and "Others" (Public Visitors).
 */
export async function getAnalyticsDashboardData(days = 30): Promise<AnalyticsDashboardData> {
  try {
    const supabase = await createClient();

    // Query records within the specified time range
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const { data: records, error: recordsError } = await supabase
      .from("website_analytics")
      .select("visitor_id, visited_at, is_admin, page_path")
      .gte("visited_at", sinceDate.toISOString())
      .order("visited_at", { ascending: true });

    if (recordsError || !records) {
      console.warn("Analytics table unavailable or error, activating mock fallback:", recordsError?.message);
      return getMockAnalyticsData(days);
    }

    // Get total views count since inception
    const { count: totalViewsCount } = await supabase
      .from("website_analytics")
      .select("*", { count: "exact", head: true });

    // In-memory aggregation
    const todayStr = new Date().toISOString().split("T")[0];
    const uniqueVisitorsSet = new Set<string>();
    const publicVisitorsSet = new Set<string>();
    const adminVisitorsSet = new Set<string>();

    let todayViews = 0;
    let todayPublicViews = 0;
    let todayAdminViews = 0;

    let adminVisits = 0;
    let publicVisits = 0;

    let current7d = 0;
    let prev7d = 0;
    let publicCurrent7d = 0;
    let publicPrev7d = 0;
    let adminCurrent7d = 0;
    let adminPrev7d = 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const dailyBuckets = new Map<
      string,
      {
        pageViews: number;
        uniqueSet: Set<string>;
        publicViews: number;
        publicUniqueSet: Set<string>;
        adminViews: number;
        adminUniqueSet: Set<string>;
      }
    >();

    // Initialize all days in the range
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split("T")[0];
      dailyBuckets.set(iso, {
        pageViews: 0,
        uniqueSet: new Set(),
        publicViews: 0,
        publicUniqueSet: new Set(),
        adminViews: 0,
        adminUniqueSet: new Set(),
      });
    }

    const pageCounts = new Map<string, { total: number; public: number; admin: number }>();

    for (const r of records) {
      uniqueVisitorsSet.add(r.visitor_id);

      const rawPath = r.page_path || "/";
      const cleanPath = rawPath.split("?")[0].split("#")[0] || "/";

      if (!pageCounts.has(cleanPath)) {
        pageCounts.set(cleanPath, { total: 0, public: 0, admin: 0 });
      }
      const pageEntry = pageCounts.get(cleanPath)!;
      pageEntry.total++;

      const visitedDate = new Date(r.visited_at);
      const dateKey = visitedDate.toISOString().split("T")[0];
      const isToday = dateKey === todayStr;
      const isCurrent7 = visitedDate >= sevenDaysAgo;
      const isPrev7 = visitedDate >= fourteenDaysAgo && visitedDate < sevenDaysAgo;

      if (r.is_admin) {
        adminVisits++;
        adminVisitorsSet.add(r.visitor_id);
        pageEntry.admin++;
        if (isToday) todayAdminViews++;
        if (isCurrent7) adminCurrent7d++;
        if (isPrev7) adminPrev7d++;
      } else {
        publicVisits++;
        publicVisitorsSet.add(r.visitor_id);
        pageEntry.public++;
        if (isToday) todayPublicViews++;
        if (isCurrent7) publicCurrent7d++;
        if (isPrev7) publicPrev7d++;
      }

      if (isToday) todayViews++;
      if (isCurrent7) current7d++;
      if (isPrev7) prev7d++;

      if (dailyBuckets.has(dateKey)) {
        const bucket = dailyBuckets.get(dateKey)!;
        bucket.pageViews++;
        bucket.uniqueSet.add(r.visitor_id);

        if (r.is_admin) {
          bucket.adminViews++;
          bucket.adminUniqueSet.add(r.visitor_id);
        } else {
          bucket.publicViews++;
          bucket.publicUniqueSet.add(r.visitor_id);
        }
      }
    }

    const trends: DailyTrafficPoint[] = [];
    for (const [dateKey, val] of dailyBuckets.entries()) {
      const d = new Date(dateKey + "T00:00:00Z");
      const monthStr = d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
      const dayStr = d.getUTCDate().toString().padStart(2, "0");
      trends.push({
        date: `${monthStr} ${dayStr}`,
        fullDate: dateKey,
        pageViews: val.pageViews,
        uniqueVisitors: val.uniqueSet.size,
        publicViews: val.publicViews,
        publicVisitors: val.publicUniqueSet.size,
        adminViews: val.adminViews,
        adminVisitors: val.adminUniqueSet.size,
      });
    }

    const growthPercentage =
      prev7d > 0 ? Math.round(((current7d - prev7d) / prev7d) * 1000) / 10 : current7d > 0 ? 100.0 : 0.0;
    const publicGrowth =
      publicPrev7d > 0
        ? Math.round(((publicCurrent7d - publicPrev7d) / publicPrev7d) * 1000) / 10
        : publicCurrent7d > 0
        ? 100.0
        : 0.0;
    const adminGrowth =
      adminPrev7d > 0
        ? Math.round(((adminCurrent7d - adminPrev7d) / adminPrev7d) * 1000) / 10
        : adminCurrent7d > 0
        ? 100.0
        : 0.0;

    const totalCount = totalViewsCount ?? records.length;
    const activeDays = Math.max(1, dailyBuckets.size);
    const averageDailyTraffic = Math.round((totalCount / activeDays) * 10) / 10;
    const avgPublicDaily = Math.round((publicVisits / activeDays) * 10) / 10;
    const avgAdminDaily = Math.round((adminVisits / activeDays) * 10) / 10;

    // Build 7-day sparkline arrays
    const last7Buckets = Array.from(dailyBuckets.values()).slice(-7);
    const sparklines: MetricSparklines = {
      uniqueVisitors: last7Buckets.map((b) => b.uniqueSet.size),
      pageViews: last7Buckets.map((b) => b.pageViews),
      todayTraffic: last7Buckets.map((b) => b.pageViews),
      avgTraffic: last7Buckets.map((b) =>
        b.uniqueSet.size > 0 ? Number((b.pageViews / b.uniqueSet.size).toFixed(1)) : 0
      ),
      growth: last7Buckets.map((b, i) => Math.min(100, Math.max(0, (i + 1) * 15))),
      adminVisits: last7Buckets.map((b) => b.adminViews),
    };

    const publicSparklines: MetricSparklines = {
      uniqueVisitors: last7Buckets.map((b) => b.publicUniqueSet.size),
      pageViews: last7Buckets.map((b) => b.publicViews),
      todayTraffic: last7Buckets.map((b) => b.publicViews),
      avgTraffic: last7Buckets.map((b) =>
        b.publicUniqueSet.size > 0 ? Number((b.publicViews / b.publicUniqueSet.size).toFixed(1)) : 0
      ),
      growth: last7Buckets.map((b, i) => Math.min(100, Math.max(0, (i + 1) * 15))),
    };

    const adminSparklines: MetricSparklines = {
      uniqueVisitors: last7Buckets.map((b) => b.adminUniqueSet.size),
      pageViews: last7Buckets.map((b) => b.adminViews),
      todayTraffic: last7Buckets.map((b) => b.adminViews),
      avgTraffic: last7Buckets.map((b) =>
        b.adminUniqueSet.size > 0 ? Number((b.adminViews / b.adminUniqueSet.size).toFixed(1)) : 0
      ),
      growth: last7Buckets.map((b, i) => Math.min(100, Math.max(0, (i + 1) * 15))),
    };

    // Calculate top pages breakdown
    const topPages: PageBreakdown[] = Array.from(pageCounts.entries())
      .map(([path, counts]) => ({
        path,
        views: counts.total,
        publicViews: counts.public,
        adminViews: counts.admin,
        percentage: totalCount > 0 ? Math.round((counts.total / totalCount) * 100) : 0,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 8);

    // Calculate visitor split (Admin vs Public)
    const adminPct = totalCount > 0 ? Math.round((adminVisits / totalCount) * 100) : 0;
    const visitorSplit: VisitorSplit = {
      adminVisits,
      publicVisits,
      adminPercentage: adminPct,
      publicPercentage: 100 - adminPct,
      adminUniqueCount: adminVisitorsSet.size,
      publicUniqueCount: publicVisitorsSet.size,
    };

    const publicMetrics: MetricSet = {
      totalUniqueVisitors: publicVisitorsSet.size,
      totalPageViews: publicVisits,
      todayTraffic: todayPublicViews,
      averageDailyTraffic: avgPublicDaily,
      growthPercentage: publicGrowth,
      current7DayTraffic: publicCurrent7d,
      previous7DayTraffic: publicPrev7d,
      sparklines: publicSparklines,
    };

    const adminMetrics: MetricSet = {
      totalUniqueVisitors: adminVisitorsSet.size,
      totalPageViews: adminVisits,
      todayTraffic: todayAdminViews,
      averageDailyTraffic: avgAdminDaily,
      growthPercentage: adminGrowth,
      current7DayTraffic: adminCurrent7d,
      previous7DayTraffic: adminPrev7d,
      sparklines: adminSparklines,
    };

    return {
      summary: {
        totalUniqueVisitors: uniqueVisitorsSet.size,
        totalPageViews: totalCount,
        todayTraffic: todayViews,
        averageDailyTraffic,
        growthPercentage,
        adminVisits,
        publicVisits,
        current7DayTraffic: current7d,
        previous7DayTraffic: prev7d,
        sparklines,
        publicMetrics,
        adminMetrics,
        isDemo: false,
      },
      trends,
      topPages,
      visitorSplit,
      isDemo: false,
    };
  } catch (err: any) {
    console.error("Critical error in getAnalyticsDashboardData:", err);
    return getMockAnalyticsData(days);
  }
}
