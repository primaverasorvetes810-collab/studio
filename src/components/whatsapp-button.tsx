'use client';

import Link from "next/link";
import Image from "next/image";

export default function WhatsAppButton() {
  return (
    <Link 
      href="https://api.whatsapp.com/send?phone=5515996443440"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-30 group"
      aria-label="Entre em contato via WhatsApp"
    >
      <div className="relative w-20 h-20 transition-transform duration-300 group-hover:scale-110">
        <Image
          src="https://res.cloudinary.com/dh88bfqo0/image/upload/v1773012156/botao-whatsapp-do-prime-gourmet_agjtio.png"
          alt="Entre em contato via WhatsApp"
          fill
          className="object-contain"
        />
      </div>
    </Link>
  );
}
