'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGift,
  faPlus,
  faPenToSquare,
  faTrashCan,
  faXmark,
  faCircleCheck,
  faCalendarDays,
  faClock,
  faEye,
  faEyeSlash,
  faBoxesStacked,
  faUpload,
  faImage,
  faRotate,
} from '@fortawesome/free-solid-svg-icons';
import { useFestivalStore, getFestivalStatus } from '@/src/store/festivalStore';
import { confirmDialog } from '@/src/store/confirmStore';
import { compressImage } from '@/src/utils/imageCompressor';

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
  announcement: '✨ Express Delivery • Photo Approval Before Dispatch',
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

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState(initialProductForm);

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchFestivals();
  }, [fetchFestivals]);

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

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('Banner image must be under 15MB');
      return;
    }

    try {
      const compressed = await compressImage(file, 1400, 800, 0.82);
      setFestivalForm((prev) => ({ ...prev, banner: compressed }));
    } catch (err) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setFestivalForm((prev) => ({ ...prev, banner: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('Product image must be under 15MB');
      return;
    }

    try {
      const compressed = await compressImage(file, 1000, 1000, 0.82);
      setProductForm((prev) => ({ ...prev, image: compressed }));
    } catch (err) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setProductForm((prev) => ({ ...prev, image: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

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
        setFeedback(`"${festivalForm.name}" updated successfully.`);
      } else {
        const created = await createFestival(festivalForm);
        if (created) setSelectedFestivalId(created.id);
        setFeedback(`"${festivalForm.name}" created successfully.`);
      }
      setFestivalModalOpen(false);
      setTimeout(() => setFeedback(''), 3000);
    } catch (err) {
      console.error(err);
      setFeedback('Error saving festival.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFestival = async (id, name) => {
    const isConfirmed = await confirmDialog({
      title: 'Delete Festival Campaign',
      message: `Are you sure you want to delete "${name}" and all of its assigned hamper packages?`,
      confirmText: 'Delete Festival',
      cancelText: 'Cancel',
      type: 'danger',
    });
    if (isConfirmed) {
      await deleteFestival(id);
      setFeedback(`Festival "${name}" deleted.`);
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  const handleToggleFestivalStatus = async (festival) => {
    const nextStatus = festival.status === 'published' ? 'draft' : 'published';
    await updateFestival(festival.id, { status: nextStatus });
    setFeedback(`"${festival.name}" is now ${nextStatus === 'published' ? 'Live' : 'Draft'}.`);
    setTimeout(() => setFeedback(''), 2500);
  };

  const handleOpenAddProduct = () => {
    if (!activeFestivalDetail) return;
    setEditingProduct(null);
    setProductForm({
      title: '',
      price: 1899,
      originalPrice: 2299,
      badge: `${activeFestivalDetail.name} Special`,
      image: '',
      description: 'Handcrafted festive hamper with curated keepsakes and traditional treats.',
      highlights: 'Signature Keepsake, Kerala Treats, Handwritten Note',
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
        setFeedback('Hamper product updated.');
      } else {
        await addProductToFestival(activeFestivalDetail.id, payload);
        setFeedback('New hamper added to celebration.');
      }
      setProductModalOpen(false);
      setTimeout(() => setFeedback(''), 3000);
    } catch (err) {
      console.error(err);
      setFeedback('Error saving hamper.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (productId, name) => {
    if (!activeFestivalDetail) return;
    const isConfirmed = await confirmDialog({
      title: 'Delete Hamper Item',
      message: `Are you sure you want to delete hamper "${name || 'item'}" from this celebration?`,
      confirmText: 'Delete Hamper',
      cancelText: 'Cancel',
      type: 'danger',
    });
    if (isConfirmed) {
      await deleteFestivalProduct(activeFestivalDetail.id, productId);
      setFeedback('Hamper removed.');
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  const handleToggleProduct = async (productId) => {
    if (!activeFestivalDetail) return;
    await toggleFestivalProduct(activeFestivalDetail.id, productId);
  };

  const renderStatusBadge = (festival) => {
    const status = getFestivalStatus(festival);
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live (Active)
          </span>
        );
      case 'PRE_BOOKING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <FontAwesomeIcon icon={faClock} className="text-[9px]" />
            Pre-Booking
          </span>
        );
      case 'UPCOMING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            <FontAwesomeIcon icon={faCalendarDays} className="text-[9px]" />
            Upcoming
          </span>
        );
      case 'ENDED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-500/10 text-stone-600 dark:text-stone-400 border border-stone-500/20">
            Ended
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-500/10 text-stone-600 dark:text-stone-400 border border-stone-500/20">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl pb-12 font-sans">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)]">
            Festival Hampers &amp; Celebrations
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Manage seasonal celebration campaigns, automated 1-month pre-booking windows, and curated festive hampers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchFestivals()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--bg)] text-xs font-semibold text-[var(--text)] shadow-xs transition-colors cursor-pointer"
            title="Refresh Festivals"
          >
            <FontAwesomeIcon icon={faRotate} className="text-[10px] text-[var(--text-muted)]" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleOpenCreateFestival}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[var(--olive)] text-white text-xs font-semibold hover:bg-[var(--olive-hover)] shadow-xs transition-colors cursor-pointer"
          >
            <FontAwesomeIcon icon={faPlus} className="text-xs" />
            <span>Add Festival</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center gap-2.5 text-xs font-semibold animate-fadeIn">
          <FontAwesomeIcon icon={faCircleCheck} className="text-sm" />
          <span>{feedback}</span>
        </div>
      )}

      {/* 2. Live Storefront Active Festival Banner Card */}
      <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--olive)]/10 text-[var(--olive)] flex items-center justify-center text-xs flex-shrink-0">
            <FontAwesomeIcon icon={faGift} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
              Storefront Showcase Status
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              {showcaseFestival ? (
                <>
                  <span className="font-bold text-sm text-[var(--text)]">{showcaseFestival.name}</span>
                  {renderStatusBadge(showcaseFestival)}
                </>
              ) : (
                <span className="font-semibold text-[var(--text-muted)]">No active festive celebration currently live</span>
              )}
            </div>
          </div>
        </div>

        <div className="text-[11px] text-[var(--text-muted)] bg-[var(--bg)] px-3 py-1.5 rounded-lg border border-[var(--border)]">
          <span className="font-semibold text-[var(--text)]">Auto-Scheduler:</span> Active Festival &rarr; Pre-Booking (1 mo before) &rarr; Standard Catalog
        </div>
      </div>

      {/* 3. Festivals Data Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[var(--text)]">
            Configured Festivals ({festivals.length})
          </h2>
          <span className="text-[11px] text-[var(--text-muted)]">Click a row to manage its hampers</span>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xs overflow-hidden">
          {festivals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[var(--bg)]/50 border-b border-[var(--border)] text-[var(--text-muted)] uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 font-bold">Celebration / Festival</th>
                    <th className="py-3 px-4 font-bold">Event Dates</th>
                    <th className="py-3 px-4 font-bold">Pre-Booking</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    <th className="py-3 px-4 font-bold">Hampers</th>
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
                          isSelected ? 'bg-[var(--olive)]/5' : ''
                        }`}
                      >
                        {/* Name & Banner */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={fest.banner || '/logo.png'}
                              alt={fest.name}
                              className="w-12 h-8 rounded-md object-cover border border-[var(--border)] flex-shrink-0 bg-[var(--bg)]"
                              onError={(e) => { e.target.src = '/logo.png'; }}
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="font-bold text-[var(--text)] text-xs">{fest.name}</p>
                                {isShowcase && (
                                  <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/20">
                                    ★ Live
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-[var(--text-muted)] truncate max-w-xs">{fest.title || fest.tagline}</p>
                            </div>
                          </div>
                        </td>

                        {/* Event Dates */}
                        <td className="py-3 px-4 whitespace-nowrap text-[11px] font-medium text-[var(--text)]">
                          {fest.startDate} &rarr; {fest.endDate}
                        </td>

                        {/* Pre-Booking */}
                        <td className="py-3 px-4 whitespace-nowrap text-[11px]">
                          {fest.preBookingEnabled ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              From {fest.preBookingStartDate || '1 mo prior'}
                            </span>
                          ) : (
                            <span className="text-[var(--text-muted)]">Off</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {renderStatusBadge(fest)}
                        </td>

                        {/* Hampers count */}
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
                              title="Edit Festival Details"
                            >
                              <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleFestivalStatus(fest)}
                              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer border ${
                                fest.status === 'published'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                  : 'bg-stone-500/10 text-stone-600 border-stone-500/20'
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
                              <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-[var(--text-muted)]">
              <FontAwesomeIcon icon={faGift} className="text-2xl text-[var(--text-muted)]/30 mb-2 block mx-auto" />
              <p className="font-semibold text-[var(--text)]">No festivals configured</p>
              <p className="mt-0.5">Click Add Festival to create your first celebration campaign.</p>
            </div>
          )}
        </div>
      </div>

      {/* 4. Products / Hampers of Selected Festival */}
      {activeFestivalDetail && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--olive)] bg-[var(--olive)]/10 px-2 py-0.5 rounded">
                Celebration Collection
              </span>
              <h2 className="text-base font-bold text-[var(--text)] mt-1">
                {activeFestivalDetail.name} &mdash; Hampers Catalog ({activeFestivalDetail.products?.length || 0})
              </h2>
            </div>

            <button
              onClick={handleOpenAddProduct}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--olive)] text-white text-xs font-semibold hover:bg-[var(--olive-hover)] shadow-xs transition-colors cursor-pointer"
            >
              <FontAwesomeIcon icon={faPlus} className="text-xs" />
              <span>Add Hamper</span>
            </button>
          </div>

          {(!activeFestivalDetail.products || activeFestivalDetail.products.length === 0) ? (
            <div className="text-center py-10 border border-dashed border-[var(--border)] rounded-xl p-6 bg-[var(--bg)]/40">
              <FontAwesomeIcon icon={faBoxesStacked} className="text-2xl text-[var(--text-muted)]/40 mb-2 block mx-auto" />
              <h3 className="text-xs font-bold text-[var(--text)]">No Hampers Assigned Yet</h3>
              <p className="text-[11px] text-[var(--text-muted)] max-w-sm mx-auto mt-0.5 mb-3">
                Add celebration hampers specifically curated for {activeFestivalDetail.name}.
              </p>
              <button
                onClick={handleOpenAddProduct}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--olive)] text-white text-xs font-bold hover:bg-[var(--olive-hover)] shadow-xs cursor-pointer"
              >
                <FontAwesomeIcon icon={faPlus} className="text-xs" />
                <span>Add First Hamper</span>
              </button>
            </div>
          ) : (
            <div className="border border-[var(--border)] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[var(--bg)]/50 border-b border-[var(--border)] text-[var(--text-muted)] uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4 font-bold">Hamper Product</th>
                      <th className="py-3 px-4 font-bold">Badge</th>
                      <th className="py-3 px-4 font-bold">Origin</th>
                      <th className="py-3 px-4 font-bold">Price</th>
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
                              <span className="text-[var(--text-muted)]">&mdash;</span>
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
                              <span className="text-[10px] font-bold text-[var(--olive)] bg-[var(--olive)]/10 px-2 py-0.5 rounded">
                                On Request
                              </span>
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
                              <FontAwesomeIcon icon={isActive ? faEye : faEyeSlash} className="text-[10px]" />
                              <span>{isActive ? 'Active' : 'Hidden'}</span>
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
                                <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id, prod.title || prod.name)}
                                className="w-7 h-7 rounded-md border border-[var(--border)] bg-[var(--card)] hover:bg-rose-50 text-rose-600 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors cursor-pointer"
                                title="Delete Hamper"
                              >
                                <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
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

      {/* 5. MODAL: CREATE / EDIT FESTIVAL */}
      {festivalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl p-6 sm:p-7 space-y-4 my-8">

            <div className="flex items-center justify-between pb-3.5 border-b border-[var(--border)]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--olive)] bg-[var(--olive)]/10 px-2 py-0.5 rounded">
                  {editingFestival ? 'Update Festival' : 'New Celebration'}
                </span>
                <h3 className="text-xl font-bold text-[var(--text)] mt-1">
                  {editingFestival ? `Edit ${editingFestival.name}` : 'Add New Festival'}
                </h3>
              </div>
              <button
                onClick={() => setFestivalModalOpen(false)}
                className="w-8 h-8 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)] flex items-center justify-center text-sm transition-colors cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <form onSubmit={handleSaveFestival} className="space-y-3.5 text-xs">

              {/* Banner Upload */}
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
                <div className="flex flex-col sm:flex-row items-center gap-3.5 p-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg)]/60">
                  <div className="w-24 h-14 rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden flex items-center justify-center flex-shrink-0 shadow-xs">
                    {festivalForm.banner ? (
                      <img
                        src={festivalForm.banner}
                        alt="Banner preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = '/logo.png'; }}
                      />
                    ) : (
                      <FontAwesomeIcon icon={faImage} className="text-xl text-[var(--text-muted)] opacity-40" />
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left space-y-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <button
                        type="button"
                        onClick={() => bannerFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--olive)] text-white text-xs font-semibold hover:bg-[var(--olive-hover)] shadow-xs transition-colors cursor-pointer"
                      >
                        <FontAwesomeIcon icon={faUpload} className="text-[10px]" />
                        <span>{festivalForm.banner ? 'Change Image' : 'Upload Banner'}</span>
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
                    <p className="text-[10px] text-[var(--text-muted)]">Max 5MB (JPG, PNG, WEBP)</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">Festival Name *</label>
                  <input
                    type="text"
                    required
                    value={festivalForm.name}
                    onChange={(e) => setFestivalForm({ ...festivalForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
                    placeholder="e.g. Onam Celebrations"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">Tagline</label>
                  <input
                    type="text"
                    value={festivalForm.tagline}
                    onChange={(e) => setFestivalForm({ ...festivalForm, tagline: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
                    placeholder="e.g. Grand Festive Keepsakes"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={festivalForm.startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={festivalForm.endDate}
                    onChange={(e) => setFestivalForm({ ...festivalForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
                  />
                </div>
              </div>

              {/* Pre-booking toggle */}
              <div className="p-3 rounded-xl bg-[var(--bg)]/60 border border-[var(--border)] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-[var(--text)]">Enable Pre-Booking Window</span>
                    <p className="text-[10px] text-[var(--text-muted)]">Opens early pre-booking for customers before start date.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={festivalForm.preBookingEnabled}
                    onChange={(e) => setFestivalForm({ ...festivalForm, preBookingEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-[var(--olive)] cursor-pointer"
                  />
                </div>

                {festivalForm.preBookingEnabled && (
                  <div className="pt-2 border-t border-[var(--border)]">
                    <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">
                      Pre-Booking Start Date (Default: 1 Month Before)
                    </label>
                    <input
                      type="date"
                      value={festivalForm.preBookingStartDate}
                      onChange={(e) => setFestivalForm({ ...festivalForm, preBookingStartDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">Publish Status</label>
                <select
                  value={festivalForm.status}
                  onChange={(e) => setFestivalForm({ ...festivalForm, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)] cursor-pointer font-semibold"
                >
                  <option value="published">Published (Live on eligible dates)</option>
                  <option value="draft">Draft (Hidden from public store)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setFestivalModalOpen(false)}
                  className="py-2 px-4 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--bg)] text-xs font-semibold text-[var(--text)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="py-2 px-5 rounded-lg bg-[var(--olive)] text-white text-xs font-bold hover:bg-[var(--olive-hover)] shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingFestival ? 'Update Festival' : 'Save Festival'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: ADD / EDIT FESTIVAL PRODUCT */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl p-6 sm:p-7 space-y-4 my-8">

            <div className="flex items-center justify-between pb-3.5 border-b border-[var(--border)]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--olive)] bg-[var(--olive)]/10 px-2 py-0.5 rounded">
                  {editingProduct ? 'Update Hamper' : 'New Festive Hamper'}
                </span>
                <h3 className="text-xl font-bold text-[var(--text)] mt-1">
                  {editingProduct ? 'Edit Hamper' : `Add to ${activeFestivalDetail?.name}`}
                </h3>
              </div>
              <button
                onClick={() => setProductModalOpen(false)}
                className="w-8 h-8 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)] flex items-center justify-center text-sm transition-colors cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">

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
                <div className="flex flex-col sm:flex-row items-center gap-3.5 p-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg)]/60">
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
                  <div className="flex-1 text-center sm:text-left space-y-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <button
                        type="button"
                        onClick={() => productFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--olive)] text-white text-xs font-semibold hover:bg-[var(--olive-hover)] shadow-xs transition-colors cursor-pointer"
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
                    <p className="text-[10px] text-[var(--text-muted)]">Max 5MB (JPG, PNG, WEBP)</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">Hamper Title *</label>
                <input
                  type="text"
                  required
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
                  placeholder="e.g. Traditional Kasavu & Treats Hamper"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">Offer Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)] font-semibold"
                    placeholder="1899"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">Original MRP (₹)</label>
                  <input
                    type="number"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
                    placeholder="2299"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={productForm.badge}
                    onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
                    placeholder="e.g. Special Edition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">Origin Cluster</label>
                  <input
                    type="text"
                    value={productForm.origin}
                    onChange={(e) => setProductForm({ ...productForm, origin: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
                    placeholder="e.g. Kerala Craft Guilds"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)] resize-none"
                  placeholder="Short artisanal description..."
                />
              </div>

              <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.active}
                    onChange={(e) => setProductForm({ ...productForm, active: e.target.checked })}
                    className="w-3.5 h-3.5 rounded text-[var(--olive)] cursor-pointer"
                  />
                  <span className="font-semibold text-xs text-[var(--text)]">Publish on Storefront</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.showPrice}
                    onChange={(e) => setProductForm({ ...productForm, showPrice: e.target.checked })}
                    className="w-3.5 h-3.5 rounded text-[var(--olive)] cursor-pointer"
                  />
                  <span className="font-semibold text-xs text-[var(--text)]">Display Price</span>
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="py-2 px-4 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--bg)] text-xs font-semibold text-[var(--text)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="py-2 px-5 rounded-lg bg-[var(--olive)] text-white text-xs font-bold hover:bg-[var(--olive-hover)] shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingProduct ? 'Update Hamper' : 'Save Hamper'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
