import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import axiosInstance from '../../lib/axios'; // Adjust the path as necessary
import { toast } from "../ui/use-toast";

export function ImageUploader({ open, onOpenChange, onUploadComplete, companyId, fetchData, currentPage, entriesPerPage, filters }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "text/csv") {
      handleFile(file);
    } else {
      alert("Please upload a valid CSV file.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "text/csv") handleFile(file);
    else {
      alert("Please upload a valid CSV file.");
    }
  };

  const handleFile = (file: File) => {
    setSelectedFile(file.name);
  };

  const uploadImage = async () => {
    if (!selectedFile) return;

    setUploading(true);

    try {
      const file = inputRef.current?.files?.[0];
      if (!file) {
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await axiosInstance.post(`/transactions/company/${companyId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(Math.min(percentCompleted, 99));
        },
      });

      if (response.status === 200) {
        setUploadProgress(100); // Set to 100% upon successful response
        onUploadComplete(response.data);
        toast({
          title: 'CSV Uploaded Successfully',
          description: 'Thank You'
        });
        fetchData(currentPage, entriesPerPage, filters);
      }
    } catch (error) {
      
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setSelectedFile(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload CSV File</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div
            className={cn(
              "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
              dragActive ? "border-primary" : "border-muted-foreground/25",
              selectedFile  ? "pb-0" : "min-h-[200px]"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              onChange={handleChange}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            {selectedFile  ? (
              <div className="relative aspect-square w-full max-w-[200px] overflow-hidden rounded-lg">
                <p>{selectedFile}</p>
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute right-0 top-5"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    if (inputRef.current) inputRef.current.value = '';
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
                
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div className="text-sm font-medium">
                  Drag & drop an CSV here, or click to select
                </div>
                <div className="text-xs text-muted-foreground">
                  CSV (max. 2MB)
                </div>
              </div>
            )}
          </div>

          {selectedFile  && !uploading && (
            <Button className="w-full" onClick={uploadImage}>
              Upload CSV
            </Button>
          )}

          {uploading && (
            <div className="relative mx-auto h-12 w-12">
              <svg
                className="h-12 w-12 -rotate-90 transform"
                viewBox="0 0 36 36"
              >
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  className="stroke-muted-foreground/20"
                  strokeWidth="2"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  className="stroke-primary"
                  strokeWidth="2"
                  strokeDasharray={100}
                  strokeDashoffset={100 - uploadProgress}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-medium">{uploadProgress}%</span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
