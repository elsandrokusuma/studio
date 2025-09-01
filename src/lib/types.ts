export type InventoryItem = {
  id: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  photoUrl?: string;
};

export type Transaction = {
  id: string;
  itemId: string;
  itemName:string;
  type: 'in' | 'out' | 'edit' | 'add' | 'delete';
  quantity: number;
  date: string;
  person?: string; // Supplier for 'in', Recipient for 'out'
};


export type PreOrder = {
  id: string;
  poNumber: string;
  itemId: string;
  itemName: string;
  price: number;
  unit: string;
  quantity: number;
  orderDate: string;
  expectedDate: string;
  status: 'Pending' | 'Awaiting Approval' | 'Approved' | 'Rejected' | 'Fulfilled' | 'Cancelled';
};

export type SparepartRequest = {
  id: string;
  requestNumber: string;
  itemName: string;
  company: string;
  quantity: number;
  price: number;
  requester: string;
  requestDate: string;
  status: 'Awaiting Approval' | 'Approved' | 'Rejected';
};

    