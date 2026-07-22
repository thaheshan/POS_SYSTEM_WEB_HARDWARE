import api from "../axiosInstance";

export const settingsAPI = {
  /**
   * Fetches shop details/metadata from the backend settings endpoint.
   */
  getShopDetails: async () => {
    try {
      const response = await api.get("/shop/profile");
      const shop = response.data?.data || response.data;
      
      return {
        ...response,
        data: {
          name: shop?.name || "",
          address: shop?.address || "",
          phone: shop?.phone || "",
          email: shop?.email || "",
          registrationNumber: shop?.business_registration_no || "",
          logoUrl: shop?.logo_url || "",
        },
      };
    } catch (error) {
      console.error("[Settings API] Failed to fetch shop profile:", error);
      throw error;
    }
  },

  /**
   * Updates shop details/metadata.
   */
  updateShopDetails: async (data: any) => {
    const apiBody: any = {};
    if (data.name !== undefined) apiBody.name = data.name;
    if (data.registrationNumber !== undefined) apiBody.business_registration_no = data.registrationNumber;
    if (data.phone !== undefined) apiBody.phone = data.phone;
    if (data.email !== undefined) apiBody.email = data.email;
    if (data.address !== undefined) apiBody.address = data.address;
    if (data.city !== undefined) apiBody.city = data.city;
    if (data.district !== undefined) apiBody.district = data.district;
    if (data.province !== undefined) apiBody.province = data.province;

    return api.put("/shop/profile", apiBody);
  }
};
