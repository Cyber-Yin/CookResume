"use client";

import { useParams } from "@remix-run/react";
import { useIsFirstRender } from "@uidotdev/usehooks";
import axios from "axios";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/AlertDialog";
import { Button } from "@/components/Button";
import CopyButton from "@/components/CopyButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/Dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/Drawer";
import ImageEditor from "@/components/ImageEditor";
import { FormInput } from "@/components/Input";
import { Label } from "@/components/Label";
import { ScrollArea } from "@/components/ScrollArea";
import { Switch } from "@/components/Switch";
import { useToast } from "@/components/Toaster/hooks";
import { VisuallyHidden } from "@/components/VisuallyHidden";
import { OPACITY_ANIMATION } from "@/lib/const/animation";
import { useHost } from "@/lib/hooks/useHost";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { cn, formatError } from "@/lib/utils";
import { useFetchResume } from "@/routes/dashboard.resume.edit.$id/hooks/useFetchResume";
import { useFetchResumeAvatars } from "@/routes/dashboard.resume.edit.$id/hooks/useFetchResumeAvatars";
import { useResumeContent } from "@/routes/dashboard.resume.edit.$id/hooks/useResumeContent";
import { useSubmitResumeSection } from "@/routes/dashboard.resume.edit.$id/hooks/useSubmitResumeSection";

const MetaEditor: React.FC = () => {
  const { toast } = useToast();
  const { resumeInfo, resumeLoading, resumeValidating, refreshResume } =
    useFetchResume();
  const { handleFormSubmit, submitLoading } = useSubmitResumeSection();
  const { host } = useHost();
  const { meta, setMeta } = useResumeContent();
  const { id } = useParams();
  const isFirstRender = useIsFirstRender();

  const [formState, setFormState] = useState<{
    published: boolean;
    title: string;
    avatar: string;
  }>({
    published: false,
    title: "",
    avatar: "",
  });

  useEffect(() => {
    if (!resumeInfo) return;

    setFormState({
      published: resumeInfo.meta.published,
      title: resumeInfo.meta.title,
      avatar: resumeInfo.meta.avatar || "",
    });
  }, [resumeInfo]);

  useEffect(() => {
    if (isFirstRender) return;

    setMeta({
      ...meta,
      title: formState.title,
      published: formState.published,
      avatar: formState.avatar,
    });
  }, [formState]);

  const [avatarSelectorOpen, setAvatarSelectorOpen] = useState(false);

  const handleSubmit = async () => {
    if (!formState.title) {
      toast({
        title: "保存失败",
        description: "请输入标题",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    await handleFormSubmit({
      meta: {
        title: formState.title,
        published: formState.published,
      },
      content: JSON.stringify({
        ...resumeInfo!.content,
      }),
    });
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col">
      <ScrollArea className="h-[calc(100vh-7.5rem)]">
        <motion.div
          variants={OPACITY_ANIMATION}
          initial="hidden"
          animate="visible"
          className="flex w-full flex-col space-y-4 px-5 py-4"
        >
          <div className="space-y-4 rounded-lg border border-custom bg-custom p-4">
            <div className="space-y-2">
              <div className="text-lg font-semibold">标题</div>
              <div className="text-sm text-custom-secondary">
                简历标题，用于区分不同简历
              </div>
            </div>
            <div className="w-full max-w-[300px]">
              <FormInput
                placeholder="请输入简历标题"
                value={formState.title}
                onValueChange={(value) =>
                  setFormState({ ...formState, title: value })
                }
              />
            </div>
          </div>

          <div className="space-y-4 rounded-lg border border-custom bg-custom p-4">
            <div className="space-y-2">
              <div className="text-lg font-semibold">证件照</div>
              <div className="text-sm text-custom-secondary">
                可以上传证件照
              </div>
            </div>
            <div className="h-[140px] w-[100px] border border-custom-secondary bg-custom-hover">
              {meta.avatar ? (
                <img
                  src={meta.avatar}
                  alt={meta.avatar}
                  className="h-[140px] w-[100px]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-custom-secondary">
                  暂无证件照
                </div>
              )}
            </div>
            <div className="flex items-center justify-end space-x-2">
              <DeleteAvatarAlert
                buttonDisabled={!meta.avatar}
                onSubmit={() => {
                  setFormState({ ...formState, avatar: "" });
                  refreshResume();
                }}
              />
              <Button onClick={() => setAvatarSelectorOpen(true)}>更改</Button>
            </div>
          </div>

          <div className="space-y-4 rounded-lg border border-custom bg-custom p-4">
            <div className="space-y-2">
              <div className="text-lg font-semibold">发布</div>
              <div className="text-sm text-custom-secondary">
                简历发布后可以通过链接直接查看
              </div>
            </div>
            <div className="flex w-full items-center space-x-1.5">
              <Switch
                checked={formState.published}
                onCheckedChange={(checked) =>
                  setFormState({ ...formState, published: checked })
                }
              />
              <Label>{formState.published ? "已发布" : "未发布"}</Label>
            </div>
            {formState.published && (
              <div className="w-full space-y-1.5">
                <Label>在线链接</Label>
                <div className="flex w-full items-center space-x-1">
                  <div className="grid grid-cols-1 truncate rounded-md bg-custom-hover px-2 py-1 text-sm">{`${host}/preview/${id}`}</div>
                  <CopyButton content={`${host}/preview/${id}`} />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 rounded-lg border border-custom bg-custom p-4">
            <div className="space-y-2">
              <div className="text-lg font-semibold">基本信息</div>
            </div>
            <div className="w-full space-y-1.5">
              <Label>创建时间</Label>
              <div className="text-sm text-custom-tertiary">
                {dayjs
                  .unix(resumeInfo?.meta.createdAt || 1)
                  .format("YYYY-MM-DD HH:mm")}
              </div>
            </div>
            <div className="w-full space-y-1.5">
              <Label>最后修改时间</Label>
              <div className="text-sm text-custom-tertiary">
                {dayjs
                  .unix(resumeInfo?.meta.updatedAt || 1)
                  .format("YYYY-MM-DD HH:mm")}
              </div>
            </div>
          </div>
        </motion.div>
      </ScrollArea>
      <div className="flex h-14 w-full items-center justify-end space-x-2 px-4">
        <Button
          disabled={submitLoading || resumeLoading || resumeValidating}
          onClick={handleSubmit}
        >
          {submitLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "保存"
          )}
        </Button>
      </div>
      <AvatarSelector
        open={avatarSelectorOpen}
        onClose={() => setAvatarSelectorOpen(false)}
        defaultURL={resumeInfo?.meta.avatar || ""}
        onSubmit={(url) => {
          setFormState({ ...formState, avatar: url });
          refreshResume();
        }}
      />
    </div>
  );
};

const AvatarSelector: React.FC<{
  open: boolean;
  onClose: () => void;
  defaultURL: string;
  onSubmit: (url: string) => void;
}> = ({ open, onClose, defaultURL, onSubmit }) => {
  const { toast } = useToast();
  const { id } = useParams();
  const { isMobile } = useMediaQuery();

  const { resumeAvatars, resumeAvatarsIsLoading, refetchResumeAvatars } =
    useFetchResumeAvatars();

  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState({
    id: 0,
    url: "",
  });

  const clear = () => {
    setSelectedImage({ id: 0, url: "" });
  };

  const handleImageChange = async () => {
    try {
      setSubmitLoading(true);

      if (!id) {
        throw new Error("简历 ID 不存在");
      }

      if (!selectedImage.id) {
        throw new Error("图片 ID 不存在");
      }

      await axios.post("/api/resume/update-avatar", {
        avatar_id: selectedImage.id,
        resume_id: parseInt(id),
      });

      onSubmit(selectedImage.url);
      clear();
      onClose();
    } catch (e) {
      console.log(e);
      toast({
        title: "保存失败",
        description: formatError(e),
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!resumeAvatars) return <></>;

  if (isMobile) {
    return (
      <Drawer open={open}>
        <DrawerContent className="px-4 pb-4">
          <DrawerHeader>
            <DrawerTitle>选择证件照</DrawerTitle>
            <VisuallyHidden asChild>
              <DrawerDescription>选择一张证件照作为头像</DrawerDescription>
            </VisuallyHidden>
          </DrawerHeader>
          <ScrollArea className="h-[calc(50vh-5rem)] w-full py-4">
            {resumeAvatarsIsLoading ? (
              <div className="flex h-[calc(50vh-7rem)] w-full items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {resumeAvatars.length > 0 ? (
                  <div className="flex w-full justify-center">
                    <div className="grid w-[332px] grid-cols-3 gap-4">
                      {resumeAvatars.map((avatar) => (
                        <div
                          onClick={() =>
                            setSelectedImage({ id: avatar.id, url: avatar.url })
                          }
                          key={avatar.id}
                          className={cn(
                            "relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-[1.5px] border-transparent bg-custom-hover brightness-100 transition-all hover:border-primary-light hover:brightness-90",
                            {
                              "border-primary-light brightness-90":
                                selectedImage.id === avatar.id,
                              "pointer-events-none brightness-75":
                                defaultURL === avatar.url,
                            },
                          )}
                        >
                          <img
                            className="h-[140px] w-[100px] object-cover"
                            src={avatar.url}
                            alt={avatar.url}
                          />
                          {selectedImage.id === avatar.id && (
                            <div className="absolute right-1.5 top-1.5 rounded-full bg-primary p-1">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                          {defaultURL === avatar.url && (
                            <div className="absolute right-1.5 top-1.5 rounded-md bg-primary px-2 py-1 text-xs text-white">
                              当前
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-[calc(50vh-7rem)] w-full items-center justify-center">
                    <div className="text-xl font-semibold">暂无证件照</div>
                  </div>
                )}
              </>
            )}
          </ScrollArea>
          <div className="flex w-full flex-col items-center space-y-2">
            <Button
              disabled={submitLoading}
              onClick={handleImageChange}
              className="w-full"
            >
              {submitLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "保存"
              )}
            </Button>
            <ImageEditor
              aspect={5 / 7}
              uploadAction="update_resume_avatar"
              onUploadSuccess={(url) => refetchResumeAvatars()}
            >
              <Button
                className="w-full"
                disabled={submitLoading}
                variant="outline"
              >
                上传新图片
              </Button>
            </ImageEditor>
            <Button
              onClick={() => {
                clear();
                onClose();
              }}
              disabled={submitLoading}
              variant="destructive"
              className="w-full"
            >
              取消
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>选择证件照</DialogTitle>
          <VisuallyHidden asChild>
            <DialogDescription>选择一张证件照作为头像</DialogDescription>
          </VisuallyHidden>
        </DialogHeader>
        <ScrollArea className="h-[calc(50vh-5rem)] w-full py-4">
          {resumeAvatarsIsLoading ? (
            <div className="flex h-[calc(50vh-7rem)] w-full items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {resumeAvatars.length > 0 ? (
                <div className="flex w-full justify-center">
                  <div className="grid w-[332px] grid-cols-3 gap-4">
                    {resumeAvatars.map((avatar) => (
                      <div
                        onClick={() =>
                          setSelectedImage({ id: avatar.id, url: avatar.url })
                        }
                        key={avatar.id}
                        className={cn(
                          "relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-[1.5px] border-transparent bg-custom-hover brightness-100 transition-all hover:border-primary-light hover:brightness-90",
                          {
                            "border-primary-light brightness-90":
                              selectedImage.id === avatar.id,
                            "pointer-events-none brightness-75":
                              defaultURL === avatar.url,
                          },
                        )}
                      >
                        <img
                          className="h-[140px] w-[100px] object-cover"
                          src={avatar.url}
                          alt={avatar.url}
                        />
                        {selectedImage.id === avatar.id && (
                          <div className="absolute right-1.5 top-1.5 rounded-full bg-primary p-1">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                        {defaultURL === avatar.url && (
                          <div className="absolute right-1.5 top-1.5 rounded-md bg-primary px-2 py-1 text-xs text-white">
                            当前
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex h-[calc(50vh-7rem)] w-full items-center justify-center">
                  <div className="text-xl font-semibold">暂无证件照</div>
                </div>
              )}
            </>
          )}
        </ScrollArea>
        <DialogFooter>
          <Button
            onClick={() => {
              clear();
              onClose();
            }}
            disabled={submitLoading}
            variant="destructive"
          >
            取消
          </Button>
          <ImageEditor
            aspect={5 / 7}
            uploadAction="update_resume_avatar"
            onUploadSuccess={(url) => refetchResumeAvatars()}
          >
            <Button
              className="w-full sm:w-auto"
              disabled={submitLoading}
              variant="outline"
            >
              上传新图片
            </Button>
          </ImageEditor>
          <Button
            disabled={submitLoading}
            onClick={handleImageChange}
          >
            {submitLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "保存"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DeleteAvatarAlert: React.FC<{
  buttonDisabled: boolean;
  onSubmit: () => void;
}> = ({ buttonDisabled, onSubmit }) => {
  const { id } = useParams();
  const { toast } = useToast();

  const [alertOpen, setAlertOpen] = useState(false);
  const [deleteAvatarLoading, setDeleteAvatarLoading] = useState(false);

  const handleDeleteAvatar = async () => {
    try {
      setDeleteAvatarLoading(true);

      if (!id) {
        throw new Error("简历 ID 不存在");
      }

      await axios.post("/api/resume/update-avatar", {
        avatar_id: 0,
        resume_id: parseInt(id),
      });

      setAlertOpen(false);
      onSubmit();
    } catch (e) {
      console.log(e);
      toast({
        title: "删除失败",
        description: formatError(e),
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setDeleteAvatarLoading(false);
    }
  };

  return (
    <>
      <Button
        disabled={buttonDisabled || deleteAvatarLoading}
        onClick={() => setAlertOpen(true)}
        variant="destructive"
      >
        删除
      </Button>
      <AlertDialog open={alertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定删除当前证件照？该操作不可恢复
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteAvatarLoading}
              onClick={() => setAlertOpen(false)}
            >
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteAvatarLoading}
              onClick={handleDeleteAvatar}
            >
              {deleteAvatarLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "确定"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MetaEditor;
