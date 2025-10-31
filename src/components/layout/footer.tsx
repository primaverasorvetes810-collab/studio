import Link from "next/link";
import { PrimaveraLogo } from "@/components/icons";

export default function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 p-8 md:flex-row">
        <div className="flex flex-col items-center gap-4 md:items-start">
          <PrimaveraLogo className="h-8" />
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} Primavera Delivery. Todos os direitos reservados.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-center text-sm text-muted-foreground md:text-left">
          <Link href="/ajuda" className="hover:text-primary hover:underline">
            Ajuda
          </Link>
          <Link href="/acessibilidade" className="hover:text-primary hover:underline">
            Acessibilidade
          </Link>
           <Link href="#" className="hover:text-primary hover:underline">
            Termos de Serviço
          </Link>
          <Link href="#" className="hover:text-primary hover:underline">
            Política de Privacidade
          </Link>
        </div>
      </div>
    </footer>
  );
}
