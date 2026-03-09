import { IceCream2, CupSoda, Pizza, Beef, Cake, Coffee, Package, type Icon } from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  categoryName: string;
}

export function CategoryIcon({ categoryName, ...props }: CategoryIconProps) {
  const name = categoryName.toLowerCase();

  let IconComponent: Icon = Package;

  if (name.includes('açaí') || name.includes('sorvete')) {
    IconComponent = IceCream2;
  } else if (name.includes('bebida')) {
    IconComponent = CupSoda;
  } else if (name.includes('pizza')) {
    IconComponent = Pizza;
  } else if (name.includes('lanche') || name.includes('hambúrguer')) {
    IconComponent = Beef;
  } else if (name.includes('doce') || name.includes('bolo')) {
    IconComponent = Cake;
  } else if (name.includes('café')) {
    IconComponent = Coffee;
  }

  return <IconComponent {...props} />;
}
