
import fs from 'fs';
import path from 'path';
import { House, Room, Tenant, PaymentHistory } from './types';

const dataDirectory = path.join(process.cwd(), 'lib', 'data');

export function getHouses(): House[] {
  const filePath = path.join(dataDirectory, 'houses.json');
  const fileContent = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContent);
}

export function getRooms(houseId: number): Room[] {
  const filePath = path.join(dataDirectory, 'rooms.json');
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const rooms: Room[] = JSON.parse(fileContent);
  return rooms.filter(room => room.house === houseId);
}

export function getTenant(roomId: number): Tenant | undefined {
  const filePath = path.join(dataDirectory, 'tenants.json');
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const tenants: Tenant[] = JSON.parse(fileContent);
  return tenants.find(tenant => tenant.roomId === roomId);
}

export function getBills(roomId: number): PaymentHistory[] {
  const filePath = path.join(dataDirectory, 'bills.json');
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const bills: PaymentHistory[] = JSON.parse(fileContent);
  return bills.filter(bill => bill.roomId === roomId);
}
