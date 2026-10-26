/**
 * Security Configuration Constants for JJ Crackers (JEGAJOTHI CRACKERS)
 * Production Protection Engine
 */

export const SECURITY_CONFIG = {
  // Official Approved Product Catalog Baseline
  APPROVED_CATALOG_COUNT: 150, // 146 regular products + 4 gift boxes
  EXPECTED_CATEGORIES_COUNT: 21,
  
  // Risk Tier Time-To-Live (in milliseconds)
  APPROVAL_TTL_MS: {
    LOW: 15 * 60 * 1000,      // 15 minutes
    MEDIUM: 10 * 60 * 1000,   // 10 minutes
    HIGH: 5 * 60 * 1000,      // 5 minutes
    CRITICAL: 3 * 60 * 1000,  // 3 minutes
  },

  // Session Configurations
  SESSION: {
    TOKEN_TTL_MS: 4 * 60 * 60 * 1000, // 4 hours standard admin session
    REAUTH_WINDOW_MS: 15 * 60 * 1000,  // 15 minutes re-authentication window for HIGH/CRITICAL actions
  },

  // Rate Limiting
  RATE_LIMIT: {
    AUTH_MAX_ATTEMPTS: 5,        // max 5 failed attempts
    AUTH_WINDOW_MS: 15 * 60 * 1000, // 15 minutes lockout window
    API_SENSITIVE_MAX_REQ: 60,   // 60 requests per minute
    API_WINDOW_MS: 60 * 1000,
  },

  // Security Headers
  HEADERS: {
    TOKEN_HEADER: 'authorization',
    APPROVAL_ID_HEADER: 'x-approval-id',
    APPROVAL_TOKEN_HEADER: 'x-approval-token',
  },
} as const;

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type SensitiveAction =
  | 'PRODUCT_CREATE'
  | 'PRODUCT_UPDATE_DETAILS'
  | 'PRODUCT_UPDATE_PRICE'
  | 'PRODUCT_UPDATE_IMAGE'
  | 'PRODUCT_UPDATE_CATEGORY'
  | 'PRODUCT_DELETE_SINGLE'
  | 'PRODUCT_DELETE_BULK'
  | 'PRODUCT_BULK_IMPORT'
  | 'PRODUCT_BULK_PRICE_CHANGE'
  | 'CATALOG_SYNC'
  | 'CATALOG_SEED'
  | 'DATABASE_CLEANUP'
  | 'SETTINGS_UPDATE'
  | 'SECURITY_CONFIG_UPDATE';
