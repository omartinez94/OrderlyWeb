/**
 * Mock data for the Header demo in App.tsx. The Header itself is a
 * controlled component — these constants are only used by the showcase
 * and will be replaced by Redux selectors + RTK Query slices once the
 * wiring layer lands.
 */

import type {
  AppNotification,
  CurrentUser,
  Restaurant,
} from './types';

export const MOCK_CURRENT_USER: CurrentUser = {
  id: 'u-1024',
  name: 'Maya Okafor',
  email: 'maya@acme.co',
  initials: 'MO',
};

export const MOCK_RESTAURANTS: Restaurant[] = [
  { id: 'r-001', name: 'Acme Bistro — Downtown', role: 'Owner' },
  { id: 'r-002', name: 'Acme Bistro — Riverside', role: 'Manager' },
  { id: 'r-003', name: 'Acme Bistro — Airport', role: 'Staff' },
  { id: 'r-004', name: 'Casa Verde', role: 'Manager' },
  { id: 'r-005', name: 'Sakura Counter', role: 'Staff' },
  { id: 'r-006', name: 'The Brick Room', role: 'Staff' },
  { id: 'r-007', name: 'Mara & Olive', role: 'Manager' },
  { id: 'r-008', name: 'Northside Tap', role: 'Owner' },
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n-1',
    title: 'New modification request',
    body: 'Order #1284 — add no-onion to the Margherita Pizza.',
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    read: false,
  },
  {
    id: 'n-2',
    title: 'Reservation confirmed',
    body: 'Table 7 — 8:30 PM, party of 4.',
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    read: false,
  },
  {
    id: 'n-3',
    title: 'Inventory low',
    body: 'San Marzano tomatoes below reorder threshold.',
    timestamp: new Date(Date.now() - 1000 * 60 * 24).toISOString(),
    read: true,
  },
];
