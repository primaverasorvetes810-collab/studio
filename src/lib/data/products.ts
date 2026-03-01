import productsData from './products.json';

export type ProductGroup = {
  id: string;
  name: string;
  description?: string;
  subgroups?: string[];
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  groupId: string; // Adicionado para associar ao ProductGroup
  isActive?: boolean;
  subgroup?: string;
};

export const products: Product[] = productsData.products as Product[];
