"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">12</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Occupied Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">9</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vacant Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">3</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Tenants</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">9</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rent Collected (This Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Rs. 75,000</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">3</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Payments</h2>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <ul className="divide-y">
            <li className="py-2 flex justify-between">
              <span>John Doe - Room 101</span>
              <span className="text-green-600">Paid Rs. 10,000</span>
            </li>
            <li className="py-2 flex justify-between">
              <span>Jane Smith - Room 202</span>
              <span className="text-red-600">Pending Rent</span>
            </li>
            <li className="py-2 flex justify-between">
              <span>Mark Lee - Room 303</span>
              <span className="text-green-600">Paid Rs. 12,000</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
