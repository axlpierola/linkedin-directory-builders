export const BUILDER_TYPES = ["AWS Community Builder", "AWS Hero"];

export const BUILDER_CATEGORIES_BY_TYPE = {
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
};

// Flat list of all unique categories (for filters)
export const ALL_CATEGORIES = [
  ...new Set([
    ...BUILDER_CATEGORIES_BY_TYPE["AWS Hero"],
    ...BUILDER_CATEGORIES_BY_TYPE["AWS Community Builder"],
  ]),
].sort();

export const LATAM_COUNTRIES = [
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
];

export const SOCIAL_LINK_DOMAINS = {
  github: ["github.com"],
  twitter: ["twitter.com", "x.com"],
  medium: ["medium.com"],
  devto: ["dev.to"],
  youtube: ["youtube.com"],
  aws_builder: ["community.aws", "builder.aws"],
  website: null,
};
