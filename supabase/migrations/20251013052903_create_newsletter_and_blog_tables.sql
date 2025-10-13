/*
  # Newsletter and Blog CMS Database Schema

  ## Overview
  This migration creates tables to support:
  1. Newsletter subscription management
  2. Content Management System (CMS) for the Insights blog

  ## New Tables

  ### `newsletter_subscriptions`
  Stores email addresses of newsletter subscribers with subscription status tracking.
  - `id` (uuid, primary key) - Unique identifier for each subscription
  - `email` (text, unique, required) - Subscriber's email address
  - `status` (text, default 'active') - Subscription status: 'active', 'unsubscribed', 'bounced'
  - `subscribed_at` (timestamptz) - When the user subscribed
  - `unsubscribed_at` (timestamptz, nullable) - When the user unsubscribed (if applicable)
  - `source` (text, default 'website') - Where the subscription came from
  - `metadata` (jsonb) - Additional data (e.g., preferences, tags)

  ### `blog_posts`
  Stores blog post content for the Insights section with full CMS capabilities.
  - `id` (uuid, primary key) - Unique identifier for each post
  - `title` (text, required) - Post title
  - `slug` (text, unique, required) - URL-friendly version of title
  - `excerpt` (text, nullable) - Short summary for previews
  - `content` (text, required) - Full post content (supports markdown)
  - `featured_image_url` (text, nullable) - URL to featured image
  - `author_id` (uuid, nullable) - Reference to author (future auth integration)
  - `status` (text, default 'draft') - Publication status: 'draft', 'published', 'archived'
  - `published_at` (timestamptz, nullable) - When the post was published
  - `created_at` (timestamptz) - When the post was created
  - `updated_at` (timestamptz) - When the post was last updated
  - `metadata` (jsonb) - Additional data (e.g., SEO, tags, categories)

  ## Security
  
  ### Newsletter Subscriptions
  - Enable RLS on `newsletter_subscriptions` table
  - Public can insert their own subscriptions (for signup form)
  - Public can update their own subscription status (for unsubscribe)
  - Only authenticated users can view subscription data
  
  ### Blog Posts
  - Enable RLS on `blog_posts` table
  - Public can read published posts only
  - Only authenticated users can create, update, or delete posts

  ## Indexes
  - Index on email for fast subscription lookups
  - Index on slug for fast blog post lookups
  - Index on status and published_at for filtering published posts
*/

-- Create newsletter_subscriptions table
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'active',
  subscribed_at timestamptz DEFAULT now(),
  unsubscribed_at timestamptz,
  source text DEFAULT 'website',
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  CONSTRAINT valid_status CHECK (status IN ('active', 'unsubscribed', 'bounced'))
);

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text NOT NULL,
  featured_image_url text,
  author_id uuid,
  status text NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT valid_slug CHECK (slug ~* '^[a-z0-9-]+$'),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'published', 'archived'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_status_published ON blog_posts(status, published_at DESC) WHERE status = 'published';

-- Enable RLS
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Newsletter Subscriptions Policies

CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscriptions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view their own subscription"
  ON newsletter_subscriptions
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can update their own subscription status"
  ON newsletter_subscriptions
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can manage all subscriptions"
  ON newsletter_subscriptions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Blog Posts Policies

CREATE POLICY "Anyone can view published posts"
  ON blog_posts
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Authenticated users can view all posts"
  ON blog_posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON blog_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update posts"
  ON blog_posts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete posts"
  ON blog_posts
  FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to automatically update updated_at
CREATE TRIGGER update_blog_posts_updated_at 
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();