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
    name: "Classic Burger",
    description: "A delicious all-beef patty with lettuce, tomato, and our special sauce.",
    price: 25.50,
    image: "burger",
    stock: 50,
  },
  {
    id: "prod_2",
    name: "Pepperoni Pizza",
    description: "Large 16-inch pizza with generous toppings of pepperoni and mozzarella.",
    price: 59.90,
    image: "pizza",
    stock: 30,
  },
  {
    id: "prod_3",
    name: "Golden Fries",
    description: "A crispy side of our perfectly salted golden french fries.",
    price: 12.00,
    image: "fries",
    stock: 100,
  },
  {
    id: "prod_4",
    name: "Cold Soda",
    description: "A refreshing can of your favorite soda.",
    price: 5.00,
    image: "soda",
    stock: 200,
  },
  {
    id: "prod_5",
    name: "Garden Salad",
    description: "A healthy mix of fresh greens, cherry tomatoes, and cucumbers.",
    price: 22.00,
    image: "salad",
    stock: 40,
  },
  {
    id: "prod_6",
    name: "Chocolate Cake",
    description: "A rich and moist slice of decadent chocolate cake.",
    price: 18.00,
    image: "cake",
    stock: 25,
  },
  {
    id: "prod_7",
    name: "Vanilla Ice Cream",
    description: "A single scoop of creamy vanilla ice cream.",
    price: 10.00,
    image: "ice_cream",
    stock: 60,
  },
  {
    id: "prod_8",
    name: "Hot Coffee",
    description: "A freshly brewed cup of hot aromatic coffee.",
    price: 8.00,
    image: "coffee",
    stock: 80,
  },
];
