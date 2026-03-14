'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
} from 'firebase/auth';
import { getClientSdks } from '@/firebase';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';

interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  birthDate: string;
  phone: string;
  address: string;
  neighborhood: string;
  city: string;
}

/** Inicia o login anônimo (sem bloqueio). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance);
}

/** Inicia o cadastro por e-mail/senha e retorna uma promessa que é resolvida após o usuário ser criado com sucesso. */
export function initiateEmailSignUp(authInstance: Auth, data: SignUpData): Promise<UserCredential> {
  const { firestore } = getClientSdks();
  // Retorna a promessa para que o chamador possa lidar com sucesso/erro
  return createUserWithEmailAndPassword(authInstance, data.email, data.password)
    .then(userCredential => {
      // Usuário criado, agora cria um documento na coleção 'users'
      const user = userCredential.user;
      const userRef = doc(firestore, 'users', user.uid);

      const userData = {
        fullName: data.fullName,
        email: user.email,
        registerTime: serverTimestamp(),
        birthDate: data.birthDate,
        phone: data.phone,
        address: data.address,
        neighborhood: data.neighborhood,
        city: data.city,
        photoURL: user.photoURL || '',
      };

      // Inicia a gravação do documento do usuário, mas não bloqueia a promessa principal
      setDoc(userRef, userData).catch(error => {
        // Se a criação do documento falhar, emite um erro global, mas não rejeita a promessa de cadastro
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: `users/${'user.uid'}`,
            operation: 'create',
            requestResourceData: userData,
          })
        );
      });
      
      // Retorna o userCredential para indicar que a autenticação foi bem-sucedida
      return userCredential;
    });
}

/** Inicia o login por e-mail/senha e retorna uma promessa. */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(authInstance, email, password);
}
