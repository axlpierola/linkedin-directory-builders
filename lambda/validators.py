import re
from urllib.parse import urlparse

from constants import (
    ALL_CATEGORIES,
    BUILDER_CATEGORIES_BY_TYPE,
    BUILDER_TYPES,
    LATAM_COUNTRIES,
    SOCIAL_LINK_DOMAINS,
)

EMAIL_REGEX = re.compile(
    r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
)


def validate_email(email):
    """Validate email format using regex. Returns (is_valid, error_message)."""
    if not email or not isinstance(email, str):
        return False, "Email is required"
    if not EMAIL_REGEX.match(email.strip()):
        return False, "Invalid email format"
    return True, None


def validate_url(url):
    """Validate that a URL is well-formed. Returns (is_valid, error_message)."""
    if not url or not isinstance(url, str):
        return False, "URL is required"
    try:
        parsed = urlparse(url.strip())
        if parsed.scheme not in ("http", "https"):
            return False, "URL must start with http:// or https://"
        if not parsed.netloc or "." not in parsed.netloc:
            return False, "URL must have a valid domain"
        return True, None
    except Exception:
        return False, "Invalid URL format"


def validate_social_link(field, url):
    """Validate that a social link URL matches the expected domain for the platform.
    Returns (is_valid, error_message).
    """
    if not url or not url.strip():
        return True, None  # empty is allowed (optional field)

    valid, err = validate_url(url)
    if not valid:
        return False, f"{field}: {err}"

    allowed_domains = SOCIAL_LINK_DOMAINS.get(field)
    if allowed_domains is None:
        # website field — any domain is fine
        return True, None

    parsed = urlparse(url.strip())
    hostname = parsed.netloc.lower().removeprefix("www.")

    if hostname not in allowed_domains:
        expected = ", ".join(allowed_domains)
        return False, f"{field}: URL must be from {expected}"

    return True, None


def validate_profile_fields(data):
    """Validate required profile fields. Returns (is_valid, errors) where errors is a list."""
    errors = []

    if data is None or not isinstance(data, dict):
        return False, ["Profile data is required"]

    # builder_type
    builder_type = data.get("builder_type")
    if not builder_type:
        errors.append("builder_type is required")
    elif builder_type not in BUILDER_TYPES:
        errors.append(f"builder_type must be one of: {', '.join(BUILDER_TYPES)}")

    # builder_categories — must be exactly one category matching the selected builder_type
    categories = data.get("builder_categories")
    if not categories or not isinstance(categories, list) or len(categories) == 0:
        errors.append("builder_categories is required and must be a non-empty list")
    elif len(categories) > 1:
        errors.append("Solo puedes seleccionar una categoría")
    elif builder_type and builder_type in BUILDER_CATEGORIES_BY_TYPE:
        allowed = BUILDER_CATEGORIES_BY_TYPE[builder_type]
        if not all(c in allowed for c in categories):
            errors.append(f"builder_categories must be from: {', '.join(allowed)}")
    elif builder_type and not all(c in ALL_CATEGORIES for c in categories):
        errors.append(f"builder_categories contains invalid values")

    # country
    country = data.get("country")
    if not country:
        errors.append("country is required")
    elif country not in LATAM_COUNTRIES:
        errors.append(f"country must be one of the LATAM countries")

    return len(errors) == 0, errors
