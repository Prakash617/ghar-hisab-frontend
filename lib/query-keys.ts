export const queryKeys = {
  paymentHistories: ["paymentHistories"],
  houses: ["houses"],
  roomsByHouseId: (houseId: string) => ["rooms", "byHouseId", houseId],
  billDetails: (roomId: string) => ["bills", "details", roomId],
  tenantByRoomId: (roomId: string) => ["tenants", "byRoomId", roomId],
  bills: ["bills"],
  allRooms: ["allRooms"],
};
