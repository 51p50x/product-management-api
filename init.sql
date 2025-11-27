CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "contentfulId" VARCHAR NOT NULL UNIQUE,
    name VARCHAR NOT NULL,
    sku INTEGER,
    brand VARCHAR,
    model VARCHAR,
    category VARCHAR,
    color VARCHAR,
    price DECIMAL(10, 2),
    currency VARCHAR,
    stock INTEGER,
    description TEXT,
    "deletedAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_contentful_id ON products("contentfulId");

CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products("deletedAt");

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand) WHERE brand IS NOT NULL;
