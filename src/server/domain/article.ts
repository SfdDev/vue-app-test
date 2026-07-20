export interface Article {
  id: number;
  title: string;
  content: string;
  author_id: number;
  image_url: string | null;
  category_id: number | null;
  created_at: string;
  updated_at: string | null;
  is_published: boolean;
  slug?: string | null;
  author_name?: string;
  category_name?: string;
  category_slug?: string;
}

export interface CreateArticleInput {
  title: string;
  content: string;
  authorId: number;
  imageUrl: string;
  isPublished: boolean;
  categoryId: number | null;
  slug: string;
}

export interface UpdateArticleInput {
  title: string;
  content: string;
  imageUrl: string | null;
  isPublished?: boolean;
  categoryId?: number | null;
  slug?: string;
}

export interface ArticlesPage {
  data: Article[];
  meta: {
    current_page: number;
    per_page: number;
    total_pages: number;
    total: number;
  };
}

export interface UploadedImage {
  buffer: Buffer;
  filename: string;
}
