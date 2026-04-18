export const MOCK_SUPPLIERS = [
  { id: 'SU001', name: 'FUTURA Hardware', email: 'FUTURAHardware@example.com', phone: '+352250698', location: 'kandy', status: 'Active' },
  { id: 'SU002', name: 'ABC Shop', email: 'ABCShop@example.com', phone: '+113728951', location: 'jaffna', status: 'Active' },
  { id: 'SU003', name: 'New hardware shop', email: 'Newhardwareshop@example.com', phone: '+355201739', location: 'colombo', status: 'Active' },
  { id: 'SU004', name: 'central Hardware shop', email: 'centralhardwareshop@example.com', phone: '+704092467', location: 'kegalle', status: 'Active' },
  { id: 'SU005', name: 'A-Z Store', email: 'a2zstore@example.com', phone: '+745749035', location: 'mawanella', status: 'Active' },
  { id: 'SU006', name: 'dammika motors', email: 'dammikamotors@example.com', phone: '+350574627', location: 'colombo 02', status: 'Active' },
  { id: 'SU007', name: 'Asian paint', email: 'Asianpaint@example.com', phone: '+118970365', location: 'Alawwa', status: 'Active' },
  { id: 'SU008', name: 'Alpha Hardware', email: 'Alphahardware@example.com', phone: '+764738103', location: 'kurunegala', status: 'Active' },
  { id: 'SU009', name: 'chathuni motors', email: 'chathunimotors@example.com', phone: '+725904536', location: 'kurunegala', status: 'Active' },
  { id: 'SU010', name: 'cement house', email: 'cementhouse@example.com', phone: '+725640473', location: 'Gampaha', status: 'Inactive' },
  { id: 'SU011', name: 'Dulux Distributors', email: 'dulux@example.com', phone: '+773400291', location: 'colombo', status: 'Active' },
  { id: 'SU012', name: 'Tokyo Super', email: 'tokyosuper@example.com', phone: '+714500900', location: 'galle', status: 'Active' },
];

export const MOCK_PURCHASE_ACTIVITY = [
  { id: '1', date: 'Feb 18, 2026', time: '14:30:25', supplier: 'FUTURA Hardware', poNo: 'HardwareTools', invoice: 'SI-8945', items: 12, amount: 45680, status: 'completed' },
  { id: '2', date: 'Feb 18, 2026', time: '14:15:10', supplier: 'ABC Shop', poNo: 'Electrical Cables', invoice: 'SI-8920', items: 34, amount: 32500, status: 'completed' },
  { id: '3', date: 'Feb 18, 2026', time: '13:45:30', supplier: 'New hardware shop', poNo: 'Plumbing Fittings', invoice: 'SI-8890', items: 34, amount: 28900, status: 'completed' },
  { id: '4', date: 'Feb 18, 2026', time: '13:20:15', supplier: 'central Hardware shop', poNo: 'Hardware Screw', invoice: 'SI-8875', items: 98, amount: 52300, status: 'Returned' },
  { id: '5', date: 'Feb 18, 2026', time: '12:55:40', supplier: 'A-Z Store', poNo: 'Paint Brushes', invoice: 'SI-8850', items: 44, amount: 41200, status: 'completed' },
  { id: '6', date: 'Feb 18, 2026', time: '12:30:20', supplier: 'dammika motors', poNo: 'Tools Safety', invoice: 'SI-8820', items: 55, amount: 36800, status: 'Pending' },
  { id: '7', date: 'Feb 18, 2026', time: '11:45:55', supplier: 'Asian paint', poNo: 'Electrical Switches', invoice: 'SI-8795', items: 12, amount: 24500, status: 'completed' },
  { id: '8', date: 'Feb 18, 2026', time: '11:20:30', supplier: 'Alpha Hardware', poNo: 'cement', invoice: 'SI-8770', items: 65, amount: 18750, status: 'exchanged' },
];

export const MOCK_REQUESTS = [
  { id: 'REQ-2024-001', supplier: 'FUTURA Hardware Solutions', status: 'Approved' },
  { id: 'REQ-2024-002', supplier: 'New hardware shop', status: 'Pending' },
  { id: 'REQ-2024-003', supplier: 'Dammika hardware', status: 'Ordered' },
  { id: 'REQ-2024-006', supplier: 'ABC hardware', status: 'Draft' },
];

export const MOCK_URGENT_ALERTS = [
  { id: 1, product: 'Wall Switch Standard', current: 3, min: 20, suggest: 40 },
  { id: 2, product: 'PVC Pipe 1/2 inch', current: 0, min: 15, suggest: 30 },
  { id: 3, product: 'LED Bulb 60W', current: 12, min: 30, suggest: 60, isYellow: true },
];
