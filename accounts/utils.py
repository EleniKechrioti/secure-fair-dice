import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from django.conf import settings

def hash_password(password):
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    return hashed.decode('utf-8')

def verify_password(password, hashed_password):
    return bcrypt.checkpw(
        password.encode('utf-8'),
        hashed_password.encode('utf-8')
    )

COMMON_PASSWORDS = {
    "12345678",
    "123456789",
    "password",
    "Aa123456",
    "1234567890",
    "password123",
    "Pass@123",
    "admin123",
    "12345678910",
    "P@ssw0rd",
    "Password",
    "Aa@123456",
}

def validate_password_policy(password, username=None):
    if not password:
        return False, "The password is mandatory."

    if len(password) < 8:
        return False, "The password must have at least 8 characters."

    if len(password) > 64:
        return False, "The password must have a maximum of 64 characters."

    if password.lower() in COMMON_PASSWORDS:
        return False, "The password is very common. Choose a stronger password."

    if username and username.lower() in password.lower():
        return False, "The password must not contain the username."

    return True, None

def create_jwt_token(user):
    expiration = datetime.now(timezone.utc) + timedelta(hours=2)

    payload = {
        "user_id": user.id,
        "username": user.username,
        "exp": expiration,
        "iat": datetime.now(timezone.utc)
    }

    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
    return token

# Will be used by the protected endpoints (game logic endpoints)
def decode_jwt_token(token):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload, None
    except jwt.ExpiredSignatureError:
        return None, "Token expired"
    except jwt.InvalidTokenError:
        return None, "Invalid token"