from django.test import TestCase
from django.contrib.auth.models import User
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
		self.assertEqual(response.data["cart"]["items"][0]["product_name"], self.product.name)

	def test_add_to_cart_accepts_configured_frontend_origin(self):
		response = APIClient().post(
			"/api/cart/add/",
			{"product_id": self.product.id},
			format="json",
			HTTP_ORIGIN="http://localhost:5173",
		)

		self.assertEqual(response.status_code, 200)

	def test_authenticated_cart_post_requires_and_accepts_csrf_token(self):
		user = User.objects.create_user(username="cart-user", password="password")
		client = APIClient(enforce_csrf_checks=True)
		client.force_login(user)

		csrf_response = client.get("/api/csrf/")
		self.assertEqual(csrf_response.status_code, 200)
		csrf_token = csrf_response.data["csrfToken"]

		missing_token_response = client.post(
			"/api/cart/add/",
			{"product_id": self.product.id},
			format="json",
			HTTP_ORIGIN="http://localhost:5173",
		)
		self.assertEqual(missing_token_response.status_code, 403)

		valid_response = client.post(
			"/api/cart/add/",
			{"product_id": self.product.id},
			format="json",
			HTTP_ORIGIN="http://localhost:5173",
			HTTP_X_CSRFTOKEN=csrf_token,
		)
		self.assertEqual(valid_response.status_code, 200)

	def test_update_and_remove_cart_item_use_cart_item_id(self):
		client = APIClient()
		add_response = client.post(
			"/api/cart/add/",
			{"product_id": self.product.id},
			format="json",
		)
		item_id = add_response.data["cart"]["items"][0]["id"]

		update_response = client.post(
			"/api/cart/update/",
			{"item_id": item_id, "quantity": 3},
			format="json",
		)
		self.assertEqual(update_response.status_code, 200)
		self.assertEqual(update_response.data["items"][0]["quantity"], 3)

		remove_response = client.post(
			"/api/cart/remove/",
			{"item_id": item_id},
			format="json",
		)
		self.assertEqual(remove_response.status_code, 200)
		self.assertEqual(remove_response.data["cart"]["items"], [])

	def test_cart_item_cannot_be_updated_from_another_session(self):
		owner = APIClient()
		add_response = owner.post(
			"/api/cart/add/",
			{"product_id": self.product.id},
			format="json",
		)
		item_id = add_response.data["cart"]["items"][0]["id"]

		response = APIClient().post(
			"/api/cart/update/",
			{"item_id": item_id, "quantity": 4},
			format="json",
		)
		self.assertEqual(response.status_code, 404)
