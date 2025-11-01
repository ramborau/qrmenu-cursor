-- Script to manually create admin user and account
-- Run this after user is created via signup page

-- First, ensure user exists and is OWNER
UPDATE users SET role = 'OWNER' WHERE email = 'rahul@botpe.com';

-- Get user ID
-- Then manually create account with password hash
-- NOTE: Better Auth password format: "hash:salt:iterations"
-- You'll need to get the actual hash from Better Auth signup process

-- For now, the user needs to sign up via web UI at:
-- http://localhost:3006/auth/signup
-- Then update role to OWNER:
-- UPDATE users SET role = 'OWNER' WHERE email = 'rahul@botpe.com';

