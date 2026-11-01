from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('register/', views.register_user, name='register_user'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path('csrf/', views.get_csrf_token, name="csrf_token"),
    path('products/', views.get_product, name="product_list"),
    path('products/<int:pk>/', views.get_product_detail, name="product_detail"),
    path('categories/', views.get_category, name="category_list"),
    path('cart/', views.get_cart, name="get_cart"),
    path('cart/add/', views.add_to_cart, name="add_to_cart"),
    path('cart/remove/', views.remove_from_cart, name="remove_from_cart"),
    path('cart/update/', views.update_cart_item_quantity, name="update_cart_item_quantity"),
    path('orders/create/', views.create_order, name="create_order"),
]
