import { Meta } from ".";

export interface Customer {
    id: string;
    name: string;
    phone: string;
}
  
export interface CustomersResponse {
    status: string;
    data: Customer[];
    meta: Meta;
}