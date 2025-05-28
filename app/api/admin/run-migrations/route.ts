import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Create subscriptions table
    const { error: createTableError } = await supabaseAdmin.rpc("exec_sql", {
      sql_string: `
        -- Create subscriptions table if it doesn't exist
        CREATE TABLE IF NOT EXISTS public.subscriptions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES auth.users(id) NOT NULL,
          stripe_subscription_id TEXT,
          stripe_customer_id TEXT,
          plan_id TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'active',
          current_period_end BIGINT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
        );

        -- Add RLS policies
        ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

        -- Users can view their own subscriptions
        CREATE POLICY IF NOT EXISTS "Users can view their own subscriptions" 
        ON public.subscriptions FOR SELECT 
        USING (auth.uid() = user_id);

        -- Users can update their own subscriptions
        CREATE POLICY IF NOT EXISTS "Users can update their own subscriptions" 
        ON public.subscriptions FOR UPDATE 
        USING (auth.uid() = user_id);

        -- Users can insert their own subscriptions
        CREATE POLICY IF NOT EXISTS "Users can insert their own subscriptions" 
        ON public.subscriptions FOR INSERT 
        WITH CHECK (auth.uid() = user_id);

        -- Create trigger for updated_at if it doesn't exist
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_subscriptions_updated_at') THEN
            CREATE TRIGGER update_subscriptions_updated_at
            BEFORE UPDATE ON public.subscriptions
            FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
          END IF;
        END
        $$;
      `,
    })

    if (createTableError) {
      console.error("Error creating subscriptions table:", createTableError)
      return NextResponse.json({ error: "Failed to create subscriptions table" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Migrations completed successfully" })
  } catch (error) {
    console.error("Error running migrations:", error)
    return NextResponse.json({ error: "Failed to run migrations" }, { status: 500 })
  }
}
