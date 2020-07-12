import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const items = await AsyncStorage.getItem('@GoMarket:products');
      if (items) {
        setProducts(JSON.parse(items));
        // await AsyncStorage.setItem('@GoMarket:products', ''); //To reset if needed
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const addProduct = { ...product, quantity: 1 };
      setProducts([...products, addProduct]);
      await AsyncStorage.setItem(
        '@GoMarket:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const product = products.find(x => x.id === id);
      if (product) product.quantity += 1;

      setProducts([...products.filter(x => x.id !== id), product] as Product[]);
      await AsyncStorage.setItem(
        '@GoMarket:products',
        JSON.stringify(products),
      );

      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const product = products.find(x => x.id === id);
      if (product) {
        product.quantity -= 1;
        if (product.quantity > 0) {
          setProducts([...products.filter(x => x.id !== id), product]);
        } else {
          setProducts([...products.filter(x => x.id !== id)]);
        }
        await AsyncStorage.setItem(
          '@GoMarket:products',
          JSON.stringify(products),
        );
      }
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
