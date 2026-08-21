'use client';

import { useState, useMemo, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faSearch,
  faPenToSquare,
  faTrashCan,
  faEye,
  faEyeSlash,
  faStar,
  faXmark,
  faBox,
  faCheck,
  faUpload,
  faImage,
} from '@fortawesome/free-solid-svg-icons';
import { useProductStore } from '@/src/store/productStore';
import { useCategoryStore } from '@/src/store/categoryStore';

export default function AdminProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct, toggleProductActive, toggleProductFeatured, toggleProductShowPrice } = useProductStore();
  const { categories } = useCategoryStore();

  const fileInputRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceVisibilityFilter, setPriceVisibilityFilter] = useState('All');
  const [editingProduct, setEditingProduct] = useState(null);
  const [isNewProductModal, setIsNewProductModal] = useState(false);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    category: categories[0]?.name || 'Wedding Hamper',
    price: '',
    originalPrice: '',
    description: '',
    imageUrl: '',
    showPrice: true,
    tag: '',
    featured: false,
    customizable: true,
    active: true,
  });

  const categoryNames = useMemo(() => {
    return ['All', ...categories.map((c) => c.name)];
  }, [categories]);

  const stats = useMemo(() => {
    return {
      total: products.length,
      active: products.filter((p) => p.active !== false).length,
      priceVisible: products.filter((p) => p.showPrice !== false).length,
      featured: products.filter((p) => p.featured).length,
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      
      if (priceVisibilityFilter === 'Visible' && p.showPrice === false) return false;
      if (priceVisibilityFilter === 'OnRequest' && p.showPrice !== false) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          (p.name || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q) ||
          (p.tag || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, selectedCategory, priceVisibilityFilter, searchQuery]);

  const openAddModal = () => {
    setFormData({
      name: '',
      category: categories[0]?.name || 'Chocolate Hamper',
      price: '',
      originalPrice: '',
      description: '',
      imageUrl: '',
      showPrice: true,
      tag: '',
      featured: false,
      customizable: true,
      active: true,
    });
    setEditingProduct(null);
    setIsNewProductModal(true);
  };

  const openEditModal = (product) => {
    setFormData({
      name: product.name || '',
      category: product.category || categories[0]?.name || 'Chocolate Hamper',
      price: product.price || '',
      originalPrice: product.originalPrice || '',
      description: product.description || '',
      imageUrl: product.images?.[0] || product.image || '',
      showPrice: product.showPrice !== false,
      tag: product.tag || '',
      featured: Boolean(product.featured),
      customizable: product.customizable !== false,
      active: product.active !== false,
    });
    setEditingProduct(product);
    setIsNewProductModal(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.imageUrl) {
      alert('Please upload an image for the product.');
      return;
    }

    const productPayload = {
      name: formData.name.trim(),
      category: formData.category,
      price: Number(formData.price) || 0,
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      description: formData.description.trim(),
      images: [formData.imageUrl.trim()],
      image: formData.imageUrl.trim(),
      stock: 100,
      showPrice: Boolean(formData.showPrice),
      tag: formData.tag.trim(),
      featured: formData.featured,
      customizable: formData.customizable,
      active: formData.active,
    };

    if (editingProduct) {
      await updateProduct(editingProduct.id, productPayload);
    } else {
      await addProduct(productPayload);
    }

    setIsNewProductModal(false);
    setEditingProduct(null);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteProduct(id);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)]">Product Catalog</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Manage your store's luxury gift hampers, bouquets, and storefront pricing ({products.length} total).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[var(--olive)] text-white text-xs font-semibold hover:bg-[var(--olive-hover)] shadow-xs transition-colors cursor-pointer"
          >
            <FontAwesomeIcon icon={faPlus} className="text-xs" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Mini KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Total Products</p>
            <p className="text-xl font-bold text-[var(--text)] mt-0.5">{stats.total}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 text-[var(--olive)] flex items-center justify-center text-xs">
            <FontAwesomeIcon icon={faBox} />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Active / Live</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{stats.active}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center text-xs">
            <FontAwesomeIcon icon={faEye} />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Price Visible</p>
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
              {stats.priceVisible}
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 flex items-center justify-center text-xs">
            <FontAwesomeIcon icon={faCheck} />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Featured</p>
            <p className="text-xl font-bold text-amber-500 mt-0.5">{stats.featured}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center text-xs">
            <FontAwesomeIcon icon={faStar} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-3.5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          {/* Search */}
          <div className="w-full sm:flex-1 relative">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs" />
            <input
              type="text"
              placeholder="Search by product title, category, or badge..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="w-full sm:w-52">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] font-medium focus:outline-none focus:border-[var(--olive)] cursor-pointer"
            >
              {categoryNames.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Price Visibility Filter */}
          <div className="w-full sm:w-44">
            <select
              value={priceVisibilityFilter}
              onChange={(e) => setPriceVisibilityFilter(e.target.value)}
              className="w-full py-2 px-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] font-medium focus:outline-none focus:border-[var(--olive)] cursor-pointer"
            >
              <option value="All">All Price Displays</option>
              <option value="Visible">Price Shown</option>
              <option value="OnRequest">Price on Request</option>
            </select>
          </div>

        </div>
      </div>

      {/* Products Data Table */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xs overflow-hidden">
        {filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[var(--bg)]/50 border-b border-[var(--border)] text-[var(--text-muted)] uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 font-bold">Product</th>
                  <th className="py-3 px-4 font-bold">Category</th>
                  <th className="py-3 px-4 font-bold">Price (₹)</th>
                  <th className="py-3 px-4 font-bold">Price on Storefront</th>
                  <th className="py-3 px-4 font-bold">Featured</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/70">
                {filteredProducts.map((p) => {
                  const discountPct = p.originalPrice && Number(p.originalPrice) > Number(p.price)
                    ? Math.round(((Number(p.originalPrice) - Number(p.price)) / Number(p.originalPrice)) * 100)
                    : 0;

                  const isPriceShown = p.showPrice !== false;

                  return (
                    <tr key={p.id} className="hover:bg-[var(--bg)]/40 transition-colors">

                      {/* Thumbnail & Title */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images?.[0] || p.image || '/logo.png'}
                            alt={p.name}
                            className="w-11 h-11 rounded-lg object-cover border border-[var(--border)] flex-shrink-0 bg-[var(--bg)]"
                            onError={(e) => { e.target.src = '/logo.png'; }}
                          />
                          <div className="overflow-hidden">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-[var(--text)] text-xs truncate max-w-[200px]">{p.name}</p>
                              {p.tag && (
                                <span className="text-[9px] font-bold bg-[var(--olive)]/10 text-[var(--olive)] px-1.5 py-0.2 rounded flex-shrink-0">
                                  {p.tag}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[var(--text-muted)] line-clamp-1 max-w-xs">{p.description}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-[11px] font-semibold text-[var(--text)]">
                          {p.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-[var(--text)]">
                            ₹{Number(p.price || 0).toLocaleString()}
                          </span>
                          {p.originalPrice && Number(p.originalPrice) > Number(p.price) && (
                            <span className="text-[10px] text-[var(--text-muted)] line-through">
                              ₹{Number(p.originalPrice).toLocaleString()}
                            </span>
                          )}
                        </div>
                        {discountPct > 0 && (
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                            {discountPct}% OFF
                          </span>
                        )}
                      </td>

                      {/* Price Display on Storefront */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleProductShowPrice(p.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer border ${
                            isPriceShown
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                          }`}
                          title="Click to toggle price display on storefront"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isPriceShown ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          <span>{isPriceShown ? 'Price Shown' : 'On Request'}</span>
                        </button>
                      </td>

                      {/* Featured Star Toggle */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleProductFeatured(p.id)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors cursor-pointer border ${
                            p.featured
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                              : 'text-[var(--text-muted)] border-[var(--border)] hover:bg-[var(--bg)]'
                          }`}
                          title="Toggle Featured on homepage"
                        >
                          <FontAwesomeIcon icon={faStar} className={`text-[10px] ${p.featured ? 'text-amber-500' : ''}`} />
                          <span>{p.featured ? 'Featured' : 'Standard'}</span>
                        </button>
                      </td>

                      {/* Active Status Switch */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleProductActive(p.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer border ${
                            p.active !== false
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-stone-500/10 text-stone-600 dark:text-stone-400 border-stone-500/20'
                          }`}
                        >
                          <FontAwesomeIcon icon={p.active !== false ? faEye : faEyeSlash} className="text-[10px]" />
                          <span>{p.active !== false ? 'Active' : 'Draft'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(p)}
                            className="w-7 h-7 rounded-md border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--bg)] text-[var(--text)] flex items-center justify-center transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="w-7 h-7 rounded-md border border-[var(--border)] bg-[var(--card)] hover:bg-rose-50 text-rose-600 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors cursor-pointer"
                            title="Delete Product"
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
          <div className="text-center py-12 px-4">
            <FontAwesomeIcon icon={faBox} className="mx-auto text-[var(--text-muted)] mb-3 text-3xl opacity-30 block" />
            <p className="text-sm font-semibold text-[var(--text)]">No products match your criteria</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Try changing category filters or clear your search.</p>
          </div>
        )}
      </div>

      {/* Structured Add / Edit Product Modal */}
      {isNewProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 sm:p-7 max-w-xl w-full shadow-xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3.5">
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--olive)] bg-[var(--olive)]/10 px-2 py-0.5 rounded">
                  {editingProduct ? 'Update Product' : 'New Listing'}
                </span>
                <h2 className="text-xl font-bold text-[var(--text)] mt-1">
                  {editingProduct ? 'Edit Product Details' : 'Add New Gifting Product'}
                </h2>
              </div>
              <button
                onClick={() => setIsNewProductModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] flex items-center justify-center cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} className="text-sm" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">

              {/* Product Image Upload Box */}
              <div>
                <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1.5">
                  Product Image *
                </label>
                
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row items-center gap-3.5 p-3.5 rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg)]/60">
                  {/* Thumbnail Preview */}
                  <div className="w-20 h-20 rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden flex items-center justify-center flex-shrink-0 shadow-xs relative group">
                    {formData.imageUrl ? (
                      <img
                        src={formData.imageUrl}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = '/logo.png'; }}
                      />
                    ) : (
                      <FontAwesomeIcon icon={faImage} className="text-2xl text-[var(--text-muted)] opacity-40" />
                    )}
                  </div>

                  {/* Upload Trigger and Info */}
                  <div className="flex-1 text-center sm:text-left space-y-1.5">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--olive)] text-white text-xs font-semibold hover:bg-[var(--olive-hover)] shadow-xs transition-colors cursor-pointer"
                      >
                        <FontAwesomeIcon icon={faUpload} className="text-[10px]" />
                        <span>{formData.imageUrl ? 'Change Image' : 'Upload Image'}</span>
                      </button>

                      {formData.imageUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, imageUrl: '' })}
                          className="px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-rose-50 text-rose-600 text-xs font-semibold cursor-pointer transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-[10.5px] text-[var(--text-muted)]">
                      Supports JPG, PNG, WEBP from your phone or computer (Max 5MB).
                    </p>
                  </div>
                </div>
              </div>

              {/* Title & Category */}
              <div>
                <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artisanal Royal Chocolate Hamper"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)] cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">
                    Badge Tag (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bestseller, New Arrival"
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
                  />
                </div>
              </div>

              {/* Pricing & Storefront Display */}
              <div className="p-3.5 rounded-xl bg-[var(--bg)]/70 border border-[var(--border)] space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                    Pricing Configuration
                  </p>

                  {/* Show Price Switch */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-[var(--text)]">Show Price on Store</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={formData.showPrice}
                      onClick={() => setFormData({ ...formData, showPrice: !formData.showPrice })}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        formData.showPrice ? 'bg-[var(--olive)]' : 'bg-stone-300 dark:bg-stone-700'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                          formData.showPrice ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[var(--text)] text-[10px] uppercase mb-1">
                      Selling Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="1499"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-[var(--card)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)] font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[var(--text)] text-[10px] uppercase mb-1">
                      Original / MRP (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="1799"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-[var(--card)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
                    />
                  </div>
                </div>

                {!formData.showPrice && (
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-900/50">
                    ℹ️ <strong>Price Hidden:</strong> Customers will see <strong>"Price on Request"</strong> and order via WhatsApp inquiry.
                  </p>
                )}

                {formData.showPrice && formData.originalPrice && Number(formData.originalPrice) > Number(formData.price) && (
                  <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    Discount: {Math.round(((Number(formData.originalPrice) - Number(formData.price)) / Number(formData.originalPrice)) * 100)}% OFF
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">
                  Product Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Details of handcrafted contents, packaging, and personalization..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)] resize-none"
                />
              </div>

              {/* Options & Visibility Flags */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-[var(--border)]">
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg border border-[var(--border)] bg-[var(--bg)]/50">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-3.5 h-3.5 rounded text-[var(--olive)]"
                  />
                  <span className="text-[11px] font-semibold text-[var(--text)]">Published &amp; Live</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg border border-[var(--border)] bg-[var(--bg)]/50">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-3.5 h-3.5 rounded text-[var(--olive)]"
                  />
                  <span className="text-[11px] font-semibold text-[var(--text)]">Featured Product</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg border border-[var(--border)] bg-[var(--bg)]/50">
                  <input
                    type="checkbox"
                    checked={formData.customizable}
                    onChange={(e) => setFormData({ ...formData, customizable: e.target.checked })}
                    className="w-3.5 h-3.5 rounded text-[var(--olive)]"
                  />
                  <span className="text-[11px] font-semibold text-[var(--text)]">Allow Custom Note</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsNewProductModal(false)}
                  className="inline-flex items-center justify-center py-2 px-4 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--bg)] text-xs font-semibold text-[var(--text)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center py-2 px-5 rounded-lg bg-[var(--olive)] text-white text-xs font-bold hover:bg-[var(--olive-hover)] shadow-xs transition-colors cursor-pointer"
                >
                  {editingProduct ? 'Save Changes' : 'Publish Product'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
