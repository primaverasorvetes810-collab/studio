"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Digite seu e-mail abaixo para fazer login em sua conta
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" placeholder="m@example.com" />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Senha</Label>
            <Link
              href="/reset-password"
              className="ml-auto inline-block text-sm underline"
            >
              Esqueceu sua senha?
            </Link>
          </div>
          <Input id="password" type="password" />
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>
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
