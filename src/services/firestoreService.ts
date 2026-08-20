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
import { Product, FeeRule, AppSettings } from '../types';
import { INITIAL_PRODUCTS, INITIAL_FEES, INITIAL_SETTINGS } from '../data/initialData';

export const PRODUCTS_COL = 'products';
export const FEES_COL = 'feeRules';
export const SETTINGS_COL = 'settings';
export const SETTINGS_DOC_ID = 'main';

// Seed Initial Data to Firestore if collections are empty
export async function seedInitialFirestoreData(): Promise<void> {
  try {
    const productsSnap = await getDocs(collection(db, PRODUCTS_COL));
    if (productsSnap.empty) {
      const batch = writeBatch(db);
      INITIAL_PRODUCTS.forEach((p) => {
        const ref = doc(db, PRODUCTS_COL, p.id);
        batch.set(ref, p);
      });
      await batch.commit();
    }

    const feesSnap = await getDocs(collection(db, FEES_COL));
    if (feesSnap.empty) {
      const batch = writeBatch(db);
      INITIAL_FEES.forEach((f) => {
        const ref = doc(db, FEES_COL, f.id);
        batch.set(ref, f);
      });
      await batch.commit();
    }

    const settingsRef = doc(db, SETTINGS_COL, SETTINGS_DOC_ID);
    await setDoc(settingsRef, INITIAL_SETTINGS, { merge: true });
  } catch (err) {
    console.warn('Gagal melakukan seed data ke Firestore:', err);
  }
}

// Real-time Subscriptions directly to Firestore (No Local Storage)
export function subscribeProducts(
  onUpdate: (products: Product[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    collection(db, PRODUCTS_COL),
    async (snapshot) => {
      if (snapshot.empty) {
        // If collection empty, seed initial products to Firestore
        await seedInitialFirestoreData();
        onUpdate(INITIAL_PRODUCTS);
        return;
      }
      const products: Product[] = [];
      snapshot.forEach((docSnap) => {
        products.push({ id: docSnap.id, ...docSnap.data() } as Product);
      });
      onUpdate(products);
    },
    (err) => {
      console.error('Firestore Products Sync Error:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeFees(
  onUpdate: (fees: FeeRule[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    collection(db, FEES_COL),
    async (snapshot) => {
      if (snapshot.empty) {
        await seedInitialFirestoreData();
        onUpdate(INITIAL_FEES);
        return;
      }
      const fees: FeeRule[] = [];
      snapshot.forEach((docSnap) => {
        fees.push({ id: docSnap.id, ...docSnap.data() } as FeeRule);
      });
      onUpdate(fees);
    },
    (err) => {
      console.error('Firestore Fees Sync Error:', err);
      if (onError) onError(err);
    }
  );
}

export function subscribeSettings(
  onUpdate: (settings: AppSettings) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    doc(db, SETTINGS_COL, SETTINGS_DOC_ID),
    async (snapshot) => {
      if (snapshot.exists()) {
        const settings = snapshot.data() as AppSettings;
        onUpdate(settings);
      } else {
        await seedInitialFirestoreData();
        onUpdate(INITIAL_SETTINGS);
      }
    },
    (err) => {
      console.error('Firestore Settings Sync Error:', err);
      if (onError) onError(err);
    }
  );
}

// Firestore Mutation Functions (Direct Cloud Storage)
export async function saveProductToCloud(product: Product): Promise<void> {
  const ref = doc(db, PRODUCTS_COL, product.id);
  // Store full product details including image_url (Base64 or URL) in Firestore document
  await setDoc(ref, product, { merge: true });
}

export async function deleteProductFromCloud(productId: string): Promise<void> {
  const ref = doc(db, PRODUCTS_COL, productId);
  await deleteDoc(ref);
}

export async function deleteProductsBatchFromCloud(productIds: string[]): Promise<void> {
  const batch = writeBatch(db);
  productIds.forEach((id) => {
    const ref = doc(db, PRODUCTS_COL, id);
    batch.delete(ref);
  });
  await batch.commit();
}

export async function saveProductsBatchToCloud(products: Product[]): Promise<void> {
  const batch = writeBatch(db);
  products.forEach((p) => {
    const ref = doc(db, PRODUCTS_COL, p.id);
    batch.set(ref, p, { merge: true });
  });
  await batch.commit();
}

export async function saveFeesToCloud(fees: FeeRule[]): Promise<void> {
  const batch = writeBatch(db);
  fees.forEach((f) => {
    const ref = doc(db, FEES_COL, f.id);
    batch.set(ref, f, { merge: true });
  });
  await batch.commit();
}

export async function saveSettingsToCloud(settings: AppSettings): Promise<void> {
  const ref = doc(db, SETTINGS_COL, SETTINGS_DOC_ID);
  await setDoc(ref, settings, { merge: true });
}

export async function resetCloudToDefaults(): Promise<void> {
  // Clear current collections in Firestore and replace with defaults
  const batch = writeBatch(db);

  INITIAL_PRODUCTS.forEach((p) => {
    const ref = doc(db, PRODUCTS_COL, p.id);
    batch.set(ref, p);
  });

  INITIAL_FEES.forEach((f) => {
    const ref = doc(db, FEES_COL, f.id);
    batch.set(ref, f);
  });

  const settingsRef = doc(db, SETTINGS_COL, SETTINGS_DOC_ID);
  batch.set(settingsRef, INITIAL_SETTINGS);

  await batch.commit();
}
