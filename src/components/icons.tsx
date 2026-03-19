import Image from 'next/image';
import type { HTMLAttributes } from "react";
import { cn } from '@/lib/utils';

export function PrimaveraLogo(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={cn("relative w-[111px]", props.className)}>
      <Image
        src="https://res.cloudinary.com/dh88bfqo0/image/upload/v1773960005/logo_primavera_delivery-removebg-preview_qiaphb.png"
        alt="Primavera Delivery Logo"
        width={111}
        height={32}
        priority
        className="object-contain"
      />
    </div>
  );
}
