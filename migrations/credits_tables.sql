-- Create credits table
CREATE TABLE IF NOT EXISTS credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan VARCHAR(255) NOT NULL,
  total INTEGER NOT NULL,
  used INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT credits_remaining_check CHECK (used <= total)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('purchase', 'usage', 'bonus')),
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own credits
CREATE POLICY credits_select_policy ON credits
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only see their own transactions
CREATE POLICY transactions_select_policy ON transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Only service role can insert/update credits
CREATE POLICY credits_insert_policy ON credits
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.jwt()->>'role' = 'service_role');

CREATE POLICY credits_update_policy ON credits
  FOR UPDATE USING (auth.uid() = user_id OR auth.jwt()->>'role' = 'service_role');

-- Only service role can insert transactions
CREATE POLICY transactions_insert_policy ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.jwt()->>'role' = 'service_role');
