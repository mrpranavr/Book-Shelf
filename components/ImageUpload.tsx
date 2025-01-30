"use client";
import React, { useState } from "react";

import { IKImage, ImageKitProvider, IKUpload } from "imagekitio-next";
import config from "@/lib/config";
import ImageKit from "imagekit";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const {
  env: {
    imageKit: { publicKey, urlEndpoint },
  },
} = config;

const authenticator = async () => {
  try {
    const response = await fetch(`${config.env.apiEndpoint}/api/auth/imagekit`);

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Request failed with status ${response.status}: ${errorText}`,
      );
    }

    const data = await response.json();
    const { signature, expire, token } = data;

    return { signature, expire, token };
  } catch (error: any) {
    console.log("Error during authentication ", error.message);
  }
};

const ImageUpload = ({
  onFileChange,
}: {
  onFileChange: (filePath: string) => void;
}) => {
  const ikUploadRef = React.useRef(null);
  const [file, setFile] = useState<{ filePath: string } | null>(null);

  const onError = (error: any) => {
    console.log("Error uploading file : ", error);

    toast({
      title: "Image Upload Failed",
      description:
        "An error occurred while uploading the image. Please try again.",
      variant: "destructive",
    });
  };

  const onSucess = (res: any) => {
    setFile(res);
    onFileChange(res.filePath);

    toast({
      title: "Image uploaded successfully",
      description: `${res.filePath} Uploaded!`,
    });
  };

  return (
    <ImageKitProvider
      publicKey={publicKey}
      urlEndpoint={urlEndpoint}
      //@ts-ignore
      authenticator={authenticator}
    >
      <IKUpload
        ref={ikUploadRef}
        className="hidden"
        onError={onError}
        onSuccess={onSucess}
        fileName="test-file.png"
      />

      <button
        className="upload-btn"
        onClick={(e) => {
          e.preventDefault();
          if (ikUploadRef.current) {
            // @ts-ignore
            ikUploadRef.current?.click();
          }
        }}
      >
        <Image
          src="/icons/upload.svg"
          alt="Upload"
          width={20}
          height={20}
          className="object-contain"
        />

        <p className="text-base text-light-100">Upload a File</p>

        {file && <p className={cn("upload-filename")}>{file.filePath}</p>}
      </button>
      {file && (
        // <p className>{file.filePath}</p>
        <IKImage
          path={file.filePath}
          alt={file.filePath}
          lqip={{ active: true }}
          width={500}
          height={300}
          // fill={true}
        />
      )}
    </ImageKitProvider>
  );
};

export default ImageUpload;
