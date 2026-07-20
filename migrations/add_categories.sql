-- Создание таблицы категорий
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Добавление колонки category_id в таблицу articles
ALTER TABLE articles ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL;

-- Создание индекса для category_id
CREATE INDEX IF NOT EXISTS idx_articles_category_id ON articles(category_id);

-- Legacy cleanup: "Без категории" is virtual (category_id IS NULL), not a DB row.
UPDATE articles
SET category_id = NULL
WHERE category_id IN (SELECT id FROM categories WHERE slug = 'bez-kategorii');

DELETE FROM categories WHERE slug = 'bez-kategorii';
