-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing')),
  current_period_end BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own subscriptions
CREATE POLICY subscriptions_select_policy ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Only service role can insert/update subscriptions
CREATE POLICY subscriptions_insert_policy ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.jwt()->>'role' = 'service_role');

CREATE POLICY subscriptions_update_policy ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id OR auth.jwt()->>'role' = 'service_role');
