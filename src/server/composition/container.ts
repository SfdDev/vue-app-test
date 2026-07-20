import { AuthApplicationService } from '../application/auth.service';
import { ArticleApplicationService } from '../application/article.service';
import { CategoryApplicationService } from '../application/category.service';
import { BcryptPasswordHasher } from '../infrastructure/auth/bcrypt-password-hasher';
import { JwtTokenService } from '../infrastructure/auth/jwt-token.service';
import { GoogleRecaptchaVerifier } from '../infrastructure/captcha/google-recaptcha';
import { getDbPool } from '../infrastructure/db/pool';
import { PgArticleRepository } from '../infrastructure/repositories/pg-article.repository';
import { PgCategoryRepository } from '../infrastructure/repositories/pg-category.repository';
import { PgUserRepository } from '../infrastructure/repositories/pg-user.repository';
import { LocalImageStorage } from '../infrastructure/storage/local-image-storage';

const pool = getDbPool();

const userRepository = new PgUserRepository(pool);
const articleRepository = new PgArticleRepository(pool);
const categoryRepository = new PgCategoryRepository(pool);

const passwordHasher = new BcryptPasswordHasher();
const tokenService = new JwtTokenService(process.env.JWT_SECRET as string);
const captchaVerifier = new GoogleRecaptchaVerifier(process.env.RECAPTCHA_SECRET_KEY as string);
const fileStorage = new LocalImageStorage();

export const authService = new AuthApplicationService(
  userRepository,
  passwordHasher,
  tokenService,
  captchaVerifier,
);

export const articleService = new ArticleApplicationService(
  articleRepository,
  fileStorage,
);

export const categoryService = new CategoryApplicationService(categoryRepository);

export { tokenService };
