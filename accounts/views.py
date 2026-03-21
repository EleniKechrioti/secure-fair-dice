import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import AppUser
from .utils import hash_password, verify_password, validate_password_policy


@csrf_exempt
def register(request):

    if request.method != 'POST':
        return JsonResponse({"error": "POST required"}, status=405)

    data = json.loads(request.body)

    first_name = data.get("first_name", "").strip()
    last_name = data.get("last_name", "").strip()
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    if not first_name or not last_name or not username or not password:
        return JsonResponse({"error": "All fields are required"}, status=400)

    if AppUser.objects.filter(username=username).exists():
        return JsonResponse({"error": "Username already exists"}, status=400)
    
    is_valid, error_message = validate_password_policy(password, username)

    if not is_valid:
        return JsonResponse({"error": error_message}, status=400)

    user = AppUser.objects.create(
        first_name=first_name,
        last_name=last_name,
        username=username,
        password_hash=hash_password(password)
    )

    return JsonResponse({
        "message": "User created successfully",
        "user_id": user.id
    }, status=201)


@csrf_exempt
def login(request):

    if request.method != 'POST':
        return JsonResponse({"error": "POST required"}, status=405)

    data = json.loads(request.body)

    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    if not username or not password:
        return JsonResponse({"error": "Username and password are required"}, status=400)

    try:
        user = AppUser.objects.get(username=username)
    except AppUser.DoesNotExist:
        return JsonResponse({"error": "Invalid credentials"}, status=401)

    if not verify_password(password, user.password_hash):
        return JsonResponse({"error": "Invalid credentials"}, status=401)

    return JsonResponse({
        "message": "Login successful",
        "user": user.username
    }, status=200)