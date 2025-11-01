"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Loading } from "@/components/ui/loading";

export default function ImportMenuPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError("");
      setResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file");
      return;
    }

    setUploading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/menu/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setTimeout(() => {
          router.push("/dashboard/menu");
        }, 2000);
      } else {
        setError(data.message || "Failed to import menu");
      }
    } catch (error) {
      console.error("Failed to import menu:", error);
      setError("Failed to import menu. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <ErrorBoundary>
      <DashboardLayout>
        <div className="mx-auto max-w-2xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Import Menu</h1>
            <p className="mt-2 text-gray-600">
              Import your menu from CSV, JSON, Excel, Markdown, HTML, or TXT files
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upload Menu File</CardTitle>
              <CardDescription>
                Supported formats: CSV, JSON, XLS/XLSX, Markdown (.md), HTML, TXT
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="file">Menu File *</Label>
                  <Input
                    id="file"
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json,.xlsx,.xls,.md,.html,.htm,.txt"
                    onChange={handleFileChange}
                    className="mt-2"
                    required
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Maximum file size: 10MB
                  </p>
                </div>

                {file && (
                  <div className="rounded-md bg-gray-50 p-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="rounded-md bg-red-50 p-3 flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                {result && (
                  <div className="rounded-md bg-green-50 p-3">
                    <div className="flex items-center gap-2 text-green-700 mb-2">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-semibold">Import Successful!</span>
                    </div>
                    <div className="text-sm text-green-600 space-y-1">
                      <p>Categories: {result.imported?.categories || 0}</p>
                      <p>Sub-categories: {result.imported?.subCategories || 0}</p>
                      <p>Menu items: {result.imported?.items || 0}</p>
                    </div>
                    <p className="mt-2 text-xs text-green-600">
                      Redirecting to menu management...
                    </p>
                  </div>
                )}

                <Button type="submit" disabled={uploading || !file} className="w-full">
                  {uploading ? (
                    <>
                      <Loading size="sm" className="mr-2" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Import Menu
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>File Format Examples</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">CSV Format:</h4>
                  <code className="block bg-gray-100 p-2 rounded text-xs">
                    Category,SubCategory,ItemName,Description,Price<br />
                    Food,Starters,Caesar Salad,Fresh romaine lettuce,12.99
                  </code>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">JSON Format:</h4>
                  <code className="block bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                    {`{
  "restaurant": "Name",
  "categories": [{
    "name": "Food",
    "subCategories": [{
      "name": "Starters",
      "items": [{
        "name": "Caesar Salad",
        "price": 12.99
      }]
    }]
  }]
}`}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ErrorBoundary>
  );
}

