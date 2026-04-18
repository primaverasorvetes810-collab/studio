
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
import { useAuth, initiateEmailSignUp } from "@/firebase";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { allowedNeighborhoods } from "@/lib/data/shipping-neighborhoods";
import { ScrollArea } from "@/components/ui/scroll-area";

const registerSchema = z.object({
  fullName: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
  birthDate: z.string().min(1, { message: "A data de nascimento é obrigatória." }),
  phone: z.string().min(1, { message: "O telefone é obrigatório." }),
  address: z.string().min(1, { message: "O endereço é obrigatório." }),
  neighborhood: z.string().min(1, { message: "O bairro é obrigatório." }),
  city: z.string().min(1, { message: "A cidade é obrigatória." }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function LoginPage() {
  const { toast } = useToast();
  const auth = useAuth();
  const router = useRouter();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      birthDate: "",
      phone: "",
      address: "",
      neighborhood: "",
      city: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await initiateEmailSignUp(auth, data);
      toast({
        title: "Conta Criada!",
        description: "Seu cadastro foi realizado com sucesso. Redirecionando...",
      });
      router.push("/");
    } catch (error) {
      if (error instanceof FirebaseError && error.code === 'auth/email-already-in-use') {
        toast({
          variant: "destructive",
          title: "Erro no Cadastro",
          description: "Este e-mail já está em uso por outra conta.",
        });
        form.setError("email", { type: "manual", message: "Este e-mail já está em uso." });
      } else {
        toast({
          variant: "destructive",
          title: "Erro no Cadastro",
          description: "Ocorreu um erro inesperado ao criar sua conta.",
        });
        console.error("Registration error:", error);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl text-primary">Falta pouco para começar a pedir</CardTitle>
        <CardDescription className="text-lg">
          Diga só algumas informações sobre você.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Qual é o seu nome completo?</FormLabel>
                  <FormControl>
                    <Input placeholder="Usuário Primavera" {...field} className="text-lg" />
                  </FormControl>
                  <FormMessage className="text-base" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Digite seu E-mail</FormLabel>
                  <FormControl>
                    <Input placeholder="m@example.com" {...field} className="text-lg" />
                  </FormControl>
                  <FormMessage className="text-base" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Digite a senha</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} className="text-lg" />
                  </FormControl>
                  <FormMessage className="text-base" />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Quando você nasceu?</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} className="text-lg" />
                  </FormControl>
                  <FormMessage className="text-base" />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Digite o seu telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(11) 99999-9999" {...field} className="text-lg" />
                  </FormControl>
                  <FormMessage className="text-base" />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Digite seu endereço</FormLabel>
                  <FormControl>
                    <Input placeholder="Rua das Flores, 123" {...field} className="text-lg" />
                  </FormControl>
                  <FormMessage className="text-base" />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="neighborhood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Selecione o bairro onde você mora</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger className="text-lg">
                            <SelectValue placeholder="Selecione seu bairro" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <ScrollArea className="h-72">
                              {allowedNeighborhoods.map((neighborhood) => (
                                  <SelectItem key={neighborhood} value={neighborhood} className="text-base">
                                  {neighborhood}
                                  </SelectItem>
                              ))}
                          </ScrollArea>
                        </SelectContent>
                    </Select>
                  <FormMessage className="text-base" />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Digite sua cidade</FormLabel>
                  <FormControl>
                    <Input placeholder="São Paulo" {...field} className="text-lg" />
                  </FormControl>
                  <FormMessage className="text-base" />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full text-lg" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Criando..." : "Criar uma conta"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <div className="mt-4 text-center text-lg p-6 pt-0">
        Já tem uma conta?{" "}
        <Link href="/register" className="underline text-blue-600">
          Login
        </Link>
      </div>
    </Card>
  );
}
