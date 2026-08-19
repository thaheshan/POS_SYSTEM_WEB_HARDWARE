export interface ActiveShop {
  id: string;
  name: string;
}

export interface VerificationResponse {
  success: boolean;
  message: string;
}

export interface ShopAssociationProps {
  onVerificationSuccess: (shopId: string) => void;
}