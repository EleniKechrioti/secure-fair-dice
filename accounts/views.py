import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import User
from .utils import hash_password, verify_password


@csrf_exempt
def register(request):

    if request.method != 'POST':
        return JsonResponse({"error": "POST required"})

    data = json.loads(request.body)

    first_name = data.get("first_name")
    last_name = data.get("last_name")
    username = data.get("username")
    password = data.get("password")

    if User.objects.filter(username=username).exists():
        return JsonResponse({"error": "username exists"})

    user = User.objects.create(
        first_name=first_name,
        last_name=last_name,
        username=username,
        password_hash=hash_password(password)
    )

    return JsonResponse({
        "message": "user created",
        "user_id": user.id
    })


@csrf_exempt
def login(request):

    if request.method != 'POST':
        return JsonResponse({"error": "POST required"})

    data = json.loads(request.body)

    username = data.get("username")
    password = data.get("password")

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({"error": "invalid credentials"})

    if not verify_password(password, user.password_hash):
        return JsonResponse({"error": "invalid credentials"})

    return JsonResponse({
        "message": "login successful",
        "user": user.username
    })