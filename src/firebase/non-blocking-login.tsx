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

/** Inicia o cadastro por e-mail/senha (sem bloqueio). */
export function initiateEmailSignUp(authInstance: Auth, data: SignUpData): void {
  const { firestore } = getClientSdks();
  createUserWithEmailAndPassword(authInstance, data.email, data.password)
    .then(userCredential => {
      // Usuário criado, agora cria um documento na coleção 'users'
      const user = userCredential.user;
      const userRef = doc(firestore, 'users', user.uid);
      // Usa setDoc para criar o documento do usuário. Não será aguardado aqui
      // mas será tratado pelo Firestore em segundo plano.
      // Erros serão capturados pelo manipulador global se as regras falharem.
      const userData = {
        fullName: data.fullName,
        email: user.email,
        registerTime: serverTimestamp(),
        birthDate: data.birthDate,
        phone: data.phone,
        address: data.address,
        neighborhood: data.neighborhood,
        city: data.city,
      };
      setDoc(userRef, userData).catch(error => {
        // Este é um failsafe. Se a criação do documento do usuário falhar devido
        // a permissões, o manipulador de erro global irá capturá-lo.
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: `users/${user.uid}`,
            operation: 'create',
            requestResourceData: userData,
          })
        );
      });
    })
    .catch(error => {
      // Erros de autenticação (como email-already-in-use) já são lançados por onAuthStateChanged
      // e serão capturados pelo FirebaseErrorListener. Não precisamos reemitir.
    });
}

/** Inicia o login por e-mail/senha e retorna uma promessa. */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(authInstance, email, password);
}
