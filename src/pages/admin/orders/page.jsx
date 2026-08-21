'use client';

import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faFilter,
  faEye,
  faTrashCan,
  faXmark,
  faLocationDot,
  faUser,
  faBagShopping,
  faWandMagicSparkles,
  faClock,
  faCircleCheck,
  faTruck,
  faCopy,
  faCheck,
  faCalendarDays,
  faIndianRupeeSign,
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { useOrderStore } from '@/src/store/orderStore';
import { useSettingsStore } from '@/src/store/settingsStore';

const statusList = ['All', 'Pending', 'Confirmed', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus, deleteOrder } = useOrderStore();
  const { settings } = useSettingsStore();

  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeOrderModal, setActiveOrderModal] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Status counts
  const statusCounts = useMemo(() => {
    const counts = { All: orders.length };
    statusList.forEach((st) => {
      if (st !== 'All') {
        counts[st] = orders.filter((o) => o.status === st).length;
      }
    });
    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (selectedStatus !== 'All' && order.status !== selectedStatus) {
        return false;
      }
      // Search filter (Order ID, customer name, phone, address, pincode)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = (order.id || '').toLowerCase().includes(q);
        const matchesName = (order.customerName || '').toLowerCase().includes(q);
        const matchesPhone = (order.phone || '').toLowerCase().includes(q);
        const matchesAddress = (order.address || '').toLowerCase().includes(q);
        if (!matchesId && !matchesName && !matchesPhone && !matchesAddress) return false;
      }
      return true;
    });
  }, [orders, selectedStatus, searchQuery]);

  const getStatusBadgeClass = (status) => {
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
    const message = `Hello ${order.customerName}, this is ${settings.brandName || 'Letters'} regarding your Order #${order.id}. Current Status: ${order.status}.`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${rawNumber}?text=${encoded}`, '_blank');
  };

  const handleCopyOrderId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteOrder = (orderId) => {
    if (window.confirm(`Are you sure you want to delete order ${orderId}?`)) {
      deleteOrder(orderId);
      if (activeOrderModal?.id === orderId) {
        setActiveOrderModal(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)]">Orders Management</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Review, update statuses, and coordinate WhatsApp fulfillment for incoming customer orders ({orders.length} total).
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 shadow-xs space-y-3.5">
        
        {/* Top Filter Row: Search and Quick Stats */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          {/* Search Input */}
          <div className="w-full sm:flex-1 relative">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs" />
            <input
              type="text"
              placeholder="Search by Order ID, Customer Name, Phone, or City..."
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
        </div>

        {/* Status Filter Tabs with Real-Time Counts */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-[var(--border)]/60">
          {statusList.map((st) => {
            const count = statusCounts[st] || 0;
            const isSelected = selectedStatus === st;

            return (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--olive)] text-white shadow-xs'
                    : 'bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)]'
                }`}
              >
                <span>{st}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[var(--card)] text-[var(--text-muted)]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Data Table */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xs overflow-hidden">
        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[var(--bg)]/50 border-b border-[var(--border)] text-[var(--text-muted)] uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 font-bold">Order ID</th>
                  <th className="py-3 px-4 font-bold">Customer Details</th>
                  <th className="py-3 px-4 font-bold">Items</th>
                  <th className="py-3 px-4 font-bold">Total</th>
                  <th className="py-3 px-4 font-bold">Delivery Date</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/70">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[var(--bg)]/40 transition-colors">
                    
                    {/* Order ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-[var(--text)] whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>#{order.id}</span>
                        <button
                          onClick={() => handleCopyOrderId(order.id)}
                          className="text-[var(--text-muted)] hover:text-[var(--text)] p-0.5 cursor-pointer"
                          title="Copy Order ID"
                        >
                          <FontAwesomeIcon icon={copiedId === order.id ? faCheck : faCopy} className="text-[10px]" />
                        </button>
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)] block font-sans">
                        {new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[var(--olive)]/10 text-[var(--olive)] flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {(order.customerName || 'C')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-[var(--text)]">{order.customerName}</p>
                          <p className="text-[11px] text-[var(--text-muted)] font-mono">{order.phone}</p>
                        </div>
                      </div>
                    </td>

                    {/* Items */}
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <p className="font-medium text-[var(--text)] truncate text-[11px]">
                        {order.items?.map((i) => `${i.name} (×${i.quantity})`).join(', ') || 'Custom Hamper'}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)]">{order.items?.length || 1} distinct item(s)</p>
                    </td>

                    {/* Total */}
                    <td className="py-3.5 px-4 font-bold text-sm text-[var(--text)] whitespace-nowrap">
                      ₹{Number(order.total || 0).toLocaleString()}
                    </td>

                    {/* Delivery Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-[11px] text-[var(--text-muted)]">
                      {order.deliveryDate || 'Standard Delivery'}
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3.5 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-md cursor-pointer focus:outline-none ${getStatusBadgeClass(
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

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setActiveOrderModal(order)}
                          className="w-7 h-7 rounded-md border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--bg)] text-[var(--text)] flex items-center justify-center transition-colors cursor-pointer"
                          title="View Complete Order"
                        >
                          <FontAwesomeIcon icon={faEye} className="text-xs" />
                        </button>

                        <button
                          onClick={() => handleContactCustomer(order)}
                          className="w-7 h-7 rounded-md bg-[#25D366]/15 text-[#128C7E] dark:text-[#25D366] hover:bg-[#25D366] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                          title="Open WhatsApp Chat"
                        >
                          <FontAwesomeIcon icon={faWhatsapp} className="text-xs" />
                        </button>

                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="w-7 h-7 rounded-md border border-[var(--border)] bg-[var(--card)] hover:bg-rose-50 text-rose-600 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors cursor-pointer"
                          title="Delete Order"
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
            <FontAwesomeIcon icon={faBagShopping} className="mx-auto text-[var(--text-muted)] mb-3 text-3xl opacity-30 block" />
            <p className="text-sm font-semibold text-[var(--text)]">No matching orders</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Try selecting a different status filter or clearing your search term.</p>
          </div>
        )}
      </div>

      {/* Structured Order Details Modal */}
      {activeOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 sm:p-7 max-w-2xl w-full shadow-xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-[var(--olive)] bg-[var(--olive)]/10 px-2 py-0.5 rounded">
                    Order Invoice
                  </span>
                  <span className="text-xs font-mono font-bold text-[var(--text-muted)]">#{activeOrderModal.id}</span>
                </div>
                <h2 className="text-xl font-bold text-[var(--text)] mt-1">
                  Order Summary
                </h2>
              </div>
              <button
                onClick={() => setActiveOrderModal(null)}
                className="w-8 h-8 rounded-lg hover:bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] flex items-center justify-center cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} className="text-sm" />
              </button>
            </div>

            {/* Status Control Bar */}
            <div className="flex items-center justify-between bg-[var(--bg)] p-3.5 rounded-xl border border-[var(--border)]">
              <div>
                <p className="text-xs font-bold text-[var(--text)]">Current Status</p>
                <p className="text-[11px] text-[var(--text-muted)]">Placed: {new Date(activeOrderModal.createdAt).toLocaleString()}</p>
              </div>
              <select
                value={activeOrderModal.status}
                onChange={(e) => {
                  updateOrderStatus(activeOrderModal.id, e.target.value);
                  setActiveOrderModal({ ...activeOrderModal, status: e.target.value });
                }}
                className={`text-xs font-bold px-3 py-1.5 rounded-md border cursor-pointer ${getStatusBadgeClass(
                  activeOrderModal.status
                )}`}
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Preparing">Preparing</option>
                <option value="Ready">Ready</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Customer & Shipping Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[var(--bg)]/70 border border-[var(--border)] space-y-1.5">
                <h4 className="font-bold text-[var(--text)] uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faUser} className="text-[var(--olive)]" /> Customer Info
                </h4>
                <p><span className="text-[var(--text-muted)]">Name:</span> <strong>{activeOrderModal.customerName}</strong></p>
                <p><span className="text-[var(--text-muted)]">Mobile:</span> <strong>{activeOrderModal.phone}</strong></p>
                <p><span className="text-[var(--text-muted)]">WhatsApp:</span> <strong>{activeOrderModal.whatsappNumber || activeOrderModal.phone}</strong></p>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--bg)]/70 border border-[var(--border)] space-y-1.5">
                <h4 className="font-bold text-[var(--text)] uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faLocationDot} className="text-[var(--olive)]" /> Delivery & Occasion
                </h4>
                <p><span className="text-[var(--text-muted)]">Address:</span> <strong>{activeOrderModal.address || 'N/A'}</strong></p>
                <p><span className="text-[var(--text-muted)]">Pincode:</span> <strong>{activeOrderModal.pincode || 'N/A'}</strong></p>
                <p><span className="text-[var(--text-muted)]">Delivery Date:</span> <strong>{activeOrderModal.deliveryDate || 'Standard'}</strong></p>
                <p><span className="text-[var(--text-muted)]">Occasion:</span> <strong>{activeOrderModal.occasion || 'General'}</strong></p>
              </div>
            </div>

            {/* Items Ordered List */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border)] pb-1.5">
                Line Items
              </h4>
              <div className="space-y-2">
                {activeOrderModal.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-[var(--bg)]/60 border border-[var(--border)] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <img src={item.image} alt="" className="w-9 h-9 rounded-md object-cover border border-[var(--border)]" />
                      )}
                      <div>
                        <p className="font-bold text-[var(--text)]">{item.name}</p>
                        <p className="text-[11px] text-[var(--text-muted)]">
                          ₹{item.price} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-xs text-[var(--text)]">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total Row */}
              <div className="flex justify-between items-center pt-2 border-t border-[var(--border)] font-bold text-sm text-[var(--text)]">
                <span>Grand Total:</span>
                <span className="text-lg text-[var(--olive)]">
                  ₹{Number(activeOrderModal.total || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Customization Details & Special Instructions */}
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-lg bg-[var(--bg)]/60 border border-[var(--border)]">
                <p className="font-bold text-[var(--text)] uppercase text-[10px] mb-1 flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faWandMagicSparkles} className="text-[var(--olive)]" /> Customization & Greeting Card
                </p>
                <p className="text-[var(--text-muted)] whitespace-pre-line leading-relaxed text-[11px]">
                  {activeOrderModal.customization || 'None requested'}
                </p>
              </div>

              {activeOrderModal.specialInstructions && (
                <div className="p-3 rounded-lg bg-[var(--bg)]/60 border border-[var(--border)]">
                  <p className="font-bold text-[var(--text)] uppercase text-[10px] mb-1">Special Instructions</p>
                  <p className="text-[var(--text-muted)] text-[11px]">
                    {activeOrderModal.specialInstructions}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons in Modal */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
              <button
                onClick={() => handleContactCustomer(activeOrderModal)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-bold bg-[#25D366] text-white hover:bg-[#1EBE5D] shadow-xs transition-colors cursor-pointer"
              >
                <FontAwesomeIcon icon={faWhatsapp} className="text-sm" />
                <span>Contact via WhatsApp</span>
              </button>

              <button
                onClick={() => setActiveOrderModal(null)}
                className="w-full sm:w-auto inline-flex items-center justify-center py-2.5 px-4 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--bg)] text-xs font-semibold text-[var(--text)] cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
