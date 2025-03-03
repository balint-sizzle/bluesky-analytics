import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../constants";

export default function TrendingPage() {
    const [trending, setTrending] = useState([]);
    const [timeframe, setTimeframe] = useState(7);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `${API_BASE_URL}/trending?days=${timeframe}`
                );
                setTrending(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching trending hashtags:", error);
                setLoading(false);
            }
        };

        fetchTrending();
    }, [timeframe]);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Trending Hashtags</h1>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timeframe
                </label>
                <select
                    value={timeframe}
                    onChange={(e) => setTimeframe(Number(e.target.value))}
                    className="border rounded p-2 w-full md:w-1/4"
                >
                    <option value={1}>Last 24 hours</option>
                    <option value={3}>Last 3 days</option>
                    <option value={7}>Last 7 days</option>
                    <option value={30}>Last 30 days</option>
                </select>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-6">Loading trending data...</div>
                ) : (
                    <>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rank
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Hashtag
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Count
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {trending.map((tag, index) => (
                                    <tr key={tag.hashtag}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                                            <Link
                                                to={`/posts?hashtag=${tag.hashtag}`}
                                            >
                                                #{tag.hashtag}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {tag.total_count}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {trending.length === 0 && (
                            <div className="p-6 text-center text-gray-500">
                                No trending hashtags found for this timeframe.
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
