"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UploadCloud, File, X } from "lucide-react";
import { useState } from "react";

export default function ScannerPage() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };
  
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-6">Crop Scanner</h1>
      <Card>
        <CardHeader>
          <CardTitle>Upload Crop Image</CardTitle>
          <CardDescription>
            Upload an image of your crop for disease detection or health analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            {!file ? (
              <div className="flex items-center justify-center w-full">
                <Label htmlFor="picture" className="flex flex-col items-center justify-center w-full h-64 border-2 border-border border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted/50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG or GIF (MAX. 800x400px)</p>
                    </div>
                    <Input id="picture" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                </Label>
              </div>
            ) : (
              <div className="w-full">
                <div className="flex items-center justify-between p-4 border rounded-md bg-muted/20">
                    <div className="flex items-center gap-3">
                      <File className="w-6 h-6 text-primary"/>
                      <span className="text-sm font-medium">{file.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleRemoveFile}>
                      <X className="w-4 h-4"/>
                    </Button>
                </div>
                <Button className="w-full mt-4" size="lg">
                    Analyze Image
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
