from django.urls import path
from . import views
urlpatterns = [
    path('products/', views.get_product, name="product_list"),
    path('products/<int:pk>/', views.get_product_detail, name="product_detail"),
    path('categories/', views.get_category, name="category_list"),
]
