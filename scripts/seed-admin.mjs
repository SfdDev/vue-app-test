import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcrypt';
import pg from 'pg';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function loadEnv() {
  const envPath = resolve(root, '.env');
  if (!existsSync(envPath)) {
    // In Docker, vars come from compose `environment` / `env_file`
    if (process.env.DB_USER && process.env.DB_NAME && process.env.DB_PASSWORD) {
      return;
    }
    throw new Error('.env not found. Copy .env.example to .env first.');
  }

  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnv();

const {
  DB_USER,
  DB_HOST = 'localhost',
  DB_NAME,
  DB_PASSWORD,
  DB_PORT = '5432',
  ADMIN_USERNAME = 'admin',
  ADMIN_PASSWORD = 'admin123',
} = process.env;

if (!DB_USER || !DB_NAME || !DB_PASSWORD) {
  throw new Error('DB_USER, DB_NAME and DB_PASSWORD are required in .env');
}

const pool = new pg.Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_NAME,
  password: DB_PASSWORD,
  port: Number(DB_PORT),
});

async function ensureSchema(client) {
  const usersSql = readFileSync(resolve(root, 'src/server/sql/create_users_table.sql'), 'utf8');
  const articlesSql = readFileSync(resolve(root, 'src/server/sql/create_articles_table.sql'), 'utf8');
  const categoriesSql = readFileSync(resolve(root, 'migrations/add_categories.sql'), 'utf8');

  await client.query(usersSql);
  await client.query(articlesSql);
  await client.query(categoriesSql);
}

async function upsertAdmin(client) {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const email = `${ADMIN_USERNAME}@example.com`;

  const result = await client.query(
    `INSERT INTO users (username, email, password_hash, is_admin)
     VALUES ($1, $2, $3, true)
     ON CONFLICT (username) DO UPDATE
       SET password_hash = EXCLUDED.password_hash,
           email = EXCLUDED.email,
           is_admin = true,
           updated_at = CURRENT_TIMESTAMP
     RETURNING id, username, is_admin`,
    [ADMIN_USERNAME, email, passwordHash],
  );

  return result.rows[0];
}

const CYRILLIC_TO_LATIN = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh',
  з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
  п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts',
  ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu',
  я: 'ya',
};

function slugify(input) {
  const lower = String(input || '').trim().toLowerCase();
  let out = '';
  for (const char of lower) {
    if (CYRILLIC_TO_LATIN[char] !== undefined) {
      out += CYRILLIC_TO_LATIN[char];
      continue;
    }
    if (/[a-z0-9]/.test(char)) {
      out += char;
      continue;
    }
    if (/\s|-|_/.test(char)) out += '-';
  }
  return out.replace(/-+/g, '-').replace(/^-+|-+$/g, '').slice(0, 180) || 'item';
}

async function backfillSlugs(client) {
  // Categories with Cyrillic/empty-ish slugs → latin
  const categories = await client.query('SELECT id, name, slug FROM categories');
  const usedCategorySlugs = new Set(categories.rows.map((row) => row.slug).filter(Boolean));

  for (const category of categories.rows) {
    const needsFix = !category.slug || /[а-яё]/i.test(category.slug);
    if (!needsFix) continue;

    let base = slugify(category.name);
    let candidate = base;
    let n = 2;
    while (usedCategorySlugs.has(candidate) && candidate !== category.slug) {
      candidate = `${base}-${n++}`;
    }
    usedCategorySlugs.add(candidate);
    await client.query('UPDATE categories SET slug = $1 WHERE id = $2', [candidate, category.id]);
    console.log(`Category slug fixed: #${category.id} -> ${candidate}`);
  }

  // Articles without slug
  const articles = await client.query('SELECT id, title, slug FROM articles WHERE slug IS NULL OR slug = \'\'');
  const existing = await client.query('SELECT slug FROM articles WHERE slug IS NOT NULL AND slug <> \'\'');
  const usedArticleSlugs = new Set(existing.rows.map((row) => row.slug));

  for (const article of articles.rows) {
    let base = slugify(article.title);
    let candidate = base;
    let n = 2;
    while (usedArticleSlugs.has(candidate)) {
      candidate = `${base}-${n++}`;
    }
    usedArticleSlugs.add(candidate);
    await client.query('UPDATE articles SET slug = $1 WHERE id = $2', [candidate, article.id]);
    console.log(`Article slug fixed: #${article.id} -> ${candidate}`);
  }
}

async function main() {
  const client = await pool.connect();
  try {
    await ensureSchema(client);
    const admin = await upsertAdmin(client);
    await backfillSlugs(client);
    console.log('Admin ready:');
    console.log(`  id: ${admin.id}`);
    console.log(`  username: ${admin.username}`);
    console.log(`  password: ${ADMIN_PASSWORD}`);
    console.log(`  is_admin: ${admin.is_admin}`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Seed failed:', error.message);
  process.exit(1);
});
