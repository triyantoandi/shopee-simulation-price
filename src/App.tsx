import React, { useState, useEffect } from 'react';
import { Product, FeeRule, AppSettings, MarketingEvent, EventNotification } from './types';
import {
  getStoredProducts,
  saveStoredProducts,
  getStoredFees,
  saveStoredFees,
  getStoredSettings,
  saveStoredSettings,
  computeDashboardStats,
  resetToDefaults
} from './utils/storage';
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
  getLocalCachedEvents,
  generateEventReminders,
  getLocalCachedNotifications,
  saveLocalCachedNotifications
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
  const [products, setProducts] = useState<Product[]>([]);
  const [fees, setFees] = useState<FeeRule[]>([]);
  const [events, setEvents] = useState<MarketingEvent[]>([]);
  const [notifications, setNotifications] = useState<EventNotification[]>([]);
  const [highlightEventId, setHighlightEventId] = useState<string | undefined>(undefined);

  const [settings, setSettings] = useState<AppSettings>({
    expiryWarningMonths: 3,
    defaultSellerTier: 'STAR_SELLER',
    targetMarginDefault: 20,
    storeName: 'Toko Kurma Berkah Shopee',
    autoSync: true
  });

  const [simSelectedProductId, setSimSelectedProductId] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(true);
  const [toastInfo, setToastInfo] = useState<{
    message: string;
    type: 'success' | 'warning' | 'error' | 'info';
  } | null>(null);

  // Initial Load & Real-time Firestore Subscriptions
  useEffect(() => {
    // Load local storage cache first
    setProducts(getStoredProducts());
    setFees(getStoredFees());
    setSettings(getStoredSettings());
    const cachedEvents = getLocalCachedEvents();
    setEvents(cachedEvents);

    const cachedNotifs = getLocalCachedNotifications();
    const freshNotifs = generateEventReminders(cachedEvents, cachedNotifs);
    setNotifications(freshNotifs);
    saveLocalCachedNotifications(freshNotifs);

    // Real-time Firestore Subscriptions
    const unsubProducts = subscribeProducts(
      (prods) => {
        setProducts(prods);
        setIsCloudConnected(true);
      },
      () => setIsCloudConnected(false)
    );

    const unsubFees = subscribeFees(
      (f) => {
        setFees(f);
        setIsCloudConnected(true);
      },
      () => setIsCloudConnected(false)
    );

    const unsubSettings = subscribeSettings(
      (s) => {
        setSettings(s);
        setIsCloudConnected(true);
      },
      () => setIsCloudConnected(false)
    );

    const unsubEvents = subscribeMarketingEvents(
      (cloudEvents) => {
        setEvents(cloudEvents);
        setNotifications((prev) => {
          const generated = generateEventReminders(cloudEvents, prev);
          saveLocalCachedNotifications(generated);
          return generated;
        });
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

  // Product CRUD
  const handleSaveProduct = async (prod: Product) => {
    const existingIdx = products.findIndex((p) => p.id === prod.id);
    let updated: Product[];
    if (existingIdx >= 0) {
      updated = [...products];
      updated[existingIdx] = prod;
    } else {
      updated = [prod, ...products];
    }
    setProducts(updated);
    saveStoredProducts(updated);

    try {
      await saveProductToCloud(prod);
      showToast('Produk tersimpan di Firestore & Local Storage!', 'success');
    } catch {
      showToast('Tersimpan di penyimpan lokal.', 'warning');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    saveStoredProducts(updated);

    try {
      await deleteProductFromCloud(id);
      showToast('Produk dihapus dari Firestore Database!', 'info');
    } catch {
      showToast('Dihapus dari penyimpan lokal.', 'warning');
    }
  };

  const handleBulkDeleteProducts = async (ids: string[]) => {
    const updated = products.filter((p) => !ids.includes(p.id));
    setProducts(updated);
    saveStoredProducts(updated);

    try {
      await deleteProductsBatchFromCloud(ids);
      showToast(`${ids.length} produk berhasil dihapus masal!`, 'info');
    } catch {
      showToast(`${ids.length} produk dihapus dari penyimpan lokal.`, 'warning');
    }
  };

  const handleBulkUpdateStatus = async (ids: string[], status: 'ACTIVE' | 'INACTIVE') => {
    const updatedProds = products.map((p) =>
      ids.includes(p.id) ? { ...p, status } : p
    );
    setProducts(updatedProds);
    saveStoredProducts(updatedProds);

    try {
      const prodsToSave = updatedProds.filter((p) => ids.includes(p.id));
      await saveProductsBatchToCloud(prodsToSave);
      showToast(
        `Status ${ids.length} produk diubah menjadi ${status === 'ACTIVE' ? 'AKTIF' : 'NONAKTIF'}!`,
        'success'
      );
    } catch {
      showToast('Status diperbarui di penyimpan lokal.', 'warning');
    }
  };

  const handleImportProducts = async (importedProds: Product[]) => {
    setProducts(importedProds);
    saveStoredProducts(importedProds);

    try {
      await saveProductsBatchToCloud(importedProds);
      showToast('Import produk berhasil tersinkron ke Firestore!', 'success');
    } catch {
      showToast('Import tersimpan di penyimpanan lokal.', 'warning');
    }
  };

  // Fee Rules CRUD
  const handleSaveFees = async (updatedFees: FeeRule[]) => {
    setFees(updatedFees);
    saveStoredFees(updatedFees);

    try {
      await saveFeesToCloud(updatedFees);
      showToast('Aturan fee tersimpan di Firestore Database!', 'success');
    } catch {
      showToast('Tersimpan di penyimpanan lokal.', 'warning');
    }
  };

  // Marketing Calendar CRUD
  const handleSaveMarketingEvent = async (updatedEvent: MarketingEvent) => {
    const existingIdx = events.findIndex((e) => e.id === updatedEvent.id);
    let newEvents: MarketingEvent[];
    if (existingIdx >= 0) {
      newEvents = [...events];
      newEvents[existingIdx] = updatedEvent;
    } else {
      newEvents = [updatedEvent, ...events];
    }
    setEvents(newEvents);

    try {
      await saveMarketingEventToCloud(updatedEvent);
    } catch (err) {
      console.warn('Gagal simpan event ke Firestore:', err);
    }
  };

  const handleDeleteMarketingEvent = async (eventId: string) => {
    const updated = events.filter((e) => e.id !== eventId);
    setEvents(updated);

    try {
      await deleteMarketingEventFromCloud(eventId);
    } catch (err) {
      console.warn('Gagal hapus event di Firestore:', err);
    }
  };

  // Settings Save
  const handleSaveSettings = async (updatedSettings: AppSettings) => {
    setSettings(updatedSettings);
    saveStoredSettings(updatedSettings);

    try {
      await saveSettingsToCloud(updatedSettings);
      showToast('Pengaturan tersimpan di Firestore Database!', 'success');
    } catch {
      showToast('Tersimpan di penyimpanan lokal.', 'warning');
    }
  };

  // Reset Data
  const handleResetData = async () => {
    resetToDefaults();
    setProducts(getStoredProducts());
    setFees(getStoredFees());
    setSettings(getStoredSettings());

    try {
      await resetCloudToDefaults();
      showToast('Database Firestore & Local berhasil direset!', 'success');
    } catch {
      showToast('Penyimpanan lokal berhasil direset.', 'info');
    }
  };

  // Sync Simulation Action
  const handleSyncData = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setProducts(getStoredProducts());
      setFees(getStoredFees());
      setIsSyncing(false);
      showToast('Data disinkronkan!', 'success');
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
    const updated = notifications.map((n) =>
      n.id === notifId ? { ...n, isRead: true } : n
    );
    setNotifications(updated);
    saveLocalCachedNotifications(updated);
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    saveLocalCachedNotifications([]);
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
