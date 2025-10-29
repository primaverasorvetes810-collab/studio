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

export default function ResetPasswordPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Redefinir Senha</CardTitle>
        <CardDescription>
          Digite seu e-mail para receber um link de redefinição de senha.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" placeholder="m@example.com" />
        </div>
        <Button type="submit" className="w-full">
          Enviar Link de Redefinição
        </Button>
      </CardContent>
      <div className="mt-4 text-center text-sm p-6 pt-0">
        Lembrou sua senha?{" "}
        <Link href="/login" className="underline">
          Login
        </Link>
      </div>
    </Card>
  );
}
