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
import { saveStoredProducts, saveStoredFees, saveStoredSettings } from '../utils/storage';

const PRODUCTS_COL = 'products';
const FEES_COL = 'feeRules';
const SETTINGS_COL = 'settings';
const SETTINGS_DOC_ID = 'main';

// Seed Initial Data to Firestore
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

// Real-time Subscriptions
export function subscribeProducts(
  onUpdate: (products: Product[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    collection(db, PRODUCTS_COL),
    (snapshot) => {
      if (snapshot.empty) {
        // If collection empty, seed initial products
        seedInitialFirestoreData();
      }
      const products: Product[] = [];
      snapshot.forEach((docSnap) => {
        products.push({ id: docSnap.id, ...docSnap.data() } as Product);
      });
      saveStoredProducts(products); // also sync to local storage cache
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
    (snapshot) => {
      if (snapshot.empty) {
        seedInitialFirestoreData();
      }
      const fees: FeeRule[] = [];
      snapshot.forEach((docSnap) => {
        fees.push({ id: docSnap.id, ...docSnap.data() } as FeeRule);
      });
      saveStoredFees(fees);
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
    (snapshot) => {
      if (snapshot.exists()) {
        const settings = snapshot.data() as AppSettings;
        saveStoredSettings(settings);
        onUpdate(settings);
      } else {
        seedInitialFirestoreData();
      }
    },
    (err) => {
      console.error('Firestore Settings Sync Error:', err);
      if (onError) onError(err);
    }
  );
}

// Mutation Functions
export async function saveProductToCloud(product: Product): Promise<void> {
  const ref = doc(db, PRODUCTS_COL, product.id);
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
  // Clear current collections in batch or overwrite with defaults
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
