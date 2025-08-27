

import type { Property } from "@/lib/placeholder-data";
import { getAdminPanelData, type AdminPanelDataResponse } from "@/actions/user.actions";
import { AdminPanel } from "@/components/admin-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";


function AdminPageSkeleton() {
    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64 mt-2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-40 w-full mt-4" />
                </CardContent>
            </Card>
        </div>
    );
}


export default async function AdminPage() {
    // Fetch all admin data in one go
    const response: AdminPanelDataResponse = await getAdminPanelData();

    return (
        <Suspense fallback={<AdminPageSkeleton />}>
            <AdminPanel 
                initialUsers={response.users} 
                initialProperties={response.properties}
                usersError={response.error} 
            />
        </Suspense>
    );
}
