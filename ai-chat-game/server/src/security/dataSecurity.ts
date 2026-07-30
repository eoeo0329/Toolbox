/**
 * 数据安全系统
 * - HTTPS 通信（生产环境由 Nginx/负载均衡层终止 TLS）
 * - 数据加密存储（AES）
 * - API Key 只保存在服务器（环境变量）
 * - 数据访问权限控制
 */

import crypto from 'crypto';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-32-char-encryption-key!!!';

// =================== AES 加解密 ===================
export function encryptData(plainText: string): string {
  return CryptoJS.AES.encrypt(plainText, ENCRYPTION_KEY).toString();
}

export function decryptData(cipherText: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return '';
  }
}

// =================== 密码哈希 ===================
import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// =================== API Key 安全 ===================
// API Key 永远只存在于服务器环境变量中，绝不返回给客户端
export function getAPIKey(provider: 'openai' | 'deepseek'): string | null {
  const key = provider === 'openai'
    ? process.env.API_KEY_OPENAI
    : process.env.API_KEY_DEEPSEEK;

  if (!key) {
    console.error(`[SECURITY] API Key for ${provider} is not configured`);
    return null;
  }
  return key;
}

// =================== 数据脱敏（日志用） ===================
export function maskSensitiveData(data: string, type: 'phone' | 'email' | 'id' | 'token'): string {
  switch (type) {
    case 'phone':
      return data.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    case 'email': {
      const [name, domain] = data.split('@');
      if (!domain) return '***';
      return `${name.slice(0, 2)}***@${domain}`;
    }
    case 'id':
      return data.length > 8 ? `${data.slice(0, 4)}****${data.slice(-4)}` : '****';
    case 'token':
      return data.length > 10 ? `${data.slice(0, 6)}****` : '****';
    default:
      return '****';
  }
}

// =================== 数据访问权限控制 ===================
export type UserRole = 'user' | 'moderator' | 'admin';

export interface PermissionConfig {
  canViewOwnData: boolean;
  canViewOthersData: boolean;
  canBanUsers: boolean;
  canViewReports: boolean;
  canViewAllViolations: boolean;
  canManageSettings: boolean;
}

const PERMISSIONS: Record<UserRole, PermissionConfig> = {
  user: {
    canViewOwnData: true,
    canViewOthersData: false,
    canBanUsers: false,
    canViewReports: false,
    canViewAllViolations: false,
    canManageSettings: false,
  },
  moderator: {
    canViewOwnData: true,
    canViewOthersData: true,
    canBanUsers: true,
    canViewReports: true,
    canViewAllViolations: true,
    canManageSettings: false,
  },
  admin: {
    canViewOwnData: true,
    canViewOthersData: true,
    canBanUsers: true,
    canViewReports: true,
    canViewAllViolations: true,
    canManageSettings: true,
  },
};

export function getPermissions(role: UserRole): PermissionConfig {
  return PERMISSIONS[role];
}

export function hasPermission(role: UserRole, permission: keyof PermissionConfig): boolean {
  return PERMISSIONS[role][permission];
}

// =================== 安全响应头（配合 helmet） ===================
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};
