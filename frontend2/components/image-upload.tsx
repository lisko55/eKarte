"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  onRemove: (url: string) => void;
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  if (value) {
    return (
      <div className="relative w-full h-64 rounded-lg overflow-hidden border border-slate-200">
        <div className="absolute top-2 right-2 z-10">
          <button
            type="button"
            onClick={() => onRemove(value)}
            className="bg-red-500 text-white p-1 rounded-full shadow-sm hover:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <Image
          fill
          src={value}
          alt="Upload"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <UploadDropzone
      endpoint="imageUploader"
      onClientUploadComplete={(res) => {
        onChange(res[0].url);
        toast.success("Slika uspješno uploadana!");
      }}
      onUploadError={(error: Error) => {
        toast.error(`Greška: ${error.message}`);
      }}
      appearance={{
        container: "border-2 border-dashed border-slate-300 rounded-lg p-10 hover:bg-slate-50 transition",
        label: "text-slate-500",
        button: "bg-slate-900 text-white hover:bg-slate-800"
      }}
    />
  );
}