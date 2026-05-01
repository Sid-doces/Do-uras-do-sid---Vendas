import { useState, useEffect } from 'react';
import { 
  collection, query, onSnapshot, 
  addDoc, updateDoc, deleteDoc, doc, 
  QueryConstraint, serverTimestamp, setDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo, null, 2));
  throw new Error(JSON.stringify(errInfo));
}

export function useCollection<T>(collectionName: string, constraints: QueryConstraint[] = [], listen: boolean = true) {
  const [data, setData] = useState<(T & { id: string })[]>([]);
  const [loading, setLoading] = useState(listen);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!listen) {
      setLoading(false);
      return;
    }

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
        handleFirestoreError(err, OperationType.GET, collectionName);
        setError(err);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [collectionName, JSON.stringify(constraints), listen]);

  const add = async (item: Omit<T, 'id'>) => {
    try {
      return await addDoc(collection(db, collectionName), {
        ...item,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, collectionName);
    }
  };

  const update = async (id: string, item: Partial<T>) => {
    try {
      return await updateDoc(doc(db, collectionName, id), item as any);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${collectionName}/${id}`);
    }
  };

  const remove = async (id: string) => {
    try {
      return await deleteDoc(doc(db, collectionName, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${collectionName}/${id}`);
    }
  };

  return { data, loading, error, add, update, remove };
}

export function useDocument<T>(collectionName: string, documentId: string) {
  const [data, setData] = useState<(T & { id: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!documentId) return;
    const unsubscribe = onSnapshot(
      doc(db, collectionName, documentId),
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ ...(snapshot.data() as T), id: snapshot.id });
        }
        setLoading(false);
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, `${collectionName}/${documentId}`);
        setError(err);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [collectionName, documentId]);

  const save = async (item: Partial<T>) => {
    return await setDoc(doc(db, collectionName, documentId), item as any, { merge: true });
  };

  return { data, loading, error, save };
}
