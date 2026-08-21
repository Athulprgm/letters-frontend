'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBagShopping,
  faClock,
  faCircleCheck,
  faTruck,
  faBox,
  faIndianRupeeSign,
  faArrowRight,
  faPlus,
  faArrowUpRightFromSquare,
  faLayerGroup,
  faGift,
  faGear,
  faPercent,
  faArrowTrendUp,
  faSignal,
  faRotateRight,
  faCheck,
  faBoxesStacked,
  faChartPie,
  faChartSimple,
  faChartLine,
  faCalendar,
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { useOrderStore } from '@/src/store/orderStore';
import { useProductStore } from '@/src/store/productStore';
import { useCategoryStore } from '@/src/store/categoryStore';
import { useFestivalStore } from '@/src/store/festivalStore';
import { useSaleBannerStore } from '@/src/store/saleBannerStore';
import { useSettingsStore } from '@/src/store/settingsStore';

export default function AdminDashboardPage() {
  const { orders, fetchOrders, updateOrderStatus } = useOrderStore();
  const { products, fetchProducts } = useProductStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { festivals, showcaseFestival, fetchFestivals } = useFestivalStore();
  const { saleBanner, fetchSaleBanner } = useSaleBannerStore();
  const { settings } = useSettingsStore();

  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [activeHoverBar, setActiveHoverBar] = useState(null);
  const [chartViewMode, setChartViewMode] = useState('revenue'); // 'revenue' | 'orders'
  const [lastRefreshed, setLastRefreshed] = useState('');

  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchCategories();
    fetchFestivals();
    fetchSaleBanner();
    setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }, [fetchOrders, fetchProducts, fetchCategories, fetchFestivals, fetchSaleBanner]);

  const handleRefresh = async () => {
    await Promise.all([
      fetchOrders(),
      fetchProducts(),
      fetchCategories(),
      fetchFestivals(),
      fetchSaleBanner(),
    ]);
    setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  // Metrics calculations
  const metrics = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === 'Pending').length;
    const confirmed = orders.filter((o) => o.status === 'Confirmed').length;
    const preparing = orders.filter((o) => o.status === 'Preparing').length;
    const ready = orders.filter((o) => o.status === 'Ready').length;
    const delivered = orders.filter((o) => o.status === 'Delivered').length;
    const cancelled = orders.filter((o) => o.status === 'Cancelled').length;

    const inProgress = confirmed + preparing + ready;

    const validOrders = orders.filter((o) => o.status !== 'Cancelled');
    const revenue = validOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const aov = validOrders.length > 0 ? Math.round(revenue / validOrders.length) : 0;
    const fulfillmentRate = total > 0 ? Math.round((delivered / total) * 100) : 100;

    const inStock = products.filter((p) => Number(p.stock || 10) > 3).length;
    const lowStock = products.filter((p) => Number(p.stock || 10) <= 3).length;
    const stockHealth = products.length > 0 ? Math.round((inStock / products.length) * 100) : 100;

    return {
      total,
      pending,
      confirmed,
      preparing,
      ready,
      delivered,
      cancelled,
      inProgress,
      revenue,
      aov,
      fulfillmentRate,
      inStock,
      lowStock,
      stockHealth,
    };
  }, [orders, products]);

  // Dynamic 7-day timeline trend data from 100% REAL orders
  const weeklySalesData = useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();

    const list = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
      const dayLabel = dayNames[d.getDay()];

      // Match orders placed strictly on this calendar date
      const matchingOrders = orders.filter((o) => {
        if (!o.createdAt || o.status === 'Cancelled') return false;
        try {
          const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
          return orderDate === dateStr;
        } catch {
          return false;
        }
      });

      const dayRevenue = matchingOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
      const dayOrders = matchingOrders.length;

      list.push({
        dateStr,
        day: dayLabel,
        revenue: dayRevenue,
        orders: dayOrders,
        isToday: i === 0,
      });
    }

    const totalPeriodRev = list.reduce((sum, d) => sum + d.revenue, 0);
    const totalPeriodOrders = list.reduce((sum, d) => sum + d.orders, 0);
    const maxRevenue = Math.max(...list.map((d) => d.revenue), 100);
    const maxOrders = Math.max(...list.map((d) => d.orders), 1);
    const hasRealSales = totalPeriodRev > 0 || totalPeriodOrders > 0;

    let peakDay = 'Awaiting new orders';
    const sorted = [...list].sort((a, b) => b.revenue - a.revenue);
    if (sorted[0] && sorted[0].revenue > 0) {
      peakDay = `${sorted[0].day} (₹${sorted[0].revenue.toLocaleString()})`;
    }

    return { list, maxRevenue, maxOrders, hasRealSales, peakDay, totalPeriodRev, totalPeriodOrders };
  }, [orders]);

  // Filtered recent orders
  const filteredOrders = useMemo(() => {
    let list = orders;
    if (selectedStatusFilter !== 'ALL') {
      list = list.filter((o) => o.status === selectedStatusFilter);
    }
    return list.slice(0, 8);
  }, [orders, selectedStatusFilter]);

  // Category product distribution
  const categoryStats = useMemo(() => {
    if (!categories.length || !products.length) return [];
    return categories.map((cat) => {
      const count = products.filter((p) => p.category === cat.name).length;
      const percentage = Math.round((count / products.length) * 100) || 0;
      return { name: cat.name, count, percentage };
    }).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [categories, products]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
      case 'Confirmed':
        return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20';
      case 'Preparing':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20';
      case 'Ready':
        return 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20';
      case 'Delivered':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
      case 'Cancelled':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';
      default:
        return 'bg-stone-500/10 text-stone-600 border border-stone-500/20';
    }
  };

  const handleContactCustomer = (order) => {
    const rawNumber = (order.whatsappNumber || order.phone || '').replace(/[^\d]/g, '');
    const message = `Hello ${order.customerName}, this is regarding your ${settings.brandName || 'Letters'} Order #${order.id}. Current Status: ${order.status}.`;
    window.open(`https://wa.me/${rawNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-6 max-w-7xl pb-12 font-sans">
      
      {/* ========================================================================= */}
      {/* 1. MINIMAL EXECUTIVE HEADER (NO DOTS) */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[var(--card)] border border-[var(--border)] p-1.5 flex items-center justify-center shadow-xs flex-shrink-0">
            <img src="/logo.png" alt="Letters" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text)]">
                Store Executive Dashboard
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                Live Operations
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Fulfillment velocity, sales revenue metrics, and inventory overview for {settings.brandName || 'Letters'}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Refresh */}
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--bg)] text-xs font-semibold text-[var(--text)] transition-colors cursor-pointer"
            title="Refresh Metrics"
          >
            <FontAwesomeIcon icon={faRotateRight} className="text-[10px] text-[var(--text-muted)]" />
            <span className="hidden sm:inline">Sync: {lastRefreshed}</span>
          </button>

          {/* Quick Actions */}
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--olive)] text-white text-xs font-bold hover:bg-[var(--olive-hover)] shadow-xs transition-colors cursor-pointer"
          >
            <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
            <span>Add Product</span>
          </Link>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-xs font-bold text-[var(--text)] hover:bg-[var(--bg)] shadow-xs transition-colors"
          >
            <FontAwesomeIcon icon={faBagShopping} className="text-[11px] text-[var(--olive)]" />
            <span>Orders ({metrics.total})</span>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ADVANCE LEVEL STATUS RIBBON (CLEAN MINIMAL, NO DOTS) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Storefront</span>
          <span className="font-bold text-[var(--text)]">Online &amp; Active</span>
        </div>

        <div className="border-l border-[var(--border)] pl-3">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">WhatsApp Gateway</span>
          <span className="font-bold text-[var(--text)]">Connected</span>
        </div>

        <div className="border-l border-[var(--border)] pl-3">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Promo Campaign</span>
          <span className="font-bold text-[var(--text)] truncate max-w-[140px] block">
            {saleBanner?.enabled ? `${saleBanner.tag || 'Mega Sale Live'}` : 'Standby'}
          </span>
        </div>

        <div className="border-l border-[var(--border)] pl-3">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Active Festival</span>
          <span className="font-bold text-[var(--text)] truncate max-w-[140px] block">
            {showcaseFestival ? showcaseFestival.name : 'Standard Catalog'}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MINIMAL LUXURY KPI STATS GRID */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Gross Revenue */}
        <div className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xs relative overflow-hidden group hover:border-[var(--olive)]/50 transition-colors">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-3">
            <span className="text-[10.5px] font-bold uppercase tracking-wider">Gross Sales</span>
            <div className="w-8 h-8 rounded-lg bg-[var(--olive)]/10 text-[var(--olive)] flex items-center justify-center text-xs">
              <FontAwesomeIcon icon={faIndianRupeeSign} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text)]">
              ₹{metrics.revenue.toLocaleString()}
            </h3>
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-[var(--text-muted)]">Avg. Order Value:</span>
              <span className="font-bold text-[var(--text)]">₹{metrics.aov.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Order Fulfillment Velocity */}
        <div className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xs relative overflow-hidden group hover:border-[var(--olive)]/50 transition-colors">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-3">
            <span className="text-[10.5px] font-bold uppercase tracking-wider">Total Orders</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center text-xs">
              <FontAwesomeIcon icon={faBagShopping} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text)]">
                {metrics.total}
              </h3>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                {metrics.fulfillmentRate}% Fulfilled
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-[var(--text-muted)]">Active in Pipeline:</span>
              <span className="font-bold text-sky-600 dark:text-sky-400">{metrics.inProgress} orders</span>
            </div>
          </div>
        </div>

        {/* Pending Action Required */}
        <div className={`p-5 rounded-2xl bg-[var(--card)] border shadow-xs relative overflow-hidden transition-colors ${
          metrics.pending > 0 ? 'border-amber-400 dark:border-amber-600' : 'border-[var(--border)]'
        }`}>
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-3">
            <span className="text-[10.5px] font-bold uppercase tracking-wider">Requires Action</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs">
              <FontAwesomeIcon icon={faClock} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-amber-600 dark:text-amber-400">
                {metrics.pending}
              </h3>
              <span className="text-[11px] font-semibold text-[var(--text-muted)]">
                Pending Orders
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-[var(--text-muted)]">Status:</span>
              <span className="font-bold text-amber-600">
                {metrics.pending > 0 ? 'Needs Confirmation' : 'All Clear'}
              </span>
            </div>
          </div>
        </div>

        {/* Catalog & Inventory Balance */}
        <div className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xs relative overflow-hidden group hover:border-[var(--olive)]/50 transition-colors">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-3">
            <span className="text-[10.5px] font-bold uppercase tracking-wider">Catalog Inventory</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs">
              <FontAwesomeIcon icon={faBoxesStacked} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text)]">
                {products.length}
              </h3>
              <span className="text-[11px] text-[var(--text-muted)]">
                across {categories.length} Categories
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-[var(--text-muted)]">Stock Health:</span>
              <span className={`font-bold ${metrics.lowStock > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {metrics.stockHealth}% In Stock
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. DYNAMIC INTERACTIVE ANALYTICS GRAPHS (NEW) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Graph 1: Weekly Revenue & Orders Velocity Chart (2 cols) */}
        <div className="lg:col-span-2 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
            <div>
              <h2 className="font-bold text-sm text-[var(--text)] flex items-center gap-2">
                <FontAwesomeIcon icon={faChartLine} className="text-xs text-[var(--olive)]" />
                <span>Sales Velocity &amp; Order Volume Trend</span>
              </h2>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Past 7-day revenue performance and transaction frequency.
              </p>
            </div>

            {/* Metric Mode Switcher */}
            <div className="flex items-center gap-1 bg-[var(--bg)] p-1 rounded-lg border border-[var(--border)]">
              <button
                type="button"
                onClick={() => setChartViewMode('revenue')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  chartViewMode === 'revenue'
                    ? 'bg-[var(--card)] text-[var(--text)] shadow-2xs font-bold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                Revenue (₹)
              </button>
              <button
                type="button"
                onClick={() => setChartViewMode('orders')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  chartViewMode === 'orders'
                    ? 'bg-[var(--card)] text-[var(--text)] shadow-2xs font-bold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                Orders Count
              </button>
            </div>
          </div>

          {/* Interactive Bar & Curve Chart Canvas */}
          <div className="pt-2">
            <div className="h-52 w-full flex items-end justify-between gap-2 sm:gap-4 px-2">
              {weeklySalesData.list.map((item, idx) => {
                const isZero = chartViewMode === 'revenue' ? item.revenue === 0 : item.orders === 0;
                const heightPct = isZero
                  ? 4
                  : chartViewMode === 'revenue'
                  ? Math.max(8, Math.round((item.revenue / weeklySalesData.maxRevenue) * 100))
                  : Math.max(8, Math.round((item.orders / weeklySalesData.maxOrders) * 100));

                const isHovered = activeHoverBar === idx;

                return (
                  <div
                    key={item.day + idx}
                    onMouseEnter={() => setActiveHoverBar(idx)}
                    onMouseLeave={() => setActiveHoverBar(null)}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                  >
                    {/* Hover Value Popover */}
                    {isHovered && (
                      <div className="absolute -top-10 z-20 bg-[var(--text)] text-[var(--bg)] text-[10.5px] font-bold py-1 px-2.5 rounded-lg shadow-lg whitespace-nowrap animate-fadeIn pointer-events-none">
                        {chartViewMode === 'revenue' ? `₹${item.revenue.toLocaleString()}` : `${item.orders} Orders`}
                      </div>
                    )}

                    {/* Chart Bar */}
                    <div className="w-full max-w-[48px] bg-[var(--bg)] rounded-t-lg overflow-hidden flex items-end h-[160px]">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full rounded-t-lg transition-all duration-300 ${
                          isZero
                            ? 'bg-[var(--border)] opacity-40'
                            : isHovered
                            ? 'bg-[var(--olive-hover)] shadow-xs'
                            : item.isToday
                            ? 'bg-[var(--olive)]'
                            : 'bg-[var(--olive)]/65 dark:bg-[var(--olive)]/50'
                        }`}
                      />
                    </div>

                    {/* Day Label */}
                    <div className="mt-2 text-center">
                      <span className={`text-[11px] font-semibold block ${item.isToday ? 'font-bold text-[var(--olive)]' : 'text-[var(--text-muted)]'}`}>
                        {item.day}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chart Footer Real Highlights */}
            <div className="flex items-center justify-between text-[11px] pt-3 border-t border-[var(--border)]/60 text-[var(--text-muted)]">
              <span>Peak Day: <strong className="text-[var(--text)] font-bold">{weeklySalesData.peakDay}</strong></span>
              <span>7-Day Sales: <strong className="text-[var(--text)] font-bold">{weeklySalesData.totalPeriodOrders} Orders (₹{weeklySalesData.totalPeriodRev.toLocaleString()})</strong></span>
            </div>
          </div>
        </div>

        {/* Graph 2: Fulfillment Status Distribution Arc / Matrix (1 col) */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="border-b border-[var(--border)] pb-3">
            <h2 className="font-bold text-sm text-[var(--text)] flex items-center gap-2">
              <FontAwesomeIcon icon={faChartPie} className="text-xs text-[var(--olive)]" />
              <span>Fulfillment Breakdown</span>
            </h2>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Live ratio of active fulfillment stages.
            </p>
          </div>

          <div className="space-y-3.5 flex-1 flex flex-col justify-center">
            
            {/* Delivered Stage */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[var(--text)]">Delivered &amp; Fulfilled</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {metrics.delivered} ({metrics.total > 0 ? metrics.fulfillmentRate : 0}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--bg)] overflow-hidden border border-[var(--border)]/50">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${metrics.total > 0 ? Math.max(2, metrics.fulfillmentRate) : 0}%` }}
                />
              </div>
            </div>

            {/* In Progress Stage */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[var(--text)]">In Atelier / Dispatched</span>
                <span className="font-bold text-sky-600 dark:text-sky-400">
                  {metrics.inProgress} orders
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--bg)] overflow-hidden border border-[var(--border)]/50">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all duration-500"
                  style={{ width: `${metrics.total > 0 ? Math.max(2, Math.round((metrics.inProgress / metrics.total) * 100)) : 0}%` }}
                />
              </div>
            </div>

            {/* Pending Confirmation Stage */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[var(--text)]">Pending Confirmation</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {metrics.pending} orders
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--bg)] overflow-hidden border border-[var(--border)]/50">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${metrics.total > 0 ? Math.max(2, Math.round((metrics.pending / metrics.total) * 100)) : 0}%` }}
                />
              </div>
            </div>

          </div>

          <div className="p-2.5 rounded-xl bg-[var(--bg)]/70 border border-[var(--border)] flex items-center justify-between text-xs">
            <span className="text-[var(--text-muted)]">Total Pipeline Value:</span>
            <span className="font-bold text-[var(--text)]">₹{metrics.revenue.toLocaleString()}</span>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5. ADVANCED ORDER FULFILLMENT PIPELINE MATRIX (NO DOTS) */}
      {/* ========================================================================= */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
          <div>
            <h2 className="font-bold text-sm text-[var(--text)] flex items-center gap-2">
              <FontAwesomeIcon icon={faSignal} className="text-xs text-[var(--olive)]" />
              <span>Fulfillment Pipeline Matrix</span>
            </h2>
            <p className="text-[11px] text-[var(--text-muted)]">
              Click any status stage below to filter incoming recent orders.
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedStatusFilter === 'ALL'
                  ? 'bg-[var(--olive)] text-white font-bold'
                  : 'bg-[var(--bg)] text-[var(--text-muted)] border border-[var(--border)] hover:text-[var(--text)]'
              }`}
            >
              All ({metrics.total})
            </button>
          </div>
        </div>

        {/* 5-Stage Interactive Fulfillment Matrix (Clean typography, NO dots) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          
          {/* Pending */}
          <button
            onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'Pending' ? 'ALL' : 'Pending')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              selectedStatusFilter === 'Pending'
                ? 'bg-amber-500/15 border-amber-500 shadow-xs'
                : 'bg-[var(--bg)]/70 border-[var(--border)] hover:border-amber-400/50'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-amber-700 dark:text-amber-400 mb-1">
              <span>Pending</span>
              <span className="text-[10px] font-bold uppercase tracking-wider">Queue</span>
            </div>
            <p className="text-xl font-extrabold text-[var(--text)]">{metrics.pending}</p>
            <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">Needs Approval</span>
          </button>

          {/* Confirmed */}
          <button
            onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'Confirmed' ? 'ALL' : 'Confirmed')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              selectedStatusFilter === 'Confirmed'
                ? 'bg-sky-500/15 border-sky-500 shadow-xs'
                : 'bg-[var(--bg)]/70 border-[var(--border)] hover:border-sky-400/50'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-sky-700 dark:text-sky-400 mb-1">
              <span>Confirmed</span>
              <span className="text-[10px] font-bold uppercase tracking-wider">Accepted</span>
            </div>
            <p className="text-xl font-extrabold text-[var(--text)]">{metrics.confirmed}</p>
            <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">Payment Verified</span>
          </button>

          {/* Preparing */}
          <button
            onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'Preparing' ? 'ALL' : 'Preparing')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              selectedStatusFilter === 'Preparing'
                ? 'bg-purple-500/15 border-purple-500 shadow-xs'
                : 'bg-[var(--bg)]/70 border-[var(--border)] hover:border-purple-400/50'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-purple-700 dark:text-purple-400 mb-1">
              <span>Preparing</span>
              <span className="text-[10px] font-bold uppercase tracking-wider">Atelier</span>
            </div>
            <p className="text-xl font-extrabold text-[var(--text)]">{metrics.preparing}</p>
            <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">Crafting Keepsake</span>
          </button>

          {/* Ready */}
          <button
            onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'Ready' ? 'ALL' : 'Ready')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              selectedStatusFilter === 'Ready'
                ? 'bg-teal-500/15 border-teal-500 shadow-xs'
                : 'bg-[var(--bg)]/70 border-[var(--border)] hover:border-teal-400/50'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-teal-700 dark:text-teal-400 mb-1">
              <span>Ready</span>
              <span className="text-[10px] font-bold uppercase tracking-wider">Dispatch</span>
            </div>
            <p className="text-xl font-extrabold text-[var(--text)]">{metrics.ready}</p>
            <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">Packed &amp; Ready</span>
          </button>

          {/* Delivered */}
          <button
            onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'Delivered' ? 'ALL' : 'Delivered')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              selectedStatusFilter === 'Delivered'
                ? 'bg-emerald-500/15 border-emerald-500 shadow-xs'
                : 'bg-[var(--bg)]/70 border-[var(--border)] hover:border-emerald-400/50'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mb-1">
              <span>Delivered</span>
              <FontAwesomeIcon icon={faCheck} className="text-xs" />
            </div>
            <p className="text-xl font-extrabold text-[var(--text)]">{metrics.delivered}</p>
            <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">Fulfilled Orders</span>
          </button>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. MAIN CONTENT: RECENT ORDERS TABLE + CATEGORY BREAKDOWN */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders List Table (2 cols on desktop) */}
        <div className="lg:col-span-2 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 sm:p-5 border-b border-[var(--border)] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[var(--text)]">Recent Customer Orders</h3>
                <p className="text-[11px] text-[var(--text-muted)]">
                  {selectedStatusFilter === 'ALL'
                    ? 'Latest incoming order requests'
                    : `Filtered by status: ${selectedStatusFilter}`}
                </p>
              </div>

              <Link
                to="/admin/orders"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--olive)] hover:underline"
              >
                <span>Full Orders ({orders.length})</span>
                <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
              </Link>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="p-10 text-center text-xs text-[var(--text-muted)]">
                <FontAwesomeIcon icon={faBagShopping} className="text-2xl text-[var(--text-muted)]/30 mb-2" />
                <p>No orders found matching this filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[var(--bg)]/60 border-b border-[var(--border)] text-[var(--text-muted)] uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4 font-bold">Order</th>
                      <th className="py-3 px-4 font-bold">Customer</th>
                      <th className="py-3 px-4 font-bold hidden sm:table-cell">Items</th>
                      <th className="py-3 px-4 font-bold">Amount</th>
                      <th className="py-3 px-4 font-bold">Status</th>
                      <th className="py-3 px-4 font-bold text-right">Concierge</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]/70">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-[var(--bg)]/40 transition-colors">
                        
                        {/* Order ID */}
                        <td className="py-3 px-4 font-mono font-bold text-[var(--text)] text-[11px]">
                          #{order.id.slice(-6)}
                        </td>

                        {/* Customer */}
                        <td className="py-3 px-4">
                          <p className="font-bold text-[var(--text)] text-xs">{order.customerName}</p>
                          <p className="text-[10.5px] text-[var(--text-muted)] font-mono">{order.phone || order.whatsappNumber}</p>
                        </td>

                        {/* Items */}
                        <td className="py-3 px-4 max-w-[150px] truncate text-[11px] text-[var(--text)] hidden sm:table-cell">
                          {order.items?.map((i) => `${i.name} (×${i.quantity})`).join(', ') || 'Custom Gift'}
                        </td>

                        {/* Total */}
                        <td className="py-3 px-4 font-bold text-[var(--text)]">
                          ₹{Number(order.total || 0).toLocaleString()}
                        </td>

                        {/* Status Switcher */}
                        <td className="py-3 px-4">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer focus:outline-none ${getStatusBadge(
                              order.status
                            )}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Preparing">Preparing</option>
                            <option value="Ready">Ready</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>

                        {/* Action */}
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleContactCustomer(order)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#25D366]/15 text-[#128C7E] dark:text-[#25D366] hover:bg-[#25D366] hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                            title="Chat on WhatsApp"
                          >
                            <FontAwesomeIcon icon={faWhatsapp} className="text-xs" />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </button>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-[var(--border)] bg-[var(--bg)]/40 text-center">
            <Link to="/admin/orders" className="text-xs font-bold text-[var(--olive)] hover:underline">
              Go to Full Order Management Center →
            </Link>
          </div>
        </div>

        {/* Right Column: Category Breakdown & Quick Navigation (1 col) */}
        <div className="space-y-6">
          
          {/* Category Distribution Matrix */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text)] flex items-center gap-2">
                <FontAwesomeIcon icon={faChartPie} className="text-[var(--olive)]" />
                <span>Category Breakdown</span>
              </h3>
              <Link to="/admin/categories" className="text-[11px] font-bold text-[var(--olive)] hover:underline">
                Manage
              </Link>
            </div>

            <div className="space-y-3">
              {categoryStats.map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-[var(--text)]">{cat.name}</span>
                    <span className="text-[var(--text-muted)] text-[11px]">
                      {cat.count} items ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[var(--bg)] overflow-hidden border border-[var(--border)]/50">
                    <div
                      className="h-full bg-[var(--olive)] rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(8, cat.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--text)]">
              Store Control Hub
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/admin/products"
                className="flex items-center gap-2 p-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)]/50 hover:bg-[var(--bg)] text-xs font-semibold text-[var(--text)] transition-colors"
              >
                <FontAwesomeIcon icon={faBox} className="text-[var(--olive)]" />
                <span>Products ({products.length})</span>
              </Link>

              <Link
                to="/admin/categories"
                className="flex items-center gap-2 p-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)]/50 hover:bg-[var(--bg)] text-xs font-semibold text-[var(--text)] transition-colors"
              >
                <FontAwesomeIcon icon={faLayerGroup} className="text-[var(--olive)]" />
                <span>Categories</span>
              </Link>

              <Link
                to="/admin/festival-hampers"
                className="flex items-center gap-2 p-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)]/50 hover:bg-[var(--bg)] text-xs font-semibold text-[var(--text)] transition-colors"
              >
                <FontAwesomeIcon icon={faGift} className="text-[var(--olive)]" />
                <span>Festivals</span>
              </Link>

              <Link
                to="/admin/sale-banner"
                className="flex items-center gap-2 p-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)]/50 hover:bg-[var(--bg)] text-xs font-semibold text-[var(--text)] transition-colors"
              >
                <FontAwesomeIcon icon={faPercent} className="text-[var(--olive)]" />
                <span>Sale Banners</span>
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
