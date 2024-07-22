import { useParams } from "@remix-run/react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import ReactCrop, {
  Crop,
  PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import { Button } from "@/components/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/Dialog";
import { VisuallyHidden } from "@/components/VisuallyHidden";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { formatError } from "@/lib/utils";

import { useToast } from "../Toaster/hooks";

const centerAspectCrop = (
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) => {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 75,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
};

const canvasPreview = async (
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: PixelCrop,
) => {
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const pixelRatio = window.devicePixelRatio;

  canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = "high";

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;

  const centerX = image.naturalWidth / 2;
  const centerY = image.naturalHeight / 2;

  ctx.save();

  ctx.translate(-cropX, -cropY);

  ctx.translate(centerX, centerY);

  ctx.translate(-centerX, -centerY);
  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
  );

  ctx.restore();
};

const ImageUploadAndCrop: React.FC<{
  children: React.ReactNode;
  aspect: number;
  uploadAction: string;
  onUploadSuccess: (url: string) => void;
}> = ({ children, aspect, uploadAction, onUploadSuccess }) => {
  const { toast } = useToast();
  const { id } = useParams();
  const { isMobile } = useMediaQuery();

  const [imgSrc, setImgSrc] = useState("");
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [uploading, setUploading] = useState(false);

  const firstCrop = useRef(true);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined); // Makes crop preview update between images.
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        setImgSrc(reader.result?.toString() || ""),
      );
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleFileInputClick = () => {
    inputRef.current?.click();
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const image = e.currentTarget;
    if (aspect) {
      const naturalWidth = image.naturalWidth;
      const naturalHeight = image.naturalHeight;

      const initialCrop = centerAspectCrop(naturalWidth, naturalHeight, aspect);
      setCrop(initialCrop);
    }
  };

  const onUploadCropClick = async () => {
    try {
      setUploading(true);

      const image = imgRef.current;
      const previewCanvas = previewCanvasRef.current;
      if (!image || !previewCanvas || !completedCrop) {
        throw new Error("裁剪图片失败");
      }

      const targetWidth = 200;
      const targetHeight = targetWidth / aspect;

      const offscreen = new OffscreenCanvas(targetWidth, targetHeight);

      const ctx = offscreen.getContext("2d");
      if (!ctx) {
        throw new Error("不是 2D 对象");
      }

      ctx.drawImage(
        previewCanvas,
        0,
        0,
        previewCanvas.width,
        previewCanvas.height,
        0,
        0,
        targetWidth,
        targetHeight,
      );

      const blob = await offscreen.convertToBlob({
        type: "image/png",
        quality: 1,
      });

      const file = new File([blob], "cropped-image.png", { type: "image/png" });
      const formData = new FormData();
      formData.append("image", file);
      formData.append("action", uploadAction);

      if (uploadAction === "update_resume_avatar") {
        if (!id) {
          throw new Error("简历 ID 不能为空");
        }
        formData.append("rid", id);
      }

      const res = await axios.post<{
        data: {
          url: string;
        };
      }>("/api/image/upload", formData, {
        withCredentials: true,
      });

      onUploadSuccess(res.data.data.url);
      clear();
    } catch (e) {
      toast({
        title: "上传失败",
        description: formatError(e),
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setUploading(false);
    }
  };

  const clear = () => {
    setImgSrc("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    firstCrop.current = true;
  };

  useEffect(() => {
    const handler = async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        previewCanvasRef.current
      ) {
        // We use canvasPreview as it's much faster than imgPreview.
        await canvasPreview(
          imgRef.current,
          previewCanvasRef.current,
          completedCrop,
        );
      }
    };

    const timer = setTimeout(handler, 100); // 设置延迟执行

    return () => {
      clearTimeout(timer); // 清除定时器
    };
  }, [completedCrop]); // 依赖项列表

  return (
    <>
      <>
        <input
          className="hidden"
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onSelectFile}
        />
        <>
          {React.cloneElement(children as React.ReactElement, {
            onClick: handleFileInputClick,
          })}
        </>
      </>
      <Dialog open={!!imgSrc}>
        <DialogContent className="w-[300px]">
          <DialogHeader>
            <DialogTitle>裁剪图片</DialogTitle>
            <VisuallyHidden>
              <DialogDescription></DialogDescription>
            </VisuallyHidden>
          </DialogHeader>
          <div className="flex w-full justify-center py-4">
            {!!imgSrc && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => {
                  if (firstCrop.current) {
                    setCompletedCrop({
                      ...c,
                      width: c.width / 0.9,
                      height: c.height / 0.9,
                    });
                    firstCrop.current = false;
                  } else {
                    setCompletedCrop(c);
                  }
                }}
                aspect={aspect}
                className="w-[200px]"
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={imgSrc}
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            )}
            {!!completedCrop && (
              <canvas
                ref={previewCanvasRef}
                style={{
                  display: "none",
                  objectFit: "contain",
                  width: 100,
                  height: 100 / aspect,
                }}
              />
            )}
          </div>
          <DialogFooter>
            {isMobile ? (
              <>
                <Button
                  disabled={uploading}
                  onClick={onUploadCropClick}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "提交"
                  )}
                </Button>
                <Button
                  variant="destructive"
                  onClick={clear}
                >
                  取消
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="destructive"
                  onClick={clear}
                >
                  取消
                </Button>
                <Button
                  disabled={uploading}
                  onClick={onUploadCropClick}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "提交"
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageUploadAndCrop;
