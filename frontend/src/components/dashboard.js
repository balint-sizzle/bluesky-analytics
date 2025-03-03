import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../constants";
import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {
    const [recentPosts, setRecentPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const handleUserClick = (username) => {
        navigate(`/user-analytics`, { state: { username: username } });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    `${API_BASE_URL}/posts?limit=50`
                );
                setRecentPosts(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching recent posts:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">
                Bluesky Analytics Dashboard
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-2">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            Recent Posts
                        </h2>
                        {loading ? (
                            <p>Loading posts...</p>
                        ) : (
                            <div className="space-y-4">
                                {recentPosts.map((post) => (
                                    <div
                                        key={post.post_id}
                                        className="border-b pb-4"
                                    >
                                        <div className="flex items-center mb-2">
                                            {/* <img
                                                src={
                                                    post.avatar //||
                                                    //"https://bsky.social/images/default-avatar.png"
                                                }
                                                alt={`${post.author_display_name}'s avatar`}
                                                onError={(e) => {
                                                    // e.target.src =
                                                    //     "https://bsky.social/images/default-avatar.png";
                                                    e.target.className =
                                                        "w-10 h-10 rounded-full bg-gray-200 mr-3";
                                                }}
                                                className="w-10 h-10 rounded-full object-cover mr-3"
                                            /> */}
                                            {/*TODO: images not loading. API problem or Bluesky? */}
                                            <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
                                            <div>
                                                <a
                                                    className="font-semibold"
                                                    onClick={() =>
                                                        handleUserClick(
                                                            post.author
                                                        )
                                                    }
                                                >
                                                    {post.author_display_name}
                                                </a>
                                                <p className="text-sm text-gray-500">
                                                    @{post.author}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="mb-2">{post.content}</p>
                                        <div className="text-sm text-gray-500 flex space-x-4">
                                            <span>❤️ {post.like_count}</span>
                                            <span>🔁 {post.repost_count}</span>
                                            <span>💬 {post.reply_count}</span>
                                            <span>
                                                {new Date(
                                                    post.created_at
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">
                            Quick Stats
                        </h2>
                        <div className="space-y-4">
                            <div className="bg-blue-50 p-4 rounded">
                                <p className="text-sm text-gray-500">
                                    Posts Collected
                                </p>
                                <p className="text-2xl font-bold">
                                    {recentPosts.length}
                                </p>
                            </div>
                            <div className="bg-green-50 p-4 rounded">
                                <p className="text-sm text-gray-500">
                                    Total Engagement
                                </p>
                                <p className="text-2xl font-bold">
                                    {recentPosts.reduce(
                                        (sum, post) =>
                                            sum +
                                            post.like_count +
                                            post.repost_count +
                                            post.reply_count,
                                        0
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
