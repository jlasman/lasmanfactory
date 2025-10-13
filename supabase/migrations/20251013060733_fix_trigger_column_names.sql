/*
  # Fix Trigger Column Names

  ## Changes Made
  
  1. Update trigger function to use correct column name
     - Change created_at to subscribed_at to match table schema
*/

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
BEGIN
  -- Construct webhook URL
  supabase_url := current_setting('request.headers', true)::json->>'host';
  IF supabase_url IS NULL THEN
    supabase_url := 'your-project.supabase.co';
  END IF;
  
  webhook_url := 'https://' || supabase_url || '/functions/v1/notify-new-subscriber';
  
  -- Build the payload with correct column name
  payload := jsonb_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'record', jsonb_build_object(
      'id', NEW.id,
      'email', NEW.email,
      'status', NEW.status,
      'subscribed_at', NEW.subscribed_at
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
