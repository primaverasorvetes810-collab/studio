
import Image from 'next/image';
import type { HTMLAttributes } from "react";

export function PrimaveraLogo(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={`relative w-[111px] ${props.className || ''}`}>
      <Image
        src="https://res.cloudinary.com/dh88bfqo0/image/upload/v1773012860/Design_sem_nome-removebg-preview_je8igb.png"
        alt="Primavera Delivery Logo"
        fill
        priority
        className="object-contain"
      />
    </div>
  );
}
