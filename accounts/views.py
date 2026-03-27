"""
Authentication & User Management Views.
Handles user registration, login, and custom JWT token verification.
"""

import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django_ratelimit.decorators import ratelimit

from .models import AppUser
from .utils import hash_password, verify_password, validate_password_policy, create_jwt_token, decode_jwt_token

def get_user_from_token(request):
    """
    Custom JWT Authentication Validator.
    Extracts the Bearer token from the incoming HTTP request headers, 
    verifies its cryptographic signature, and retrieves the associated user.

    Args:
        request: The incoming Django HTTP request object.

    Returns:
        tuple: (AppUser object or None, JsonResponse with error or None)
    """
    auth_header = request.headers.get("Authorization")

    # Ensure the Authorization header exists
    if not auth_header:
        return None, JsonResponse({"error": "Authorization header missing"}, status=401)

    # Enforce the strict "Bearer <token>" format
    if not auth_header.startswith("Bearer "):
        return None, JsonResponse({"error": "Invalid authorization format"}, status=401)

    # Extract the actual token string
    token = auth_header.split(" ")[1]

    # Decode the token and verify its signature
    payload, error = decode_jwt_token(token)
    if error:
        return None, JsonResponse({"error": error}, status=401)

    try:
        user = AppUser.objects.get(id=payload["user_id"])
    except AppUser.DoesNotExist:
        return None, JsonResponse({"error": "User not found"}, status=401)

    return user, None

@csrf_exempt
def register(request):
    """
    User Registration Endpoint.
    Accepts a JSON payload, sanitizes inputs, validates against strict 
    password policies, hashes the password, and creates a new user.
    
    Note: @csrf_exempt is used because this is a stateless JSON API 
    that relies on JWTs rather than session cookies.
    """

    # Restrict endpoint to POST requests only
    if request.method != 'POST':
        return JsonResponse({"error": "POST required"}, status=405)

    data = json.loads(request.body)

    # Extract and sanitize inputs (strip removes leading/trailing whitespaces)
    first_name = data.get("first_name", "").strip()
    last_name = data.get("last_name", "").strip()
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    # Basic input validation
    if not first_name or not last_name or not username or not password:
        return JsonResponse({"error": "All fields are required"}, status=400)

    # Prevent duplicate usernames
    if AppUser.objects.filter(username=username).exists():
        return JsonResponse({"error": "Username already exists"}, status=400)
    
    # Enforce enterprise password policies (length, complexity, commonality)
    is_valid, error_message = validate_password_policy(password, username)

    if not is_valid:
        return JsonResponse({"error": error_message}, status=400)

    # Create the user and store ONLY the hashed password
    user = AppUser.objects.create(
        first_name=first_name,
        last_name=last_name,
        username=username,
        password_hash=hash_password(password)
    )

    return JsonResponse({
        "message": "User created successfully",
        "user_id": user.id,
        "username": user.username
    }, status=201)


@csrf_exempt
@ratelimit(key='ip', rate='5/m', block=True) # Allows only 5 attempts per minute per IP | Mitigates Brute-Force and Credential Stuffing attacks
def login(request):
    """
    User Login Endpoint.
    Authenticates user credentials and issues a custom JSON Web Token (JWT).
    Protected by IP-based rate limiting to prevent automated password guessing.
    """

    if request.method != 'POST':
        return JsonResponse({"error": "POST required"}, status=405)

    data = json.loads(request.body)

    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    if not username or not password:
        return JsonResponse({"error": "Username and password are required"}, status=400)
    
    # Attempt to locate the user in the database
    try:
        user = AppUser.objects.get(username=username)
    except AppUser.DoesNotExist:
        return JsonResponse({"error": "Invalid credentials"}, status=401)

    if not verify_password(password, user.password_hash):
        return JsonResponse({"error": "Invalid credentials"}, status=401)
    
    # Generate the cryptographic token for stateless session management
    token = create_jwt_token(user)

    return JsonResponse({
        "message": "Login successful",
        "user": user.username,
        "token": token
    }, status=200)