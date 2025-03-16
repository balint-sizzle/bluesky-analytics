import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

// Modify the existing UserAnalyticsPage component to include these graphs
const UserAnalyticsPage = () => {
  const [username, setUsername] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [historicalData, setHistoricalData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username) {
      setError('Please enter a username');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Main user analytics
      const response = await axios.get(`${API_BASE_URL}/analytics/user/${username}`);
      setAnalytics(response.data);
      
      
      const historicalResponse = await axios.get(`${API_BASE_URL}/analytics/user/${username}/historical`);
      setHistoricalData(historicalResponse.data);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      setError('Failed to fetch user analytics');
      setLoading(false);
    }
  };

  // Engagement Composition Pie Chart
  const EngagementCompositionChart = () => {
    if (!analytics) return null;

    const engagementData = [
      { name: 'Likes', value: analytics.engagement.total_likes || 0 },
      { name: 'Reposts', value: analytics.engagement.total_reposts || 0 },
      { name: 'Replies', value: analytics.engagement.total_replies || 0 }
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Engagement Composition</h3>
        <PieChart width={400} height={300}>
          <Pie
            data={engagementData}
            cx={200}
            cy={150}
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {engagementData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>
    );
  };

  // Historical Engagement Line Chart
  const HistoricalEngagementChart = () => {
    if (!historicalData) return null;

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Historical Engagement</h3>
        <LineChart
          width={600}
          height={300}
          data={historicalData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="likes" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="reposts" stroke="#82ca9d" />
          <Line type="monotone" dataKey="replies" stroke="#ffc658" />
        </LineChart>
      </div>
    );
  };

  // Hashtag Usage Bar Chart
  const HashtagUsageChart = () => {
    if (!analytics || !analytics.top_hashtags) return null;

    const hashtagData = analytics.top_hashtags.map(tag => ({
      name: `#${tag.hashtag}`,
      posts: tag.count
    }));

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Top Hashtag Usage</h3>
        <BarChart
          width={600}
          height={300}
          data={hashtagData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="posts" fill="#8884d8" />
        </BarChart>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">User Analytics</h1>
      
      {/* Existing username input form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <form onSubmit={handleSubmit}>
          {/* ... (previous form code remains the same) */}
        </form>
      </div>
      
      {/* Graphs Container */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EngagementCompositionChart />
          <HashtagUsageChart />
          {historicalData && <HistoricalEngagementChart />}
        </div>
      )}
    </div>
  );
};

export default UserAnalyticsPage;