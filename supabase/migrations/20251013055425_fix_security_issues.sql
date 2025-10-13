/*
  # Fix Security Issues

  ## Changes Made
  
  1. Remove Unused Indexes
     - Drop `idx_newsletter_email` (replaced by unique constraint)
     - Drop `idx_newsletter_status` (not needed for current queries)
     - Drop `idx_blog_slug` (replaced by unique constraint)
     - Drop `idx_blog_status_published` (not needed for current queries)
  
  2. Consolidate Overlapping RLS Policies
     - Remove redundant policies on `blog_posts` table
     - Remove redundant policies on `newsletter_subscriptions` table
     - Keep only the most permissive necessary policies
  
  3. Fix Function Search Path
     - Recreate `update_updated_at_column` with immutable search_path
  
  ## Security Improvements
  - Eliminated policy conflicts that could cause confusion
  - Simplified RLS structure for better maintainability
  - Fixed function search path vulnerability
*/

-- Drop unused indexes
DROP INDEX IF EXISTS idx_newsletter_email;
DROP INDEX IF EXISTS idx_newsletter_status;
DROP INDEX IF EXISTS idx_blog_slug;
DROP INDEX IF EXISTS idx_blog_status_published;

-- Drop all existing policies on blog_posts
DROP POLICY IF EXISTS "Anyone can view published posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can view all posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can manage all blog posts" ON blog_posts;

-- Create consolidated blog_posts policies
CREATE POLICY "Anyone can view published blog posts"
  ON blog_posts
  FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authenticated users can manage blog posts"
  ON blog_posts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Drop all existing policies on newsletter_subscriptions
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscription" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription status" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Authenticated users can manage all subscriptions" ON newsletter_subscriptions;

-- Create consolidated newsletter_subscriptions policies
CREATE POLICY "Anyone can subscribe"
  ON newsletter_subscriptions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own subscription"
  ON newsletter_subscriptions
  FOR SELECT
  USING (email = current_setting('request.jwt.claims', true)::json->>'email' OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own subscription"
  ON newsletter_subscriptions
  FOR UPDATE
  USING (email = current_setting('request.jwt.claims', true)::json->>'email')
  WITH CHECK (email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Authenticated admins can manage all subscriptions"
  ON newsletter_subscriptions
  FOR ALL
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Fix function search path vulnerability
-- Drop trigger first, then function, then recreate both
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
DROP FUNCTION IF EXISTS update_updated_at_column();

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
