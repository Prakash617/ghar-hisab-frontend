"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Tenant } from "@/lib/types";
import { useUpdateTenant } from "@/hooks/tenants/useUpdateTenant";

export const TenantInfoCard = ({ tenant, roomId }: { tenant: Tenant | undefined, roomId: string }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTenant, setEditedTenant] = useState<Tenant | undefined>(tenant);
    const { mutate: updateTenant } = useUpdateTenant(roomId);

    useEffect(() => {
        setEditedTenant(tenant);
    }, [tenant]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedTenant(tenant);
    };

    const handleSave = () => {
        if (editedTenant && tenant) {
            const { documents, ...tenantData } = editedTenant;
            updateTenant({ tenantId: tenant.id, tenantData });
            setIsEditing(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (editedTenant) {
            setEditedTenant({ ...editedTenant, [e.target.name]: e.target.value });
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Tenant Information</CardTitle>
                <div className="flex space-x-2">
                    {isEditing ? (
                        <>
                            <Button onClick={handleSave}>Save</Button>
                            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                        </>
                    ) : (
                        <Button onClick={handleEdit}>Edit</Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                {tenant ? (
                    <>
                        <div><strong>Name:</strong> {isEditing ? <Input name="name" value={editedTenant?.name} onChange={handleChange} /> : tenant.name}</div>
                        <div><strong>Contact:</strong> {isEditing ? <Input name="contact" value={editedTenant?.contact} onChange={handleChange} /> : tenant.contact}</div>
                        <div><strong>Move-in Date:</strong> {isEditing ? <Input name="moveInDate" value={editedTenant?.moveInDate} onChange={handleChange} /> : tenant.moveInDate}</div>
                        <div><strong>Electricity Price Per Unit:</strong> {isEditing ? <Input name="electricityPricePerUnit" value={editedTenant?.electricityPricePerUnit} onChange={handleChange} /> : tenant.electricityPricePerUnit}</div>
                        <div><strong>Water Price:</strong> {isEditing ? <Input name="water_price" value={editedTenant?.water_price} onChange={handleChange} /> : tenant.water_price}</div>
                        <div><strong>Rent Price:</strong> {isEditing ? <Input name="rent_price" value={editedTenant?.rent_price} onChange={handleChange} /> : tenant.rent_price}</div>
                        <div><strong>Waste Price:</strong> {isEditing ? <Input name="waste_price" value={editedTenant?.waste_price} onChange={handleChange} /> : tenant.waste_price}</div>
                    </>
                ) : <p>No tenant information found for this room.</p>}
            </CardContent>
        </Card>
    );
};