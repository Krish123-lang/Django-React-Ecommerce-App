import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/useCart.js";
import {authFetch} from '../utils/auth.js';

function CheckoutPage() {
    const Base_URL = import.meta.env.VITE_DJANGO_BASE_URL || '';
    const navigate = useNavigate();
    const { clearCart } = useCart();

    const [form, setForm] = useState({
        name: "",
        address: "",
        phone: "",
        payment_method: "COD",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        try {
            const csrfResponse = await authFetch(`${Base_URL}/api/csrf/`, {
                credentials: "include",
            });
            const csrfData = await csrfResponse.json();
            if (!csrfResponse.ok || !csrfData.csrfToken) {
                throw new Error("Could not initialize a secure order request. Refresh the page and try again.");
            }

            const response = await authFetch(`${Base_URL}/api/orders/create/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfData.csrfToken,
                },
                body: JSON.stringify(form),
                credentials: "include",
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.error || data.detail || `Failed to place order (HTTP ${response.status})`);
            }
            setMessage("Order placed successfully!");
            clearCart();
            setTimeout(() => {
                navigate("/");
            }, 2000);
        } catch (error) {
            console.error("Error placing order: ", error);
            setMessage(`Error: ${error.message}`);
        }
        setLoading(false);
    }


    return (
        <main className="min-h-screen bg-stone-50 px-4 py-10 text-stone-900 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
                <div className="mb-8 border-b border-stone-200 pb-6">
                    <p className="mb-2 text-xs font-semibold uppercase text-emerald-800">Almost yours</p>
                    <h1 className="font-serif text-3xl font-semibold sm:text-4xl">Checkout</h1>
                </div>
                <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
                    <label htmlFor="checkout-name" className="grid gap-2 text-sm font-medium text-stone-800">
                        Full name
                        <input id="checkout-name" type="text" name="name" autoComplete="name" value={form.name} onChange={handleChange} required className="min-h-12 w-full border border-stone-300 bg-white px-4 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/20" />
                    </label>
                    <label htmlFor="checkout-phone" className="grid gap-2 text-sm font-medium text-stone-800">
                        Phone number
                        <input id="checkout-phone" type="tel" name="phone" autoComplete="tel" value={form.phone} onChange={handleChange} required className="min-h-12 w-full border border-stone-300 bg-white px-4 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/20" />
                    </label>
                    <label htmlFor="checkout-address" className="grid gap-2 text-sm font-medium text-stone-800 sm:col-span-2">
                        Full address
                        <textarea id="checkout-address" name="address" autoComplete="street-address" value={form.address} onChange={handleChange} required rows="4" className="w-full resize-y border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/20" />
                    </label>
                    <label htmlFor="checkout-payment" className="grid gap-2 text-sm font-medium text-stone-800 sm:col-span-2">
                        Payment method
                        <select id="checkout-payment" name="payment_method" value={form.payment_method} onChange={handleChange} className="min-h-12 w-full border border-stone-300 bg-white px-4 text-base text-stone-900 outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/20">
                            <option value="COD">Cash on Delivery</option>
                            <option value="onlinepayment">Online Payment</option>
                        </select>
                    </label>
                    <button type="submit" disabled={loading} className="min-h-12 w-full bg-emerald-900 px-6 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-wait disabled:bg-stone-500 sm:col-span-2">
                        {loading ? "Processing..." : "Place Order"}
                    </button>
                    {message && <p role="status" className={`text-sm sm:col-span-2 ${message.startsWith("Error:") ? "text-red-700" : "text-emerald-800"}`}>{message}</p>}
                </form>
            </div>
        </main>
    )
}
export default CheckoutPage;