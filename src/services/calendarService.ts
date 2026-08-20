import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  getDocs
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MarketingEvent, EventNotification } from '../types';
import { INITIAL_MARKETING_EVENTS } from '../data/calendarData';

const MARKETING_EVENTS_COL = 'marketing_events';
const STORAGE_EVENTS_KEY = 'kurma_marketing_events_cache';
const STORAGE_NOTIF_KEY = 'kurma_event_notifications_cache';

// Local storage caching helpers
export function getLocalCachedEvents(): MarketingEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_EVENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed reading cached events', e);
  }
  return INITIAL_MARKETING_EVENTS;
}

export function saveLocalCachedEvents(events: MarketingEvent[]): void {
  try {
    localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(events));
  } catch (e) {
    console.warn('Failed saving cached events', e);
  }
}

export function getLocalCachedNotifications(): EventNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_NOTIF_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed reading cached notifications', e);
  }
  return [];
}

export function saveLocalCachedNotifications(notifs: EventNotification[]): void {
  try {
    localStorage.setItem(STORAGE_NOTIF_KEY, JSON.stringify(notifs));
  } catch (e) {
    console.warn('Failed saving cached notifications', e);
  }
}

// Seed initial marketing events to Firestore if empty
export async function seedInitialMarketingEvents(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, MARKETING_EVENTS_COL));
    if (snap.empty) {
      const batch = writeBatch(db);
      INITIAL_MARKETING_EVENTS.slice(0, 300).forEach((ev) => {
        const ref = doc(db, MARKETING_EVENTS_COL, ev.id);
        batch.set(ref, ev);
      });
      await batch.commit();
    }
  } catch (err) {
    console.warn('Gagal seed marketing events ke Firestore:', err);
  }
}

// Subscribe real-time marketing events
export function subscribeMarketingEvents(
  onUpdate: (events: MarketingEvent[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    collection(db, MARKETING_EVENTS_COL),
    (snapshot) => {
      if (snapshot.empty) {
        seedInitialMarketingEvents();
        onUpdate(INITIAL_MARKETING_EVENTS);
        saveLocalCachedEvents(INITIAL_MARKETING_EVENTS);
        return;
      }
      const events: MarketingEvent[] = [];
      snapshot.forEach((docSnap) => {
        events.push({ id: docSnap.id, ...docSnap.data() } as MarketingEvent);
      });
      saveLocalCachedEvents(events);
      onUpdate(events);
    },
    (err) => {
      console.error('Firestore Marketing Events Sync Error:', err);
      if (onError) onError(err);
    }
  );
}

// Save or Update an event
export async function saveMarketingEventToCloud(event: MarketingEvent): Promise<void> {
  const ref = doc(db, MARKETING_EVENTS_COL, event.id);
  await setDoc(ref, event, { merge: true });
}

// Delete custom event
export async function deleteMarketingEventFromCloud(eventId: string): Promise<void> {
  const ref = doc(db, MARKETING_EVENTS_COL, eventId);
  await deleteDoc(ref);
}

// Batch save events
export async function batchSaveEventsToCloud(events: MarketingEvent[]): Promise<void> {
  const batch = writeBatch(db);
  events.forEach((ev) => {
    const ref = doc(db, MARKETING_EVENTS_COL, ev.id);
    batch.set(ref, ev, { merge: true });
  });
  await batch.commit();
}

/**
 * Real-time notification & reminder generator engine (H-30, H-14, H-7, H-3, H-1, H-0)
 * Uses current Jakarta date (Asia/Jakarta timezone) and ensures idempotent notifications
 */
export function generateEventReminders(
  events: MarketingEvent[],
  existingNotifications: EventNotification[]
): EventNotification[] {
  const now = new Date();
  const jakartaDateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now); // "YYYY-MM-DD"

  const today = new Date(jakartaDateStr);
  const updatedNotifications: EventNotification[] = [...existingNotifications];

  const notifKeySet = new Set(
    existingNotifications.map((n) => `${n.eventId}_${n.reminderType}`)
  );

  events
    .filter((e) => e.isActive && e.reminderEnabled)
    .forEach((ev) => {
      const eventDate = new Date(ev.date);
      const diffTime = eventDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const totalTasks = ev.preparationChecklist?.length || 0;
      const completedTasks = ev.preparationChecklist?.filter((t) => t.completed).length || 0;
      const checklistProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const reminderDays = ev.reminderDays || [30, 14, 7, 3, 1, 0];

      reminderDays.forEach((days) => {
        if (diffDays === days) {
          const reminderType: EventNotification['reminderType'] = `H-${days}` as any;
          const uniqueKey = `${ev.id}_${reminderType}`;

          if (!notifKeySet.has(uniqueKey)) {
            let message = '';
            if (days === 0) {
              message = `🔥 EVENT HARI INI: "${ev.title}" sedang berlangsung! Pantau order & live streaming.`;
            } else if (days === 1) {
              message = `⚡ H-1 BESOK: "${ev.title}" segera dimulai! Pastikan semua stok & materi siap.`;
            } else if (days === 7) {
              message = `🔔 EVENT PROMO H-7: "${ev.title}" berlangsung 7 hari lagi. Persiapkan produk promo, voucher & checklist.`;
            } else if (days === 14) {
              message = `📦 H-14 PERSIAPAN: Segera amankan stok kurma & kemasan untuk event "${ev.title}".`;
            } else if (days === 30) {
              message = `📅 H-30 PLANNING: Mulai rancang strategi promo & campaign "${ev.title}".`;
            } else {
              message = `⏰ Reminder H-${days}: Persiapan event "${ev.title}". Progress: ${checklistProgress}%.`;
            }

            const newNotif: EventNotification = {
              id: `notif_${ev.id}_h${days}`,
              eventId: ev.id,
              eventTitle: ev.title,
              eventDate: ev.date,
              daysRemaining: diffDays,
              reminderType,
              message,
              timestamp: new Date().toISOString(),
              isRead: false,
              targetRole: 'ALL',
              checklistProgress
            };

            updatedNotifications.unshift(newNotif);
            notifKeySet.add(uniqueKey);
          }
        }
      });
    });

  return updatedNotifications.slice(0, 50);
}
