export interface Customer {
  id: string;
  name: string;
  initials?: string;
  image?: string;
  colorClass?: string;
  type: string;
  phone: string;
  email: string;
  totalPurchases: number;
  transactions: number;
  outstanding: number;
  isOverdue?: boolean;
  overdueDays?: number;
  lastActive: string;
  hasAvatar?: boolean;
}

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'CUST-00234', name: 'John Perera', initials: 'JP', colorClass: 'bg-[#2563eb] text-white', type: 'Business', phone: '+94 77 123 4567', email: 'john@business.lk', totalPurchases: 487560, transactions: 156, outstanding: 12450, lastActive: '2 days ago', hasAvatar: false },
  { id: 'CUST-00235', name: 'Sarah Fernando', image: 'https://api.dicebear.com/7.x/faces/svg?seed=Sarah', type: 'Individual', phone: '+94 71 987 6543', email: 'sarah.h@email.com', totalPurchases: 89200, transactions: 24, outstanding: 0, lastActive: '1 week ago', hasAvatar: true },
  { id: 'CUST-00188', name: 'Mega Networks', initials: 'MN', colorClass: 'bg-gray-200 text-gray-700', type: 'Business', phone: '+94 11 234 5678', email: 'accounts@meganet.lk', totalPurchases: 1245000, transactions: 89, outstanding: 185000, isOverdue: true, overdueDays: 45, lastActive: '1 month ago', hasAvatar: false },
  { id: 'CUST-00417', name: 'Kamal Silva', image: 'https://api.dicebear.com/7.x/faces/svg?seed=Kamal', type: 'Individual', phone: '+94 77 555 1234', email: 'kamal.s@gmail.com', totalPurchases: 45500, transactions: 8, outstanding: 0, lastActive: '3 weeks ago', hasAvatar: true },
  { id: 'CUST-00418', name: 'ABC Builders', initials: 'AB', colorClass: 'bg-emerald-500 text-white', type: 'Business', phone: '+94 11 222 3344', email: 'procurement@abcbuilders.lk', totalPurchases: 850000, transactions: 62, outstanding: 45000, lastActive: '12 hours ago', hasAvatar: false },
  { id: 'CUST-00419', name: 'Nimal Jayasooriya', image: 'https://api.dicebear.com/7.x/faces/svg?seed=Nimal', type: 'Individual', phone: '+94 72 333 4455', email: 'nimal.j@gmail.com', totalPurchases: 12500, transactions: 3, outstanding: 0, lastActive: '2 months ago', hasAvatar: true },
];
