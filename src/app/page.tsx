import { ProductCard } from "@/components/product-card";
import { products } from "@/lib/data/products";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import PageHeader from "@/components/page-header";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Our Products"
        description="Browse our selection of delicious items."
      />
      <div className="mb-8 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search products..." className="pl-10" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
