import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBagShopping,
  faCheck,
  faWandMagicSparkles,
  faShieldHalved,
  faTruckFast,
  faGift,
  faCamera,
  faStar,
  faLocationDot,
  faPlus,
  faCheckCircle,
  faShareNodes,
  faHeart,
  faBoxOpen,
  faLeaf,
  faClock,
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { useProductStore } from '@/src/store/productStore';
import { useCartStore } from '@/src/store/cartStore';
import { useOrderStore } from '@/src/store/orderStore';
import { useSettingsStore } from '@/src/store/settingsStore';
import ProductCard from '@/src/components/ProductCard';
import { ProductDetailSkeleton } from '@/src/components/SkeletonLoader';

export default function ProductDetailPage(props) {
  const routerParams = useParams();
  const slug = props.params?.slug || routerParams?.slug;


  const router = useRouter();
  const { products, getProductBySlug, isLoading } = useProductStore();
  const addToCart = useCartStore((state) => state.addToCart);
  const { createOrder } = useOrderStore();
  const { settings, getWhatsAppUrl } = useSettingsStore();

  const product = getProductBySlug(slug) || products.find((p) => p.slug === slug || p.id === slug);

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState('inclusions');
  const [wishlisted, setWishlisted] = useState(false);
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null);

  // Customization fields
  const [recipientName, setRecipientName] = useState('');
  const [personalizedMessage, setPersonalizedMessage] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  if (!product) {
    if (isLoading) {
      return <ProductDetailSkeleton />;
    }
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center bg-[var(--bg)]">
        <FontAwesomeIcon icon={faGift} className="text-[var(--olive)] text-3xl mb-4" />
        <h2 className="font-heading text-2xl font-bold text-[var(--text)] mb-2">Product Not Found</h2>
        <p className="text-xs text-[var(--text-muted)] mb-6">The gift item you requested could not be located.</p>
        <Link href="/shop" className="gold-btn px-6 py-3 text-xs font-semibold">
          Explore All Gifts
        </Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.image || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80'];

  const isPriceShown = settings.showPricesGlobally !== false && product.showPrice !== false;
  const inquiryLabel = settings.priceInquiryLabel || 'Price on Request';

  const discountPercent = isPriceShown && product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const rating = product.rating || 4.9;
  const reviewCount = product.reviewsCount || 28;

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (pincode.trim().length >= 6) {
      setPincodeStatus({
        valid: true,
        message: `Express Delivery Available to ${pincode}! Dispatches in 24–48 hours. Live photo preview on WhatsApp before shipping.`,
      });
    } else {
      setPincodeStatus({
        valid: false,
        message: 'Please enter a valid 6-digit postal pincode.',
      });
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, {
      recipientName,
      personalizedMessage,
      specialInstructions,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  const handleWhatsAppOrder = async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    let customDetails = '';
    if (recipientName || personalizedMessage || specialInstructions) {
      customDetails = `\nCustomization for Order:\n• Recipient Name: ${recipientName || 'Not specified'}\n• Message: ${personalizedMessage || 'None'}\n• Instructions: ${specialInstructions || 'None'}`;
    }

    const priceDisplay = isPriceShown ? `₹${product.price}` : inquiryLabel;
    const totalDisplay = isPriceShown ? `₹${Number(product.price) * quantity}` : 'Quote on Request / Direct Confirmation';

    const newOrder = await createOrder({
      customerName: recipientName ? `Order for ${recipientName}` : 'Product Inquiry Patron',
      phone: '',
      whatsappNumber: '',
      address: pincode ? `Delivery to PIN: ${pincode}` : 'Direct Product WhatsApp Order',
      pincode: pincode || '',
      deliveryDate: 'Standard Delivery',
      occasion: 'Special Occasion',
      items: [{
        id: product.id,
        name: product.name,
        price: Number(product.price) || 0,
        quantity: quantity,
        image: images[0] || product.image,
        category: product.category,
        customization: {
          recipientName,
          personalizedMessage,
          specialInstructions,
        },
      }],
      subtotal: (Number(product.price) || 0) * quantity,
      total: (Number(product.price) || 0) * quantity,
      customization: personalizedMessage ? `Card Message: "${personalizedMessage}"` : (recipientName ? `Recipient: ${recipientName}` : ''),
      specialInstructions: specialInstructions || 'WhatsApp Product Order',
    });

    const message = `*${settings.orderMessagePrefix || 'Order Inquiry — LETTERS'}*
Order Reference: #${newOrder.id}

Item: ${product.name}
Category: ${product.category}
Quantity: ${quantity}
Price: ${priceDisplay}
Total: ${totalDisplay}
Product Link: ${origin}/product/${product.slug}${customDetails}

Hello LETTERS Concierge, please share the quote, personalization details, and delivery timeline for this item.`;

    window.open(getWhatsAppUrl(message), '_blank');
  };

  const relatedProducts = products
    .filter((p) => p.active && p.id !== product.id && (p.category === product.category || p.featured))
    .slice(0, 4);

  return (
    <div className="min-h-screen pt-8 pb-28 px-4 sm:px-6 lg:px-12 bg-[var(--bg)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-8 overflow-x-auto whitespace-nowrap pb-1">
          <Link href="/" className="hover:text-[var(--text)] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[var(--text)] transition-colors">Shop</Link>
          <span>/</span>
          <Link href={`/category/${product.categorySlug || 'hampers'}`} className="hover:text-[var(--text)] transition-colors">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-[var(--text)] font-semibold truncate max-w-xs">{product.name}</span>
        </div>

        {/* Product Main Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start mb-20">
          
          {/* Left Column: Product Gallery */}
          <div className="lg:col-span-6 space-y-4 sticky top-28">
            <div className="relative aspect-square bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-xs group">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-500"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                {discountPercent > 0 && (
                  <span className="text-xs font-bold bg-[var(--maroon)] text-white px-3 py-1 rounded-full shadow-xs tracking-wider">
                    {discountPercent}% OFF
                  </span>
                )}
                {product.tag && (
                  <span className="text-[11px] font-semibold bg-white/95 backdrop-blur-md text-[var(--text)] px-3 py-1 rounded-full border border-[var(--border)] shadow-xs capitalize">
                    {product.tag.toLowerCase()}
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => setWishlisted(!wishlisted)}
                className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs ${
                  wishlisted ? 'bg-white text-[var(--maroon)]' : 'bg-white/85 backdrop-blur-md text-[var(--text-muted)] hover:text-[var(--maroon)]'
                }`}
              >
                <FontAwesomeIcon icon={wishlisted ? faHeart : faHeartRegular} className="text-sm" />
              </button>

              {/* Handcrafted ribbon */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[var(--border)] flex items-center justify-between text-xs text-[var(--text)] pointer-events-none shadow-xs">
                <span className="flex items-center gap-1.5 font-medium">
                  <FontAwesomeIcon icon={faCamera} className="text-[var(--olive)] text-xs" />
                  Live photo sent on WhatsApp before dispatch
                </span>
                <span className="text-[10px] text-[var(--olive)] font-bold uppercase tracking-wider">Studio Verified</span>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-xl border-2 transition-all flex-shrink-0 cursor-pointer overflow-hidden ${
                      selectedImage === idx
                        ? 'border-[var(--olive)] shadow-sm'
                        : 'border-[var(--border)] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Details & Purchase Studio */}
          <div className="lg:col-span-6 flex flex-col justify-start space-y-6">
            
            {/* Category, Rating & Title */}
            <div>
              <div className="flex items-center justify-between gap-4 mb-2">
                <span
                  className="text-[var(--chandanam)]"
                  style={{ fontFamily: "'Great Vibes', cursive", fontSize: '24px' }}
                >
                  {product.category}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-[var(--chandanam-dark)] font-bold bg-[var(--chandanam-soft)] px-2.5 py-1 rounded-full border border-[var(--chandanam)]/20">
                  <FontAwesomeIcon icon={faStar} className="text-[10px] text-[var(--chandanam)]" />
                  <span>{rating}</span>
                  <span className="text-[var(--text-muted)] font-normal">({reviewCount} verified reviews)</span>
                </div>
              </div>

              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--text)] leading-tight mb-3">
                {product.name}
              </h1>

              {/* Pricing */}
              <div className="flex flex-wrap items-baseline gap-3 pb-4 border-b border-[var(--border)]">
                {isPriceShown ? (
                  <>
                    <span className="font-heading text-3xl font-bold text-[var(--text)]">
                      ₹{product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-base text-[var(--text-muted)] line-through">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                    {discountPercent > 0 && (
                      <span className="text-xs font-bold text-[var(--olive)] bg-[var(--olive)]/10 px-2 py-0.5 rounded">
                        You save ₹{(product.originalPrice - product.price).toLocaleString()} ({discountPercent}%)
                      </span>
                    )}
                    <span className="w-full text-[11px] text-[var(--text-muted)]">
                      Inclusive of all taxes & complimentary handwritten keepsake card.
                    </span>
                  </>
                ) : (
                  <div className="w-full space-y-1">
                    <span className="text-xl sm:text-2xl font-bold text-[var(--olive)]">
                      {inquiryLabel}
                    </span>
                    <p className="text-xs text-[var(--text-muted)]">
                      Contact our concierge directly via WhatsApp for bespoke pricing and customization.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Short Highlights */}
            <div className="text-xs text-[var(--text-muted)] leading-relaxed font-normal">
              <p>{product.description}</p>
            </div>

            {/* Delivery Pincode Checker */}
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-4 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <FontAwesomeIcon icon={faLocationDot} className="text-xs text-[var(--olive)]" />
                <span className="text-xs font-bold text-[var(--text)]">Check Delivery Date & Speed</span>
              </div>
              <form onSubmit={handlePincodeCheck} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit Pincode (e.g. 682001)"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  className="input-warm text-xs py-2 flex-1"
                />
                <button
                  type="submit"
                  className="gold-btn px-4 py-2 text-xs font-semibold whitespace-nowrap cursor-pointer"
                >
                  Check Speed
                </button>
              </form>
              {pincodeStatus && (
                <div
                  className={`mt-2.5 text-[11px] p-2.5 rounded-lg flex items-start gap-2 ${
                    pincodeStatus.valid
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  <FontAwesomeIcon icon={faCheckCircle} className="text-xs mt-0.5 flex-shrink-0" />
                  <span>{pincodeStatus.message}</span>
                </div>
              )}
            </div>

            {/* Customization Section */}
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faWandMagicSparkles} className="text-[var(--chandanam)] text-xs" />
                  <span className="text-xs font-bold text-[var(--text)]">Bespoke Customization Studio</span>
                </div>
                <span className="text-[10px] text-[var(--olive)] bg-[var(--olive)]/10 px-2 py-0.5 rounded font-semibold">
                  Complimentary
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                  Recipient Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sarah / Dr. Menon & Family"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="input-warm text-xs py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                  Complimentary Handwritten Keepsake Message Card
                </label>
                <textarea
                  rows={2}
                  placeholder="Write your heart's message. We will hand-write it on our gold-embossed textured parchment card..."
                  value={personalizedMessage}
                  onChange={(e) => setPersonalizedMessage(e.target.value)}
                  className="input-warm text-xs py-2 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                  Special Notes / Delivery Date Preference
                </label>
                <input
                  type="text"
                  placeholder="e.g. Please deliver on Aug 24th, strictly eggless chocolates"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="input-warm text-xs py-2"
                />
              </div>
            </div>

            {/* Quantity Selector & CTAs */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-[var(--text-muted)]">Quantity:</span>
                  <div className="flex items-center rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-2xs">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-9 h-9 flex items-center justify-center text-xs font-bold hover:bg-[var(--bg-subtle)] text-[var(--text)] transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-9 text-center text-xs font-bold text-[var(--text)]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-9 h-9 flex items-center justify-center text-xs font-bold hover:bg-[var(--bg-subtle)] text-[var(--text)] transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-[var(--text-muted)] block">
                    {isPriceShown ? 'Subtotal' : 'Pricing Status'}
                  </span>
                  <span className="font-heading text-lg font-bold text-[var(--text)]">
                    {isPriceShown
                      ? `₹${(product.price * quantity).toLocaleString()}`
                      : inquiryLabel}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  className={`flex items-center justify-center gap-2 py-4 px-6 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-sm ${
                    added ? 'bg-emerald-700 text-white' : 'gold-btn'
                  }`}
                >
                  {added ? (
                    <>
                      <FontAwesomeIcon icon={faCheck} className="text-xs" /> Added to Your Bag
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faBagShopping} className="text-xs" /> Add to Cart
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  className="secondary-pill-btn flex items-center justify-center gap-2 py-4 px-6 text-xs font-semibold cursor-pointer shadow-2xs"
                >
                  Instant Buy Now
                </button>
              </div>

              {/* WhatsApp Order Button */}
              <button
                onClick={handleWhatsAppOrder}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-full text-xs font-semibold bg-[#25D366] text-white hover:bg-[#1EBE5D] transition-colors cursor-pointer shadow-sm"
              >
                <FontAwesomeIcon icon={faWhatsapp} className="text-base" />
                Concierge Order via WhatsApp
              </button>
            </div>

            {/* E-Commerce Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4">
              <div className="bg-[var(--card)] p-3 rounded-xl border border-[var(--border)] text-center shadow-2xs">
                <FontAwesomeIcon icon={faCamera} className="mx-auto text-[var(--olive)] mb-1 text-sm block" />
                <p className="text-[10.5px] font-bold text-[var(--text)]">Live Preview</p>
                <p className="text-[9px] text-[var(--text-muted)]">On WhatsApp</p>
              </div>
              <div className="bg-[var(--card)] p-3 rounded-xl border border-[var(--border)] text-center shadow-2xs">
                <FontAwesomeIcon icon={faGift} className="mx-auto text-[var(--chandanam)] mb-1 text-sm block" />
                <p className="text-[10.5px] font-bold text-[var(--text)]">Luxe Trunk</p>
                <p className="text-[9px] text-[var(--text-muted)]">Satin Ribbons</p>
              </div>
              <div className="bg-[var(--card)] p-3 rounded-xl border border-[var(--border)] text-center shadow-2xs">
                <FontAwesomeIcon icon={faTruckFast} className="mx-auto text-[var(--maroon)] mb-1 text-sm block" />
                <p className="text-[10.5px] font-bold text-[var(--text)]">Safe Express</p>
                <p className="text-[9px] text-[var(--text-muted)]">Pan-India Transit</p>
              </div>
              <div className="bg-[var(--card)] p-3 rounded-xl border border-[var(--border)] text-center shadow-2xs">
                <FontAwesomeIcon icon={faShieldHalved} className="mx-auto text-[var(--olive)] mb-1 text-sm block" />
                <p className="text-[10.5px] font-bold text-[var(--text)]">Guaranteed</p>
                <p className="text-[9px] text-[var(--text-muted)]">100% Quality</p>
              </div>
            </div>

          </div>

        </div>

        {/* Tabbed In-Depth Information Section */}
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 sm:p-10 mb-20 shadow-xs">
          
          <div className="flex border-b border-[var(--border)] overflow-x-auto gap-4 sm:gap-8 mb-8 pb-1 scrollbar-none">
            {[
              { id: 'inclusions', label: "Hamper Inclusions & Details", icon: faBoxOpen },
              { id: 'care', label: 'Care & Storage Guide', icon: faLeaf },
              { id: 'delivery', label: 'Shipping Timelines', icon: faTruckFast },
              { id: 'reviews', label: `Patron Reviews (${reviewCount})`, icon: faStar },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[var(--olive)] text-[var(--olive)]'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} className="text-xs" />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'inclusions' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-[var(--text-muted)] leading-relaxed">
              <div className="space-y-3">
                <h4 className="font-heading text-sm font-bold text-[var(--text)]">What Makes This Curation Special:</h4>
                <p>
                  Every element in the <strong>{product.name}</strong> is hand-picked and tested for exceptional presentation, aroma, and taste. Hand-assembled at our atelier in Kerala, each unit is carefully sealed in protective cushioning before being placed inside our signature keepsake box.
                </p>
                <ul className="space-y-2 pt-2 text-[var(--text)]">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--olive)]" />
                    Signature handcrafted keepsake trunk packaging
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--olive)]" />
                    Complimentary textured gold-foil greeting card
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--olive)]" />
                    Bespoke velvet and satin ribbon embellishments
                  </li>
                </ul>
              </div>

              <div className="bg-[var(--bg-subtle)] p-5 rounded-xl border border-[var(--border)] space-y-3">
                <h4 className="font-heading text-sm font-bold text-[var(--text)]">Artisan Guarantee</h4>
                <p>
                  We believe gifting should be stress-free. If any item is damaged during transit, our team will immediately replace or refund without dispute upon sharing a photo within 24 hours of delivery.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'care' && (
            <div className="text-xs text-[var(--text-muted)] space-y-3 leading-relaxed max-w-2xl">
              <h4 className="font-heading text-sm font-bold text-[var(--text)]">Storage & Freshness Advice</h4>
              <p>• <strong>Artisan Chocolates & Confections:</strong> Store in a cool, dry place away from direct sunlight (16°C – 20°C). Avoid prolonged refrigeration to prevent moisture condensation.</p>
              <p>• <strong>Preserved Florals & Bouquets:</strong> Do not water. Keep in a dry ambient room away from direct humidity for maximum longevity of 1–3 years.</p>
              <p>• <strong>Ajwa Dates & Dry Fruits:</strong> Airtight sealed jars ensure freshness up to 6 months.</p>
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-[var(--text-muted)]">
              <div className="bg-[var(--bg-subtle)] p-4 rounded-xl border border-[var(--border)]">
                <span className="font-bold text-[var(--text)] block mb-1">Standard Dispatch</span>
                <p>Handcrafted & dispatched within 24–48 hours from our Kerala atelier.</p>
              </div>
              <div className="bg-[var(--bg-subtle)] p-4 rounded-xl border border-[var(--border)]">
                <span className="font-bold text-[var(--text)] block mb-1">Transit Duration</span>
                <p>South India: 2–3 business days. Rest of India: 3–5 business days via Bluedart/Delhivery.</p>
              </div>
              <div className="bg-[var(--bg-subtle)] p-4 rounded-xl border border-[var(--border)]">
                <span className="font-bold text-[var(--text)] block mb-1">WhatsApp Photo Alert</span>
                <p>High-definition photo preview sent directly to your WhatsApp before sealing the parcel.</p>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border)]">
                <span className="font-heading text-3xl font-bold text-[var(--text)]">{rating}</span>
                <div>
                  <div className="flex text-[var(--chandanam)] text-xs mb-0.5">
                    {'★★★★★'}
                  </div>
                  <span className="text-xs text-[var(--text-muted)]">Based on {reviewCount} verified patron reviews</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Dr. Ananya S.', city: 'Bengaluru', comment: 'The hamper was even more gorgeous in person than on the photo! The personalized card calligraphy was breathtaking.', date: '3 days ago' },
                  { name: 'Faisal & Maryam', city: 'Kochi', comment: 'Ordered for our engagement celebration. Sending the WhatsApp photo preview before dispatch gave us complete peace of mind. Highly recommended!', date: '1 week ago' },
                ].map((rev, i) => (
                  <div key={i} className="bg-[var(--card)] p-4 rounded-xl border border-[var(--border)] text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[var(--text)]">{rev.name} ({rev.city})</span>
                      <span className="text-[10px] text-[var(--text-muted)]">{rev.date}</span>
                    </div>
                    <div className="text-[var(--chandanam)] text-[10px]">{'★★★★★'}</div>
                    <p className="text-[var(--text-muted)] leading-relaxed">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Related Gifts */}
        {relatedProducts.length > 0 && (
          <div className="pt-8 border-t border-[var(--border)]">
            <div className="mb-8">
              <span
                className="block mb-1 text-[var(--chandanam)]"
                style={{ fontFamily: "'Great Vibes', cursive", fontSize: '24px' }}
              >
                Recommended Curations
              </span>
              <h2 className="font-heading text-2xl font-bold text-[var(--text)]">
                You May Also Cherish
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

