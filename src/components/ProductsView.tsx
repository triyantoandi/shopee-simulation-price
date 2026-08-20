import React, { useState } from 'react';
import { Product } from '../types';
import { formatRupiah } from '../utils/calculator';
import { ProductModal } from './ProductModal';
import {
  Search,
  Plus,
  Filter,
  FileSpreadsheet,
  Trash2,
  Edit,
  Package,
  AlertTriangle,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  CheckCircle2,
  XCircle,
  Square,
  Image as ImageIcon,
  Eye,
  Maximize2,
  X
} from 'lucide-react';

interface ProductsViewProps {
  products: Product[];
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onBulkDeleteProducts?: (productIds: string[]) => void;
  onBulkUpdateStatus?: (productIds: string[], status: 'ACTIVE' | 'INACTIVE') => void;
  onImportProducts: (products: Product[]) => void;
  onNavigateToSimulator: (productId: string) => void;
  onToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  onSaveProduct,
  onDeleteProduct,
  onBulkDeleteProducts,
  onBulkUpdateStatus,
  onImportProducts,
  onNavigateToSimulator,
  onToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const pageSize = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [previewPhotoProduct, setPreviewPhotoProduct] = useState<Product | null>(null);
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    type: 'SINGLE' | 'BULK';
    targetId?: string;
    sku?: string;
    count?: number;
  }>({ isOpen: false, type: 'SINGLE' });

  function getExpiryInfo(expiryDate?: string) {
    if (!expiryDate) return { isExpiring: false, label: 'N/A', daysDiff: 999 };
    const exp = new Date(expiryDate);
    const now = new Date();
    const expZero = new Date(exp.getFullYear(), exp.getMonth(), exp.getDate()).getTime();
    const nowZero = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const daysDiff = Math.ceil((expZero - nowZero) / (1000 * 60 * 60 * 24));

    const isExpiring = daysDiff <= 90;

    let label = '';
    if (daysDiff < 0) {
      label = `Expired (${Math.abs(daysDiff)} hr lalu)`;
    } else if (daysDiff === 0) {
      label = 'Expired Hari Ini!';
    } else if (daysDiff <= 90) {
      label = `Exp: ${expiryDate} (${daysDiff} hr lagi)`;
    } else {
      const months = Math.floor(daysDiff / 30);
      label = `Exp: ${expiryDate} (${months} bln lagi)`;
    }

    return { isExpiring, label, daysDiff };
  }

  function isExpiringSoon(expiryDate?: string): boolean {
    return getExpiryInfo(expiryDate).isExpiring;
  }

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.product_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ALL' || p.category === selectedCategory;

    const matchesStatus =
      selectedStatus === 'ALL' ||
      (selectedStatus === 'ACTIVE' && p.status === 'ACTIVE') ||
      (selectedStatus === 'INACTIVE' && p.status === 'INACTIVE') ||
      (selectedStatus === 'EXPIRING' && isExpiringSoon(p.expiry_date));

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const isAllSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p) => selectedProductIds.includes(p.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedProductIds.length === 0) return;
    setDeleteConfirmState({
      isOpen: true,
      type: 'BULK',
      count: selectedProductIds.length
    });
  };

  const handleBulkStatusChange = (status: 'ACTIVE' | 'INACTIVE') => {
    if (selectedProductIds.length === 0) return;
    if (onBulkUpdateStatus) {
      onBulkUpdateStatus(selectedProductIds, status);
    } else {
      products.forEach((p) => {
        if (selectedProductIds.includes(p.id)) {
          onSaveProduct({ ...p, status });
        }
      });
      onToast(`Status ${selectedProductIds.length} produk diubah!`, 'success');
    }
    setSelectedProductIds([]);
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setIsModalOpen(true);
  };

  const handleSave = (product: Product) => {
    onSaveProduct(product);
    setIsModalOpen(false);
    onToast(
      editingProduct
        ? `SKU [${product.sku}] berhasil diperbarui`
        : `SKU Baru [${product.sku}] berhasil ditambahkan`,
      'success'
    );
  };

  const handleDelete = (id: string, sku: string) => {
    setDeleteConfirmState({
      isOpen: true,
      type: 'SINGLE',
      targetId: id,
      sku
    });
  };

  const executeDelete = () => {
    if (deleteConfirmState.type === 'BULK') {
      if (onBulkDeleteProducts) {
        onBulkDeleteProducts(selectedProductIds);
      } else {
        selectedProductIds.forEach((id) => onDeleteProduct(id));
        onToast(`${selectedProductIds.length} produk telah dihapus`, 'warning');
      }
      setSelectedProductIds([]);
    } else if (deleteConfirmState.type === 'SINGLE' && deleteConfirmState.targetId) {
      onDeleteProduct(deleteConfirmState.targetId);
      onToast(`SKU [${deleteConfirmState.sku || ''}] telah dihapus`, 'warning');
    }
    setDeleteConfirmState({ isOpen: false, type: 'SINGLE' });
  };

  const handleDownloadTemplateCSV = () => {
    const headers = [
      'SKU',
      'Nama Produk',
      'Kategori',
      'Foto Produk (URL)',
      'Bahan Kurma (Rp)',
      'Kemasan (Rp)',
      'Ongkir Masuk (Rp)',
      'Overhead (Rp)',
      'Total HPP (Rp)',
      'Harga Normal (Rp)',
      'Stok',
      'Tanggal Expired (YYYY-MM-DD)',
      'Target Untung (Rp)',
      'Target Margin (%)',
      'Status'
    ];
    const exampleRow = [
      'KRM-AJW-01',
      '"Kurma Ajwa Super Madinah 500g"',
      'Kurma Ajwa',
      '"https://images.unsplash.com/photo-1596797882870-8c33deeac224?w=400&q=80&auto=format&fit=crop"',
      '45000',
      '5000',
      '3000',
      '2000',
      '55000',
      '85000',
      '50',
      '2026-12-31',
      '15000',
      '20',
      'ACTIVE'
    ];

    const csvContent = '\uFEFF' + [headers.join(','), exampleRow.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Template_Import_Produk_Kurma.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onToast('Template CSV berhasil diunduh!', 'info');
  };

  const handleExportCSV = () => {
    if (products.length === 0) {
      onToast('Tidak ada produk untuk diexport', 'warning');
      return;
    }
    const headers = [
      'SKU',
      'Nama Produk',
      'Kategori',
      'Foto Produk (URL)',
      'Bahan Kurma (Rp)',
      'Kemasan (Rp)',
      'Ongkir Masuk (Rp)',
      'Overhead (Rp)',
      'Total HPP (Rp)',
      'Harga Normal (Rp)',
      'Stok',
      'Tanggal Expired (YYYY-MM-DD)',
      'Target Untung (Rp)',
      'Target Margin (%)',
      'Status'
    ];
    const rows = products.map((p) => [
      p.sku,
      `"${p.product_name.replace(/"/g, '""')}"`,
      p.category,
      p.image_url ? `"${p.image_url.replace(/"/g, '""')}"` : '""',
      p.hppBreakdown?.rawCost || 0,
      p.hppBreakdown?.packagingCost || 0,
      p.hppBreakdown?.shippingInCost || 0,
      p.hppBreakdown?.overheadCost || 0,
      p.total_hpp,
      p.normal_price,
      p.stock,
      p.expiry_date,
      p.target_profit || 10000,
      ((p.target_margin || 0.15) * 100).toFixed(0),
      p.status
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Master_Kurma_Shopee_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onToast('Master produk berhasil diexport ke CSV!', 'success');
  };

  const parseCSV = (text: string): string[][] => {
    const lines: string[][] = [];
    let currentRow: string[] = [];
    let currentVal = '';
    let inQuotes = false;

    const cleanText = text.replace(/^\uFEFF/, '');

    for (let i = 0; i < cleanText.length; i++) {
      const char = cleanText[i];
      const nextChar = cleanText[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentVal += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if ((char === ',' || char === ';') && !inQuotes) {
        currentRow.push(currentVal.trim());
        currentVal = '';
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        currentRow.push(currentVal.trim());
        if (currentRow.some((col) => col.length > 0)) {
          lines.push(currentRow);
        }
        currentRow = [];
        currentVal = '';
      } else {
        currentVal += char;
      }
    }

    if (currentVal.length > 0 || currentRow.length > 0) {
      currentRow.push(currentVal.trim());
      if (currentRow.some((col) => col.length > 0)) {
        lines.push(currentRow);
      }
    }

    return lines;
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const rows = parseCSV(text);

        if (rows.length < 2) {
          onToast('File CSV kosong atau tidak memiliki baris data.', 'error');
          return;
        }

        const headers = rows[0].map((h) => h.toLowerCase().trim());

        const findCol = (keywords: string[]) =>
          headers.findIndex((h) => keywords.some((k) => h.includes(k)));

        const idxSku = findCol(['sku']);
        const idxName = findCol(['nama', 'product', 'produk']);
        const idxCategory = findCol(['kategori', 'category']);
        const idxImage = findCol(['foto', 'image', 'gambar', 'url']);
        const idxRawCost = findCol(['bahan', 'raw']);
        const idxPkgCost = findCol(['kemasan', 'packaging', 'pack']);
        const idxShipCost = findCol(['ongkir', 'shipping']);
        const idxOverhead = findCol(['overhead', 'tenaga']);
        const idxTotalHpp = findCol(['total hpp', 'hpp']);
        const idxNormalPrice = findCol(['harga', 'normal', 'price']);
        const idxStock = findCol(['stok', 'stock']);
        const idxExpiry = findCol(['expired', 'kadaluarsa', 'exp']);
        const idxTargetProfit = findCol(['target untung', 'profit']);
        const idxTargetMargin = findCol(['target margin', 'margin']);
        const idxStatus = findCol(['status']);

        const importedProducts: Product[] = [];

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0) continue;

          const skuVal = idxSku !== -1 && row[idxSku] ? row[idxSku] : `SKU-${Date.now()}-${i}`;
          const sku = skuVal.toUpperCase().trim();
          const product_name = (idxName !== -1 ? row[idxName] : '') || 'Produk Kurma Import';
          const category = (idxCategory !== -1 ? row[idxCategory] : '') || 'Kurma Umum';
          const image_url = idxImage !== -1 && row[idxImage] ? row[idxImage].trim() : undefined;

          const rawCost = idxRawCost !== -1 && row[idxRawCost] ? parseFloat(row[idxRawCost].replace(/[^0-9.]/g, '')) || 0 : 0;
          const packagingCost = idxPkgCost !== -1 && row[idxPkgCost] ? parseFloat(row[idxPkgCost].replace(/[^0-9.]/g, '')) || 0 : 0;
          const shippingInCost = idxShipCost !== -1 && row[idxShipCost] ? parseFloat(row[idxShipCost].replace(/[^0-9.]/g, '')) || 0 : 0;
          const overheadCost = idxOverhead !== -1 && row[idxOverhead] ? parseFloat(row[idxOverhead].replace(/[^0-9.]/g, '')) || 0 : 0;

          let total_hpp = rawCost + packagingCost + shippingInCost + overheadCost;
          if (total_hpp === 0 && idxTotalHpp !== -1 && row[idxTotalHpp]) {
            total_hpp = parseFloat(row[idxTotalHpp].replace(/[^0-9.]/g, '')) || 0;
          }

          const normal_price = idxNormalPrice !== -1 && row[idxNormalPrice] ? parseFloat(row[idxNormalPrice].replace(/[^0-9.]/g, '')) || 0 : 0;
          const stock = idxStock !== -1 && row[idxStock] ? parseInt(row[idxStock].replace(/[^0-9]/g, '')) || 0 : 0;
          const expiry_date = idxExpiry !== -1 && row[idxExpiry] ? row[idxExpiry] : '2026-12-31';
          const target_profit = idxTargetProfit !== -1 && row[idxTargetProfit] ? parseFloat(row[idxTargetProfit].replace(/[^0-9.]/g, '')) || 10000 : 10000;

          let target_margin = 0.15;
          if (idxTargetMargin !== -1 && row[idxTargetMargin]) {
            const val = parseFloat(row[idxTargetMargin].replace(/[^0-9.]/g, '')) || 15;
            target_margin = val > 1 ? val / 100 : val;
          }

          const statusRaw = idxStatus !== -1 && row[idxStatus] ? row[idxStatus].toUpperCase() : 'ACTIVE';
          const status = statusRaw.includes('NON') || statusRaw.includes('INACTIVE') ? 'INACTIVE' : 'ACTIVE';

          if (sku && normal_price > 0) {
            importedProducts.push({
              id: `prod_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
              sku,
              product_name,
              category,
              image_url,
              hppBreakdown: {
                rawCost,
                packagingCost,
                shippingInCost,
                overheadCost
              },
              total_hpp: total_hpp || 0,
              normal_price,
              stock,
              expiry_date,
              target_profit,
              target_margin,
              status
            });
          }
        }

        if (importedProducts.length > 0) {
          onImportProducts(importedProducts);
          onToast(`Berhasil mengimpor ${importedProducts.length} produk dari CSV!`, 'success');
        } else {
          onToast('Tidak ditemukan data produk valid pada file CSV.', 'warning');
        }
      } catch {
        onToast('Gagal memproses file CSV. Pastikan format kolom sesuai.', 'error');
      }

      e.target.value = '';
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          onImportProducts(imported);
          onToast(`${imported.length} produk berhasil diimport!`, 'success');
        } else {
          onToast('Format file JSON tidak valid.', 'error');
        }
      } catch {
        onToast('Gagal membaca file JSON.', 'error');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const categoriesList = Array.from(new Set(products.map((p) => p.category)));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h3 className="font-bold text-slate-800 text-xl">Master Produk Kurma</h3>
          <p className="text-xs text-slate-500">
            Total {products.length} SKU terdaftar • Atur rincian HPP, tanggal kadaluarsa, dan harga
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDownloadTemplateCSV}
            className="px-3.5 py-2.5 rounded-full bg-slate-100 hover:bg-orange-50 hover:text-[#EE4D2D] text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 border border-slate-200"
            title="Unduh format template CSV untuk diisi di Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#EE4D2D]" />
            Template CSV
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-full bg-slate-100 hover:bg-orange-50 hover:text-[#EE4D2D] text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 border border-slate-200"
          >
            <Download className="w-4 h-4 text-[#EE4D2D]" />
            Export CSV
          </button>

          <label className="px-3.5 py-2.5 rounded-full bg-slate-100 hover:bg-orange-50 hover:text-[#EE4D2D] text-slate-700 font-bold text-xs cursor-pointer transition-colors flex items-center gap-1.5 border border-slate-200">
            <Upload className="w-4 h-4 text-[#EE4D2D]" />
            Import CSV
            <input type="file" accept=".csv,.txt" onChange={handleImportCSV} className="hidden" />
          </label>

          <label className="px-3.5 py-2.5 rounded-full bg-slate-100 hover:bg-orange-50 hover:text-[#EE4D2D] text-slate-700 font-bold text-xs cursor-pointer transition-colors flex items-center gap-1.5 border border-slate-200">
            <Upload className="w-4 h-4 text-[#EE4D2D]" />
            Import JSON
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>

          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 rounded-full bg-[#EE4D2D] text-white font-bold text-xs hover:bg-orange-600 transition-all flex items-center gap-1.5 shadow-md shadow-[#EE4D2D]/20"
          >
            <Plus className="w-4 h-4" />
            Tambah SKU Baru
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#EE4D2D] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari SKU atau Nama Produk..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#EE4D2D] focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#EE4D2D]"
          >
            <option value="ALL">Semua Kategori</option>
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#EE4D2D]"
          >
            <option value="ALL">Semua Status</option>
            <option value="ACTIVE">Aktif</option>
            <option value="INACTIVE">Nonaktif</option>
            <option value="EXPIRING">Kadaluarsa &le; 90 Hari</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedProductIds.length > 0 && (
        <div className="bg-slate-900 text-white p-3.5 px-5 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-3 animate-fadeIn border border-slate-800">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-[#EE4D2D]" />
            <span className="text-xs font-bold text-slate-100">
              <span className="text-[#EE4D2D] font-extrabold">{selectedProductIds.length}</span> Produk Dipilih
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleBulkStatusChange('ACTIVE')}
              className="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1"
              title="Aktifkan Semua Terpilih"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Set Aktif
            </button>

            <button
              onClick={() => handleBulkStatusChange('INACTIVE')}
              className="px-3 py-1.5 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition-colors flex items-center gap-1"
              title="Nonaktifkan Semua Terpilih"
            >
              <XCircle className="w-3.5 h-3.5" />
              Set Nonaktif
            </button>

            <button
              onClick={handleBulkDelete}
              className="px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
              title="Hapus Masal Produk Terpilih"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Hapus Masal ({selectedProductIds.length})
            </button>

            <button
              onClick={() => setSelectedProductIds([])}
              className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 uppercase font-bold tracking-wider">
                <th className="p-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded text-[#EE4D2D] focus:ring-[#EE4D2D] cursor-pointer accent-[#EE4D2D]"
                    title="Pilih Semua Produk"
                  />
                </th>
                <th className="p-4 w-16 text-center">Foto</th>
                <th className="p-4">SKU & Kategori</th>
                <th className="p-4">Nama Produk Kurma</th>
                <th className="p-4">Total HPP Modal</th>
                <th className="p-4">Harga Normal</th>
                <th className="p-4">Stok & Expired</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((p) => {
                  const { isExpiring, label } = getExpiryInfo(p.expiry_date);
                  const isSelected = selectedProductIds.includes(p.id);

                  return (
                    <tr
                      key={p.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-orange-50/60' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(p.id)}
                          className="w-4 h-4 rounded text-[#EE4D2D] focus:ring-[#EE4D2D] cursor-pointer accent-[#EE4D2D]"
                        />
                      </td>
                      <td className="p-4 text-center">
                        <div
                          onClick={() => setPreviewPhotoProduct(p)}
                          className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200/80 overflow-hidden flex items-center justify-center cursor-pointer group relative shadow-xs hover:border-[#EE4D2D] transition-all mx-auto"
                          title="Klik untuk perbesar foto"
                        >
                          {p.image_url ? (
                            <>
                              <img
                                src={p.image_url}
                                alt={p.product_name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                <Eye className="w-4 h-4" />
                              </div>
                            </>
                          ) : (
                            <div className="text-slate-400 flex flex-col items-center justify-center p-1 text-[9px] font-bold">
                              <ImageIcon className="w-4 h-4 text-slate-300" />
                              <span className="text-[8px] mt-0.5">No Foto</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-extrabold text-slate-900 block font-mono text-xs">
                          {p.sku}
                        </span>
                        <span className="inline-block text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200 mt-1">
                          {p.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-800 block line-clamp-2 max-w-xs text-xs">
                          {p.product_name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Target Untung: {formatRupiah(p.target_profit || 0)} ({( (p.target_margin || 0.15) * 100).toFixed(0)}%)
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-700">
                        {formatRupiah(p.total_hpp)}
                      </td>
                      <td className="p-4 font-extrabold text-slate-900">
                        {formatRupiah(p.normal_price)}
                      </td>
                      <td className="p-4">
                        <span className="block font-semibold text-slate-800">{p.stock} Unit</span>
                        {isExpiring ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200 mt-1">
                            <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                            {label}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 mt-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            {label}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {p.status === 'ACTIVE' ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                            AKTIF
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                            NONAKTIF
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onNavigateToSimulator(p.id)}
                            className="px-3 py-1.5 rounded-full bg-[#EE4D2D] text-white font-bold hover:bg-orange-600 transition-colors shadow-xs text-xs"
                            title="Simulasi Shopee"
                          >
                            Simulasi
                          </button>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="Edit Master & Foto"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.sku)}
                            className="p-1.5 rounded-full text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Hapus Master"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    Tidak ada produk kurma yang cocok dengan pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <span className="text-xs text-slate-500 font-medium">
            Halaman <span className="font-bold text-slate-800">{currentPage}</span> dari{' '}
            <span className="font-bold text-slate-800">{totalPages}</span> (Total{' '}
            {filteredProducts.length} Produk)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialProduct={editingProduct}
      />

      {/* Photo Preview Lightbox Modal */}
      {previewPhotoProduct && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="p-4 px-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#EE4D2D]" />
                <span className="text-xs font-mono font-bold text-orange-400">
                  {previewPhotoProduct.sku}
                </span>
              </div>
              <button
                onClick={() => setPreviewPhotoProduct(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-100 relative max-h-80 overflow-hidden flex items-center justify-center">
              {previewPhotoProduct.image_url ? (
                <img
                  src={previewPhotoProduct.image_url}
                  alt={previewPhotoProduct.product_name}
                  referrerPolicy="no-referrer"
                  className="w-full h-80 object-cover"
                />
              ) : (
                <div className="py-16 text-center text-slate-400 flex flex-col items-center">
                  <ImageIcon className="w-12 h-12 text-slate-300 mb-2" />
                  <span className="text-xs font-bold">Produk ini belum memiliki foto</span>
                </div>
              )}
            </div>

            <div className="p-5 space-y-3">
              <div>
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block">
                  {previewPhotoProduct.category}
                </span>
                <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                  {previewPhotoProduct.product_name}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-medium">Harga Normal</span>
                  <span className="font-extrabold text-slate-800 text-sm">
                    {formatRupiah(previewPhotoProduct.normal_price)}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-100">
                  <span className="text-[10px] text-orange-600 block font-medium">Total HPP Modal</span>
                  <span className="font-extrabold text-[#EE4D2D] text-sm">
                    {formatRupiah(previewPhotoProduct.total_hpp)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => {
                    const prod = previewPhotoProduct;
                    setPreviewPhotoProduct(null);
                    handleOpenEdit(prod);
                  }}
                  className="flex-1 py-2 rounded-full bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Ubah Foto / Data
                </button>
                <button
                  onClick={() => {
                    const id = previewPhotoProduct.id;
                    setPreviewPhotoProduct(null);
                    onNavigateToSimulator(id);
                  }}
                  className="flex-1 py-2 rounded-full bg-[#EE4D2D] text-white font-bold text-xs hover:bg-orange-600 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  Simulasi Harga
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmState.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-scaleUp">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 text-center mb-2">
              Konfirmasi Hapus {deleteConfirmState.type === 'BULK' ? 'Masal' : 'Produk'}
            </h3>
            <p className="text-sm text-slate-600 text-center mb-6">
              {deleteConfirmState.type === 'BULK'
                ? `Apakah Anda yakin ingin menghapus masal ${deleteConfirmState.count} produk terpilih? Tindakan ini akan menghapus data dari Firestore & Local Storage.`
                : `Apakah Anda yakin ingin menghapus produk SKU [${deleteConfirmState.sku}]?`}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirmState({ isOpen: false, type: 'SINGLE' })}
                className="flex-1 py-2.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={executeDelete}
                className="flex-1 py-2.5 rounded-full bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors shadow-sm"
              >
                Ya, Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
