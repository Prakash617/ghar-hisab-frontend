"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useGetAllRooms } from "@/hooks/rooms/useGetAllRooms"
import { useGetAllTenants } from "@/hooks/tenants/useGetAllTenants"
import { useGetPaymentHistories } from "@/hooks/bills/useGetPaymentHistories"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link";

export default function DashboardPage() {
  const { data: roomsData, isLoading: isLoadingRooms } = useGetAllRooms()
  const { data: tenantsData, isLoading: isLoadingTenants } = useGetAllTenants()
  const { data: paymentHistoriesData, isLoading: isLoadingPayments } = useGetPaymentHistories()

  const totalRooms = roomsData?.length || 0
  const occupiedRooms = roomsData?.filter(room => room.is_occupied).length || 0
  const vacantRooms = totalRooms - occupiedRooms
  const totalTenants = tenantsData?.length || 0

  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  const rentCollectedThisMonth = paymentHistoriesData
    ?.filter(history => {
      const billingDate = new Date(history.billing_month)
      return billingDate.getMonth() === currentMonth && billingDate.getFullYear() === currentYear
    })
    .reduce((total, history) => total + parseFloat(history.rent_paid), 0) || 0

  const pendingBills = paymentHistoriesData?.filter(history => history.status !== "Paid").length || 0
  
  const recentPayments = paymentHistoriesData?.slice(0, 3) || []

  const isLoading = isLoadingRooms || isLoadingTenants || isLoadingPayments

  const getRoomNumber = (roomId: number) => {
    const room = roomsData?.find(r => r.id === roomId);
    return room?.room_number || "N/A";
  };

  const getTenantName = (roomId: number) => {
    const tenant = tenantsData?.find(t => t.roomId === roomId);
    return tenant?.name || "N/A";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Payments</h2>
          <div className="space-y-2">
            <Skeleton className="h-[48px]" />
            <Skeleton className="h-[48px]" />
            <Skeleton className="h-[48px]" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalRooms}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Occupied Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{occupiedRooms}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vacant Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{vacantRooms}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Tenants</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalTenants}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rent Collected (This Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Rs. {rentCollectedThisMonth.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Link href="/dashboard/bills">
          <Card>
            <CardHeader>
              <CardTitle>Pending Bills</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{pendingBills}</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Payments Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Payments</h2>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          {recentPayments.length > 0 ? (
            <ul className="divide-y">
              {recentPayments.map(payment => (
                <li key={payment.id} className="py-2 flex justify-between">
                  <span>Room: {getRoomNumber(payment.roomId)} - Tenant: {getTenantName(payment.roomId)}</span>
                  <span className={payment.status === 'Paid' ? 'text-green-600' : 'text-red-600'}>
                    {payment.status} - Rs. {parseFloat(payment.total_paid).toLocaleString()} / {parseFloat(payment.total).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No recent payments.</p>
          )}
        </div>
      </div>
    </div>
  )
}