'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPercent,
  faBolt,
  faClock,
  faSave,
  faTag,
  faEye,
  faCheck,
  faSliders,
  faUpload,
  faBox,
  faSearch,
  faPlus,
  faMinus,
  faLayerGroup,
  faFire,
  faImage,
} from '@fortawesome/free-solid-svg-icons';
import { useSaleBannerStore } from '@/src/store/saleBannerStore';
import { useProductStore } from '@/src/store/productStore';

export default function AdminSaleBannerPage() {
  const { saleBanner, fetchSaleBanner, updateSaleBanner } = useSaleBannerStore();
  const { products, updateProduct } = useProductStore();

  const [formData, setFormData] = useState(saleBanner);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('All');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchSaleBanner();
  }, [fetchSaleBanner]);

  useEffect(() => {
    if (saleBanner) {
      setFormData({
        ...saleBanner,
        selectedProductIds: saleBanner.selectedProductIds || ['prod-1', 'prod-2', 'prod-3', 'prod-5', 'prod-6', 'prod-7'],
      });
    }
  }, [saleBanner]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Toggle a single product in or out of the sale
  const handleToggleProductInSale = async (product) => {
    const isAdding = !(formData.selectedProductIds || []).includes(product.id);

    setFormData((prev) => {
      const currentIds = prev.selectedProductIds || [];
      const exists = currentIds.includes(product.id);
      const updated = exists
        ? currentIds.filter((id) => id !== product.id)
        : [...currentIds, product.id];
      return { ...prev, selectedProductIds: updated };
    });

    // If adding and product has no originalPrice, set default 20% discount
    if (isAdding && (!product.originalPrice || product.originalPrice <= product.price)) {
      const orig = Math.round(product.price * 1.25);
      await updateProduct(product.id, {
        originalPrice: orig,
        price: product.price,
      });
    }
  };

  // Select all / Deselect all
  const handleSelectAll = () => {
    const allIds = products.map((p) => p.id);
    setFormData((prev) => ({ ...prev, selectedProductIds: allIds }));
  };

  const handleDeselectAll = () => {
    setFormData((prev) => ({ ...prev, selectedProductIds: [] }));
  };

  // Apply a quick discount % to a specific product
  const handleApplyProductDiscount = async (product, percent) => {
    const pVal = Math.max(0, Math.min(95, Number(percent) || 0));
    const orig = product.originalPrice || (pVal > 0 ? Math.round(product.price * 1.25) : product.price);
    const newPrice = pVal > 0 ? Math.round(orig * (1 - pVal / 100)) : orig;
    await updateProduct(product.id, {
      originalPrice: orig,
      price: newPrice,
    });
  };

  // Handle local image file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Please upload an image smaller than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      handleChange('image', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await updateSaleBanner(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Calculate remaining time for preview
  const calculateRemaining = () => {
    if (!formData.endDate) return 'No timer set';
    const diff = new Date(formData.endDate).getTime() - Date.now();
    if (diff <= 0) return 'Sale Expired';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    return `${days}d ${hours}h ${mins}m remaining`;
  };

  // Filtered products list for the selector
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategoryTab !== 'All' && p.category !== selectedCategoryTab) return false;
      if (productSearch.trim()) {
        const q = productSearch.toLowerCase();
        return p.name.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [products, selectedCategoryTab, productSearch]);

  const categoriesList = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [products]);

  const selectedCount = (formData?.selectedProductIds || []).length;

  if (!formData) {
    return (
      <div className="p-8 text-center text-xs text-[var(--text-muted)]">
        Loading Sale Banner Configuration...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl pb-16 font-sans">
      
      {/* ========================================================================= */}
      {/* 1. MINIMAL HEADER */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text)]">
              Sale &amp; Banners Manager
            </h1>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                formData.enabled
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-stone-500/10 text-stone-600 dark:text-stone-400 border-stone-500/20'
              }`}
            >
              {formData.enabled ? `${selectedCount} Items in Active Sale` : 'Sale Standby'}
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Configure homepage billboard campaigns, countdown timers, and discount percentages.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--olive)] text-white text-xs font-bold hover:bg-[var(--olive-hover)] shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : saveSuccess ? (
              <>
                <FontAwesomeIcon icon={faCheck} className="text-xs" />
                <span>Saved &amp; Published!</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} className="text-xs" />
                <span>Save &amp; Publish</span>
              </>
            )}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-2.5 text-xs font-semibold animate-fadeIn">
          <FontAwesomeIcon icon={faCheck} className="text-emerald-600" />
          <span>Mega Sale Banner and product selection updated successfully.</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. FORM & LIVE PREVIEW GRID */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section Visibility Switches */}
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-2">
              <FontAwesomeIcon icon={faSliders} className="text-[var(--olive)]" />
              <span>Section Visibility &amp; Toggles</span>
            </h2>

            {/* Main Sale Section Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg)]/70 border border-[var(--border)]">
              <div>
                <h3 className="text-xs font-bold text-[var(--text)]">Enable Mega Sale Showcase</h3>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  Display the promotional billboard on the storefront homepage.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={formData.enabled || false}
                onClick={() => handleChange('enabled', !formData.enabled)}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.enabled ? 'bg-[var(--olive)]' : 'bg-stone-300 dark:bg-stone-700'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                    formData.enabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Top Navbar Alert Bar Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg)]/70 border border-[var(--border)]">
              <div>
                <h3 className="text-xs font-bold text-[var(--text)]">Show Top Announcement Bar</h3>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  Display the countdown ticker at the top under the navigation bar.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={formData.showTopBar || false}
                onClick={() => handleChange('showTopBar', !formData.showTopBar)}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.showTopBar ? 'bg-[var(--olive)]' : 'bg-stone-300 dark:bg-stone-700'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                    formData.showTopBar ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Banner Content & Countdown */}
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-2">
              <FontAwesomeIcon icon={faTag} className="text-[var(--olive)]" />
              <span>Banner Content &amp; Countdown Timer</span>
            </h2>

            {/* Title & Calligraphy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">
                  Banner Title *
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g. Grand Gifting Mega Sale"
                  className="w-full px-3.5 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">
                  Tagline / Subtitle
                </label>
                <input
                  type="text"
                  value={formData.calligraphy || ''}
                  onChange={(e) => handleChange('calligraphy', e.target.value)}
                  placeholder="e.g. Exclusive Flash Drop"
                  className="w-full px-3.5 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
                />
              </div>
            </div>

            {/* Event Tag & Offer Badge */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">
                  Top Event Pill Tag
                </label>
                <input
                  type="text"
                  value={formData.tag || ''}
                  onChange={(e) => handleChange('tag', e.target.value)}
                  placeholder="e.g. FESTIVE DROPS"
                  className="w-full px-3.5 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">
                  Discount Highlight Badge
                </label>
                <input
                  type="text"
                  value={formData.discountOffer || ''}
                  onChange={(e) => handleChange('discountOffer', e.target.value)}
                  placeholder="e.g. FLAT 30% OFF"
                  className="w-full px-3.5 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
                />
              </div>
            </div>

            {/* Timer End Date */}
            <div>
              <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">
                Sale End Date &amp; Time (Countdown) *
              </label>
              <input
                type="datetime-local"
                value={formData.endDate ? formData.endDate.substring(0, 16) : ''}
                onChange={(e) => {
                  const d = new Date(e.target.value);
                  handleChange('endDate', d.toISOString());
                }}
                className="w-full px-3.5 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">
                Banner Description
              </label>
              <textarea
                rows={2}
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe the promo discounts, special packages or gifts included..."
                className="w-full px-3.5 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)] resize-none"
              />
            </div>

            {/* Banner Image Upload Box */}
            <div>
              <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1.5">
                Banner Artwork Image *
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="flex flex-col sm:flex-row items-center gap-3.5 p-3.5 rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg)]/60">
                {/* Thumbnail Preview */}
                <div className="w-28 h-16 rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden flex items-center justify-center flex-shrink-0 shadow-xs">
                  {formData.image ? (
                    <img
                      src={formData.image}
                      alt="Banner artwork"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = '/logo.png'; }}
                    />
                  ) : (
                    <FontAwesomeIcon icon={faImage} className="text-2xl text-[var(--text-muted)] opacity-40" />
                  )}
                </div>

                {/* Upload Actions */}
                <div className="flex-1 text-center sm:text-left space-y-1.5">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--olive)] text-white text-xs font-semibold hover:bg-[var(--olive-hover)] shadow-xs transition-colors cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faUpload} className="text-[10px]" />
                      <span>{formData.image ? 'Change Artwork' : 'Upload Artwork'}</span>
                    </button>

                    {formData.image && (
                      <button
                        type="button"
                        onClick={() => handleChange('image', '')}
                        className="px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-rose-50 text-rose-600 text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[10.5px] text-[var(--text-muted)]">
                    Direct local file upload for desktop &amp; mobile banners (Max 5MB).
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Button Text & Link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">
                  CTA Button Text
                </label>
                <input
                  type="text"
                  value={formData.ctaText || ''}
                  onChange={(e) => handleChange('ctaText', e.target.value)}
                  placeholder="e.g. Explore Deals"
                  className="w-full px-3.5 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">
                  CTA Button Destination
                </label>
                <input
                  type="text"
                  value={formData.ctaLink || '/deals'}
                  onChange={(e) => handleChange('ctaLink', e.target.value)}
                  placeholder="/deals"
                  className="w-full px-3.5 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
                />
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* 3. SALE PRODUCTS SELECTOR & DISCOUNT % CUSTOMIZER */}
          {/* ========================================================================= */}
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 shadow-xs space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-2">
                  <FontAwesomeIcon icon={faBox} className="text-[var(--olive)]" />
                  <span>Select Products Included in Sale</span>
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Only the items checked below will appear in the Mega Sale and Deals page.
                </p>
              </div>

              {/* Selection Summary and Shortcuts */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--olive)] bg-[var(--olive)]/10 px-2.5 py-0.5 rounded-full border border-[var(--olive)]/20">
                  {selectedCount} Selected
                </span>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-[11px] font-semibold text-[var(--olive)] hover:underline cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-stone-300">•</span>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Search & Category Filter */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <div className="relative w-full sm:flex-grow">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search products to add to sale..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1 w-full sm:w-auto">
                {categoriesList.slice(0, 4).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategoryTab(cat)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      selectedCategoryTab === cat
                        ? 'bg-[var(--olive)] text-white shadow-xs font-bold'
                        : 'bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Table with 1-Click Sale Switch and Discount % Manager */}
            <div className="border border-[var(--border)] rounded-xl overflow-hidden shadow-xs max-h-[420px] overflow-y-auto">
              {filteredProducts.length > 0 ? (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[var(--bg)]/70 border-b border-[var(--border)] text-[var(--text-muted)] uppercase tracking-wider text-[10px] sticky top-0 z-10 backdrop-blur-xs">
                      <th className="py-2.5 px-3.5 font-bold">Product</th>
                      <th className="py-2.5 px-3 font-bold hidden sm:table-cell">Category</th>
                      <th className="py-2.5 px-3 font-bold">Price (₹)</th>
                      <th className="py-2.5 px-3 font-bold">Sale Discount %</th>
                      <th className="py-2.5 px-3.5 font-bold text-right">In Sale</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]/70">
                    {filteredProducts.map((p) => {
                      const isSelected = (formData.selectedProductIds || []).includes(p.id);
                      const discountPercent = p.originalPrice && p.originalPrice > p.price
                        ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
                        : 0;

                      return (
                        <tr
                          key={p.id}
                          className={`hover:bg-[var(--bg)]/40 transition-colors ${
                            isSelected ? 'bg-[var(--olive)]/5' : ''
                          }`}
                        >
                          {/* Product */}
                          <td className="py-2.5 px-3.5">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={p.images?.[0] || p.image || '/logo.png'}
                                alt={p.name}
                                className="w-9 h-9 rounded-lg object-cover border border-[var(--border)] flex-shrink-0 bg-[var(--bg)]"
                                onError={(e) => { e.target.src = '/logo.png'; }}
                              />
                              <div className="overflow-hidden">
                                <p className="font-bold text-[var(--text)] text-xs truncate max-w-[160px]">{p.name}</p>
                                <span className="text-[10px] text-[var(--text-muted)] sm:hidden">{p.category}</span>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-2.5 px-3 whitespace-nowrap hidden sm:table-cell">
                            <span className="text-[10px] font-semibold text-[var(--text-muted)]">{p.category}</span>
                          </td>

                          {/* Price */}
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="font-bold text-xs text-[var(--text)]">₹{p.price.toLocaleString()}</span>
                              {p.originalPrice && p.originalPrice > p.price && (
                                <span className="text-[10px] text-[var(--text-muted)] line-through">
                                  MRP ₹{p.originalPrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Discount % Control */}
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <div className="relative w-16">
                                <input
                                  type="number"
                                  min="0"
                                  max="90"
                                  value={discountPercent || ''}
                                  placeholder="0"
                                  onChange={(e) => handleApplyProductDiscount(p, e.target.value)}
                                  className="w-full px-2 py-1 pr-5 rounded-md border border-[var(--border)] bg-[var(--card)] text-xs font-bold text-[var(--olive)] text-right focus:outline-none focus:border-[var(--olive)]"
                                  title="Enter discount percentage"
                                />
                                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--text-muted)] pointer-events-none">
                                  %
                                </span>
                              </div>

                              {/* Quick Presets */}
                              <div className="hidden md:flex items-center gap-1">
                                {[15, 25, 40].map((pct) => (
                                  <button
                                    key={pct}
                                    type="button"
                                    onClick={() => handleApplyProductDiscount(p, pct)}
                                    className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                                      discountPercent === pct
                                        ? 'bg-[var(--olive)] text-white border-[var(--olive)]'
                                        : 'bg-[var(--bg)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text)]'
                                    }`}
                                  >
                                    {pct}%
                                  </button>
                                ))}
                              </div>
                            </div>
                          </td>

                          {/* Toggle Action */}
                          <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleToggleProductInSale(p)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                                isSelected
                                  ? 'bg-[var(--olive)] text-white shadow-xs'
                                  : 'bg-[var(--card)] border border-[var(--border)] text-[var(--text)] hover:border-[var(--text)]'
                              }`}
                            >
                              <FontAwesomeIcon icon={isSelected ? faCheck : faPlus} className="text-[9px]" />
                              <span>{isSelected ? 'In Sale' : 'Add to Sale'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-xs text-[var(--text-muted)] bg-[var(--bg)]">
                  No products matched your search.
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Right Live Interactive Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-20 space-y-6">
            
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-2">
                  <FontAwesomeIcon icon={faEye} className="text-[var(--olive)]" />
                  <span>Live Storefront Billboard Preview</span>
                </h3>
                <span className="text-[10px] font-semibold text-[var(--olive)] bg-[var(--olive)]/10 px-2 py-0.5 rounded-full border border-[var(--olive)]/20">
                  Real-time
                </span>
              </div>

              {/* Status Pill Summary */}
              <div className="p-3 rounded-xl bg-[var(--bg)]/70 border border-[var(--border)] flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--text-muted)]">Countdown Status:</span>
                <span className="font-bold text-[var(--text)]">
                  {calculateRemaining()}
                </span>
              </div>

              {/* Poster Preview Card */}
              <div className="space-y-2">
                <div className="relative rounded-xl overflow-hidden shadow-xs border border-[var(--border)] aspect-[16/10] bg-[var(--bg)]">
                  <img
                    src={formData.image || 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80'}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="bg-white/90 backdrop-blur-sm text-stone-900 text-[9.5px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                      {formData.tag || 'SEASONAL SPECIAL'}
                    </span>
                    <span className="bg-[var(--olive)] text-white text-[9.5px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                      {formData.discountOffer || 'SALE'}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white space-y-1">
                    <h4 className="text-sm font-bold leading-tight line-clamp-1">
                      {formData.title || 'Sale Title'}
                    </h4>
                    <p className="text-white/80 text-[10px] line-clamp-1">
                      {formData.description || 'Sale description text will appear here...'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Save button in preview */}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full py-2.5 rounded-lg bg-[var(--olive)] text-white text-xs font-bold hover:bg-[var(--olive-hover)] shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faSave} />
                <span>{saving ? 'Publishing...' : 'Save & Publish Live'}</span>
              </button>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
