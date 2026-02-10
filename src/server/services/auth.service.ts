import jwt from 'jsonwebtoken';
import axios from 'axios';
import bcrypt from 'bcrypt';
import { getDbPool } from '../utils/db';
import { createUserModel } from '../models/user.model';

const pool = getDbPool();
const userModel = createUserModel({ pool });

const JWT_SECRET = process.env.JWT_SECRET as string;
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY as string;

export interface AuthUser {
  id: number;
  username: string;
  is_admin: boolean;
}

export async function verifyRecaptcha(recaptcha: string): Promise<boolean> {
  try {
    const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
      params: {
        secret: RECAPTCHA_SECRET,
        response: recaptcha,
      },
    });
    return response.data.success;
  } catch {
    return false;
  }
}

export async function registerUser(username: string, password: string, recaptcha: string) {
  const isRecaptchaValid = await verifyRecaptcha(recaptcha);
  if (!isRecaptchaValid) {
    throw new Error('Ошибка проверки reCAPTCHA');
  }

  const existingUser = await userModel.findByUsername(username);
  if (existingUser) {
    throw new Error('Пользователь уже существует');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userModel.create(username, passwordHash);

  return {
    id: user.id,
    username: user.username,
    is_admin: user.is_admin,
  };
}

export async function loginUser(username: string, password: string) {
  const user = await userModel.findByUsername(username);
  if (!user || !user.password_hash) {
    throw new Error('Неверное имя пользователя или пароль');
  }

  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    throw new Error('Неверное имя пользователя или пароль');
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, is_admin: user.is_admin },
    JWT_SECRET,
    { expiresIn: '1h' },
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      is_admin: user.is_admin,
    },
  };
}

export async function getCurrentUser(userId: number) {
  const user = await userModel.findById(userId);
  if (!user) {
    throw new Error('Пользователь не найден');
  }
  return {
    id: user.id,
    username: user.username,
    is_admin: user.is_admin,
  };
}

export async function usernameExists(username: string) {
  return userModel.exists(username);
}

