# Auth-Gated App Testing Playbook

## Step 1: Create Test User & Session
```bash
psql -U postgres -d test_database -c "
INSERT INTO users (user_id, email, name, picture, created_at) 
VALUES ('user_test123', 'test.user@example.com', 'Test User', 'https://via.placeholder.com/150', NOW());

INSERT INTO user_sessions (user_id, session_token, expires_at, created_at) 
VALUES ('user_test123', 'test_session_123', NOW() + INTERVAL '7 days', NOW());

SELECT 'Session token: test_session_123' as info;
SELECT 'User ID: user_test123' as info;
"
```

## Step 2: Test Backend API
```bash
# Test auth endpoint
curl -X GET "http://localhost:8001/api/auth/me" \
  -H "Authorization: Bearer test_session_123"

# Test protected endpoints
curl -X GET "http://localhost:8001/api/trips" \
  -H "Authorization: Bearer test_session_123"

curl -X POST "http://localhost:8001/api/vehicles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test_session_123" \
  -d '{"name": "Test Vehicle", "make": "Toyota", "model": "Camry", "year": 2020, "business_percentage": 100}'
```

## Step 3: Browser Testing
Set cookie and test in browser console:
```javascript
document.cookie = "session_token=test_session_123; path=/; max-age=604800";
```

## PostgreSQL ID Handling
Use custom `user_id` field and let PostgreSQL handle primary keys.

**Database Schema**:
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    picture TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(user_id),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Quick Debug
```bash
# Check data format
psql -U postgres -d test_database -c "SELECT * FROM users LIMIT 2;"
psql -U postgres -d test_database -c "SELECT * FROM user_sessions LIMIT 2;"

# Clean test data
psql -U postgres -d test_database -c "DELETE FROM user_sessions WHERE session_token LIKE 'test_session%';"
psql -U postgres -d test_database -c "DELETE FROM users WHERE email LIKE 'test.user%';"
```

## Checklist
- [ ] User document has `user_id` field
- [ ] Session `user_id` matches `users.user_id` exactly
- [ ] API returns user data (not 401/404)
- [ ] Browser loads dashboard (not login page)

## Success Indicators
- `/api/auth/me` returns user data with `user_id` field
- Dashboard loads without redirect
- CRUD operations work

## Failure Indicators
- "User not found" errors
- 401 Unauthorized responses
- Redirect to login page
