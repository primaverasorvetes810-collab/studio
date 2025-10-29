import productsData from './products.json';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
};

export const products: Product[] = productsData.products;
