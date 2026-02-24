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

-- Создание категории по умолчанию "Без категории"
INSERT INTO categories (name, slug, description) 
VALUES ('Без категории', 'bez-kategorii', 'Статьи без определенной категории')
ON CONFLICT (name) DO NOTHING;

-- Обновление существующих статей, устанавливая категорию по умолчанию
UPDATE articles 
SET category_id = (SELECT id FROM categories WHERE slug = 'bez-kategorii')
WHERE category_id IS NULL;
