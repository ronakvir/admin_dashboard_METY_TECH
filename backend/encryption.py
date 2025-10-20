# utils/secret_key.py
import os, secrets
from pathlib import Path
from dotenv import set_key, load_dotenv
import base64
from django.core import signing

# Fetches Key from .env. If it doesnt exist, create it.
def ensure_encryption_key(key_name: str = "ENCRYPTION_KEY") -> str:
    load_dotenv()

    key = os.getenv(key_name)

    if not key:
        key = secrets.token_urlsafe(64)
        set_key(".env", key_name, key)

    return key


def encrypt_value(value: str) -> str:
    key = ensure_encryption_key()

    """Encrypts a string using Django's SECRET_KEY."""
    signed = signing.dumps(value, key=key)
    return base64.b64encode(signed.encode()).decode()

def decrypt_value(value: str) -> str:
    key = ensure_encryption_key()

    """Decrypts a string previously encrypted by encrypt_value()."""
    try:
        decoded = base64.b64decode(value).decode()
        return signing.loads(decoded, key=key)
    except Exception:
        return value  # Return raw if it’s already decrypted or invalid