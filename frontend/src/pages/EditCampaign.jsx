import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { buildApiUrl } from '../config/apiUrl';
import UnifiedNavbar from '../components/layout/Navbars';
import CampaignEditor from '../components/ui/CampaignEditor';
import { AlertTriangle } from 'lucide-react';

const EditCampaign = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) { navigate('/login'); return; }
    if (user?.userType !== 'founder') { navigate('/dashboard'); return; }
    loadCampaign();
  }, [id, isAuthenticated, user]);

  const loadCampaign = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(buildApiUrl(`/campaigns/${id}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || 'Failed to load campaign');

      const d = result.data;

      // Only draft and rejected can be edited
      if (!['draft', 'rejected'].includes(d.status)) {
        navigate('/my-campaigns');
        return;
      }

      // Ownership check
      if (d.creator?.id && user?.id !== d.creator.id) {
        navigate('/my-campaigns');
        return;
      }

      setInitialData(d);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
      <AlertTriangle className="h-12 w-12 text-red-400" />
      <p className="text-gray-700">{error}</p>
      <button onClick={() => navigate('/my-campaigns')}
        className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
        Back to My Campaigns
      </button>
    </div>
  );

  return (
    <>
      <UnifiedNavbar variant="dashboard" />
      <CampaignEditor mode="edit" initialData={initialData} campaignId={id} />
    </>
  );
};

export default EditCampaign;
