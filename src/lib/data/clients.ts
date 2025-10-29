export type Client = {
  id: string;
  name: string;
  email: string;
  registeredSince: string;
  totalOrders: number;
  totalSpent: number;
  dueAmount: number;
  lastOrderDate: string;
};

export const clients: Client[] = [
  {
    id: "CUST-001",
    name: "João Silva",
    email: "joao.silva@example.com",
    registeredSince: "2023-01-15",
    totalOrders: 5,
    totalSpent: 450.75,
    dueAmount: 0,
    lastOrderDate: "2023-10-26",
  },
  {
    id: "CUST-002",
    name: "Maria Oliveira",
    email: "maria.oliveira@example.com",
    registeredSince: "2023-03-22",
    totalOrders: 3,
    totalSpent: 220.50,
    dueAmount: 50.0,
    lastOrderDate: "2023-11-15",
  },
  {
    id: "CUST-003",
    name: "Carlos Pereira",
    email: "carlos.pereira@example.com",
    registeredSince: "2023-05-30",
    totalOrders: 8,
    totalSpent: 890.0,
    dueAmount: 120.25,
    lastOrderDate: "2024-01-05",
  },
  {
    id: "CUST-004",
    name: "Ana Costa",
    email: "ana.costa@example.com",
    registeredSince: "2023-07-11",
    totalOrders: 2,
    totalSpent: 95.20,
    dueAmount: 0,
    lastOrderDate: "2024-02-20",
  },
  {
    id: "CUST-005",
    name: "Pedro Martins",
    email: "pedro.martins@example.com",
    registeredSince: "2023-09-01",
    totalOrders: 12,
    totalSpent: 1540.80,
    dueAmount: 300.0,
    lastOrderDate: "2023-12-18",
  },
];
