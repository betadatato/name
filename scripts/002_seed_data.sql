-- Insert sample admin user (password: admin123)
INSERT INTO users (username, email, password_hash, is_email_confirmed, role, status) VALUES 
('admin', 'admin@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlDO', TRUE, 'admin', 'active')
ON CONFLICT (email) DO NOTHING;

-- Insert sample regular user (password: user123)
INSERT INTO users (username, email, password_hash, is_email_confirmed, role, status) VALUES 
('john_doe', 'john@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlDO', TRUE, 'user', 'active')
ON CONFLICT (email) DO NOTHING;

-- Get user IDs for sample data
DO $$
DECLARE
    admin_id UUID;
    user_id UUID;
BEGIN
    SELECT id INTO admin_id FROM users WHERE email = 'admin@example.com';
    SELECT id INTO user_id FROM users WHERE email = 'john@example.com';
    
    -- Insert sample sites
    INSERT INTO sites (user_id, name, url, description, check_interval, status_page_slug) VALUES 
    (admin_id, 'Main Website', 'https://example.com', 'Primary company website', 5, 'main-website'),
    (admin_id, 'API Server', 'https://api.example.com', 'REST API endpoint', 2, 'api-server'),
    (admin_id, 'Blog', 'https://blog.example.com', 'Company blog', 10, 'blog'),
    (user_id, 'Dashboard', 'https://dashboard.example.com', 'User dashboard', 5, 'dashboard'),
    (user_id, 'Payment Gateway', 'https://payments.example.com', 'Payment processing', 1, 'payments')
    ON CONFLICT (status_page_slug) DO NOTHING;
END $$;
