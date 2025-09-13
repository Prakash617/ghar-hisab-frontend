"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadialBarChart, RadialBar } from "recharts"
import { DollarSign, Users, Wrench, Activity } from 'lucide-react';

const incomeData = [
  { month: "Jan", rent: 4000, bills: 1200, total: 5200 },
  { month: "Feb", rent: 4200, bills: 1100, total: 5300 },
  { month: "Mar", rent: 4100, bills: 1300, total: 5400 },
  { month: "Apr", rent: 4500, bills: 1400, total: 5900 },
  { month: "May", rent: 4800, bills: 1500, total: 6300 },
  { month: "Jun", rent: 5000, bills: 1600, total: 6600 },
]

const occupancyData = [{ name: 'Occupied', value: 80, fill: '#3b82f6' }];

const maintenanceData = [
    { name: 'Open', value: 3, fill: '#f87171' },
    { name: 'In Progress', value: 5, fill: '#f59e0b' },
    { name: 'Closed', value: 12, fill: '#4ade80' },
];

const recentActivities = [
    { id: 1, type: 'payment', description: 'John Doe paid rent for Room 101.' },
    { id: 2, type: 'tenant', description: 'New tenant, Jane Smith, moved into Room 201.' },
    { id: 3, type: 'maintenance', description: 'Maintenance request for Room 102 (leaky faucet) was closed.' },
    { id: 4, type: 'payment', description: 'Jane Smith paid security deposit.' },
];

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
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Reports & Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">Rs. 34,700</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">80%</div>
                <p className="text-xs text-muted-foreground">20 of 25 rooms filled</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Maintenance Requests</CardTitle>
                <Wrench className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">8 Active</div>
                <p className="text-xs text-muted-foreground">3 open, 5 in progress</p>
            </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="income" className="space-y-6">
        <TabsList>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
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
                            data={occupancyData} 
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
                                {occupancyData[0].value}%
                            </text>
                        </RadialBarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="maintenance">
            <Card>
                <CardHeader>
                    <CardTitle>Maintenance Status</CardTitle>
                    <CardDescription>The current status of all maintenance requests.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                    <Pie data={maintenanceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                        {maintenanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                    </PieChart>
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
                            {activity.type === 'maintenance' && <Wrench className="w-5 h-5 text-orange-500" />}
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
