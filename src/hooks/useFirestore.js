import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { 
  collection, query, where, orderBy as firestoreOrderBy, limit as firestoreLimit, 
  onSnapshot, doc, addDoc, setDoc, updateDoc, deleteDoc, getDoc as fsGetDoc 
} from 'firebase/firestore';

export const getDoc = async (collectionPath, docId) => {
  if (!docId) return null;
  const docRef = doc(db, collectionPath, docId);
  const docSnap = await fsGetDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

export const useCollection = (collectionPath, queries = [], orderByField, limitCount) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = collection(db, collectionPath);
    
    // queries is an array of { field, operator, value }
    if (queries && queries.length > 0) {
      queries.forEach(queryObj => {
        if (queryObj.value !== undefined && queryObj.value !== null) {
          q = query(q, where(queryObj.field, queryObj.operator, queryObj.value));
        }
      });
    }
    
    if (orderByField) {
      q = query(q, firestoreOrderBy(orderByField, 'desc'));
    }
    
    if (limitCount) {
      q = query(q, firestoreLimit(limitCount));
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const docs = [];
      querySnapshot.forEach((docSnap) => {
        docs.push({ id: docSnap.id, ...docSnap.data() });
      });
      setData(docs);
      setLoading(false);
    }, (err) => {
      console.error("useCollection onSnapshot error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [collectionPath, JSON.stringify(queries), orderByField, limitCount]);

  return { data, loading, error: null };
};

export const useDocument = (collectionPath, docId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!docId) {
      setLoading(false);
      return;
    }
    const docRef = doc(db, collectionPath, docId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setData({ id: docSnap.id, ...docSnap.data() });
      } else {
        setData(null);
      }
      setLoading(false);
    }, (err) => {
      console.error("useDocument onSnapshot error:", err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [collectionPath, docId]);

  return { data, loading, error: null };
};

export const useFirestoreAdd = (collectionPath) => {
  const [loading, setLoading] = useState(false);
  const add = async (docData, customId = null) => {
    setLoading(true);
    try {
      const finalId = customId || docData.id;
      if (finalId) {
        const docRef = doc(db, collectionPath, finalId);
        await setDoc(docRef, { ...docData, id: finalId, createdAt: Date.now() });
        setLoading(false);
        return { id: finalId };
      } else {
        const colRef = collection(db, collectionPath);
        const docRef = await addDoc(colRef, { ...docData, createdAt: Date.now() });
        // update the auto-generated id on the doc itself to match pattern
        await updateDoc(docRef, { id: docRef.id });
        setLoading(false);
        return { id: docRef.id };
      }
    } catch (err) {
      console.error("useFirestoreAdd error:", err);
      setLoading(false);
      throw err;
    }
  };
  return { add, loading, error: null };
};

export const useFirestoreUpdate = (collectionPath) => {
  const [loading, setLoading] = useState(false);
  const update = async (docId, updateData) => {
    if (!docId) return;
    setLoading(true);
    try {
      const docRef = doc(db, collectionPath, docId);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: Date.now()
      });
      setLoading(false);
    } catch (err) {
      console.error("useFirestoreUpdate error:", err);
      setLoading(false);
      throw err;
    }
  };
  return { update, loading, error: null };
};

export const useFirestoreDelete = (collectionPath) => {
  const [loading, setLoading] = useState(false);
  const remove = async (docId) => {
    if (!docId) return;
    setLoading(true);
    try {
      const docRef = doc(db, collectionPath, docId);
      await deleteDoc(docRef);
      setLoading(false);
    } catch (err) {
      console.error("useFirestoreDelete error:", err);
      setLoading(false);
      throw err;
    }
  };
  return { remove, loading, error: null };
};
