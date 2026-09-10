import { useAuthContext } from '../context/AuthContext';
import { API_BASE } from '../constants/api';

export const useVisitService = () => {
  const { token } = useAuthContext();

  const getVisits = async () => {
    const response = await fetch(`${API_BASE}/visits`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch visits');
    return response.json();
  };

  const getVisitById = async (id) => {
    const response = await fetch(`${API_BASE}/visits/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch visit');
    return response.json();
  };

  const createVisit = async (data) => {
    const response = await fetch(`${API_BASE}/visits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create visit');
    return response.json();
  };

  const updateVisit = async (id, data) => {
    const response = await fetch(`${API_BASE}/visits/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update visit');
    return response.json();
  };

  const deleteVisit = async (id) => {
    const response = await fetch(`${API_BASE}/visits/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to delete visit');
    return response.json();
  };

  return {
    getVisits,
    getVisitById,
    createVisit,
    updateVisit,
    deleteVisit,
  };
};
