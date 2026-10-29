import {Link} from "react-router-dom";

function ProductCard({ product }) {
    const BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL || 'http://localhost:8000';
    const imageUrl = product.image ? new URL(product.image, `${BASE_URL}/`).toString() : null;

    return (
        <Link to={`/products/${product.id}`} className="h-full">
            <article className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md cursor-pointer">
                <div className="relative aspect-[4/3] w-full bg-gray-100 p-3">
                    <div className="flex h-full items-center justify-center rounded-md bg-gray-50 text-sm text-gray-500">
                        No image available
                    </div>
                    {imageUrl && (
                        <img
                            src={imageUrl}
                            alt={product.name}
                            loading="lazy"
                            onError={(event) => { event.currentTarget.style.display = 'none'; }}
                            className="absolute inset-3 h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)] rounded-md object-contain"
                        />
                    )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                    <h2 className="line-clamp-2 text-base font-semibold text-gray-900">{product.name}</h2>
                    <p className="mt-auto pt-2 text-lg font-semibold text-emerald-700">${product.price}</p>
                </div>
            </article>
        </Link>
    )
}
export default ProductCard;