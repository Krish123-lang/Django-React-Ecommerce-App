import { useState, useEffect } from 'react';
import { CartContext } from './cartContext.js';
const CART_STORAGE_KEY = 'ecommerce-cart';

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const savedCart = localStorage.getItem(CART_STORAGE_KEY);
            const parsedCart = savedCart ? JSON.parse(savedCart) : [];
            return Array.isArray(parsedCart) ? parsedCart : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product) => {
        setCartItems(items => {
            const existingItem = items.find(item => item.id === product.id);
            return existingItem
                ? items.map(item => item.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item)
                : [...items, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId) => {
        setCartItems(items => items.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        setCartItems(items => items.map(item =>
            item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
        ));
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity }}>
            {children}
        </CartContext.Provider>
    );
};

export default CartProvider;