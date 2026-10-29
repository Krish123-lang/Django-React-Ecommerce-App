from django.contrib import admin

# Register your models here.
from .models import Product, Order, Category, OrderItem, UserProfile, Cart, CartItem

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug': ('name', )}
    list_display = ('name', 'slug', 'id')

admin.site.register(Product)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(UserProfile)
admin.site.register(CartItem)
