export interface Customer {
  id: number;
  name: string;
  email: string;
}

export interface CreateCustomerRequest {
  name: string;
  email: string;
}