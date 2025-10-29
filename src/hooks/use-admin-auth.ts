'use client';

import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';

export function useAdminAuth() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const adminDocRef = useMemoFirebase(() => {
    if (!user?.uid || !firestore) return null;
    return doc(firestore, 'roles_admin', user.uid);
  }, [user?.uid, firestore]);

  const { data: adminDoc, isLoading: isAdminLoading } = useDoc(adminDocRef);

  const isAdmin = adminDoc !== null;
  const isLoading = isUserLoading || (user ? isAdminLoading : false);

  return { user, isAdmin, isLoading };
}
