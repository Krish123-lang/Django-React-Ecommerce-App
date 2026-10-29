import { Link } from "react-router-dom";
import { useCart } from "../context/useCart.js";

function CartPage() {
    const { cartItems, removeFromCart, updateQuantity } = useCart();
    const baseUrl = import.meta.env.VITE_DJANGO_BASE_URL || "http://localhost:8000";
    const total = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <main className="min-h-screen bg-stone-50 px-4 py-10 text-stone-900 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-6">
                    <div>
                        <p className="mb-2 text-xs font-semibold uppercase text-emerald-800">Your selection</p>
                        <h1 className="font-serif text-3xl font-semibold sm:text-4xl">Shopping cart</h1>
                    </div>
                    <Link to="/products" className="text-sm font-semibold text-emerald-900 underline decoration-stone-300 underline-offset-4 transition hover:decoration-emerald-900">
                        Continue shopping
                    </Link>
                </div>

                {cartItems.length === 0 ? (
                    <section className="py-16 text-center">
                        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-900">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-8" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2l2.1 10.1a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 8H6" />
                                <circle cx="10" cy="19" r="1" />
                                <circle cx="17" cy="19" r="1" />
                            </svg>
                        </div>
                        <h2 className="font-serif text-2xl font-semibold">Your cart is empty</h2>
                        <p className="mt-2 text-sm text-stone-600">Find something you love and it will be waiting here.</p>
                        <Link to="/products" className="mt-6 inline-flex min-h-11 items-center justify-center bg-emerald-900 px-5 text-sm font-semibold text-white transition hover:bg-emerald-800">
                            Browse products
                        </Link>
                    </section>
                ) : (
                    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
                        <section aria-label="Cart items" className="divide-y divide-stone-200">
                            {cartItems.map(item => {
                                const imageUrl = item.image ? new URL(item.image, `${baseUrl}/`).toString() : null;
                                return (
                                    <article key={item.id} className="flex flex-col gap-5 py-6 sm:flex-row sm:items-center">
                                        <div className="relative flex size-28 shrink-0 items-center justify-center overflow-hidden bg-white sm:size-32">
                                            {imageUrl ? (
                                                <img src={imageUrl} alt={item.name} className="size-full object-contain p-2" onError={event => { event.currentTarget.style.display = "none"; }} />
                                            ) : (
                                                <span className="px-2 text-center text-xs text-stone-500">Image unavailable</span>
                                            )}
                                        </div>
                                        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-4">
                                            <div className="min-w-0">
                                                <h2 className="truncate font-serif text-lg font-semibold">{item.name}</h2>
                                                <p className="mt-1 text-sm text-stone-600">${Number(item.price).toFixed(2)} each</p>
                                                <button type="button" className="mt-3 text-sm font-medium text-stone-500 underline decoration-stone-300 underline-offset-4 hover:text-red-700 hover:decoration-red-300" onClick={() => removeFromCart(item.id)}>
                                                    Remove
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-10 items-center border border-stone-300" aria-label={`Quantity for ${item.name}`}>
                                                    <button type="button" aria-label={`Decrease ${item.name} quantity`} className="flex size-10 items-center justify-center text-lg text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:text-stone-300" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                                                        −
                                                    </button>
                                                    <span className="w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">{item.quantity}</span>
                                                    <button type="button" aria-label={`Increase ${item.name} quantity`} className="flex size-10 items-center justify-center text-lg text-stone-700 transition hover:bg-stone-100" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                                        +
                                                    </button>
                                                </div>
                                                <p className="w-20 text-right font-semibold tabular-nums">${(Number(item.price) * item.quantity).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </section>

                        <aside className="h-fit border-t border-stone-300 pt-6 lg:border-l lg:border-t-0 lg:pl-8">
                            <h2 className="font-serif text-xl font-semibold">Order summary</h2>
                            <div className="mt-5 space-y-3 border-b border-stone-200 pb-5 text-sm">
                                <div className="flex justify-between gap-4 text-stone-600">
                                    <span>Items ({itemCount})</span>
                                    <span className="tabular-nums">${total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between gap-4 text-stone-600">
                                    <span>Shipping</span>
                                    <span>Calculated at checkout</span>
                                </div>
                            </div>
                            <div className="flex justify-between gap-4 py-5 font-semibold">
                                <span>Subtotal</span>
                                <span className="tabular-nums">${total.toFixed(2)}</span>
                            </div>
                            <p className="text-xs leading-5 text-stone-500">Shipping and taxes are confirmed when checkout is available.</p>
                        </aside>
                    </div>
                )}
            </div>
        </main>
    );
}
export default CartPage;