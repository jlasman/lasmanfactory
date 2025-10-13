/*
  # Use HTTP Extension for Trigger

  ## Changes Made
  
  1. Enable http extension (pg_http)
  2. Update trigger function to use http extension instead of pg_net
     - http extension makes synchronous requests
     - More reliable for immediate webhook calls
*/

-- Enable http extension
CREATE EXTENSION IF NOT EXISTS http;

-- Update trigger function to use http extension
CREATE OR REPLACE FUNCTION notify_new_subscriber()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  webhook_url text;
  payload jsonb;
  http_response public.http_response;
BEGIN
  -- Use actual Supabase URL
  webhook_url := 'https://jdfwtsgtoldktewtrbgc.supabase.co/functions/v1/notify-new-subscriber';
  
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

  -- Make the HTTP request using http extension
  http_response := public.http((
    'POST',
    webhook_url,
    ARRAY[public.http_header('Content-Type', 'application/json')],
    'application/json',
    payload::text
  )::public.http_request);

  -- Log the response status
  RAISE NOTICE 'Webhook response status: %', http_response.status;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the insert
    RAISE WARNING 'Failed to trigger webhook: %', SQLERRM;
    RETURN NEW;
END;
$$;
