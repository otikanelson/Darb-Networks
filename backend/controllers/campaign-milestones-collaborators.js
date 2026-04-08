// Add these helper functions to campaign.controller.js

// Helper function to save milestones
async function saveMilestones(campaignId, milestones, connection) {
  if (!milestones || !Array.isArray(milestones) || milestones.length === 0) {
    return;
  }

  // Delete existing milestones
  await connection.query(
    'DELETE FROM campaign_milestones WHERE campaign_id = ?',
    {
      replacements: [campaignId],
      type: connection.QueryTypes.DELETE
    }
  );

  // Insert new milestones
  for (let i = 0; i < milestones.length; i++) {
    const milestone = milestones[i];
    await connection.query(
      `INSERT INTO campaign_milestones 
       (campaign_id, title, description, target_amount, image_url, video_url, order_index) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          campaignId,
          milestone.title,
          milestone.description,
          parseFloat(milestone.targetAmount) || 0,
          milestone.imageUrl || null,
          milestone.videoUrl || null,
          i + 1
        ],
        type: connection.QueryTypes.INSERT
      }
    );
  }
  
  console.log(`✅ Saved ${milestones.length} milestones for campaign ${campaignId}`);
}

// Helper function to save collaborators
async function saveCollaborators(campaignId, collaborators, connection) {
  if (!collaborators || !Array.isArray(collaborators) || collaborators.length === 0) {
    return;
  }

  // Delete existing collaborators
  await connection.query(
    'DELETE FROM campaign_collaborators WHERE campaign_id = ?',
    {
      replacements: [campaignId],
      type: connection.QueryTypes.DELETE
    }
  );

  // Insert new collaborators
  for (let i = 0; i < collaborators.length; i++) {
    const collab = collaborators[i];
    await connection.query(
      `INSERT INTO campaign_collaborators 
       (campaign_id, name, role, description, email, phoneNumber, order_index) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          campaignId,
          collab.name,
          collab.role,
          collab.description || null,
          collab.email || null,
          collab.phoneNumber || null,
          i + 1
        ],
        type: connection.QueryTypes.INSERT
      }
    );
  }
  
  console.log(`✅ Saved ${collaborators.length} collaborators for campaign ${campaignId}`);
}

// Helper function to get milestones
async function getMilestones(campaignId, connection) {
  const milestones = await connection.query(
    `SELECT id, title, description, target_amount as targetAmount, current_amount as currentAmount,
            image_url as imageUrl, video_url as videoUrl, status, order_index as orderIndex
     FROM campaign_milestones 
     WHERE campaign_id = ? 
     ORDER BY order_index ASC`,
    {
      replacements: [campaignId],
      type: connection.QueryTypes.SELECT
    }
  );
  return milestones;
}

// Helper function to get collaborators
async function getCollaborators(campaignId, connection) {
  const collaborators = await connection.query(
    `SELECT id, name, role, description, email, phoneNumber, 
            profile_image_url as profileImageUrl, linkedin_url as linkedinUrl, order_index as orderIndex
     FROM campaign_collaborators 
     WHERE campaign_id = ? 
     ORDER BY order_index ASC`,
    {
      replacements: [campaignId],
      type: connection.QueryTypes.SELECT
    }
  );
  return collaborators;
}

module.exports = {
  saveMilestones,
  saveCollaborators,
  getMilestones,
  getCollaborators
};
