// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Mock environment variables for testing
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/testdb";
process.env.REDIS_URL = "redis://localhost:6379";
process.env.ENCRYPTION_KEY = "test-encryption-key-minimum-32-chars-long";
process.env.ADMIN_TOKEN = "test-admin-token";
process.env.APP_URL = "http://localhost:3000";
