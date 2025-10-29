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
import { PrimaveraLogo } from "@/components/icons";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
                <PrimaveraLogo className="h-10 w-10 text-primary" />
            </div>
          <CardTitle className="text-2xl">Acesso Administrativo</CardTitle>
          <CardDescription>
            Digite a senha para acessar o painel de administração.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" />
          </div>
          <Button type="submit" className="w-full" asChild>
            <Link href="/admin/dashboard">Ir para o Painel</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
