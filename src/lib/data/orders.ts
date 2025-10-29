import { products, type Product } from "./products";

export type OrderItem = {
  product: Product;
  quantity: number;
  price: number;
};

export type Order = {
  id: string;
  date: string;
  status: "Pending" | "Paid" | "Shipped" | "Delivered" | "Canceled" | "Overdue";
  total: number;
  items: OrderItem[];
  paymentMethod: "Pix" | "Dinheiro" | "Cartão de Crédito ou Débito";
};

export const orders: Order[] = [
  {
    id: "ORD-001",
    date: "2023-10-26",
    status: "Delivered",
    total: 85.4,
    items: [
      { product: products[0], quantity: 1, price: products[0].price },
      { product: products[1], quantity: 1, price: products[1].price },
    ],
    paymentMethod: "Cartão de Crédito ou Débito",
  },
  {
    id: "ORD-002",
    date: "2023-11-15",
    status: "Paid",
    total: 30.5,
    items: [
      { product: products[0], quantity: 1, price: products[0].price },
      { product: products[3], quantity: 1, price: products[3].price },
    ],
    paymentMethod: "Pix",
  },
  {
    id: "ORD-003",
    date: "2024-01-05",
    status: "Overdue",
    total: 12.0,
    items: [{ product: products[2], quantity: 1, price: products[2].price }],
    paymentMethod: "Dinheiro",
  },
  {
    id: "ORD-004",
    date: "2024-02-20",
    status: "Pending",
    total: 23.0,
    items: [
        { product: products[7], quantity: 1, price: products[7].price },
        { product: products[5], quantity: 1, price: products[5].price },
    ],
    paymentMethod: "Pix",
  },
];
