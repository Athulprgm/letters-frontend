import { useState, useMemo, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faPenToSquare,
  faTrashCan,
  faEye,
  faEyeSlash,
  faXmark,
  faRotate,
  faLayerGroup,
  faLink,
  faUpload,
  faImage,
} from '@fortawesome/free-solid-svg-icons';
import { useCategoryStore } from '@/src/store/categoryStore';
import { confirmDialog } from '@/src/store/confirmStore';
import { compressImage } from '@/src/utils/imageCompressor';

export default function AdminCategoriesPage() {
  const { categories, fetchCategories, addCategory, updateCategory, deleteCategory, toggleCategoryStatus, resetCategories } = useCategoryStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const fileInputRef = useRef(null);

  const [selectedGroup, setSelectedGroup] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    group: 'Hampers',
    description: '',
    image: '',
    enabled: true,
  });

  const filteredCategories = useMemo(() => {
    if (selectedGroup === 'All') return categories;
    return categories.filter((c) => c.group === selectedGroup);
  }, [categories, selectedGroup]);

  const openAddModal = () => {
    setFormData({
      name: '',
      slug: '',
      group: 'Hampers',
      description: '',
      image: '',
      enabled: true,
    });
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setFormData({
      name: cat.name,
      slug: cat.slug,
      group: cat.group,
      description: cat.description || '',
      image: cat.image || '',
      enabled: cat.enabled !== false,
    });
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('Image file size must be under 15MB');
      return;
    }

    try {
      const compressed = await compressImage(file, 1000, 1000, 0.82);
      setFormData((prev) => ({ ...prev, image: compressed }));
    } catch (err) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setFormData((prev) => ({ ...prev, image: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (!formData.image) {
      alert('Please upload a cover image for this category.');
      return;
    }

    const slug =
      formData.slug.trim() ||
      formData.name
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');

    const payload = {
      name: formData.name.trim(),
      slug,
      group: formData.group,
      description: formData.description.trim(),
      image: formData.image,
      enabled: formData.enabled,
    };

    if (editingCategory) {
      await updateCategory(editingCategory.id, payload);
    } else {
      await addCategory(payload);
    }

    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleDelete = async (id, name) => {
    const isConfirmed = await confirmDialog({
      title: 'Delete Category',
      message: `Are you sure you want to delete category "${name}"? Products under this category might lose their grouping.`,
      confirmText: 'Delete Category',
      cancelText: 'Cancel',
      type: 'danger',
    });
    if (isConfirmed) {
      await deleteCategory(id);
    }
  };

  const handleResetDefaults = async () => {
    const isConfirmed = await confirmDialog({
      title: 'Reset Default Categories',
      message: 'Are you sure you want to restore the 12 default curated gift categories? Any custom categories will be reset.',
      confirmText: 'Reset Defaults',
      cancelText: 'Cancel',
      type: 'warning',
    });
    if (isConfirmed) {
      await resetCategories();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)]">Category Management</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Organize gifting categories across Hampers and Gifts &amp; Bouquets ({categories.length} total).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--bg)] text-xs font-semibold text-[var(--text)] shadow-xs transition-colors cursor-pointer"
            title="Reset to 12 Default Categories"
          >
            <FontAwesomeIcon icon={faRotate} className="text-[10px] text-[var(--text-muted)]" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[var(--olive)] text-white text-xs font-semibold hover:bg-[var(--olive-hover)] shadow-xs transition-colors cursor-pointer"
          >
            <FontAwesomeIcon icon={faPlus} className="text-xs" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 pb-1">
        {['All', 'Hampers', 'Gifts & Bouquets'].map((group) => {
          const isSelected = selectedGroup === group;
          const count = group === 'All' ? categories.length : categories.filter((c) => c.group === group).length;

          return (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-[var(--olive)] text-white shadow-xs'
                  : 'bg-[var(--card)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)]'
              }`}
            >
              <span>{group}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-[var(--bg)] text-[var(--text-muted)]'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Categories Data Table */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xs overflow-hidden">
        {filteredCategories.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[var(--bg)]/50 border-b border-[var(--border)] text-[var(--text-muted)] uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 font-bold">Category</th>
                  <th className="py-3 px-4 font-bold">Group</th>
                  <th className="py-3 px-4 font-bold">Description</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/70">
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[var(--bg)]/40 transition-colors">
                    
                    {/* Category Thumbnail & Title */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={cat.image || '/logo.png'}
                          alt={cat.name}
                          className="w-10 h-10 rounded-lg object-cover border border-[var(--border)] flex-shrink-0 bg-[var(--bg)]"
                          onError={(e) => { e.target.src = '/logo.png'; }}
                        />
                        <div>
                          <p className="font-bold text-[var(--text)] text-xs">{cat.name}</p>
                          <span className="text-[10px] text-[var(--text-muted)] sm:hidden">{cat.group}</span>
                        </div>
                      </div>
                    </td>

                    {/* Group */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-[var(--olive)]/10 text-[var(--olive)] px-2 py-0.5 rounded">
                        {cat.group}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="py-3 px-4 max-w-sm">
                      <p className="text-[11px] text-[var(--text-muted)] line-clamp-2">
                        {cat.description}
                      </p>
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleCategoryStatus(cat.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer border ${
                          cat.enabled
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-stone-500/10 text-stone-600 dark:text-stone-400 border-stone-500/20'
                        }`}
                      >
                        <FontAwesomeIcon icon={cat.enabled ? faEye : faEyeSlash} className="text-[10px]" />
                        <span>{cat.enabled ? 'Active' : 'Hidden'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="w-7 h-7 rounded-md border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--bg)] text-[var(--text)] flex items-center justify-center transition-colors cursor-pointer"
                          title="Edit Category"
                        >
                          <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="w-7 h-7 rounded-md border border-[var(--border)] bg-[var(--card)] hover:bg-rose-50 text-rose-600 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors cursor-pointer"
                          title="Delete Category"
                        >
                          <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 px-4">
            <FontAwesomeIcon icon={faLayerGroup} className="mx-auto text-[var(--text-muted)] mb-3 text-3xl opacity-30 block" />
            <p className="text-sm font-semibold text-[var(--text)]">No categories found</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Try changing group filter or click Reset Defaults.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-xl space-y-5 my-8">
            
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3.5">
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--olive)] bg-[var(--olive)]/10 px-2 py-0.5 rounded">
                  {editingCategory ? 'Update' : 'New Category'}
                </span>
                <h2 className="text-xl font-bold text-[var(--text)] mt-1">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] flex items-center justify-center cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} className="text-sm" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Category Image Upload Box */}
              <div>
                <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1.5">
                  Category Cover Image *
                </label>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row items-center gap-3.5 p-3.5 rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg)]/60">
                  {/* Thumbnail Preview */}
                  <div className="w-20 h-20 rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden flex items-center justify-center flex-shrink-0 shadow-xs">
                    {formData.image ? (
                      <img
                        src={formData.image}
                        alt="Category preview"
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
                        <span>{formData.image ? 'Change Image' : 'Upload Image'}</span>
                      </button>

                      {formData.image && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image: '' })}
                          className="px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-rose-50 text-rose-600 text-xs font-semibold cursor-pointer transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-[10.5px] text-[var(--text-muted)]">
                      Supports JPG, PNG, WEBP from your device (Max 5MB).
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">
                    Category Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wedding Hamper"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">
                    Group *
                  </label>
                  <select
                    value={formData.group}
                    onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)] cursor-pointer"
                  >
                    <option value="Hampers">Hampers</option>
                    <option value="Gifts & Bouquets">Gifts & Bouquets</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Short summary of this gifting category collection..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)] resize-none"
                />
              </div>

              <div className="pt-2 border-t border-[var(--border)]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="w-3.5 h-3.5 rounded text-[var(--olive)]"
                  />
                  <span className="font-semibold text-xs text-[var(--text)]">Enable / Display on Storefront</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="inline-flex items-center justify-center py-2 px-4 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--bg)] text-xs font-semibold text-[var(--text)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center py-2 px-5 rounded-lg bg-[var(--olive)] text-white text-xs font-bold hover:bg-[var(--olive-hover)] shadow-xs transition-colors cursor-pointer"
                >
                  Save Category
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
