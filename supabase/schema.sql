-- RealBrand Pro Database Schema
-- Comprehensive schema for real estate brand management platform

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Brokerages table
CREATE TABLE brokerages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255),
    subscription_plan VARCHAR(50) DEFAULT 'professional',
    brand_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brokerage_id UUID REFERENCES brokerages(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'broker', 'senior-agent', 'agent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending')),
    permissions TEXT[] DEFAULT '{}',
    license_number VARCHAR(100),
    phone VARCHAR(20),
    profile_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    CONSTRAINT unique_brokerage_email UNIQUE (brokerage_id, email)
);

-- Brand assets table
CREATE TABLE brand_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brokerage_id UUID REFERENCES brokerages(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('logos', 'colors', 'typography', 'templates', 'imagery', 'compliance', 'general')),
    subcategory VARCHAR(100),
    description TEXT,
    file_type VARCHAR(10) NOT NULL,
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    metadata JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    downloads INTEGER DEFAULT 0,
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent-specific subcategories (for asset categorization)
CREATE TABLE asset_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID REFERENCES brand_assets(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_asset_tag UNIQUE (asset_id, tag)
);

-- Asset downloads tracking
CREATE TABLE downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID REFERENCES brand_assets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    user_agent TEXT,
    ip_address INET,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates for generating custom materials
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brokerage_id UUID REFERENCES brokerages(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('listing', 'open-house', 'email-signature', 'business-card', 'postcard', 'banner', 'other')),
    description TEXT,
    template_data JSONB NOT NULL,
    fields JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    is_default BOOLEAN DEFAULT FALSE,
    downloads INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated materials
CREATE TABLE generated_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    material_data JSONB NOT NULL,
    generated_url TEXT,
    file_type VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compliance tracking
CREATE TABLE compliance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brokerage_id UUID REFERENCES brokerages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    rule_type VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('compliant', 'violation', 'warning', 'pending')),
    description TEXT,
    evidence_urls TEXT[],
    resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics events
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brokerage_id UUID REFERENCES brokerages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    event_type VARCHAR(100) NOT NULL,
    data JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow system tables
CREATE TABLE workflow_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brokerage_id UUID REFERENCES brokerages(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger JSONB NOT NULL,
    conditions JSONB DEFAULT '[]',
    actions JSONB DEFAULT '[]',
    enabled BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE workflow_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID REFERENCES workflow_rules(id) ON DELETE CASCADE,
    triggered_by VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
    result JSONB,
    error TEXT,
    context JSONB DEFAULT '{}',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent onboarding workflows
CREATE TABLE agent_onboarding (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES users(id) ON DELETE CASCADE,
    broker_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
    current_step INTEGER DEFAULT 0,
    steps JSONB NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real-time collaboration tables
CREATE TABLE collaboration_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    page VARCHAR(255) NOT NULL,
    cursor_position JSONB,
    focus_element VARCHAR(255),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_session UNIQUE (session_id)
);

CREATE TABLE collaboration_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session JSONB NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    data JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID REFERENCES brand_assets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    position_x INTEGER,
    position_y INTEGER,
    resolved BOOLEAN DEFAULT FALSE,
    parent_id UUID REFERENCES comments(id),
    replies_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enterprise configuration
CREATE TABLE enterprise_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brokerage_id UUID REFERENCES brokerages(id) ON DELETE CASCADE UNIQUE,
    config JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications system
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brokerage_id UUID REFERENCES brokerages(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
    read BOOLEAN DEFAULT FALSE,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Tasks for workflow automation
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brokerage_id UUID REFERENCES brokerages(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API usage tracking for rate limiting
CREATE TABLE api_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brokerage_id UUID REFERENCES brokerages(id) ON DELETE CASCADE,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    response_time INTEGER,
    status_code INTEGER,
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Storage usage tracking
CREATE TABLE storage_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brokerage_id UUID REFERENCES brokerages(id) ON DELETE CASCADE,
    total_size BIGINT DEFAULT 0,
    asset_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compliance scores tracking
CREATE TABLE compliance_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brokerage_id UUID REFERENCES brokerages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    factors JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_brokerage_id ON users(brokerage_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_brand_assets_category ON brand_assets(category);
CREATE INDEX idx_brand_assets_status ON brand_assets(status);
CREATE INDEX idx_downloads_user_id ON downloads(user_id);
CREATE INDEX idx_downloads_asset_id ON downloads(asset_id);
CREATE INDEX idx_templates_type ON templates(type);
CREATE INDEX idx_compliance_user_id ON compliance_records(user_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_api_usage_brokerage ON api_usage(brokerage_id);

-- RLS policies (Row Level Security)
ALTER TABLE brokerages ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies (example for brokerages)
CREATE POLICY "Users can only access their brokerage data" ON brokerages
    FOR ALL USING (auth.jwt() ->> 'brokerage_id' = id::text);

-- Functions for analytics
CREATE OR REPLACE FUNCTION get_top_assets(p_brokerage_id UUID, p_timeframe VARCHAR(10))
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    category VARCHAR(50),
    downloads INTEGER,
    unique_downloads INTEGER,
    avg_rating NUMERIC,
    conversion_rate NUMERIC,
    last_download TIMESTAMP WITH TIME ZONE,
    trend VARCHAR(10),
    trend_percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ba.id,
        ba.name,
        ba.category,
        ba.downloads,
        COUNT(DISTINCT d.user_id)::INTEGER as unique_downloads,
        0.0::NUMERIC as avg_rating,
        0.0::NUMERIC as conversion_rate,
        MAX(d.downloaded_at) as last_download,
        'stable'::VARCHAR as trend,
        0.0::NUMERIC as trend_percentage
    FROM brand_assets ba
    LEFT JOIN downloads d ON ba.id = d.asset_id
    WHERE ba.brokerage_id = p_brokerage_id
        AND ba.status = 'published'
        AND d.downloaded_at >= (CASE 
            WHEN p_timeframe = '7d' THEN NOW() - INTERVAL '7 days'
            WHEN p_timeframe = '30d' THEN NOW() - INTERVAL '30 days'
            WHEN p_timeframe = '90d' THEN NOW() - INTERVAL '90 days'
            ELSE NOW() - INTERVAL '30 days'
        END)
    GROUP BY ba.id, ba.name, ba.category, ba.downloads
    ORDER BY downloads DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_download_count(p_asset_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE brand_assets 
    SET downloads = downloads + 1 
    WHERE id = p_asset_id;
END;
$$ LANGUAGE plpgsql;

-- Triggers for maintaining updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_brokerages_updated_at BEFORE UPDATE ON brokerages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_brand_assets_updated_at BEFORE UPDATE ON brand_assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_compliance_records_updated_at BEFORE UPDATE ON compliance_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for common queries
CREATE VIEW active_users_summary AS
SELECT 
    b.id as brokerage_id,
    b.name as brokerage_name,
    COUNT(u.id) as total_users,
    COUNT(CASE WHEN u.status = 'active' THEN 1 END) as active_users,
    COUNT(CASE WHEN u.role = 'agent' THEN 1 END) as agents,
    COUNT(CASE WHEN u.role = 'broker' THEN 1 END) as brokers,
    COUNT(CASE WHEN u.role = 'admin' THEN 1 END) as admins
FROM brokerages b
LEFT JOIN users u ON b.id = u.brokerage_id
GROUP BY b.id, b.name;

CREATE VIEW asset_summary AS
SELECT 
    b.id as brokerage_id,
    b.name as brokerage_name,
    ba.category,
    COUNT(*) as total_assets,
    COUNT(CASE WHEN ba.status = 'published' THEN 1 END) as published_assets,
    SUM(downloads) as total_downloads,
    AVG(downloads) as avg_downloads
FROM brokerages b
LEFT JOIN brand_assets ba ON b.id = ba.brokerage_id
GROUP BY b.id, b.name, ba.category;
