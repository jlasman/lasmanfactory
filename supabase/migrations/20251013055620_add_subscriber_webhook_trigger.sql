/*
  # Add Webhook Trigger for New Subscribers

  ## Changes Made
  
  1. Create webhook trigger function
     - Calls the edge function when new subscribers are added
     - Sends subscriber data as JSON payload
  
  2. Create trigger on newsletter_subscriptions
     - Fires after INSERT on newsletter_subscriptions table
     - Automatically notifies the edge function
  
  ## Notes
  - The edge function will handle email notifications and Google Sheets integration
  - Only active subscriptions trigger notifications
  - Uses Supabase's pg_net extension for HTTP requests
*/

-- Enable pg_net extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create function to trigger webhook
CREATE OR REPLACE FUNCTION notify_new_subscriber()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  webhook_url text;
  payload jsonb;
  supabase_url text;
  service_key text;
BEGIN
  -- Construct webhook URL (you'll need to replace with your actual Supabase URL)
  supabase_url := current_setting('request.headers', true)::json->>'host';
  IF supabase_url IS NULL THEN
    supabase_url := 'your-project.supabase.co';
  END IF;
  
  webhook_url := 'https://' || supabase_url || '/functions/v1/notify-new-subscriber';
  
  -- Build the payload
  payload := jsonb_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'record', jsonb_build_object(
      'id', NEW.id,
      'email', NEW.email,
      'status', NEW.status,
      'created_at', NEW.created_at
    )
  );

  -- Make the HTTP request using pg_net
  PERFORM net.http_post(
    url := webhook_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := payload
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the insert
    RAISE WARNING 'Failed to trigger webhook: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_subscriber_created ON newsletter_subscriptions;

CREATE TRIGGER on_subscriber_created
  AFTER INSERT ON newsletter_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_subscriber();
