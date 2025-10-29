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

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Cadastre-se</CardTitle>
        <CardDescription>
          Digite suas informações para criar uma conta
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
            <Label htmlFor="full-name">Nome completo</Label>
            <Input id="full-name" placeholder="Usuário Primavera" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Senha</Label>
          <Input id="password" type="password" />
        </div>
        <Button type="submit" className="w-full">
          Criar uma conta
        </Button>
      </CardContent>
      <div className="mt-4 text-center text-sm p-6 pt-0">
        Já tem uma conta?{" "}
        <Link href="/login" className="underline">
          Login
        </Link>
      </div>
    </Card>
  );
}
