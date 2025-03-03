import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../constants";

export default function UserAnalyticsPage() {
    const [username, setUsername] = useState("");
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const location = useLocation();

    const fetchAnalytics = async (username) => {
        if (!username) {
            setError("Please enter a username");
            return;
        }

        try {
            setLoading(true);
            setError("");
            const response = await axios.get(
                `${API_BASE_URL}/analytics/user/${username}`
            );
            setAnalytics(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching user analytics:", error);
            setError("Failed to fetch user analytics");
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchAnalytics(username);
    };

    useEffect(() => {
        if (location.state?.username) {
            setUsername(location.state.username);
            fetchAnalytics(location.state.username);
        }
    }, [location.state?.username]);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">User Analytics</h1>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bluesky Username
                        </label>
                        <div className="flex">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                @
                            </span>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="username"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                        disabled={loading}
                    >
                        {loading ? "Loading..." : "Get Analytics"}
                    </button>
                    {error && <p className="mt-2 text-red-600">{error}</p>}
                </form>
            </div>

            {analytics && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Analytics for @{analytics.username}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-blue-50 p-4 rounded">
                            <p className="text-sm text-gray-500">Total Posts</p>
                            <p className="text-2xl font-bold">
                                {analytics.post_count}
                            </p>
                        </div>
                        <div className="bg-green-50 p-4 rounded">
                            <p className="text-sm text-gray-500">Total Likes</p>
                            <p className="text-2xl font-bold">
                                {analytics.engagement.total_likes || 0}
                            </p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded">
                            <p className="text-sm text-gray-500">
                                Total Reposts
                            </p>
                            <p className="text-2xl font-bold">
                                {analytics.engagement.total_reposts || 0}
                            </p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">
                            Top Hashtags
                        </h3>
                        {analytics.top_hashtags &&
                        analytics.top_hashtags.length > 0 ? (
                            <div className="bg-gray-50 p-4 rounded">
                                <ul className="space-y-2">
                                    {analytics.top_hashtags.map((tag) => (
                                        <li
                                            key={tag.hashtag}
                                            className="flex justify-between"
                                        >
                                            <span className="text-blue-600">
                                                #{tag.hashtag}
                                            </span>
                                            <span className="text-gray-600">
                                                {tag.count} posts
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <p className="text-gray-500">No hashtags found.</p>
                        )}
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-2">
                            Engagement Summary
                        </h3>
                        <div className="bg-gray-50 p-4 rounded">
                            <p>
                                Average engagement per post:
                                <span className="font-semibold ml-2">
                                    {Math.round(
                                        (((analytics.engagement.total_likes ||
                                            0) +
                                            (analytics.engagement
                                                .total_reposts || 0) +
                                            (analytics.engagement
                                                .total_replies || 0)) /
                                            analytics.post_count) *
                                            10
                                    ) / 10 || 0}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
