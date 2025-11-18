"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth, initiateEmailSignIn } from "@/firebase";
import { FirebaseError } from "firebase/app";

const loginSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  password: z.string().min(1, { message: "A senha é obrigatória." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { toast } = useToast();
  const auth = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    form.clearErrors();
    try {
      await initiateEmailSignIn(auth, data.email, data.password);
      // A navegação ou atualização do estado da UI após o login bem-sucedido
      // é gerenciada pelo listener onAuthStateChanged no FirebaseProvider.
      toast({
        title: "Conexão Segura",
        description: "Estamos verificando suas credenciais com segurança.",
      });
    } catch (error: any) {
      let title = "Ocorreu um erro";
      let description = "Não foi possível fazer o login. Tente novamente mais tarde.";

      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            title = "Credenciais inválidas";
            description = "O e-mail ou a senha que você digitou está incorreto.";
            break;
          case 'auth/too-many-requests':
            title = "Muitas tentativas";
            description = "O acesso a esta conta foi temporariamente desativado. Tente novamente mais tarde.";
            break;
        }
      }
      
      toast({
        variant: "destructive",
        title: title,
        description: description,
      });
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Digite seu e-mail abaixo para fazer login em sua conta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input placeholder="m@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center">
                    <FormLabel>Senha</FormLabel>
                    <Link
                      href="/reset-password"
                      className="ml-auto inline-block text-sm underline"
                    >
                      Esqueceu sua senha?
                    </Link>
                  </div>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Entrando..." : "Login"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <div className="mt-4 text-center text-sm p-6 pt-0">
        Não tem uma conta?{" "}
        <Link href="/register" className="underline">
          Cadastre-se
        </Link>
      </div>
    </Card>
  );
}
