import { PrimaveraLogo } from "@/components/icons";

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto flex flex-col items-center justify-center gap-4 p-8 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <PrimaveraLogo className="h-6 w-6 text-primary" />
          <p className="text-center text-sm leading-loose md:text-left">
            © {new Date().getFullYear()} Primavera Delivery. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
