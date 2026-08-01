import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";
import { IconUpload } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

interface FileUploadProps {
  name?: string;
  onChange?: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  maxFiles?: number;
  value?: File[];
}

export const FileUpload = ({
  name = "profile",
  onChange,
  accept = {
    "image/*": [".jpeg", ".jpg", ".png", ".gif"],
  },
  maxSize = 5242880, // 5MB
  maxFiles = 1,
  value,
}: FileUploadProps) => {
  const [files, setFiles] = useState<File[]>(value || []);
  const [error, setError] = useState<string>("");

  const onDrop = (acceptedFiles: File[]) => {
    setError("");
    if (acceptedFiles?.length > 0) {
      const newFiles = acceptedFiles.slice(0, maxFiles);
      setFiles(newFiles);
      onChange?.(newFiles);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles,
    onDropRejected: (rejections) => {
      if (rejections[0]?.errors[0]?.code === "file-too-large") {
        setError(`File is too large. Max size is ${maxSize / 1024 / 1024}MB`);
      } else if (rejections[0]?.errors[0]?.code === "file-invalid-type") {
        setError("Invalid file type. Please upload an image file.");
      } else {
        setError(rejections[0]?.errors[0]?.message || "Invalid file");
      }
    },
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          "relative w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
          isDragActive
            ? "border-primary/50 bg-primary/10"
            : "border-muted-foreground/25",
          error ? "border-destructive/50 bg-destructive/10" : ""
        )}
      >
        <input {...getInputProps({ name })} />
        <div className="h-full flex flex-col items-center justify-center gap-2">
          <motion.div
            variants={mainVariant}
            initial="initial"
            whileHover="animate"
            className="flex items-center justify-center"
          >
            <IconUpload className="w-8 h-8 text-muted-foreground/50" />
          </motion.div>
          <motion.div
            variants={secondaryVariant}
            initial="initial"
            animate="animate"
            className="text-xs text-muted-foreground text-center"
          >
            <p>Drop your image here, or click to browse</p>
            <p className="text-xs text-muted-foreground/75">
              Maximum file size: {maxSize / 1024 / 1024}MB
            </p>
          </motion.div>
        </div>
      </div>
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      {files.length > 0 && (
        <div className="mt-2">
          {files.map((file, index) => (
            <div key={index} className="text-sm text-muted-foreground">
              {file.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex bg-muted flex-shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px  scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex flex-shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-background"
                  : "bg-background shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset] dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]"
              }`}
            />
          );
        })
      )}
    </div>
  );
}
