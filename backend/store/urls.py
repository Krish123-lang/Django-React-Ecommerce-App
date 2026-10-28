from django.urls import path
from . import views
urlpatterns = [
    path('products/', views.get_product, name="product_list"),
    path('categories/', views.get_category, name="category_list"),
]
