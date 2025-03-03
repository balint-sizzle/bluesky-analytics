-- Create the database
CREATE DATABASE bluesky_analytics;

-- Connect to the database
\c bluesky_analytics

-- Create table for storing posts
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    post_id TEXT UNIQUE,
    author TEXT,
    author_display_name TEXT,
    content TEXT,
    created_at TIMESTAMP,
    like_count INTEGER DEFAULT 0,
    repost_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on author for faster queries
CREATE INDEX idx_posts_author ON posts(author);
CREATE INDEX idx_posts_created_at ON posts(created_at);

-- Create table for storing hashtags
CREATE TABLE hashtags (
    id SERIAL PRIMARY KEY,
    post_id TEXT REFERENCES posts(post_id),
    hashtag TEXT,
    UNIQUE(post_id, hashtag)
);

-- Create index on hashtags for trending queries
CREATE INDEX idx_hashtags_hashtag ON hashtags(hashtag);

-- Create table for storing trending hashtags by day
CREATE TABLE trending (
    id SERIAL PRIMARY KEY,
    hashtag TEXT,
    count INTEGER,
    date DATE DEFAULT CURRENT_DATE,
    UNIQUE(hashtag, date)
);

-- Create index for faster trending lookups
CREATE INDEX idx_trending_date ON trending(date);
CREATE INDEX idx_trending_hashtag_date ON trending(hashtag, date);

-- Create a view for user engagement metrics
CREATE VIEW user_engagement AS
SELECT 
    author,
    COUNT(*) as post_count,
    SUM(like_count) as total_likes,
    SUM(repost_count) as total_reposts,
    SUM(reply_count) as total_replies,
    (SUM(like_count) + SUM(repost_count) + SUM(reply_count))::float / COUNT(*) as engagement_rate
FROM posts
GROUP BY author;

-- Create a function to get trending hashtags for a specific date range
CREATE OR REPLACE FUNCTION get_trending_hashtags(start_date DATE, end_date DATE, limit_count INTEGER)
RETURNS TABLE(hashtag TEXT, count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT t.hashtag, SUM(t.count) as total_count
    FROM trending t
    WHERE t.date BETWEEN start_date AND end_date
    GROUP BY t.hashtag
    ORDER BY total_count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;