"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import Image from "next/image";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { ImagePlus, Loader2, X } from "lucide-react";
import { storage } from "@/lib/firebase";
import { compressImage } from "@/lib/compress-image";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  storagePath: string;
}

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-");
}

export default function ImageUpload({
  value,
  onChange,
  storagePath,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStage, setUploadStage] = useState<
    "compressing" | "uploading" | null
  >(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const isUploading = uploadStage !== null;

  async function uploadFile(file: File) {
    if (!file.type.startsWith("image/")) {
      alert("Zəhmət olmasa şəkil faylı seçin.");
      return;
    }

    try {
      setUploadStage("compressing");
      const compressedFile = await compressImage(file);

      setUploadStage("uploading");
      const path = `${storagePath}/${Date.now()}-${sanitizeFilename(file.name)}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, compressedFile);
      const url = await getDownloadURL(storageRef);
      onChange(url);
    } catch {
      alert("Şəkil yüklənərkən xəta baş verdi.");
    } finally {
      setUploadStage(null);
    }
  }

  function handleFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) uploadFile(file);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDraggingOver(true);
  }

  function handleDragLeave() {
    setIsDraggingOver(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDraggingOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  async function handleRemove() {
    const previousUrl = value;
    onChange("");

    if (previousUrl) {
      try {
        await deleteObject(ref(storage, previousUrl));
      } catch {
        // Best-effort cleanup only; ignore failures (e.g. already deleted).
      }
    }
  }

  return (
    <div className="relative">
      {value ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-[var(--radius)]">
          <Image src={value} alt="" fill className="object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Şəkli sil"
            className="absolute top-2 right-2 rounded-full bg-background/90 p-2 text-foreground transition-colors hover:bg-background"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex aspect-video cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius)] border-2 border-dashed bg-input p-8 transition ${
            isDraggingOver
              ? "border-primary bg-accent/50"
              : "border-border hover:bg-accent/30"
          }`}
        >
          <ImagePlus className="text-muted-foreground" size={32} />
          <p className="text-sm text-muted-foreground">
            Şəkil yükləmək üçün klikləyin
          </p>
          <p className="text-xs text-muted-foreground">
            və ya sürükləyib buraxın
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-[var(--radius)] bg-background/80">
          <Loader2 className="animate-spin text-primary" size={20} />
          <span className="text-sm text-muted-foreground">
            {uploadStage === "compressing"
              ? "Şəkil hazırlanır..."
              : "Yüklənir..."}
          </span>
        </div>
      )}
    </div>
  );
}
