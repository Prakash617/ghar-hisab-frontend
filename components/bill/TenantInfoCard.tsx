import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const TenantInfoCard = ({ tenant }: { tenant: { name: string; contact: string; moveInDate: string } | undefined }) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadMessage, setUploadMessage] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setSelectedFiles(Array.from(event.target.files));
        } else {
            setSelectedFiles([]);
        }
    };

    const handleUpload = () => {
        if (selectedFiles.length > 0) {
            const fileNames = selectedFiles.map(file => file.name).join(', ');
            setUploadMessage(`Files '${fileNames}' uploaded successfully!`);
            setTimeout(() => {
                setUploadMessage(null);
                setSelectedFiles([]); // Clear selected files after simulated upload
            }, 3000); // Clear message and files after 3 seconds
        } else {
            setUploadMessage("Please select files to upload.");
            setTimeout(() => {
                setUploadMessage(null);
            }, 3000);
        }
    };

    return (
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
                        <div className="space-y-2">
                            <label htmlFor="tenant-files" className="block text-sm font-medium text-gray-700">Upload Tenant Documents</label>
                            <div className="flex items-center space-x-2">
                                <Input id="tenant-files" type="file" multiple onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                <Button onClick={handleUpload} disabled={selectedFiles.length === 0}>Upload</Button>
                            </div>
                            {selectedFiles.length > 0 && (
                                <div className="text-sm text-gray-600">
                                    <p>Selected files:</p>
                                    <ul className="list-disc list-inside">
                                        {selectedFiles.map((file, index) => (
                                            <li key={index} className="font-semibold">{file.name}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {uploadMessage && (
                                <p className="text-sm text-green-600 font-semibold">{uploadMessage}</p>
                            )}
                        </div>
                    </>
                ) : <p>No tenant information found for this room.</p>}
            </CardContent>
        </Card>
    );
};