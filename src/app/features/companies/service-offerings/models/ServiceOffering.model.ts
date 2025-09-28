export interface ServiceOffering {
  id: string;
  name: string;
  price: number;
  currency: string;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc?: string;
}