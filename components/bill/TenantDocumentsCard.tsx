
"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Tenant } from "@/lib/types";
import { useUploadTenantDocumentWithProgress } from "@/hooks/tenants/useUploadTenantDocumentWithProgress";
import { useDeleteTenantDocument } from "@/hooks/tenants/useDeleteTenantDocument";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const TenantDocumentsCard = ({ tenant, roomId }: { tenant: Tenant | undefined, roomId: string }) => {
    const { mutate: uploadDocument } = useUploadTenantDocumentWithProgress(roomId);
    const { mutate: deleteDocument } = useDeleteTenantDocument(roomId, () => {
        setDocumentToDelete(null);
    });
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadMessage, setUploadMessage] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
    const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setSelectedFiles(Array.from(event.target.files));
            setUploadProgress({});
        } else {
            setSelectedFiles([]);
        }
    };

    const handleUpload = () => {
        if (selectedFiles.length > 0 && tenant) {
            selectedFiles.forEach(file => {
                uploadDocument({ 
                    tenantId: tenant.id, 
                    document: file, 
                    onProgress: (progress) => {
                        setUploadProgress(prev => ({...prev, [file.name]: progress}));
                    }
                }, {
                    onSuccess: () => {
                        setUploadMessage(`File '${file.name}' uploaded successfully!`);
                        setUploadProgress(prev => ({...prev, [file.name]: 100}));
                        setTimeout(() => {
                            setUploadMessage(null);
                            setSelectedFiles([]);
                            setUploadProgress({});
                        }, 3000);
                    },
                    onError: (error) => {
                        console.error("Error uploading file:", error);
                        setUploadMessage(`Error uploading file '${file.name}': ${error.message}`);
                        setTimeout(() => {
                            setUploadMessage(null);
                        }, 3000);
                    }
                });
            });
        } else {
            setUploadMessage("Please select files to upload.");
            setTimeout(() => {
                setUploadMessage(null);
            }, 3000);
        }
    };

    const handleDeleteDocument = () => {
        if (documentToDelete) {
            deleteDocument(documentToDelete);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tenant Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div>
                    <strong>Documents:</strong>
                    {tenant && tenant.documents.length > 0 ? (
                        <ul className="list-disc list-inside">
                            {tenant.documents.map((doc) => {
                                const fileName = doc.document.split('/').pop() || 'Document';
                                return (
                                    <li key={doc.id} className="flex items-center justify-between">
                                        <a href={doc.document} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{fileName}</a>
                                        <Button variant="destructive" size="sm" onClick={() => setDocumentToDelete(doc.id)}>Delete</Button>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p>No documents uploaded.</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label htmlFor="tenant-files" className="block text-sm font-medium text-gray-700">Upload Tenant Documents</label>
                    <div className="flex items-center space-x-2">
                        <Input id="tenant-files" type="file" multiple onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        <Button onClick={handleUpload} disabled={selectedFiles.length === 0}>Upload</Button>
                    </div>
                    {selectedFiles.length > 0 && (
                        <div className="text-sm text-gray-600 space-y-2 mt-2">
                            <p>Selected files:</p>
                            <ul className="list-disc list-inside">
                                {selectedFiles.map((file, index) => (
                                    <li key={index} className="font-semibold">
                                        {file.name}
                                        {uploadProgress[file.name] && <Progress value={uploadProgress[file.name]} className="w-full mt-1"/>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {uploadMessage && (
                        <p className="text-sm text-green-600 font-semibold">{uploadMessage}</p>
                    )}
                </div>
                <AlertDialog open={documentToDelete !== null} onOpenChange={() => setDocumentToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the document.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteDocument}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    );
}
