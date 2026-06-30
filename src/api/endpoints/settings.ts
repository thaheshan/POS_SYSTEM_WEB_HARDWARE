import api from "../axiosInstance";

export const settingsAPI = {
  /**
   * Fetches shop details/metadata from the backend settings endpoint.
   * Since this endpoint may still be under development by another developer, 
   * we attempt the API request but gracefully fall back to mock data if it fails.
   */
  getShopDetails: async () => {
    try {
      return await api.get("/settings/shop");
    } catch (error) {
      console.warn(
        "[Settings API] Backend endpoint '/settings/shop' is unavailable or under development. Returning fallback mock details.",
        error
      );
      // Return a simulated AxiosResponse-like structure so the calling page gets the expected shape
      return {
        data: {
          name: "AutoParts Superstore Ltd.",
          address: "123 Sheikh Zayed Rd, Dubai, UAE",
          phone: "+971 50 123 4567",
          email: "info@autoparts.ae",
          registrationNumber: "TRN-987654321",
          logoUrl: "",
        },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as any,
      };
    }
  },

  /**
   * Placeholder for updating shop details when the backend settings endpoint is fully developed.
   */
  updateShopDetails: async (data: any) => {
    return api.put("/settings/shop", data);
  }
};
