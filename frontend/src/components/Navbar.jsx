import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/useCart.js";

function Navbar() {
    const { cartItems } = useCart();
    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    return (
        <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 shadow-sm backdrop-blur">
            <nav aria-label="Main navigation" className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6 lg:px-8">
                <Link to="/" className="group flex shrink-0 items-center gap-3" aria-label="My Store home">
                    <span className="hidden size-10 items-center justify-center bg-emerald-900 font-serif text-xl text-white transition-colors group-hover:bg-emerald-800 sm:flex" aria-hidden="true">M</span>
                    <span className="font-serif text-lg font-semibold text-stone-900 sm:text-2xl">
                        My<span className="text-emerald-800">Store</span>
                    </span>
                </Link>

                <div className="flex items-center gap-1 sm:gap-4">
                    <NavLink
                        to="/products"
                        className={({ isActive }) => `px-2 py-2 text-sm font-semibold transition-colors sm:px-4 ${isActive ? "text-emerald-900 underline decoration-2 underline-offset-8" : "text-stone-600 hover:text-emerald-900"}`}
                    >
                        Products
                    </NavLink>

                    <NavLink
                        to="/cart"
                        aria-label={`Cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
                        className={({ isActive }) => `flex min-h-11 items-center gap-2 border px-2 text-sm font-semibold transition-colors sm:px-4 ${isActive ? "border-emerald-900 bg-emerald-900 text-white" : "border-stone-300 bg-white text-stone-800 hover:border-emerald-900 hover:text-emerald-900"}`}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="size-5" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2l2.1 10.1a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 8H6" />
                            <circle cx="10" cy="19" r="1" />
                            <circle cx="17" cy="19" r="1" />
                        </svg>
                        <span>Cart</span>
                        <span className="flex min-w-5 items-center justify-center bg-emerald-100 px-1 text-xs tabular-nums text-emerald-950">
                            {cartCount}
                        </span>
                    </NavLink>
                </div>
            </nav>
        </header>
    );
}
export default Navbar;