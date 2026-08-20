import React, { useState, useEffect, useRef } from 'react';
import { Product, HppBreakdown } from '../types';
import { formatRupiah } from '../utils/calculator';
import { processAndCompressImage } from '../utils/imageHelper';
import {
  X,
  Save,
  Package,
  Upload,
  Image as ImageIcon,
  Trash2,
  Link as LinkIcon,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  initialProduct?: Product | null;
}

const CATEGORIES = [
  'Kurma Ajwa',
  'Kurma Sukari',
  'Kurma Medjool',
  'Kurma Deglet Noor',
  'Kurma Ruthob',
  'Kurma Khalas',
  'Kurma Safawi',
  'Olahan Kurma',
  'Paket Hampers',
  'Lainnya'
];

const PRESET_IMAGES: { name: string; url: string }[] = [
  {
    name: 'Kurma Ajwa Madinah',
    url: 'https://images.unsplash.com/photo-1596797882870-8c33deeac224?w=400&q=80&auto=format&fit=crop'
  },
  {
    name: 'Kurma Sukari Soft Dates',
    url: 'https://images.unsplash.com/photo-1577906096429-f73c2c312435?w=400&q=80&auto=format&fit=crop'
  },
  {
    name: 'Kurma Medjool Jumbo',
    url: 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=400&q=80&auto=format&fit=crop'
  },
  {
    name: 'Kurma Deglet Noor Tangkai',
    url: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=400&q=80&auto=format&fit=crop'
  },
  {
    name: 'Kurma Ruthob Rayan Frozen',
    url: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400&q=80&auto=format&fit=crop'
  },
  {
    name: 'Kurma Khalas Vacuum Pack',
    url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80&auto=format&fit=crop'
  },
  {
    name: 'Paket Hampers Berkah Gift',
    url: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&q=80&auto=format&fit=crop'
  }
];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProduct
}) => {
  const [sku, setSku] = useState('');
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Kurma Ajwa');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [stock, setStock] = useState(100);
  const [expiryDate, setExpiryDate] = useState('2027-01-01');
  const [normalPrice, setNormalPrice] = useState(100000);
  const [targetProfit, setTargetProfit] = useState(20000);
  const [targetMargin, setTargetMargin] = useState(0.20);
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // HPP Breakdown state
  const [rawCost, setRawCost] = useState(35000);
  const [packagingCost, setPackagingCost] = useState(4000);
  const [shippingInCost, setShippingInCost] = useState(2000);
  const [overheadCost, setOverheadCost] = useState(2000);

  // Upload handling states
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialProduct) {
      setSku(initialProduct.sku);
      setProductName(initialProduct.product_name);
      setCategory(initialProduct.category || 'Kurma Ajwa');
      setImageUrl(initialProduct.image_url || '');
      setStock(initialProduct.stock || 0);
      setExpiryDate(initialProduct.expiry_date || '');
      setNormalPrice(initialProduct.normal_price || 0);
      setTargetProfit(initialProduct.target_profit || 0);
      setTargetMargin(initialProduct.target_margin || 0.20);
      setStatus(initialProduct.status || 'ACTIVE');

      if (initialProduct.hppBreakdown) {
        setRawCost(initialProduct.hppBreakdown.rawCost || 0);
        setPackagingCost(initialProduct.hppBreakdown.packagingCost || 0);
        setShippingInCost(initialProduct.hppBreakdown.shippingInCost || 0);
        setOverheadCost(initialProduct.hppBreakdown.overheadCost || 0);
      } else {
        setRawCost(initialProduct.total_hpp || 0);
        setPackagingCost(0);
        setShippingInCost(0);
        setOverheadCost(0);
      }
    } else {
      // Reset form
      setSku(`KRM-${Math.floor(100 + Math.random() * 900)}`);
      setProductName('');
      setCategory('Kurma Ajwa');
      setImageUrl('https://images.unsplash.com/photo-1596797882870-8c33deeac224?w=400&q=80&auto=format&fit=crop');
      setStock(100);
      setExpiryDate('2027-06-01');
      setNormalPrice(100000);
      setTargetProfit(20000);
      setTargetMargin(0.20);
      setStatus('ACTIVE');
      setRawCost(40000);
      setPackagingCost(5000);
      setShippingInCost(2500);
      setOverheadCost(2500);
    }
    setShowUrlInput(false);
    setCustomUrlInput('');
  }, [initialProduct, isOpen]);

  if (!isOpen) return null;

  const totalHppComputed = rawCost + packagingCost + shippingInCost + overheadCost;

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar yang valid (JPG, PNG, WEBP).');
      return;
    }

    try {
      setIsUploading(true);
      const compressedBase64 = await processAndCompressImage(file, 600, 600, 0.82);
      setImageUrl(compressedBase64);
    } catch (err) {
      console.error('Error processing image:', err);
      alert('Gagal memproses gambar. Silakan coba file lain.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleApplyCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    setImageUrl(customUrlInput.trim());
    setShowUrlInput(false);
    setCustomUrlInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim() || !productName.trim()) return;

    const hppBreakdown: HppBreakdown = {
      rawCost,
      packagingCost,
      shippingInCost,
      overheadCost
    };

    const product: Product = {
      id: initialProduct ? initialProduct.id : `p_${Date.now()}`,
      sku: sku.trim().toUpperCase(),
      product_name: productName.trim(),
      category,
      image_url: imageUrl.trim() ? imageUrl.trim() : '',
      hppBreakdown,
      total_hpp: totalHppComputed,
      normal_price: Number(normalPrice) || 0,
      stock: Number(stock) || 0,
      expiry_date: expiryDate || '',
      target_profit: Number(targetProfit) || 0,
      target_margin: Number(targetMargin) || 0,
      status,
      created_at: initialProduct?.created_at || new Date().toISOString()
    };

    onSave(product);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 px-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-50 rounded-2xl text-[#EE4D2D]">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base sm:text-lg">
                {initialProduct ? 'Edit Master Produk Kurma' : 'Tambah Produk Kurma Baru'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Lengkapi foto produk, nomor SKU, harga, stok, dan komponen HPP modal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* SECTION 1: FOTO PRODUK (UPLOAD & PRESET) */}
          <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#EE4D2D]" />
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Foto Produk Kurma
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="text-[11px] font-bold text-slate-600 hover:text-[#EE4D2D] transition-colors flex items-center gap-1"
                >
                  <LinkIcon className="w-3 h-3" />
                  {showUrlInput ? 'Tutup Input Link' : 'Gunakan Link URL'}
                </button>
              </div>
            </div>

            {/* URL input field toggle */}
            {showUrlInput && (
              <div className="flex gap-2 animate-fadeIn">
                <input
                  type="url"
                  placeholder="https://contoh.com/foto-kurma.jpg"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-[#EE4D2D] outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCustomUrl}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Pasang URL
                </button>
              </div>
            )}

            {/* Upload Area & Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              {/* Photo Preview Box */}
              <div className="sm:col-span-4 flex flex-col items-center justify-center">
                <div className="relative w-36 h-36 rounded-2xl bg-white border-2 border-slate-200 shadow-sm overflow-hidden flex items-center justify-center group">
                  {imageUrl ? (
                    <>
                      <img
                        src={imageUrl}
                        alt="Preview Produk"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600/90 text-white hover:bg-rose-700 shadow-md transition-colors opacity-90 hover:opacity-100"
                        title="Hapus Foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-3 text-slate-400 flex flex-col items-center">
                      <ImageIcon className="w-8 h-8 mb-1 text-slate-300" />
                      <span className="text-[10px] font-bold">Belum Ada Foto</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Dropzone */}
              <div className="sm:col-span-8 space-y-3">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-[#EE4D2D] bg-orange-50/80 scale-[0.99]'
                      : 'border-slate-300 hover:border-[#EE4D2D] hover:bg-white bg-slate-100/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-9 h-9 rounded-full bg-orange-100 text-[#EE4D2D] flex items-center justify-center">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-slate-800 block">
                        {isUploading ? 'Sedang Mengunggah & Mengompres...' : 'Klik atau Tarik Foto ke Sini'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Mendukung format JPG, PNG, WEBP (Dikompres optimal & tersimpan di database Firestore)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Presets for Kurma */}
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block mb-1.5 uppercase tracking-wider">
                    Atau Pilih Contoh Foto Kurma:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImageUrl(preset.url)}
                        className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold transition-colors ${
                          imageUrl === preset.url
                            ? 'bg-[#EE4D2D] text-white border-[#EE4D2D]'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-[#EE4D2D] hover:text-[#EE4D2D]'
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: IDENTITAS PRODUK */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nomor SKU</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold uppercase text-slate-900 focus:outline-none focus:border-[#EE4D2D] focus:bg-white"
                placeholder="KRM-01"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Kurma</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#EE4D2D] focus:bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nama Produk Kurma Lengkap</label>
            <input
              type="text"
              required
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#EE4D2D] focus:bg-white"
              placeholder="Contoh: Kurma Ajwa Al-Madinah Premium 500g (Kurma Nabi Original)"
            />
          </div>

          {/* SECTION 3: HARGA, STOK & EXPIRY */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Harga Normal / Coret (Rp)</label>
              <input
                type="number"
                required
                value={normalPrice}
                onChange={(e) => setNormalPrice(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black text-slate-900 focus:outline-none focus:border-[#EE4D2D] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Jumlah Stok (Unit)</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black text-slate-900 focus:outline-none focus:border-[#EE4D2D] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Expired</label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#EE4D2D] focus:bg-white"
              />
            </div>
          </div>

          {/* SECTION 4: RINCIAN HPP MODAL */}
          <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                Rincian Komponen HPP Modal Produk
              </h4>
              <span className="text-sm font-black text-[#EE4D2D]">
                Total HPP: {formatRupiah(totalHppComputed)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Bahan Kurma Murni (Rp)
                </label>
                <input
                  type="number"
                  value={rawCost}
                  onChange={(e) => setRawCost(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#EE4D2D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Kemasan (Box/Dus/Pouch/Label) (Rp)
                </label>
                <input
                  type="number"
                  value={packagingCost}
                  onChange={(e) => setPackagingCost(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#EE4D2D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Ongkir Masuk & Handling (Rp)
                </label>
                <input
                  type="number"
                  value={shippingInCost}
                  onChange={(e) => setShippingInCost(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#EE4D2D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Overhead & Tenaga Kerja (Rp)
                </label>
                <input
                  type="number"
                  value={overheadCost}
                  onChange={(e) => setOverheadCost(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#EE4D2D]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: TARGET & STATUS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Untung (Rp)</label>
              <input
                type="number"
                value={targetProfit}
                onChange={(e) => setTargetProfit(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#EE4D2D]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Margin (%)</label>
              <input
                type="number"
                step="0.01"
                value={targetMargin * 100}
                onChange={(e) => setTargetMargin(Number(e.target.value) / 100)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#EE4D2D]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status Master</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-[#EE4D2D]"
              >
                <option value="ACTIVE">AKTIF</option>
                <option value="INACTIVE">NONAKTIF</option>
              </select>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#EE4D2D] to-orange-500 text-white font-bold text-xs hover:from-orange-600 hover:to-orange-500 transition-all flex items-center gap-2 shadow-md shadow-[#EE4D2D]/20 active:scale-95"
            >
              <Save className="w-4 h-4" />
              Simpan Master Produk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
