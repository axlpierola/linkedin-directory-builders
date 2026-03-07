BUILDER_TYPES = ["AWS Community Builder", "AWS Hero"]

BUILDER_CATEGORIES_BY_TYPE = {
    "AWS Hero": [
        "AI",
        "Community",
        "Container",
        "Data",
        "DevTools",
        "Security",
        "Serverless",
    ],
    "AWS Community Builder": [
        "AI Engineering",
        "Cloud Operations",
        "Containers",
        "Data",
        "Dev Tools",
        "Machine Learning",
        "Networking & Content Delivery",
        "Security",
        "Serverless",
    ],
}

# Flat list of all unique categories (for filters/validation)
ALL_CATEGORIES = sorted(set(
    cat for cats in BUILDER_CATEGORIES_BY_TYPE.values() for cat in cats
))

LATAM_COUNTRIES = [
    "Argentina",
    "Bolivia",
    "Brasil",
    "Chile",
    "Colombia",
    "Costa Rica",
    "Cuba",
    "Ecuador",
    "El Salvador",
    "Guatemala",
    "Honduras",
    "México",
    "Nicaragua",
    "Panamá",
    "Paraguay",
    "Perú",
    "Puerto Rico",
    "República Dominicana",
    "Uruguay",
    "Venezuela",
]

SOCIAL_LINK_DOMAINS = {
    "github": ["github.com"],
    "twitter": ["twitter.com", "x.com"],
    "medium": ["medium.com"],
    "devto": ["dev.to"],
    "youtube": ["youtube.com"],
    "aws_builder": ["community.aws", "builder.aws"],
    "website": None,
}
