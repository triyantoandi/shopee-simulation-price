import React, { useState, useEffect } from 'react';
import { Product, FeeRule, AppSettings, MarketingEvent, EventNotification } from './types';
import { computeDashboardStats } from './utils/storage';
import { INITIAL_PRODUCTS, INITIAL_FEES, INITIAL_SETTINGS } from './data/initialData';
import { INITIAL_MARKETING_EVENTS } from './data/calendarData';
import {
  subscribeProducts,
  subscribeFees,
  subscribeSettings,
  saveProductToCloud,
  deleteProductFromCloud,
  deleteProductsBatchFromCloud,
  saveProductsBatchToCloud,
  saveFeesToCloud,
  saveSettingsToCloud,
  resetCloudToDefaults
} from './services/firestoreService';
import {
  subscribeMarketingEvents,
  saveMarketingEventToCloud,
  deleteMarketingEventFromCloud,
  generateEventReminders
} from './services/calendarService';

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { SimulatorView } from './components/SimulatorView';
import { BundlingView } from './components/BundlingView';
import { ProductsView } from './components/ProductsView';
import { FeesView } from './components/FeesView';
import { SettingsView } from './components/SettingsView';
import { MarketingCalendarView } from './components/Calendar/MarketingCalendarView';
import { Toast } from './components/Toast';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [fees, setFees] = useState<FeeRule[]>(INITIAL_FEES);
  const [events, setEvents] = useState<MarketingEvent[]>(INITIAL_MARKETING_EVENTS);
  const [notifications, setNotifications] = useState<EventNotification[]>([]);
  const [highlightEventId, setHighlightEventId] = useState<string | undefined>(undefined);

  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);

  const [simSelectedProductId, setSimSelectedProductId] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(true);
  const [toastInfo, setToastInfo] = useState<{
    message: string;
    type: 'success' | 'warning' | 'error' | 'info';
  } | null>(null);

  // Real-time Firestore Subscriptions (Single Source of Truth)
  useEffect(() => {
    // 1. Subscribe to Firestore Products collection
    const unsubProducts = subscribeProducts(
      (prods) => {
        setProducts(prods);
        setIsCloudConnected(true);
      },
      () => setIsCloudConnected(false)
    );

    // 2. Subscribe to Firestore Fee Rules collection
    const unsubFees = subscribeFees(
      (f) => {
        setFees(f);
        setIsCloudConnected(true);
      },
      () => setIsCloudConnected(false)
    );

    // 3. Subscribe to Firestore Settings document
    const unsubSettings = subscribeSettings(
      (s) => {
        setSettings(s);
        setIsCloudConnected(true);
      },
      () => setIsCloudConnected(false)
    );

    // 4. Subscribe to Firestore Marketing Events collection
    const unsubEvents = subscribeMarketingEvents(
      (cloudEvents) => {
        setEvents(cloudEvents);
        setNotifications((prev) => generateEventReminders(cloudEvents, prev));
        setIsCloudConnected(true);
      },
      () => setIsCloudConnected(false)
    );

    return () => {
      unsubProducts();
      unsubFees();
      unsubSettings();
      unsubEvents();
    };
  }, []);

  const showToast = (
    message: string,
    type: 'success' | 'warning' | 'error' | 'info' = 'info'
  ) => {
    setToastInfo({ message, type });
    setTimeout(() => {
      setToastInfo(null);
    }, 3500);
  };

  // Product CRUD (Direct to Firestore with Photo Base64/URL)
  const handleSaveProduct = async (prod: Product) => {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === prod.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = prod;
        return next;
      }
      return [prod, ...prev];
    });

    try {
      await saveProductToCloud(prod);
      showToast('Produk & Foto tersimpan di Firestore Database!', 'success');
    } catch (err: any) {
      console.error('Error saving product to Firestore:', err);
      showToast('Gagal menyimpan ke Firestore. Menunggu sinkronisasi...', 'warning');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      await deleteProductFromCloud(id);
      showToast('Produk dihapus dari Firestore Database!', 'info');
    } catch (err: any) {
      console.error('Error deleting product from Firestore:', err);
      showToast('Gagal menghapus produk dari Firestore.', 'warning');
    }
  };

  const handleBulkDeleteProducts = async (ids: string[]) => {
    setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
    try {
      await deleteProductsBatchFromCloud(ids);
      showToast(`${ids.length} produk berhasil dihapus dari Firestore!`, 'info');
    } catch (err: any) {
      console.error('Error batch deleting products from Firestore:', err);
      showToast('Gagal menghapus masal dari Firestore.', 'warning');
    }
  };

  const handleBulkUpdateStatus = async (ids: string[], status: 'ACTIVE' | 'INACTIVE') => {
    setProducts((prev) =>
      prev.map((p) => (ids.includes(p.id) ? { ...p, status } : p))
    );
    try {
      const prodsToSave = products
        .filter((p) => ids.includes(p.id))
        .map((p) => ({ ...p, status }));
      await saveProductsBatchToCloud(prodsToSave);
      showToast(
        `Status ${ids.length} produk diubah menjadi ${status === 'ACTIVE' ? 'AKTIF' : 'NONAKTIF'}!`,
        'success'
      );
    } catch (err: any) {
      console.error('Error batch updating status:', err);
      showToast('Gagal memperbarui status di Firestore.', 'warning');
    }
  };

  const handleImportProducts = async (importedProds: Product[]) => {
    setProducts(importedProds);
    try {
      await saveProductsBatchToCloud(importedProds);
      showToast(`${importedProds.length} produk import tersimpan ke Firestore!`, 'success');
    } catch (err: any) {
      console.error('Error importing products to Firestore:', err);
      showToast('Gagal mengimpor produk ke Firestore.', 'warning');
    }
  };

  // Fee Rules CRUD (Direct to Firestore)
  const handleSaveFees = async (updatedFees: FeeRule[]) => {
    setFees(updatedFees);
    try {
      await saveFeesToCloud(updatedFees);
      showToast('Aturan fee tersimpan di Firestore Database!', 'success');
    } catch (err: any) {
      console.error('Error saving fees to Firestore:', err);
      showToast('Gagal menyimpan aturan fee ke Firestore.', 'warning');
    }
  };

  // Marketing Calendar CRUD (Direct to Firestore)
  const handleSaveMarketingEvent = async (updatedEvent: MarketingEvent) => {
    setEvents((prev) => {
      const idx = prev.findIndex((e) => e.id === updatedEvent.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updatedEvent;
        return next;
      }
      return [updatedEvent, ...prev];
    });

    try {
      await saveMarketingEventToCloud(updatedEvent);
      showToast('Event promo tersimpan di Firestore Database!', 'success');
    } catch (err: any) {
      console.error('Error saving event to Firestore:', err);
      showToast('Gagal menyimpan event ke Firestore.', 'warning');
    }
  };

  const handleDeleteMarketingEvent = async (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    try {
      await deleteMarketingEventFromCloud(eventId);
      showToast('Event promo dihapus dari Firestore Database!', 'info');
    } catch (err: any) {
      console.error('Error deleting event from Firestore:', err);
      showToast('Gagal menghapus event dari Firestore.', 'warning');
    }
  };

  // Settings Save (Direct to Firestore)
  const handleSaveSettings = async (updatedSettings: AppSettings) => {
    setSettings(updatedSettings);
    try {
      await saveSettingsToCloud(updatedSettings);
      showToast('Pengaturan tersimpan di Firestore Database!', 'success');
    } catch (err: any) {
      console.error('Error saving settings to Firestore:', err);
      showToast('Gagal menyimpan pengaturan ke Firestore.', 'warning');
    }
  };

  // Reset Data (Direct to Firestore)
  const handleResetData = async () => {
    try {
      await resetCloudToDefaults();
      showToast('Seluruh koleksi Firestore berhasil direset ke standar!', 'success');
    } catch (err) {
      console.error('Error resetting Firestore:', err);
      showToast('Gagal mereset data Firestore.', 'error');
    }
  };

  // Manual Refresh / Sync trigger from Firestore
  const handleSyncData = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      showToast('Sinkronisasi real-time Firestore aktif & terhubung!', 'success');
    }, 600);
  };

  // Quick Nav to Simulator
  const handleNavigateToSimulator = (productId?: string) => {
    if (productId) {
      setSimSelectedProductId(productId);
    }
    setActiveTab('simulator');
  };

  // Quick Nav to Calendar
  const handleNavigateToCalendar = (eventId?: string) => {
    if (eventId) {
      setHighlightEventId(eventId);
    }
    setActiveTab('calendar');
  };

  const handleMarkNotificationRead = (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
    );
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const dashboardStats = computeDashboardStats(products, fees, settings.expiryWarningMonths);

  return (
    <div className="flex h-screen w-screen bg-[#F5F5F5] text-[#222222] font-sans overflow-hidden antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        syncData={handleSyncData}
        isSyncing={isSyncing}
        expiringCount={dashboardStats.expiringCount}
      />

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          activeTab={activeTab}
          storeName={settings.storeName}
          isCloudConnected={isCloudConnected}
          notifications={notifications}
          onSelectNotification={handleNavigateToCalendar}
          onMarkNotificationRead={handleMarkNotificationRead}
          onClearAllNotifications={handleClearAllNotifications}
        />

        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              products={products}
              fees={fees}
              stats={dashboardStats}
              events={events}
              onNavigateToSimulator={handleNavigateToSimulator}
              onNavigateToProducts={() => setActiveTab('products')}
              onNavigateToCalendar={handleNavigateToCalendar}
            />
          )}

          {activeTab === 'calendar' && (
            <MarketingCalendarView
              events={events}
              products={products}
              fees={fees}
              settings={settings}
              onSaveEvent={handleSaveMarketingEvent}
              onDeleteEvent={handleDeleteMarketingEvent}
              onToast={showToast}
              onNavigateToSimulator={handleNavigateToSimulator}
              highlightEventId={highlightEventId}
            />
          )}

          {activeTab === 'simulator' && (
            <SimulatorView
              products={products}
              fees={fees}
              selectedProductId={simSelectedProductId}
              onToast={showToast}
            />
          )}

          {activeTab === 'bundling' && (
            <BundlingView
              products={products}
              fees={fees}
              settings={settings}
              onSaveProduct={handleSaveProduct}
              onToast={showToast}
              onNavigateToSimulator={handleNavigateToSimulator}
            />
          )}

          {activeTab === 'products' && (
            <ProductsView
              products={products}
              onSaveProduct={handleSaveProduct}
              onDeleteProduct={handleDeleteProduct}
              onBulkDeleteProducts={handleBulkDeleteProducts}
              onBulkUpdateStatus={handleBulkUpdateStatus}
              onImportProducts={handleImportProducts}
              onNavigateToSimulator={handleNavigateToSimulator}
              onToast={showToast}
            />
          )}

          {activeTab === 'fees' && (
            <FeesView
              fees={fees}
              onSaveFees={handleSaveFees}
              onToast={showToast}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onResetData={handleResetData}
              onToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Toast Notification Banner */}
      {toastInfo && (
        <Toast
          message={toastInfo.message}
          type={toastInfo.type}
          onClose={() => setToastInfo(null)}
        />
      )}
    </div>
  );
}
