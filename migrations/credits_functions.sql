-- Function to purchase credits
CREATE OR REPLACE FUNCTION purchase_credits(
  p_user_id UUID,
  p_plan VARCHAR,
  p_amount INTEGER,
  p_description TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_credit_id UUID;
  v_transaction_id UUID;
  v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Set expiration date (30 days from now for most plans)
  IF p_plan = 'Lifetime' THEN
    v_expires_at = NULL;
  ELSE
    v_expires_at = NOW() + INTERVAL '30 days';
  END IF;

  -- Insert new credit package
  INSERT INTO credits (user_id, plan, total, used, expires_at)
  VALUES (p_user_id, p_plan, p_amount, 0, v_expires_at)
  RETURNING id INTO v_credit_id;

  -- Record the transaction
  INSERT INTO transactions (user_id, amount, description, type, reference_id)
  VALUES (p_user_id, p_amount, p_description, 'purchase', v_credit_id)
  RETURNING id INTO v_transaction_id;

  RETURN v_transaction_id;
END;
$$;

-- Function to use credits
CREATE OR REPLACE FUNCTION use_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_remaining INTEGER := 0;
  v_credit_record RECORD;
  v_amount_to_use INTEGER;
BEGIN
  -- Check if user has enough credits
  SELECT SUM(total - used) INTO v_remaining
  FROM credits
  WHERE user_id = p_user_id
  AND (expires_at IS NULL OR expires_at > NOW());

  IF v_remaining < p_amount THEN
    RETURN FALSE;
  END IF;

  -- Use credits from oldest to newest
  FOR v_credit_record IN
    SELECT id, total, used
    FROM credits
    WHERE user_id = p_user_id
    AND (expires_at IS NULL OR expires_at > NOW())
    AND used < total
    ORDER BY created_at ASC
  LOOP
    v_amount_to_use := LEAST(p_amount, v_credit_record.total - v_credit_record.used);
    
    -- Update the credit record
    UPDATE credits
    SET used = used + v_amount_to_use,
        updated_at = NOW()
    WHERE id = v_credit_record.id;
    
    -- Record the transaction
    INSERT INTO transactions (user_id, amount, description, type, reference_id)
    VALUES (p_user_id, -v_amount_to_use, p_description, 'usage', v_credit_record.id);
    
    p_amount := p_amount - v_amount_to_use;
    
    EXIT WHEN p_amount <= 0;
  END LOOP;

  RETURN TRUE;
END;
$$;
