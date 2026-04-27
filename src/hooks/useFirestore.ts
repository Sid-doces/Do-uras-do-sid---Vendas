import { useState, useEffect } from 'react';
import { 
  collection, query, onSnapshot, 
  addDoc, updateDoc, deleteDoc, doc, 
  QueryConstraint, serverTimestamp, setDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useCollection<T>(collectionName: string, constraints: QueryConstraint[] = []) {
  const [data, setData] = useState<(T & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, collectionName), ...constraints);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          ...(doc.data() as T),
          id: doc.id,
        }));
        setData(items);
        setLoading(false);
      },
      (err) => {
        console.error(`Error fetching ${collectionName}:`, err);
        setError(err);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [collectionName, JSON.stringify(constraints)]);

  const add = async (item: Omit<T, 'id'>) => {
    return await addDoc(collection(db, collectionName), {
      ...item,
      createdAt: serverTimestamp(),
    });
  };

  const update = async (id: string, item: Partial<T>) => {
    return await updateDoc(doc(db, collectionName, id), item as any);
  };

  const remove = async (id: string) => {
    return await deleteDoc(doc(db, collectionName, id));
  };

  return { data, loading, error, add, update, remove };
}

export function useDocument<T>(collectionName: string, documentId: string) {
  const [data, setData] = useState<(T & { id: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!documentId) return;
    const unsubscribe = onSnapshot(doc(db, collectionName, documentId), (doc) => {
      if (doc.exists()) {
        setData({ ...(doc.data() as T), id: doc.id });
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [collectionName, documentId]);

  const save = async (item: Partial<T>) => {
    return await setDoc(doc(db, collectionName, documentId), item as any, { merge: true });
  };

  return { data, loading, save };
}
