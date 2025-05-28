-- Sample credits data
INSERT INTO "public"."credits" ("id", "user_id", "plan", "total", "used", "expires_at", "created_at", "updated_at") 
VALUES ('034f0dff-1ad0-4656-a302-46b97c3b28ca', '0ece322b-6336-412a-9df3-316d952b7d21', 'Basic', '500', '0', '2025-04-20 18:57:44.519437+00', '2025-03-21 18:57:44.519437+00', '2025-03-21 18:57:44.519437+00');

-- Sample transactions data
INSERT INTO "public"."transactions" ("id", "user_id", "amount", "description", "type", "reference_id", "created_at") 
VALUES ('b4823041-85d9-4339-93fb-184932bec50e', '0ece322b-6336-412a-9df3-316d952b7d21', '500', 'Basic plan credits purchase', 'purchase', '034f0dff-1ad0-4656-a302-46b97c3b28ca', '2025-03-21 18:57:44.519437+00');
