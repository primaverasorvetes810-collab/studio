import PageHeader from '@/components/page-header';
import { ProductGrid } from '@/components/product-grid';
import { getFirebaseAdmin } from '@/firebase/admin';
import { Product } from '@/lib/data/products';
import { collection, getDocs } from 'firebase/firestore';

async function getProducts() {
  // Use the admin SDK on the server
  const { firestore } = getFirebaseAdmin();
  const productsCollection = collection(firestore, 'products');
  try {
    const snapshot = await getDocs(productsCollection);
    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as Product[];
  } catch (error) {
    console.error("Error fetching products on server:", error);
    // In a real app, you'd want more robust error handling.
    // For now, we'll return an empty array on error.
    return [];
  }
}

// Ensure the page is dynamically rendered
export const revalidate = 0;

export default async function Home() {
  const initialProducts = await getProducts();

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Nossos Produtos"
        description="Navegue pela nossa seleção de itens deliciosos."
      />
      <ProductGrid initialProducts={initialProducts} />
    </div>
  );
}
