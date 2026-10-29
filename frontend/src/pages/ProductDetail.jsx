// import { Link } from "react-router-dom";

// function ProductDetail({ product }) {
//     const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL || 'http://localhost:8000';
//     return (
//         <Link to={`/products/${product.id}`} className="bg-white rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-transform p-4">
//             <img src={product.image} alt={product.name} className="w-full h-56 object-cover rounded-lg mb-4" />
//             <h2 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h2>
//             <p className="text-gray-600 font-medium">${product.price}</p>
//             <p className="text-gray-500">{product.description}</p>
//         </Link>
//     )
// }

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

function ProductDetail() {
    const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL || 'http://localhost:8000';
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${BASE_URL}/api/products/${id}/`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch product details");
                }
                return response.json();
            })
            .then(data => {
                setProduct(data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching product: ", error);
                setError(error.message);
                setLoading(false);
            });
    }, [BASE_URL, id]);
    if (loading) {
        return <main className="min-h-screen bg-gray-50 px-5 py-12 text-center text-gray-600">Loading product details...</main>;
    }
    if (error) {
        return <main className="min-h-screen bg-gray-50 px-5 py-12 text-center text-red-700">Could not load product details: {error}</main>;
    }
    if (!product) {
        return <main className="min-h-screen bg-gray-50 px-5 py-12 text-center text-gray-600">Product not found.</main>;
    }
    const imageUrl = product.image ? new URL(product.image, `${BASE_URL}/`).toString() : null;

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-center py-10">
            <div className="bg-white shadow-lg rounded-2xl p-8 max-w-3xl w-full">
                <div className="flex flex-col md:flex-row gap-8">
                    {imageUrl ? (
                        <img src={imageUrl} alt={product.name} className="w-full md:w-1/2 h-64 object-contain rounded-lg bg-gray-50" />
                    ) : (
                        <div className="flex h-64 w-full md:w-1/2 items-center justify-center rounded-lg bg-gray-100 text-gray-500">No image available</div>
                    )}
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
                        <p className="text-2xl font-bold text-emerald-700 mb-4">${Number(product.price).toFixed(2)}</p>
                        <p className="text-gray-600 mb-6">{product.description}</p>
                        <button className="bg-emerald-700 text-white px-6 py-3 rounded-lg hover:bg-emerald-800 transition-colors">Add to Cart</button>
                    </div>
                </div>
                <button className="mt-6 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors" onClick={() => window.history.back()}>
                    Back to Products
                </button>
            </div>
        </div>
    )
}
export default ProductDetail;