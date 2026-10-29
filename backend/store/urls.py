from django.urls import path
from . import views
urlpatterns = [
    path('products/', views.get_product, name="product_list"),
    path('products/<int:pk>/', views.get_product_detail, name="product_detail"),
    path('categories/', views.get_category, name="category_list"),
    path('cart/', views.get_cart, name="get_cart"),
    path('cart/add/', views.add_to_cart, name="add_to_cart"),
    path('cart/remove/', views.remove_from_cart, name="remove_from_cart"),
    path('cart/update/', views.update_cart_item_quantity, name="update_cart_item_quantity"),
]
