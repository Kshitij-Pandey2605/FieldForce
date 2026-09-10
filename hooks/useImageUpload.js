import { API_BASE } from '../constants/api';
import { useAuthContext } from '../context/AuthContext';

export const useImageUpload = () => {
  const { token } = useAuthContext();

  const uploadImage = async (uri, visitId) => {
    try {
      const formData = new FormData();
      formData.append('photo', {
        uri,
        type: 'image/jpeg',
        name: `visit_${visitId}_${Date.now()}.jpg`,
      });

      const response = await fetch(`${API_BASE}/visits/${visitId}/photo`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    } catch (error) {
      throw new Error(`Image upload error: ${error.message}`);
    }
  };

  return { uploadImage };
};
