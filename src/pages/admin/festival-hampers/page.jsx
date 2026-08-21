'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGift,
  faPlus,
  faEdit,
  faTrash,
  faSave,
  faXmark,
  faCircleCheck,
  faCalendarDays,
  faClock,
  faCheck,
  faToggleOn,
  faToggleOff,
  faEye,
  faBoxesStacked,
  faArrowRight,
  faWandMagicSparkles,
  faUpload,
  faImage,
} from '@fortawesome/free-solid-svg-icons';
import { useFestivalStore, getFestivalStatus } from '@/src/store/festivalStore';

const initialFestivalForm = {
  name: '',
  title: '',
  subtitle: '',
  tagline: '',
  description: '',
  calligraphy: '',
  badge: 'FESTIVE DROP',
  banner: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  preBookingEnabled: true,
  preBookingStartDate: '',
  status: 'published',
  announcement: '✨ Pan-India Express Delivery • Live Photo Approval Before Dispatch',
  highlightTag1: 'Artisanal Keepsake',
  highlightTag2: 'Handmade Delicacy',
  highlightTag3: 'Keepsake Box',
};

const initialProductForm = {
  title: '',
  price: 1899,
  originalPrice: 2299,
  badge: 'Special Edition',
  image: '',
  description: '',
  highlights: '',
  origin: 'Kerala Craft Guilds',
  showPrice: true,
  active: true,
};

export default function AdminFestivalHampersPage() {
  const {
    festivals,
    showcaseFestival,
    fetchFestivals,
    createFestival,
    updateFestival,
    deleteFestival,
    addProductToFestival,
    updateFestivalProduct,
    deleteFestivalProduct,
    toggleFestivalProduct,
  } = useFestivalStore();

  const bannerFileInputRef = useRef(null);
  const productFileInputRef = useRef(null);

  const [selectedFestivalId, setSelectedFestivalId] = useState(null);
  const [festivalModalOpen, setFestivalModalOpen] = useState(false);
  const [editingFestival, setEditingFestival] = useState(null);
  const [festivalForm, setFestivalForm] = useState(initialFestivalForm);

  // Product modal state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState(initialProductForm);

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleBannerUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Banner image must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        setFestivalForm((prev) => ({ ...prev, banner: reader.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleProductImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Product image must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        setProductForm((prev) => ({ ...prev, image: reader.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    fetchFestivals();
  }, [fetchFestivals]);

  // Set default selected festival to showcase festival or first festival
  useEffect(() => {
    if (festivals && festivals.length > 0 && !selectedFestivalId) {
      if (showcaseFestival) {
        setSelectedFestivalId(showcaseFestival.id);
      } else {
        setSelectedFestivalId(festivals[0].id);
      }
    }
  }, [festivals, showcaseFestival, selectedFestivalId]);

  const activeFestivalDetail = useMemo(() => {
    if (!festivals || festivals.length === 0) return null;
    return festivals.find((f) => f.id === selectedFestivalId) || festivals[0];
  }, [festivals, selectedFestivalId]);

  // When start date changes, automatically compute 1 month before for preBookingStartDate (if not explicitly modified)
  const handleStartDateChange = (newStartDate) => {
    const sDate = new Date(newStartDate);
    sDate.setMonth(sDate.getMonth() - 1);
    const autoPreDate = sDate.toISOString().split('T')[0];

    setFestivalForm((prev) => ({
      ...prev,
      startDate: newStartDate,
      preBookingStartDate: prev.preBookingStartDate && prev.preBookingStartDate !== prev.startDate
        ? prev.preBookingStartDate
        : autoPreDate,
    }));
  };

  const handleOpenCreateFestival = () => {
    setEditingFestival(null);
    const today = new Date().toISOString().split('T')[0];
    const sDate = new Date();
    sDate.setMonth(sDate.getMonth() - 1);
    const autoPre = sDate.toISOString().split('T')[0];

    setFestivalForm({
      ...initialFestivalForm,
      startDate: today,
      preBookingStartDate: autoPre,
    });
    setFestivalModalOpen(true);
  };

  const handleOpenEditFestival = (festival) => {
    setEditingFestival(festival);
    setFestivalForm({
      name: festival.name || '',
      title: festival.title || '',
      subtitle: festival.subtitle || '',
      tagline: festival.tagline || '',
      description: festival.description || '',
      calligraphy: festival.calligraphy || '',
      badge: festival.badge || 'FESTIVE DROP',
      banner: festival.banner || '',
      startDate: festival.startDate || '',
      endDate: festival.endDate || '',
      preBookingEnabled: festival.preBookingEnabled !== false,
      preBookingStartDate: festival.preBookingStartDate || festival.startDate,
      status: festival.status || 'published',
      announcement: festival.announcement || '',
      highlightTag1: festival.highlightTag1 || '',
      highlightTag2: festival.highlightTag2 || '',
      highlightTag3: festival.highlightTag3 || '',
    });
    setFestivalModalOpen(true);
  };

  const handleSaveFestival = async (e) => {
    e.preventDefault();
    if (!festivalForm.name || !festivalForm.startDate || !festivalForm.endDate) {
      alert('Please provide Festival Name, Start Date, and End Date.');
      return;
    }
    setSaving(true);
    try {
      if (editingFestival) {
        await updateFestival(editingFestival.id, festivalForm);
        setFeedback(`"${festivalForm.name}" updated successfully!`);
      } else {
        const created = await createFestival(festivalForm);
        if (created) setSelectedFestivalId(created.id);
        setFeedback(`"${festivalForm.name}" created and published!`);
      }
      setFestivalModalOpen(false);
      setTimeout(() => setFeedback(''), 3500);
    } catch (err) {
      console.error(err);
      setFeedback('Error saving festival.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFestival = async (id, name) => {
    if (confirm(`Are you sure you want to delete festival "${name}" and all its assigned products?`)) {
      await deleteFestival(id);
      setFeedback(`Festival "${name}" removed.`);
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  const handleToggleFestivalStatus = async (festival) => {
    const nextStatus = festival.status === 'published' ? 'draft' : 'published';
    await updateFestival(festival.id, { status: nextStatus });
    setFeedback(`"${festival.name}" status updated to ${nextStatus.toUpperCase()}.`);
    setTimeout(() => setFeedback(''), 3000);
  };

  // Product CRUD within festival
  const handleOpenAddProduct = () => {
    if (!activeFestivalDetail) return;
    setEditingProduct(null);
    setProductForm({
      title: '',
      price: 1899,
      originalPrice: 2299,
      badge: `${activeFestivalDetail.name} Special`,
      image: '',
      description: 'Handcrafted festive hamper with curated keepsakes, brassware and traditional confections.',
      highlights: 'Signature Keepsake, Kerala Treats, Complimentary Handwritten Card',
      origin: 'Kerala Craft Guilds',
      showPrice: true,
      active: true,
    });
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      title: product.title || product.name || '',
      price: product.price || '',
      originalPrice: product.originalPrice || '',
      badge: product.badge || 'Festive Special',
      image: product.image || (product.images && product.images[0]) || '',
      description: product.description || '',
      highlights: Array.isArray(product.highlights) ? product.highlights.join(', ') : product.highlights || '',
      origin: product.origin || 'Kerala Craft Guilds',
      showPrice: product.showPrice !== false,
      active: product.active !== false,
    });
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!activeFestivalDetail || !productForm.title || !productForm.price) {
      alert('Please fill Hamper Title and Price.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...productForm,
        price: Number(productForm.price) || 0,
        originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
        highlights: typeof productForm.highlights === 'string'
          ? productForm.highlights.split(',').map((s) => s.trim()).filter(Boolean)
          : productForm.highlights,
      };

      if (editingProduct) {
        await updateFestivalProduct(activeFestivalDetail.id, editingProduct.id, payload);
        setFeedback('Festival hamper product updated!');
      } else {
        await addProductToFestival(activeFestivalDetail.id, payload);
        setFeedback('New hamper added to festival!');
      }
      setProductModalOpen(false);
      setTimeout(() => setFeedback(''), 3000);
    } catch (err) {
      console.error(err);
      setFeedback('Error saving festival hamper product.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!activeFestivalDetail) return;
    if (confirm('Are you sure you want to remove this product from the festival?')) {
      await deleteFestivalProduct(activeFestivalDetail.id, productId);
      setFeedback('Product removed from festival.');
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  const handleToggleProduct = async (productId) => {
    if (!activeFestivalDetail) return;
    await toggleFestivalProduct(activeFestivalDetail.id, productId);
    setFeedback('Product visibility updated!');
    setTimeout(() => setFeedback(''), 2500);
  };

  const renderStatusBadge = (festival) => {
    const status = getFestivalStatus(festival);
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ACTIVE (LIVE)
          </span>
        );
      case 'PRE_BOOKING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
            <FontAwesomeIcon icon={faClock} className="text-[9px]" />
            PRE-BOOKING
          </span>
        );
      case 'UPCOMING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border border-indigo-500/30">
            <FontAwesomeIcon icon={faCalendarDays} className="text-[9px]" />
            UPCOMING
          </span>
        );
      case 'ENDED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-neutral-500/15 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20">
            ENDED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            DRAFT
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-7xl pb-16">

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)]">
            Festival Hampers &amp; Celebrations
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Manage seasonal celebration campaigns, festive atelier drops, automated 1-month pre-booking windows, and curated hamper collections.
          </p>
        </div>

        <button
          onClick={handleOpenCreateFestival}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[var(--olive)] text-white text-xs font-semibold hover:bg-[var(--olive-hover)] shadow-xs transition-colors cursor-pointer"
        >
          <FontAwesomeIcon icon={faPlus} className="text-xs" />
          <span>Add New Festival</span>
        </button>
      </div>

      {feedback && (
        <div className="bg-[var(--chandanam-soft)] border border-[var(--chandanam)]/40 text-[var(--text)] p-4 rounded-xl flex items-center gap-3 text-xs font-semibold animate-fadeIn">
          <FontAwesomeIcon icon={faCircleCheck} className="text-base text-[var(--chandanam-dark)]" />
          <span>{feedback}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. STOREFRONT LIVE STATUS SUMMARY CARD */}
      {/* ========================================================================= */}
      <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[var(--chandanam)]/15 text-[var(--chandanam)] flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={faWandMagicSparkles} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                  Storefront Display Priority Resolver
                </span>
              </div>
              <h2 className="font-heading text-base sm:text-lg font-bold text-[var(--text)]">
                {showcaseFestival ? (
                  <>
                    Live on Storefront: <span className="text-[var(--olive)]">{showcaseFestival.name}</span> ({renderStatusBadge(showcaseFestival)})
                  </>
                ) : (
                  <span className="text-[var(--text-muted)]">No Eligible Festival Currently Active (Section Hidden on Public Site)</span>
                )}
              </h2>
            </div>
          </div>

          <div className="text-xs text-[var(--text-muted)] bg-[var(--bg-subtle)] px-3.5 py-2 rounded-xl border border-[var(--border)] max-w-md">
            <strong>Priority Engine:</strong> Active Festival (1st) &rarr; Upcoming Festival in 1-Mo Pre-Booking Window (2nd) &rarr; Hidden (3rd).
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FESTIVALS LIST & MATRIX TABLE */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--text)]">
              Configured Festivals &amp; Seasonal Drops ({festivals.length})
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Click any row or select a festival to view and manage its assigned hampers</p>
          </div>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[var(--bg)]/50 border-b border-[var(--border)] text-[var(--text-muted)] uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 font-bold">Celebration / Festival</th>
                  <th className="py-3 px-4 font-bold">Event Dates</th>
                  <th className="py-3 px-4 font-bold">Pre-Booking</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold">Assigned Hampers</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/70">
                {festivals.map((fest) => {
                  const isSelected = selectedFestivalId === fest.id;
                  const isShowcase = showcaseFestival?.id === fest.id;
                  const productCount = (fest.products || []).length;
                  const activeProductCount = (fest.products || []).filter((p) => p.active !== false).length;

                  return (
                    <tr
                      key={fest.id}
                      onClick={() => setSelectedFestivalId(fest.id)}
                      className={`hover:bg-[var(--bg)]/40 transition-colors cursor-pointer ${
                        isSelected ? 'bg-[var(--olive)]/5 font-semibold' : ''
                      }`}
                    >
                      {/* Festival Name & Banner */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={fest.banner || '/logo.png'}
                            alt={fest.name}
                            className="w-12 h-8 rounded-md object-cover border border-[var(--border)] flex-shrink-0 bg-[var(--bg)]"
                            onError={(e) => { e.target.src = '/logo.png'; }}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-[var(--text)] text-xs">{fest.name}</p>
                              {isShowcase && (
                                <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-1.5 py-0.2 rounded">
                                  ★ SHOWCASE
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-[var(--text-muted)] truncate max-w-xs">{fest.title || fest.tagline}</p>
                          </div>
                        </div>
                      </td>

                      {/* Event Dates */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-[11px] font-semibold text-[var(--text)]">
                          {fest.startDate} &rarr; {fest.endDate}
                        </span>
                      </td>

                      {/* Pre-Booking */}
                      <td className="py-3 px-4 whitespace-nowrap text-[11px]">
                        {fest.preBookingEnabled ? (
                          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                            Starts {fest.preBookingStartDate || '1 mo prior'}
                          </span>
                        ) : (
                          <span className="text-[var(--text-muted)]">Disabled</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {renderStatusBadge(fest)}
                      </td>

                      {/* Assigned Hampers Count */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-[11px] font-bold text-[var(--olive)]">
                          {activeProductCount} active / {productCount} total
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditFestival(fest)}
                            className="w-7 h-7 rounded-md border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--bg)] text-[var(--text)] flex items-center justify-center transition-colors cursor-pointer"
                            title="Edit Festival"
                          >
                            <FontAwesomeIcon icon={faEdit} className="text-xs" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleFestivalStatus(fest)}
                            className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
                              fest.status === 'published'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                            }`}
                            title="Toggle Published / Draft"
                          >
                            {fest.status === 'published' ? 'Live' : 'Draft'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteFestival(fest.id, fest.name)}
                            className="w-7 h-7 rounded-md border border-[var(--border)] bg-[var(--card)] hover:bg-rose-50 text-rose-600 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors cursor-pointer"
                            title="Delete Festival"
                          >
                            <FontAwesomeIcon icon={faTrash} className="text-xs" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. PRODUCT MANAGEMENT FOR SELECTED FESTIVAL */}
      {/* ========================================================================= */}
      {activeFestivalDetail && (
        <div className="rounded-xl bg-[var(--card)] border border-[var(--border)] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[var(--border)]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FontAwesomeIcon icon={faBoxesStacked} className="text-xs text-[var(--olive)]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Products Assigned to Celebration
                </span>
              </div>
              <h2 className="text-lg font-bold text-[var(--text)]">
                {activeFestivalDetail.name} — Products Table ({activeFestivalDetail.products?.length || 0} Hampers)
              </h2>
            </div>

            <button
              onClick={handleOpenAddProduct}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[var(--olive)] text-white text-xs font-semibold hover:bg-[var(--olive-hover)] shadow-xs transition-colors cursor-pointer"
            >
              <FontAwesomeIcon icon={faPlus} className="text-xs" />
              <span>Add Hamper to {activeFestivalDetail.name}</span>
            </button>
          </div>

          {/* Product Items Table */}
          {(!activeFestivalDetail.products || activeFestivalDetail.products.length === 0) ? (
            <div className="text-center py-12 border-2 border-dashed border-[var(--border)] rounded-xl p-6">
              <FontAwesomeIcon icon={faGift} className="text-3xl text-[var(--text-muted)] mb-3 opacity-30" />
              <h3 className="text-sm font-bold text-[var(--text)]">No Hampers Assigned Yet</h3>
              <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto mt-1 mb-4">
                Add products specifically for {activeFestivalDetail.name}.
              </p>
              <button
                onClick={handleOpenAddProduct}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--olive)] text-white text-xs font-bold hover:bg-[var(--olive-hover)] shadow-xs cursor-pointer"
              >
                <FontAwesomeIcon icon={faPlus} className="text-xs" />
                <span>Add First Hamper Product</span>
              </button>
            </div>
          ) : (
            <div className="border border-[var(--border)] rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[var(--bg)]/50 border-b border-[var(--border)] text-[var(--text-muted)] uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4 font-bold">Hamper Product</th>
                      <th className="py-3 px-4 font-bold">Badge</th>
                      <th className="py-3 px-4 font-bold">Origin / Cluster</th>
                      <th className="py-3 px-4 font-bold">Price (₹)</th>
                      <th className="py-3 px-4 font-bold">Status</th>
                      <th className="py-3 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]/70">
                    {activeFestivalDetail.products.map((prod) => {
                      const isActive = prod.active !== false;

                      return (
                        <tr key={prod.id} className="hover:bg-[var(--bg)]/40 transition-colors">
                          
                          {/* Title & Image */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={prod.image || (prod.images && prod.images[0]) || '/logo.png'}
                                alt={prod.title || prod.name}
                                className="w-10 h-10 rounded-lg object-cover border border-[var(--border)] flex-shrink-0 bg-[var(--bg)]"
                                onError={(e) => { e.target.src = '/logo.png'; }}
                              />
                              <div>
                                <p className="font-bold text-[var(--text)] text-xs">{prod.title || prod.name}</p>
                                <p className="text-[10px] text-[var(--text-muted)] line-clamp-1 max-w-xs">{prod.description}</p>
                              </div>
                            </div>
                          </td>

                          {/* Badge */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            {prod.badge ? (
                              <span className="text-[9.5px] font-bold bg-[var(--olive)]/10 text-[var(--olive)] px-2 py-0.5 rounded">
                                {prod.badge}
                              </span>
                            ) : (
                              <span className="text-[var(--text-muted)]">—</span>
                            )}
                          </td>

                          {/* Origin */}
                          <td className="py-3 px-4 whitespace-nowrap text-[11px] font-medium text-[var(--text)]">
                            {prod.origin || 'Kerala Atelier'}
                          </td>

                          {/* Price */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            {prod.showPrice !== false ? (
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-[var(--text)]">
                                  ₹{prod.price?.toLocaleString()}
                                </span>
                                {prod.originalPrice && prod.originalPrice > prod.price && (
                                  <span className="text-[10px] text-[var(--text-muted)] line-through">
                                    ₹{prod.originalPrice?.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="flex flex-col">
                                <span className="text-[10.5px] font-bold text-[var(--olive)] bg-[var(--olive)]/10 px-2 py-0.5 rounded w-fit">
                                  On Request
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <button
                              onClick={() => handleToggleProduct(prod.id)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer border ${
                                isActive
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                  : 'bg-stone-500/10 text-stone-600 dark:text-stone-400 border-stone-500/20'
                              }`}
                            >
                              <span>{isActive ? 'Active' : 'Disabled'}</span>
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditProduct(prod)}
                                className="w-7 h-7 rounded-md border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--bg)] text-[var(--text)] flex items-center justify-center transition-colors cursor-pointer"
                                title="Edit Hamper"
                              >
                                <FontAwesomeIcon icon={faEdit} className="text-xs" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="w-7 h-7 rounded-md border border-[var(--border)] bg-[var(--card)] hover:bg-rose-50 text-rose-600 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors cursor-pointer"
                                title="Delete Hamper"
                              >
                                <FontAwesomeIcon icon={faTrash} className="text-xs" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT FESTIVAL */}
      {/* ========================================================================= */}
      {festivalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl p-6 sm:p-7">

            <div className="flex items-center justify-between pb-3.5 border-b border-[var(--border)] mb-5">
              <div>
                <h3 className="text-xl font-bold text-[var(--text)]">
                  {editingFestival ? `Edit Festival: ${editingFestival.name}` : 'Create New Celebration / Festival'}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Configure banner assets, dates, automated 1-month pre-booking, and celebration storytelling.
                </p>
              </div>
              <button
                onClick={() => setFestivalModalOpen(false)}
                className="w-8 h-8 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)] flex items-center justify-center text-sm transition-colors cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <form onSubmit={handleSaveFestival} className="space-y-3.5 text-xs">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">Festival / Celebration Name *</label>
                  <input
                    type="text"
                    required
                    value={festivalForm.name}
                    onChange={(e) => setFestivalForm({ ...festivalForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
                    placeholder="e.g. Onam Celebrations 2026"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">Headline Title</label>
                  <input
                    type="text"
                    value={festivalForm.title}
                    onChange={(e) => setFestivalForm({ ...festivalForm, title: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
                    placeholder="e.g. Thiruvonam Grand Festive Atelier"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">Festival Start Date *</label>
                  <input
                    type="date"
                    required
                    value={festivalForm.startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">Festival End Date *</label>
                  <input
                    type="date"
                    required
                    value={festivalForm.endDate}
                    onChange={(e) => setFestivalForm({ ...festivalForm, endDate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
                  />
                </div>
              </div>

              {/* Pre-Booking Controls */}
              <div className="p-3.5 rounded-xl bg-[var(--bg)]/70 border border-[var(--border)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text)]">Upcoming Pre-Booking System</h4>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Automatically opens pre-booking 1 month prior to Festival Start Date.
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={festivalForm.preBookingEnabled}
                    onClick={() => setFestivalForm({ ...festivalForm, preBookingEnabled: !festivalForm.preBookingEnabled })}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      festivalForm.preBookingEnabled ? 'bg-[var(--olive)]' : 'bg-stone-300 dark:bg-stone-700'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                        festivalForm.preBookingEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {festivalForm.preBookingEnabled && (
                  <div>
                    <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">
                      Pre-Booking Start Date (Default: 1 Month Before Start Date)
                    </label>
                    <input
                      type="date"
                      value={festivalForm.preBookingStartDate}
                      onChange={(e) => setFestivalForm({ ...festivalForm, preBookingStartDate: e.target.value })}
                      className="w-full sm:w-1/2 px-3.5 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
                    />
                  </div>
                )}
              </div>

              {/* Banner Image Upload Box */}
              <div>
                <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1.5">
                  Festival Banner Image *
                </label>
                
                <input
                  type="file"
                  ref={bannerFileInputRef}
                  accept="image/*"
                  onChange={handleBannerUpload}
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row items-center gap-3.5 p-3.5 rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg)]/60">
                  {/* Thumbnail Preview */}
                  <div className="w-28 h-16 rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden flex items-center justify-center flex-shrink-0 shadow-xs">
                    {festivalForm.banner ? (
                      <img
                        src={festivalForm.banner}
                        alt="Banner preview"
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
                        onClick={() => bannerFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--olive)] text-white text-xs font-semibold hover:bg-[var(--olive-hover)] shadow-xs transition-colors cursor-pointer"
                      >
                        <FontAwesomeIcon icon={faUpload} className="text-[10px]" />
                        <span>{festivalForm.banner ? 'Change Banner' : 'Upload Banner'}</span>
                      </button>

                      {festivalForm.banner && (
                        <button
                          type="button"
                          onClick={() => setFestivalForm({ ...festivalForm, banner: '' })}
                          className="px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-rose-50 text-rose-600 text-xs font-semibold cursor-pointer transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-[10.5px] text-[var(--text-muted)]">
                      Landscape banner image for festive atelier (Max 5MB).
                    </p>
                  </div>
                </div>
              </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">Tagline Flourish Line</label>
                    <input
                      type="text"
                      value={festivalForm.calligraphy}
                      onChange={(e) => setFestivalForm({ ...festivalForm, calligraphy: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
                      placeholder="e.g. Tradition &amp; Prosperity"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">Top Badge Text</label>
                    <input
                      type="text"
                      value={festivalForm.badge}
                      onChange={(e) => setFestivalForm({ ...festivalForm, badge: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
                      placeholder="e.g. KERALA FESTIVE DROP"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">Tagline &amp; Short Description</label>
                  <input
                    type="text"
                    value={festivalForm.tagline}
                    onChange={(e) => setFestivalForm({ ...festivalForm, tagline: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)] mb-2"
                    placeholder="Short catchy tagline..."
                  />
                  <textarea
                    rows={2}
                    value={festivalForm.description}
                    onChange={(e) => setFestivalForm({ ...festivalForm, description: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)] resize-none"
                    placeholder="Full celebration description..."
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">Delivery Announcement Ribbon</label>
                  <input
                    type="text"
                    value={festivalForm.announcement}
                    onChange={(e) => setFestivalForm({ ...festivalForm, announcement: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
                    placeholder="e.g. ✨ Pan-India Express Delivery..."
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">Publish Status</label>
                  <select
                    value={festivalForm.status}
                    onChange={(e) => setFestivalForm({ ...festivalForm, status: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)] cursor-pointer font-semibold"
                  >
                    <option value="published">Published (Active on Eligible Dates)</option>
                    <option value="draft">Draft / Hidden (Never displayed publicly)</option>
                  </select>
                </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setFestivalModalOpen(false)}
                  className="inline-flex items-center justify-center py-2 px-4 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--bg)] text-xs font-semibold text-[var(--text)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center py-2 px-5 rounded-lg bg-[var(--olive)] text-white text-xs font-bold hover:bg-[var(--olive-hover)] shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingFestival ? 'Update Festival' : 'Create Festival'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT FESTIVAL PRODUCT */}
      {/* ========================================================================= */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl p-6 sm:p-7">

            <div className="flex items-center justify-between pb-3.5 border-b border-[var(--border)] mb-5">
              <div>
                <h3 className="text-xl font-bold text-[var(--text)]">
                  {editingProduct ? 'Edit Festival Hamper' : `Add Hamper to ${activeFestivalDetail?.name}`}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Add product title, pricing, images, and craft inclusions.
                </p>
              </div>
              <button
                onClick={() => setProductModalOpen(false)}
                className="w-8 h-8 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)] flex items-center justify-center text-sm transition-colors cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">

              <div>
                <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">Hamper Title *</label>
                <input
                  type="text"
                  required
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
                  placeholder="e.g. Royal Kasavu & Artisanal Treats Hamper"
                />
              </div>

              {/* Pricing & Show Price Toggle */}
              <div className="p-3.5 rounded-xl bg-[var(--bg)]/70 border border-[var(--border)] space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                    Pricing &amp; Public Visibility
                  </p>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-[var(--text)]">Show Price on Store</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={productForm.showPrice}
                      onClick={() => setProductForm({ ...productForm, showPrice: !productForm.showPrice })}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        productForm.showPrice ? 'bg-[var(--olive)]' : 'bg-stone-300 dark:bg-stone-700'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                          productForm.showPrice ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">Offer Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)] font-semibold"
                      placeholder="1899"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">Original MRP (₹)</label>
                    <input
                      type="number"
                      value={productForm.originalPrice}
                      onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
                      placeholder="2299"
                    />
                  </div>
                </div>

                {!productForm.showPrice && (
                  <p className="text-[10.5px] text-[var(--olive)] font-medium bg-[var(--olive)]/10 px-2.5 py-1 rounded-lg">
                    Customers will see &quot;Price on Request&quot; with a WhatsApp order/inquiry button.
                  </p>
                )}
              </div>

              {/* Hamper Image Upload Box */}
              <div>
                <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1.5">
                  Hamper Image *
                </label>
                
                <input
                  type="file"
                  ref={productFileInputRef}
                  accept="image/*"
                  onChange={handleProductImageUpload}
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row items-center gap-3.5 p-3.5 rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg)]/60">
                  {/* Thumbnail Preview */}
                  <div className="w-20 h-20 rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden flex items-center justify-center flex-shrink-0 shadow-xs">
                    {productForm.image ? (
                      <img
                        src={productForm.image}
                        alt="Hamper preview"
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
                        onClick={() => productFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--olive)] text-white text-xs font-semibold hover:bg-[var(--olive-hover)] shadow-xs transition-colors cursor-pointer"
                      >
                        <FontAwesomeIcon icon={faUpload} className="text-[10px]" />
                        <span>{productForm.image ? 'Change Image' : 'Upload Image'}</span>
                      </button>

                      {productForm.image && (
                        <button
                          type="button"
                          onClick={() => setProductForm({ ...productForm, image: '' })}
                          className="px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-rose-50 text-rose-600 text-xs font-semibold cursor-pointer transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-[10.5px] text-[var(--text-muted)]">
                      Square / portrait hamper product image (Max 5MB).
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={productForm.badge}
                    onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
                    placeholder="e.g. Onam Special"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">Origin / Craft Cluster</label>
                  <input
                    type="text"
                    value={productForm.origin}
                    onChange={(e) => setProductForm({ ...productForm, origin: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
                    placeholder="e.g. Mannar &amp; Balaramapuram Clusters"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">Description</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)] resize-none"
                  placeholder="Artisanal description of this celebration hamper..."
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">Inclusions / Highlights (Comma separated)</label>
                <input
                  type="text"
                  value={productForm.highlights}
                  onChange={(e) => setProductForm({ ...productForm, highlights: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
                  placeholder="Brass Nilavilakku, Palada Payasam, Banana Chips, Custom Note"
                />
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
                <input
                  type="checkbox"
                  id="prodActive"
                  checked={productForm.active}
                  onChange={(e) => setProductForm({ ...productForm, active: e.target.checked })}
                  className="w-3.5 h-3.5 rounded text-[var(--olive)] cursor-pointer"
                />
                <label htmlFor="prodActive" className="font-semibold text-xs text-[var(--text)] cursor-pointer">
                  Publish Hamper on Storefront
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="inline-flex items-center justify-center py-2 px-4 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--bg)] text-xs font-semibold text-[var(--text)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center py-2 px-5 rounded-lg bg-[var(--olive)] text-white text-xs font-bold hover:bg-[var(--olive-hover)] shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingProduct ? 'Update Hamper' : 'Add Hamper'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
