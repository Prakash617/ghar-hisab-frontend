"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar } from "recharts"
import { DollarSign, Users, Activity } from 'lucide-react';
import { useGetAllRooms } from "@/hooks/rooms/useGetAllRooms"
import { useGetPaymentHistories } from "@/hooks/bills/useGetPaymentHistories"
import { Skeleton } from "@/components/ui/skeleton"
import { useGetAllTenants } from "@/hooks/tenants/useGetAllTenants"

type CustomTooltipProps = {
    active?: boolean;
    payload?: Array<{
      value: number;
      payload: {
        total: number;
      };
    }>;
    label?: string;
  };

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-background border rounded-md shadow-md">
          <p className="font-bold">{label}</p>
          <p className="text-sm text-muted-foreground">Rent: Rs. {payload[0].value}</p>
          <p className="text-sm text-muted-foreground">Bills: Rs. {payload[1].value}</p>
          <p className="text-sm text-primary">Total: Rs. {payload[0].payload.total}</p>
        </div>
      );
    }
  
    return null;
  };

export default function ReportsPage() {
  const { data: roomsData, isLoading: isLoadingRooms } = useGetAllRooms()
  const { data: paymentHistoriesData, isLoading: isLoadingPayments } = useGetPaymentHistories()
  const { data: tenantsData, isLoading: isLoadingTenants } = useGetAllTenants()

  const isLoading = isLoadingRooms || isLoadingPayments || isLoadingTenants;

  // Calculations
  const totalRooms = roomsData?.length || 0;
  const occupiedRooms = roomsData?.filter(room => room.is_occupied).length || 0;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const totalRevenue = paymentHistoriesData
    ?.filter(history => {
      const billingDate = new Date(history.billing_month);
      return billingDate.getMonth() === currentMonth && billingDate.getFullYear() === currentYear;
    })
    .reduce((total, history) => total + parseFloat(history.total_paid), 0) || 0;

  const incomeData = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const month = d.toLocaleString('default', { month: 'short' });
    const year = d.getFullYear();

    const monthlyPayments = paymentHistoriesData?.filter(h => {
        const paymentDate = new Date(h.billing_month);
        return paymentDate.getMonth() === d.getMonth() && paymentDate.getFullYear() === year;
    });

    const rent = monthlyPayments?.reduce((sum, p) => sum + parseFloat(p.rent_paid), 0) || 0;
    const bills = monthlyPayments?.reduce((sum, p) => sum + (parseFloat(p.electricity_paid) + parseFloat(p.water_paid) + parseFloat(p.waste_paid)), 0) || 0;
    
    return {
        month,
        rent,
        bills,
        total: rent + bills,
    }
  }).reverse();

  const occupancyChartData = [{ name: 'Occupied', value: occupancyRate, fill: '#3b82f6' }];

  const recentActivities = [
    ...(paymentHistoriesData?.slice(0, 2).map(p => ({ id: `p-${p.id}`, type: 'payment', description: `Payment of Rs. ${p.total_paid} received for Room ${p.roomId}.` })) || []),
    ...(tenantsData?.slice(0, 2).map(t => ({ id: `t-${t.id}`, type: 'tenant', description: `New tenant, ${t.name}, moved into Room ${t.roomId}.` })) || [])
  ].sort(() => Math.random() - 0.5).slice(0, 4); // Shuffle and pick 4 for variety

  if (isLoading) {
    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
            </div>
            <Skeleton className="h-96" />
            <Skeleton className="h-48" />
        </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Reports & Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue (This Month)</CardTitle>
                <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">Rs. {totalRevenue.toLocaleString()}</div>
                {/* <p className="text-xs text-muted-foreground">+12% from last month</p> */}
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{occupancyRate}%</div>
                <p className="text-xs text-muted-foreground">{occupiedRooms} of {totalRooms} rooms filled</p>
            </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="income" className="space-y-6">
        <TabsList>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
        </TabsList>

        <TabsContent value="income">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Income</CardTitle>
              <CardDescription>A breakdown of income from rent and bills over the last 6 months.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={incomeData}>
                  <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rs. ${value / 1000}k`}/>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="rent" fill="#3b82f6" name="Rent" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="bills" fill="#f59e0b" name="Bills" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="occupancy">
            <Card>
                <CardHeader>
                    <CardTitle>Occupancy Overview</CardTitle>
                    <CardDescription>A look at the percentage of rooms currently occupied.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <ResponsiveContainer width="100%" height={300}>
                        <RadialBarChart 
                            innerRadius="80%" 
                            outerRadius="100%" 
                            data={occupancyChartData} 
                            startAngle={90} 
                            endAngle={-270}
                        >
                            <RadialBar
                                background
                                dataKey='value'
                                cornerRadius={10}
                            />
                            <Tooltip />
                            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold">
                                {occupancyRate}%
                            </text>
                        </RadialBarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Recent Activity
            </CardTitle>
            <CardDescription>A log of the most recent activities in the system.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {recentActivities.map(activity => (
                    <div key={activity.id} className="flex items-start space-x-4">
                        <div>
                            {activity.type === 'payment' && <DollarSign className="w-5 h-5 text-green-500" />}
                            {activity.type === 'tenant' && <Users className="w-5 h-5 text-blue-500" />}
                        </div>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                    </div>
                ))}
            </div>
        </CardContent>
      </Card>
    </div>
  )
}