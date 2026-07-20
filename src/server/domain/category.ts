export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  articles_count?: string | number;
}

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string | null;
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  description?: string | null;
}
