'use client';

import { useDoc, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

interface AdminRole {
    email: string;
}

export function useAdmin() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const adminRoleRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'roles_admin', user.uid);
    }, [user, firestore]);

    const { data: adminRole, isLoading: isAdminRoleLoading } = useDoc<AdminRole>(adminRoleRef);
    
    return {
        isAdmin: !!adminRole, // Se o documento existir, o usuário é admin
        isLoading: isUserLoading || isAdminRoleLoading,
    };
}
