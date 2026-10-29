from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Product, Category, Cart, CartItem
from .serializers import ProductSerializer, CategorySerializer, CartSerializer, CartItemSerializer


def _get_cart(request):
    if request.user.is_authenticated:
        return Cart.objects.get_or_create(user=request.user)[0]

    if request.session.session_key is None:
        request.session.create()
    return Cart.objects.get_or_create(
        session_key=request.session.session_key,
        defaults={"user": None},
    )[0]


@api_view(['GET'])
def get_product(request):
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def get_category(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def get_product_detail(request, pk):
    try:
        product = Product.objects.get(id=pk)
        serializer = ProductSerializer(product, context={'request': request})
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=404)

@api_view(['GET'])
def get_cart(request):
    cart = _get_cart(request)
    serializer = CartSerializer(cart)
    return Response(serializer.data)

@api_view(['POST'])
def add_to_cart(request):
    product_id = request.data.get('product_id')
    product = Product.objects.get(id=product_id)        
    cart = _get_cart(request)
    item, created = CartItem.objects.get_or_create(cart=cart, product=product)
    
    if not created:
        item.quantity += 1
        item.save()
    return Response({"message": "Product added to cart", "cart": CartSerializer(cart).data})

@api_view(['POST'])
def remove_from_cart(request):
    item_id=request.data.get('item_id')
    cart = _get_cart(request)
    CartItem.objects.filter(id=item_id, cart=cart).delete()
    return Response({"message": "Item removed from cart"})

@api_view(['POST'])
def update_cart_item_quantity(request):
    item_id = request.data.get('item_id')
    quantity = request.data.get('quantity')
    cart = _get_cart(request)
    
    if not item_id or not quantity:
        return Response({"error": "Item ID and quantity are required"}, status=400)
    try:
        item = CartItem.objects.get(id=item_id)
        if int(quantity)<1:
            item.delete()
            return Response({'error': 'Qunatity must be at least 1. Item removed from cart.'}, status=400)
        item.quantity = quantity
        item.save()
        serializer = CartSerializer(cart)
        return Response(serializer.data)
    except CartItem.DoesNotExist:
        return Response({"error": "Cart item not found"}, status=404)