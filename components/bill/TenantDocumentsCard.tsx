
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
import { useToast } from "@/components/ui/use-toast";
import { FileText, Download, Trash2 } from "lucide-react"; // Import FileText and Download icons
import Image from "next/image";

export const TenantDocumentsCard = ({ tenant, roomId }: { tenant: Tenant | undefined, roomId: string }) => {
    const { toast } = useToast();
    const { mutate: uploadDocument } = useUploadTenantDocumentWithProgress(roomId);
    const { mutate: deleteDocument } = useDeleteTenantDocument(
        roomId, 
        () => {
            setDocumentToDelete(null);
            toast({ title: "Document deleted", description: "The document has been deleted successfully." });
        },
        (error) => {
            setDocumentToDelete(null);
            toast({
                title: "Error deleting document",
                description: error.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        }
    );
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

    const isImage = (fileName: string) => {
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
        const ext = fileName.split('.').pop()?.toLowerCase();
        return ext && imageExtensions.includes(ext);
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                            {tenant.documents.map((doc) => {
                                const fileName = doc.document.split('/').pop() || 'Document';
                                return (
                                    <div key={doc.id} className="flex items-center justify-between p-2 border rounded-md shadow-sm bg-gray-50">
                                        <a href={doc.document} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 flex-grow min-w-0">
                                            {isImage(fileName) ? (
                                                <Image src={doc.document} alt={fileName} className="w-8 h-8 object-cover rounded flex-shrink-0" />
                                            ) : (
                                                <FileText className="w-5 h-5 flex-shrink-0 text-gray-500" />
                                            )}
                                            <span className="text-sm font-medium text-gray-700 truncate">{fileName}</span>
                                        </a>
                                        <div className="flex items-center space-x-1 flex-shrink-0">
                                            <Button variant="ghost" size="icon" asChild>
                                                <a href={doc.document} target="_blank" rel="noopener noreferrer">
                                                    <Download className="h-4 w-4" />
                                                </a>
                                            </Button>
                                            <Button variant="destructive" size="icon" onClick={() => setDocumentToDelete(doc.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
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
