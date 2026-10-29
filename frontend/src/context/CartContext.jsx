import { useState, useEffect, useCallback, useRef } from 'react';
import { CartContext } from './cartContext.js';

export const CartProvider = ({ children }) => {
    const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL || '';
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const cartReady = useRef(Promise.resolve());

    const normalizeCart = useCallback((cart) => {
        const items = (cart.items || []).map(item => ({
            id: item.id,
            productId: item.product,
            name: item.product_name,
            price: Number(item.product_price),
            image: item.product_image,
            quantity: item.quantity,
        }));
        setCartItems(items);
        setTotal(Number(cart.total) || 0);
    }, []);

    const request = useCallback(async (path, options = {}) => {
        const method = (options.method || 'GET').toUpperCase();
        let csrfToken;
        if (!['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(method)) {
            const csrfResponse = await fetch(`${BASE_URL}/api/csrf/`, {
                credentials: 'include',
            });
            const csrfData = await csrfResponse.json();
            if (!csrfResponse.ok || !csrfData.csrfToken) {
                throw new Error('Could not initialize secure cart requests. Refresh the page and try again.');
            }
            csrfToken = csrfData.csrfToken;
        }

        const response = await fetch(`${BASE_URL}${path}`, {
            credentials: 'include',
            ...options,
            headers: {
                ...(options.body ? { 'Content-Type': 'application/json' } : {}),
                ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
                ...options.headers,
            },
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || data.detail || 'Cart request failed');
        }
        return data;
    }, [BASE_URL]);

    const fetchCartFromBackend = useCallback(async () => {
        try {
            const cart = await request('/api/cart/');
            normalizeCart(cart);
            setError('');
        }
        catch (error) {
            console.error('Error fetching cart from backend:', error);
            setError(error.message || 'Could not load your cart.');
        } finally {
            setLoading(false);
        }
    }, [normalizeCart, request]);

    useEffect(() => {
        // State updates happen after the backend request resolves; the rule cannot see through the callback.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        cartReady.current = fetchCartFromBackend();
    }, [fetchCartFromBackend]);

    const addToCart = async (product) => {
        try {
            await cartReady.current;
            setError('');
            const response = await request('/api/cart/add/', {
                method: 'POST',
                body: JSON.stringify({ product_id: product.id })
            });
            normalizeCart(response.cart);
            return true;
        } catch (error) {
            console.error('Error adding to cart:', error);
            setError(error.message || 'Could not add this product to your cart.');
            return false;
        }
    };

    const removeFromCart = async (cartItemId) => {
        try {
            await cartReady.current;
            setError('');
            const response = await request('/api/cart/remove/', {
                method: 'POST',
                body: JSON.stringify({ item_id: cartItemId })
            });
            normalizeCart(response.cart);
        } catch (error) {
            console.error('Error removing from cart:', error);
            setError(error.message || 'Could not remove this item.');
        }
    };

    const updateQuantity = async (cartItemId, quantity) => {
        if (quantity < 1) {
            await removeFromCart(cartItemId);
            return;
        }
        try {
            await cartReady.current;
            setError('');
            const cart = await request('/api/cart/update/', {
                method: 'POST',
                body: JSON.stringify({ item_id: cartItemId, quantity })
            });
            normalizeCart(cart);
        } catch (error) {
            console.error('Error updating quantity:', error);
            setError(error.message || 'Could not update item quantity.');
        }
    };

    return (
        <CartContext.Provider value={{ cartItems, total, loading, error, addToCart, removeFromCart, updateQuantity, refreshCart: fetchCartFromBackend }}>
            {children}
        </CartContext.Provider>
    );
};

export default CartProvider;