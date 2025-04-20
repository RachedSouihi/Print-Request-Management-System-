

import axios from 'axios';

export const followUser = async (followerId: string, followedId: string) => {
  try {
    const response = await axios.post(
      'http://localhost:8089/api/follow/follow',
      null, // Pas de corps de requête
      {
        params: {
          followerId,
          followedId,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || 'Erreur lors du follow';
  }
};


export const unfollowUser = async (followerId: string, followedId: string) => {
  try {
    const response = await axios.post(
      'http://localhost:8089/api/follow/unfollow',
      null, // Pas de corps de requête
      {
        params: {
          followerId,
          followedId,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || 'Erreur lors du unfollow';
  }
};
