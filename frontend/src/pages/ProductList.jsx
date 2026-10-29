import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";

function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL || 'http://localhost:8000';
    useEffect(() => {
        fetch(`${BASE_URL}/api/products/`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setProducts(data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching products: ", error);
                setError(error.message);
                setLoading(false);
            });
    }, [BASE_URL]);
    if (loading) {
        return <main className="min-h-screen bg-gray-50 px-5 py-12 text-center text-gray-600">Loading products...</main>;
    }
    if (error) {
        return <main className="min-h-screen bg-gray-50 px-5 py-12 text-center text-red-700">Could not load products: {error}</main>;
    }
    return (
        <main className="min-h-screen bg-gray-50 text-gray-900">
            <header className="border-b border-gray-200 bg-white px-5 py-8">
                <div className="mx-auto max-w-7xl">
                    <p className="text-sm font-semibold uppercase text-emerald-700">Shop</p>
                    <h1 className="mt-1 text-3xl font-bold">Products</h1>
                    <p className="mt-2 text-sm text-gray-600">Browse our collection</p>
                </div>
            </header>
            <section className="mx-auto max-w-7xl px-5 py-8">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.length > 0 ? (
                        products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    ) : (
                        <p className="col-span-full text-center text-gray-500">No products available.</p>
                    )}
                </div>
            </section>
        </main>
    );
}

export default ProductList;