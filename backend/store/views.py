from django.middleware.csrf import get_token
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .models import Product, Category, Cart, CartItem, Order, OrderItem
from .serializers import ProductSerializer, CategorySerializer, CartSerializer, CartItemSerializer, RegisterSerializer, UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from rest_framework import status


@api_view(['GET'])
def get_csrf_token(request):
    return Response({"csrfToken": get_token(request)})


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
@permission_classes([IsAuthenticated])
def get_cart(request):
    cart = _get_cart(request)
    serializer = CartSerializer(cart)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    product_id = request.data.get('product_id')
    if not product_id:
        return Response({"error": "Product ID is required"}, status=400)
    try:
        product = Product.objects.get(id=product_id)
    except (Product.DoesNotExist, ValueError, TypeError):
        return Response({"error": "Product not found"}, status=404)

    cart = _get_cart(request)
    item, created = CartItem.objects.get_or_create(cart=cart, product=product)

    if not created:
        item.quantity += 1
        item.save()
    return Response({"message": "Product added to cart", "cart": CartSerializer(cart).data})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request):
    item_id = request.data.get('item_id')
    if not item_id:
        return Response({"error": "Item ID is required"}, status=400)

    cart = _get_cart(request)
    deleted, _ = CartItem.objects.filter(id=item_id, cart=cart).delete()
    if not deleted:
        return Response({"error": "Cart item not found"}, status=404)
    return Response({"message": "Item removed from cart", "cart": CartSerializer(cart).data})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_cart_item_quantity(request):
    item_id = request.data.get('item_id')
    quantity = request.data.get('quantity')
    cart = _get_cart(request)

    if item_id is None or quantity is None:
        return Response({"error": "Item ID and quantity are required"}, status=400)

    try:
        quantity = int(quantity)
    except (ValueError, TypeError):
        return Response({"error": "Quantity must be a positive integer"}, status=400)
    if quantity < 1:
        return Response({"error": "Quantity must be at least 1"}, status=400)

    try:
        item = CartItem.objects.get(id=item_id, cart=cart)
    except (CartItem.DoesNotExist, ValueError, TypeError):
        return Response({"error": "Cart item not found"}, status=404)

    item.quantity = quantity
    item.save(update_fields=["quantity"])
    return Response(CartSerializer(cart).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    try:
        data = request.data
        name = data.get('name')
        address = data.get('address')
        phone = data.get('phone')
        payment_method = data.get('payment_method', 'COD')
        
        #validate phone number
        if not phone.isdigit() or len(phone) < 10:
            return Response({'error': 'Invalid phone number'}, status=400)
        
        #Get user cart
        cart = _get_cart(request)
        if not cart or not cart.items.exists():
            return Response({'error': 'Cart is empty'}, status=400)
        total = sum(float(item.product.price) * item.quantity for item in cart.items.all())
        order = Order.objects.create(user=request.user, total_amount=total)
        for item in cart.items.all():
            OrderItem.objects.create(order=order, product=item.product, quantity=item.quantity, price=item.product.price)
        
        # Clear the cart after order creation
        cart.items.all().delete()
        return Response({'message': 'Order created successfully', 'order_id': order.id}, status=201)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)
        
        
    '''try:
        data = request.data
        name = data.get('name')
        address = data.get('address')
        phone = data.get('phone')
        payment_method = data.get('payment_method')
        cart = _get_cart(request)

        if not cart or not cart.items.exists():
            return Response({'error': 'Cart is empty'}, status=400)
        total = sum(float(item.product.price) *
                    item.quantity for item in cart.items.all())

        # create order
        order = Order.objects.create(
            user=request.user if request.user.is_authenticated else None,
            total_amount=total,
        )

        # Create order items
        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price
            )

        # Clear the cart
        cart.items.all().delete()
        return Response({'message': 'Order created successfully', 'order_id': order.id}, status=201)

    except Exception as e:
        return Response({'error': str(e)}, status=500)
    '''

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({"message": "User created successfully", "user": UserSerializer(user).data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)