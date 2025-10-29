export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
};

export const products: Product[] = [
  {
    id: "prod_1",
    name: "Hambúrguer Clássico",
    description: "Um delicioso hambúrguer de carne com alface, tomate e nosso molho especial.",
    price: 25.50,
    image: "burger",
    stock: 50,
  },
  {
    id: "prod_2",
    name: "Pizza de Pepperoni",
    description: "Pizza grande de 40cm com generosas coberturas de pepperoni e mussarela.",
    price: 59.90,
    image: "pizza",
    stock: 30,
  },
  {
    id: "prod_3",
    name: "Batatas Fritas Douradas",
    description: "Uma porção crocante de nossas batatas fritas douradas e perfeitamente salgadas.",
    price: 12.00,
    image: "fries",
    stock: 100,
  },
  {
    id: "prod_4",
    name: "Refrigerante Gelado",
    description: "Uma lata refrescante do seu refrigerante favorito.",
    price: 5.00,
    image: "soda",
    stock: 200,
  },
  {
    id: "prod_5",
    name: "Salada Verde",
    description: "Uma mistura saudável de folhas verdes frescas, tomates cereja e pepinos.",
    price: 22.00,
    image: "salad",
    stock: 40,
  },
  {
    id: "prod_6",
    name: "Bolo de Chocolate",
    description: "Uma fatia rica e úmida de um bolo de chocolate decadente.",
    price: 18.00,
    image: "cake",
    stock: 25,
  },
  {
    id: "prod_7",
    name: "Sorvete de Baunilha",
    description: "Uma bola cremosa de sorvete de baunilha.",
    price: 10.00,
    image: "ice_cream",
    stock: 60,
  },
  {
    id: "prod_8",
    name: "Café Quente",
    description: "Uma xícara de café aromático recém-passado.",
    price: 8.00,
    image: "coffee",
    stock: 80,
  },
];
