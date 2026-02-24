export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryData {
  name: string;
  slug?: string;
  description?: string;
}

export interface UpdateCategoryData {
  name?: string;
  slug?: string;
  description?: string;
}
