# app.py - Main Flask application

from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import os
import json
import requests
from atproto import Client
from datetime import datetime, timedelta
import time
import threading
import dotenv

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
dotenv.load_dotenv()  # Load environment variables from .env file

# Database connection information
DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_NAME = os.environ.get("DB_NAME", "bluesky-analytics")
DB_USER = os.environ.get("DB_USER", "postgres")
DB_PASS = os.environ.get("DB_PASS", "1234")

# Bluesky API information
BLUESKY_API_URL = "https://bsky.social/xrpc"
BLUESKY_USERNAME = os.environ.get("BLUESKY_USERNAME", "")
BLUESKY_PASSWORD = os.environ.get("BLUESKY_PASSWORD", "")

# Utility functions
def get_db_connection():
    """Establish a connection to the PostgreSQL database"""
    conn = psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASS,
        cursor_factory=RealDictCursor
    )
    return conn

def bluesky_login():
    """Login to Bluesky and get a client object"""
    client = Client()
    try:
        client.login(BLUESKY_USERNAME, BLUESKY_PASSWORD)
        return client
    except Exception as e:
        print(f"Login failed: {e}")
        return None

def init_db():
    """Initialize database tables if they don't exist"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Create tables
    cur.execute('''
    CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        post_id TEXT UNIQUE,
        author TEXT,
        author_display_name TEXT,
        content TEXT,
        created_at TIMESTAMP,
        like_count INTEGER DEFAULT 0,
        repost_count INTEGER DEFAULT 0,
        reply_count INTEGER DEFAULT 0,
        collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        avatar TEXT
    )
    ''')
    
    cur.execute('''
    CREATE TABLE IF NOT EXISTS hashtags (
        id SERIAL PRIMARY KEY,
        post_id TEXT REFERENCES posts(post_id),
        hashtag TEXT,
        UNIQUE(post_id, hashtag)
    )
    ''')
    
    cur.execute('''
    CREATE TABLE IF NOT EXISTS trending (
        id SERIAL PRIMARY KEY,
        hashtag TEXT,
        count INTEGER,
        date DATE DEFAULT CURRENT_DATE,
        UNIQUE(hashtag, date)
    )
    ''')
    
    conn.commit()
    cur.close()
    conn.close()

# API Routes
@app.route('/api/trending', methods=['GET'])
def get_trending():
    """Get trending hashtags for the last 7 days"""
    days = request.args.get('days', default=7, type=int)
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute('''
    SELECT hashtag, SUM(count) as total_count
    FROM trending
    WHERE date >= CURRENT_DATE - %s
    GROUP BY hashtag
    ORDER BY total_count DESC
    LIMIT 10
    ''', (days,))
    
    trending = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return jsonify(trending)

@app.route('/api/posts', methods=['GET'])
def get_posts():
    """Get recent posts with optional filtering"""
    hashtag = request.args.get('hashtag', default=None)
    author = request.args.get('author', default=None)
    limit = request.args.get('limit', default=50, type=int)
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    query = '''
    SELECT p.*
    FROM posts p
    '''
    
    params = []
    where_clauses = []
    
    if hashtag:
        query += '''
        JOIN hashtags h ON p.post_id = h.post_id
        '''
        where_clauses.append("h.hashtag = %s")
        params.append(hashtag)
    
    if author:
        where_clauses.append("p.author = %s")
        params.append(author)
    
    if where_clauses:
        query += "WHERE " + " AND ".join(where_clauses)
    
    query += '''
    ORDER BY p.created_at DESC
    LIMIT %s
    '''
    params.append(limit)
    
    cur.execute(query, params)
    posts = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return jsonify(posts)

@app.route('/api/analytics/user/<username>', methods=['GET'])
def get_user_analytics(username):
    """Get analytics for a specific user"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Get post count
    cur.execute("SELECT COUNT(*) as post_count FROM posts WHERE author = %s", (username,))
    post_count = cur.fetchone()['post_count']
    
    # Get total engagement
    cur.execute("""
    SELECT 
        SUM(like_count) as total_likes,
        SUM(repost_count) as total_reposts,
        SUM(reply_count) as total_replies
    FROM posts
    WHERE author = %s
    """, (username,))
    engagement = cur.fetchone()
    
    # Get top hashtags
    cur.execute("""
    SELECT h.hashtag, COUNT(*) as count
    FROM hashtags h
    JOIN posts p ON h.post_id = p.post_id
    WHERE p.author = %s
    GROUP BY h.hashtag
    ORDER BY count DESC
    LIMIT 5
    """, (username,))
    top_hashtags = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return jsonify({
        "username": username,
        "post_count": post_count,
        "engagement": engagement,
        "top_hashtags": top_hashtags
    })

# Data collection functions
def fetch_recent_posts():
    """Fetch recent posts from Bluesky and store in database"""
    client = bluesky_login()
    if not client:
        print("Failed to login to Bluesky")
        return

    author = "chrislhayes.bsky.social"
    
    # Get popular posts
    try:
        response = client.get_author_feed(author, limit=50)
    except Exception as e:
        print(f"Failed to fetch timeline: {e}")
        return
    
    posts_data = response.model_dump()
    print(f"Fetched {len(posts_data.get('feed', []))} posts")
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    for post_item in posts_data.get('feed', []):
        post = post_item.get('post', {})
        if not post:
            continue
            
        post_id = post.get('uri', '').split('/')[-1]
        author = post.get('author', {}).get('handle', '')
        author_display_name = post.get('author', {}).get('display_name', '')
        avatar = post.get('author', {}).get('avatar', '')
        
        record = post.get('record', {})
        content = record.get('text', '')
        created_at = datetime.fromisoformat(record.get('created_at').replace('Z', '+00:00'))
        
        # Get metrics
        like_count = 0
        repost_count = 0
        reply_count = 0
        
        like_count = post['like_count']
        repost_count = post['repost_count']
        reply_count = post['reply_count']
        
        # Insert or update post
        try:
            cur.execute('''
            INSERT INTO posts
                (post_id, author, author_display_name, content, created_at, like_count, repost_count, reply_count, avatar)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (post_id) 
            DO UPDATE SET 
                like_count = EXCLUDED.like_count,
                repost_count = EXCLUDED.repost_count,
                reply_count = EXCLUDED.reply_count,
                collected_at = CURRENT_TIMESTAMP
            ''', (
                post_id, author, author_display_name, content, created_at, 
                like_count, repost_count, reply_count, avatar
            ))
            
            # Extract and save hashtags
            hashtags = [word[1:] for word in content.split() if word.startswith('#')]
            for tag in hashtags:
                try:
                    cur.execute('''
                    INSERT INTO hashtags (post_id, hashtag)
                    VALUES (%s, %s)
                    ON CONFLICT (post_id, hashtag) DO NOTHING
                    ''', (post_id, tag))
                except Exception as e:
                    print(f"Error inserting hashtag: {e}")
            
        except Exception as e:
            print(f"Error processing post {post_id}: {e}")
    
    # Update trending hashtags
    cur.execute('''
    INSERT INTO trending (hashtag, count, date)
    SELECT hashtag, COUNT(*) as count, CURRENT_DATE as date
    FROM hashtags h
    JOIN posts p ON h.post_id = p.post_id
    WHERE p.created_at >= CURRENT_DATE - INTERVAL '1 day'
    GROUP BY hashtag
    ON CONFLICT (hashtag, date) 
    DO UPDATE SET count = EXCLUDED.count
    ''')
    
    conn.commit()
    cur.close()
    conn.close()

def schedule_data_collection():
    """Run data collection on a schedule"""
    while True:
        try:
            fetch_recent_posts()
            print(f"Data collection completed at {datetime.now()}")
        except Exception as e:
            print(f"Error in data collection: {e}")
        
        # Sleep for 15 minutes
        time.sleep(900)

# Main application entry point
if __name__ == "__main__":
    # Initialize database
    init_db()

    
    # Start data collection in background thread
    collector_thread = threading.Thread(target=schedule_data_collection)
    collector_thread.daemon = True
    collector_thread.start()
    
    # Start Flask app
    app.run(host="0.0.0.0", port=5000, debug=True)