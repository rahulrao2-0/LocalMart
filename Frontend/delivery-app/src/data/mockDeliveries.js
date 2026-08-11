/**
 * Single source of truth for the demo delivery data.
 *
 * All coordinates are centred around Kothri Kalan, Sehore & Bhopal, MP, India.
 * Max radius: < 100 km.
 */

export const DELIVERY_STATUS = {
  NEW: 'new',
  ACCEPTED: 'accepted',
  PICKED_UP: 'picked_up',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const STATUS_META = {
  [DELIVERY_STATUS.NEW]: { label: 'New request', color: 'warning' },
  [DELIVERY_STATUS.ACCEPTED]: { label: 'Accepted', color: 'info' },
  [DELIVERY_STATUS.PICKED_UP]: { label: 'Picked up', color: 'secondary' },
  [DELIVERY_STATUS.IN_TRANSIT]: { label: 'In transit', color: 'primary' },
  [DELIVERY_STATUS.DELIVERED]: { label: 'Delivered', color: 'success' },
  [DELIVERY_STATUS.CANCELLED]: { label: 'Cancelled', color: 'error' },
};

// Progress order for the delivery stepper.
export const DELIVERY_STAGES = [
  DELIVERY_STATUS.ACCEPTED,
  DELIVERY_STATUS.PICKED_UP,
  DELIVERY_STATUS.IN_TRANSIT,
  DELIVERY_STATUS.DELIVERED,
];

export const mockDeliveries = [
  {
    id: 'DEL-2041',
    orderId: 'ORD-98231',
    status: DELIVERY_STATUS.NEW,
    placedAtLabel: '2 min ago',
    slaMinutes: 35,
    paymentMode: 'prepaid',
    orderValue: 742,
    payout: 95,
    distanceKm: 8.5,
    customer: { name: 'Deepak Patel', phone: '+91 98930 11223', rating: 4.9 },
    pickup: {
      name: 'Kothri Kalan Kisan Supermart',
      address: 'Bhopal-Indore Highway, Kothri Kalan, Sehore 466116',
      phone: '+91 7562 241001',
      position: { lat: 23.1852, lng: 77.0180 },
    },
    drop: {
      address: 'House No 45, Main Market Road, Sehore City 466001',
      landmark: 'Near Town Hall & Bus Stand',
      position: { lat: 23.2032, lng: 77.0844 },
    },
    items: [
      { name: 'Fresh Milk', qty: 2, weight: '1 L' },
      { name: 'Sourdough Bread', qty: 1, weight: '400 g' },
      { name: 'Aashirvaad Atta', qty: 1, weight: '5 kg' },
    ],
    notes: 'Call before arriving, ring doorbell.',
  },
  {
    id: 'DEL-2042',
    orderId: 'ORD-98244',
    status: DELIVERY_STATUS.NEW,
    placedAtLabel: '6 min ago',
    slaMinutes: 40,
    paymentMode: 'cod',
    orderValue: 1285,
    payout: 110,
    distanceKm: 3.2,
    customer: { name: 'Rahul Verma', phone: '+91 99071 44567', rating: 4.6 },
    pickup: {
      name: 'Sehore Daily Fresh Provisions',
      address: 'Station Road, Sehore 466001',
      phone: '+91 7562 223344',
      position: { lat: 23.2010, lng: 77.0810 },
    },
    drop: {
      address: '18, Bhopal Naka, Near Bus Stand, Sehore 466001',
      landmark: 'Next to Government School',
      position: { lat: 23.2080, lng: 77.0920 },
    },
    items: [
      { name: 'Basmati Rice', qty: 1, weight: '10 kg' },
      { name: 'Fortune Sunflower Oil', qty: 2, weight: '1 L' },
    ],
    notes: 'Collect ₹1,285 in cash on delivery.',
  },
  {
    id: 'DEL-2043',
    orderId: 'ORD-98250',
    status: DELIVERY_STATUS.NEW,
    placedAtLabel: '11 min ago',
    slaMinutes: 30,
    paymentMode: 'prepaid',
    orderValue: 398,
    payout: 65,
    distanceKm: 1.8,
    customer: { name: 'Meena Sharma', phone: '+91 94250 22334', rating: 5.0 },
    pickup: {
      name: 'LocalMart Express Hub',
      address: 'Bypass Road, Kothri Kalan, Sehore 466116',
      phone: '+91 7562 255667',
      position: { lat: 23.1865, lng: 77.0210 },
    },
    drop: {
      address: 'Gram Kothri, Ashta Road, Kothri Kalan, Sehore 466116',
      landmark: 'Near Panchayat Bhavan',
      position: { lat: 23.1820, lng: 77.0150 },
    },
    items: [
      { name: 'Fresh Tomatoes', qty: 1, weight: '1 kg' },
      { name: 'Amul Curd', qty: 2, weight: '400 g' },
    ],
    notes: '',
  },
  {
    id: 'DEL-2039',
    orderId: 'ORD-98198',
    status: DELIVERY_STATUS.ACCEPTED,
    placedAtLabel: '18 min ago',
    slaMinutes: 50,
    paymentMode: 'prepaid',
    orderValue: 1450,
    payout: 220,
    distanceKm: 42.5,
    customer: { name: 'Pooja Solanki', phone: '+91 97520 55678', rating: 4.8 },
    pickup: {
      name: 'Bairagarh Wholesale Mart',
      address: 'Bairagarh Main Road, Bhopal 462030',
      phone: '+91 755 2731010',
      position: { lat: 23.2650, lng: 77.3400 },
    },
    drop: {
      address: 'Plot 55, MP Nagar Zone-1, Bhopal 462011',
      landmark: 'Behind Chetak Bridge Metro Station',
      position: { lat: 23.2320, lng: 77.4320 },
    },
    items: [
      { name: 'Fresh Paneer', qty: 2, weight: '500 g' },
      { name: 'Multigrain Bread', qty: 1, weight: '400 g' },
      { name: 'Farm Fresh Eggs', qty: 1, weight: '12 pcs' },
    ],
    notes: 'Call on arrival, security entry required.',
  },
  {
    id: 'DEL-2038',
    orderId: 'ORD-98180',
    status: DELIVERY_STATUS.PICKED_UP,
    placedAtLabel: '24 min ago',
    slaMinutes: 35,
    paymentMode: 'cod',
    orderValue: 845,
    payout: 140,
    distanceKm: 22.0,
    customer: { name: 'Sunil Chouhan', phone: '+91 98260 77889', rating: 4.7 },
    pickup: {
      name: 'Ichhawar Farmers Co-op Store',
      address: 'Ichhawar Main Road, Sehore 466115',
      phone: '+91 7562 266144',
      position: { lat: 23.0244, lng: 77.0142 },
    },
    drop: {
      address: 'Gram Barkheda, Ichhawar Road, Sehore 466115',
      landmark: 'Near Hanuman Temple',
      position: { lat: 23.0550, lng: 77.0250 },
    },
    items: [{ name: 'Assorted Fresh Vegetables', qty: 1, weight: '5 kg' }],
    notes: 'Collect ₹845 in cash on delivery.',
  },
  {
    id: 'DEL-2037',
    orderId: 'ORD-98165',
    status: DELIVERY_STATUS.IN_TRANSIT,
    placedAtLabel: '31 min ago',
    slaMinutes: 45,
    paymentMode: 'prepaid',
    orderValue: 1920,
    payout: 180,
    distanceKm: 34.0,
    customer: { name: 'Vikram Singh', phone: '+91 98936 33445', rating: 4.9 },
    pickup: {
      name: 'Ashta APMC Traders',
      address: 'Kannod Road, Ashta, Sehore 466116',
      phone: '+91 7560 284199',
      position: { lat: 23.0163, lng: 76.7196 },
    },
    drop: {
      address: 'House 7, Old Bus Stand Road, Ashta, Sehore 466116',
      landmark: 'Near State Bank of India',
      position: { lat: 23.0210, lng: 76.7250 },
    },
    items: [
      { name: 'Surf Excel Detergent', qty: 2, weight: '2 kg' },
      { name: 'Fortune Soyabean Oil', qty: 1, weight: '5 L' },
    ],
    notes: 'Customer at store location.',
  },
  {
    id: 'DEL-2036',
    orderId: 'ORD-98150',
    status: DELIVERY_STATUS.IN_TRANSIT,
    placedAtLabel: '38 min ago',
    slaMinutes: 20,
    paymentMode: 'prepaid',
    orderValue: 630,
    payout: 85,
    distanceKm: 12.0,
    customer: { name: 'Priyanka Thakur', phone: '+91 89890 66778', rating: 4.5 },
    pickup: {
      name: 'Sehore Central Organic Store',
      address: 'Crescent Road, Sehore 466001',
      phone: '+91 7562 241144',
      position: { lat: 23.1980, lng: 77.0750 },
    },
    drop: {
      address: 'Gram Englishpura, Sehore 466001',
      landmark: 'Near Sugar Mill Road',
      position: { lat: 23.2120, lng: 77.0890 },
    },
    items: [{ name: 'Organic Fruit Basket', qty: 1, weight: '3 kg' }],
    notes: '',
  },
];

export const activeStatuses = [
  DELIVERY_STATUS.ACCEPTED,
  DELIVERY_STATUS.PICKED_UP,
  DELIVERY_STATUS.IN_TRANSIT,
];

export const getActiveDeliveries = (list = mockDeliveries) =>
  list.filter((delivery) => activeStatuses.includes(delivery.status));

export const getNewDeliveries = (list = mockDeliveries) =>
  list.filter((delivery) => delivery.status === DELIVERY_STATUS.NEW);

export const nextStopOf = (delivery) =>
  delivery.status === DELIVERY_STATUS.ACCEPTED || delivery.status === DELIVERY_STATUS.NEW
    ? { kind: 'pickup', ...delivery.pickup }
    : { kind: 'drop', ...delivery.drop };

export const mockHistory = [
  {
    id: 'DEL-2030',
    orderId: 'ORD-98042',
    customer: 'Kavya Sharma',
    area: 'Kothri Kalan, Sehore',
    date: '2026-08-11T13:20:00',
    status: DELIVERY_STATUS.DELIVERED,
    distanceKm: 4.2,
    durationMin: 18,
    payout: 75,
    rating: 5,
    paymentMode: 'prepaid',
  },
  {
    id: 'DEL-2029',
    orderId: 'ORD-98035',
    customer: 'Manoj Patidar',
    area: 'Sehore Town',
    date: '2026-08-11T11:45:00',
    status: DELIVERY_STATUS.DELIVERED,
    distanceKm: 9.8,
    durationMin: 28,
    payout: 110,
    rating: 4,
    paymentMode: 'cod',
  },
  {
    id: 'DEL-2028',
    orderId: 'ORD-98020',
    customer: 'Farhan Khan',
    area: 'Ashta, Sehore',
    date: '2026-08-11T10:05:00',
    status: DELIVERY_STATUS.CANCELLED,
    distanceKm: 31.4,
    durationMin: 40,
    payout: 40,
    rating: null,
    paymentMode: 'prepaid',
  },
  {
    id: 'DEL-2027',
    orderId: 'ORD-97988',
    customer: 'Divya Rajput',
    area: 'Bairagarh, Bhopal',
    date: '2026-08-10T19:30:00',
    status: DELIVERY_STATUS.DELIVERED,
    distanceKm: 38.1,
    durationMin: 52,
    payout: 210,
    rating: 5,
    paymentMode: 'prepaid',
  },
  {
    id: 'DEL-2026',
    orderId: 'ORD-97965',
    customer: 'Satish Tyagi',
    area: 'Ichhawar, Sehore',
    date: '2026-08-10T17:10:00',
    status: DELIVERY_STATUS.DELIVERED,
    distanceKm: 21.3,
    durationMin: 35,
    payout: 135,
    rating: 4,
    paymentMode: 'cod',
  },
];
