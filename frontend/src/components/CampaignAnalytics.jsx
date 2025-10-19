// src/components/CampaignAnalytics.jsx - Analytics component for campaign viewing

import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Heart, 
  TrendingUp, 
  Users, 
  DollarSign,
  Calendar,
  BarChart3,
  Loader
} from 'lucide-react';

const CampaignAnalytics = ({ campaignId, isOwner = false }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (campaignId && isOwner) {
      loadAnalytics();
    }
  }, [campaignId, isOwner]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/campaigns/${campaignId}/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load analytics');
      }

      const result = await response.json();
      
      if (result.success) {
        setAnalytics(result.data);
      } else {
        throw new Error(result.message || 'Failed to load analytics');
      }

    } catch (error) {
      console.error('❌ Error loading analytics:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOwner) {
    return null; // Don't show analytics to non-owners
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-center py-8">
          <Loader className="h-6 w-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="text-center py-8">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Campaign Analytics</h3>
        <BarChart3 className="h-5 w-5 text-gray-400" />
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <Eye className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-900">
            {analytics.overall.view_count || 0}
          </div>
          <div className="text-xs text-blue-600">Total Views</div>
        </div>

        <div className="text-center p-4 bg-red-50 rounded-lg">
          <Heart className="h-6 w-6 text-red-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-red-900">
            {analytics.overall.favorite_count || 0}
          </div>
          <div className="text-xs text-red-600">Favorites</div>
        </div>

        <div className="text-center p-4 bg-green-50 rounded-lg">
          <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-900">
            {Math.round(analytics.overall.funding_percentage || 0)}%
          </div>
          <div className="text-xs text-green-600">Funded</div>
        </div>

        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-900">
            {formatCurrency(analytics.overall.current_amount)}
          </div>
          <div className="text-xs text-purple-600">Raised</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Recent Activity (Last 30 Days)</h4>
        
        {/* Views Chart */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Daily Views</span>
            <Eye className="h-4 w-4 text-gray-400" />
          </div>
          
          {analytics.viewsOverTime && analytics.viewsOverTime.length > 0 ? (
            <div className="space-y-2">
              {analytics.viewsOverTime.slice(0, 5).map((day, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {new Date(day.date).toLocaleDateString()}
                  </span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ 
                          width: `${Math.min((day.views / Math.max(...analytics.viewsOverTime.map(d => d.views))) * 100, 100)}%` 
                        }}
                      />
                    </div>
                    <span className="font-medium">{day.views}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No view data available</p>
          )}
        </div>

        {/* Favorites Chart */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Daily Favorites</span>
            <Heart className="h-4 w-4 text-gray-400" />
          </div>
          
          {analytics.favoritesOverTime && analytics.favoritesOverTime.length > 0 ? (
            <div className="space-y-2">
              {analytics.favoritesOverTime.slice(0, 5).map((day, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {new Date(day.date).toLocaleDateString()}
                  </span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-red-600 h-2 rounded-full"
                        style={{ 
                          width: `${Math.min((day.favorites / Math.max(...analytics.favoritesOverTime.map(d => d.favorites))) * 100, 100)}%` 
                        }}
                      />
                    </div>
                    <span className="font-medium">{day.favorites}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No favorite data available</p>
          )}
        </div>
      </div>

      {/* Performance Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Performance Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Target Amount</span>
            <span className="font-medium">{formatCurrency(analytics.overall.target_amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Amount Raised</span>
            <span className="font-medium">{formatCurrency(analytics.overall.current_amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Funding Progress</span>
            <span className="font-medium">{Math.round(analytics.overall.funding_percentage || 0)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Views</span>
            <span className="font-medium">{analytics.overall.view_count || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Favorites</span>
            <span className="font-medium">{analytics.overall.favorite_count || 0}</span>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Performance Tips</h4>
        <div className="space-y-2 text-sm text-gray-600">
          {analytics.overall.view_count < 100 && (
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
              <span>Share your campaign on social media to increase visibility</span>
            </div>
          )}
          {analytics.overall.favorite_count < 10 && (
            <div className="flex items-start">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
              <span>Encourage supporters to save your campaign for later</span>
            </div>
          )}
          {analytics.overall.funding_percentage < 25 && (
            <div className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
              <span>Consider reaching out to your network for initial funding</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignAnalytics;