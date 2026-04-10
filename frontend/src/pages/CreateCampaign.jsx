import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UnifiedNavbar from '../components/layout/Navbars';
import CampaignEditor from '../components/ui/CampaignEditor';

const CreateCampaign = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated()) { navigate('/login'); return; }
    if (user?.userType !== 'founder') { navigate('/dashboard'); }
  }, [isAuthenticated, user, navigate]);

  return (
    <>
      <UnifiedNavbar variant="dashboard" />
      <CampaignEditor mode="create" />
    </>
  );
};

export default CreateCampaign;
