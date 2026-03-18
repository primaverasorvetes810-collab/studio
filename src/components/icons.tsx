
import Image from 'next/image';
import type { HTMLAttributes } from "react";

export function PrimaveraLogo(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={`relative w-32 ${props.className || ''}`}>
      <Image
        src="https://res.cloudinary.com/dh88bfqo0/image/upload/v1773874955/logo_primavera_delivery_jcnww8.png"
        alt="Primavera Delivery Logo"
        fill
        priority
        className="object-contain"
      />
    </div>
  );
}
