from django.test import TestCase
from rest_framework.test import APIClient
from .models import Cart, CartItem, Category, Product


class GuestCartTests(TestCase):
	def setUp(self):
		category = Category.objects.create(name="Books", slug="books")
		self.product = Product.objects.create(
			name="Test book",
			price="12.50",
			category=category,
		)

	def test_guest_cart_is_created_and_reused_for_session(self):
		client = APIClient()

		first_response = client.get("/api/cart/")
		second_response = client.get("/api/cart/")

		self.assertEqual(first_response.status_code, 200)
		self.assertEqual(second_response.status_code, 200)
		self.assertEqual(first_response.data["id"], second_response.data["id"])
		self.assertNotIn("session_key", first_response.data)
		self.assertEqual(Cart.objects.count(), 1)
		self.assertIsNone(Cart.objects.get().user_id)

	def test_guest_carts_are_isolated_between_sessions(self):
		first_response = APIClient().get("/api/cart/")
		second_response = APIClient().get("/api/cart/")

		self.assertNotEqual(first_response.data["id"], second_response.data["id"])

	def test_add_to_cart_uses_guest_session_cart(self):
		client = APIClient()

		response = client.post(
			"/api/cart/add/",
			{"product_id": self.product.id},
			format="json",
		)

		self.assertEqual(response.status_code, 200)
		self.assertEqual(Cart.objects.count(), 1)
		self.assertEqual(CartItem.objects.get().cart_id, response.data["cart"]["id"])
