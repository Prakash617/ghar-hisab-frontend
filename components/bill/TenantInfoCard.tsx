
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const TenantInfoCard = ({ tenant }: { tenant: { name: string; contact: string; moveInDate: string } | undefined }) => (
    <Card>
        <CardHeader>
            <CardTitle>Tenant Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
            {tenant ? (
                <>
                    <p><strong>Name:</strong> {tenant.name}</p>
                    <p><strong>Contact:</strong> {tenant.contact}</p>
                    <p><strong>Move-in Date:</strong> {tenant.moveInDate}</p>
                </>
            ) : <p>No tenant information found for this room.</p>}
        </CardContent>
    </Card>
);
