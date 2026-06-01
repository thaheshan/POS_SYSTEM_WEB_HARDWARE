const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const shopApi = {
  async uploadLogo(file: File, token: string) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/shops/logo`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Failed to upload logo');
    }

    return json.data || json;
  },
};
