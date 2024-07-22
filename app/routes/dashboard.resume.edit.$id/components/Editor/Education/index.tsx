"use client";

import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useIsFirstRender } from "@uidotdev/usehooks";
import { motion } from "framer-motion";
import { Loader2, Menu, Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
import { FormInput } from "@/components/Input";
import { Label } from "@/components/Label";
import Editor from "@/components/RichText/Editor";
import Viewer from "@/components/RichText/Viewer";
import { ScrollArea } from "@/components/ScrollArea";
import { useToast } from "@/components/Toaster/hooks";
import { VisuallyHidden } from "@/components/VisuallyHidden";
import { OPACITY_ANIMATION } from "@/lib/const/animation";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { EducationFormState } from "@/lib/types/resume";
import {
  checkRichTextOutputIsNull,
  formatError,
  generateRandomSalt,
  handleEditorSortEnd,
} from "@/lib/utils";
import { useFetchResume } from "@/routes/dashboard.resume.edit.$id/hooks/useFetchResume";
import { useResumeContent } from "@/routes/dashboard.resume.edit.$id/hooks/useResumeContent";
import { useSubmitResumeSection } from "@/routes/dashboard.resume.edit.$id/hooks/useSubmitResumeSection";

type SortableItemProps = {
  item: {
    experience: string;
    sort: number;
    school: string;
    major: string;
    startDate: string;
    endDate: string;
    key: string;
  };
  onItemDelete: (key: string) => void;
  onItemEdit: (item: {
    experience: string;
    sort: number;
    school: string;
    major: string;
    startDate: string;
    endDate: string;
    key: string;
  }) => void;
};

type SortableListProps = {
  items: SortableItemProps["item"][];
  onItemDelete: (key: string) => void;
  onItemEdit: (item: {
    experience: string;
    sort: number;
    school: string;
    major: string;
    startDate: string;
    endDate: string;
    key: string;
  }) => void;
  onSortEnd: (event: DragEndEvent) => void;
};

const SortableItem = ({
  item,
  onItemDelete,
  onItemEdit,
}: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.key });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    height: isDragging ? undefined : "",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-full select-none space-y-3 overflow-hidden rounded-lg border border-custom-secondary bg-custom p-3"
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex space-x-2 text-sm font-semibold">
          <div>{item.school}</div>
          {item.major && <div>{item.major}</div>}
          <div>{`${item.startDate} - ${item.endDate}`}</div>
        </div>
        <div className="flex items-center space-x-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab touch-none"
          >
            <Menu className="h-3.5 w-3.5" />
          </div>
          <Pencil
            onClick={() => onItemEdit(item)}
            className="h-3.5 w-3.5 cursor-pointer transition-colors hover:text-primary"
          />
          <Trash2
            onClick={() => onItemDelete(item.key)}
            className="h-3.5 w-3.5 cursor-pointer text-danger-light"
          />
        </div>
      </div>
      {item.experience && <Viewer content={item.experience} />}
    </div>
  );
};

const SortableList = ({
  items,
  onItemDelete,
  onItemEdit,
  onSortEnd,
}: SortableListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor),
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onSortEnd}
    >
      <SortableContext
        items={items.map((item) => item.key)}
        strategy={verticalListSortingStrategy}
      >
        <motion.div
          variants={OPACITY_ANIMATION}
          initial="hidden"
          animate="visible"
          className="flex w-full flex-col space-y-4 px-5 py-4"
        >
          {items.map((item) => (
            <SortableItem
              key={item.key}
              item={item}
              onItemDelete={onItemDelete}
              onItemEdit={onItemEdit}
            />
          ))}
        </motion.div>
      </SortableContext>
    </DndContext>
  );
};

const EducationEditor: React.FC = () => {
  const { resumeInfo, resumeLoading, resumeValidating } = useFetchResume();
  const { handleFormSubmit, submitLoading } = useSubmitResumeSection();
  const { content, setContent } = useResumeContent();

  const isFirstRender = useIsFirstRender();

  const [formState, setFormState] = useState<EducationFormState>({});

  useEffect(() => {
    if (!resumeInfo) return;

    const formattedEducationContent =
      resumeInfo.content.education.reduce<EducationFormState>((acc, curr) => {
        acc[curr.key] = {
          experience: curr.experience || "",
          sort: curr.sort,
          school: curr.school || "",
          major: curr.major || "",
          startDate: curr.startDate || "",
          endDate: curr.endDate || "",
        };
        return acc;
      }, {});

    setFormState(formattedEducationContent);
  }, [resumeInfo]);

  const sortedItems = useMemo(
    () =>
      Object.entries(formState)
        .map(([key, item]) => ({ key, ...item }))
        .sort((a, b) => a.sort - b.sort),
    [formState],
  );

  useEffect(() => {
    if (isFirstRender) return;

    setContent({
      ...content,
      education: sortedItems,
    });
  }, [sortedItems]);

  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<{
    experience: string;
    school: string;
    major: string;
    startDate: string;
    endDate: string;
    key: string;
  }>();

  const handleSubmit = async () => {
    await handleFormSubmit({
      content: JSON.stringify({
        ...resumeInfo!.content,
        education: sortedItems,
      }),
    });
  };

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertKey, setAlertKey] = useState("");

  const handleItemDelete = () => {
    if (!alertKey) {
      setAlertOpen(false);
      return;
    }

    setFormState((prev) => {
      const { [alertKey]: _, ...rest } = prev;
      return rest;
    });

    setAlertOpen(false);
    setAlertKey("");
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col">
      <ScrollArea className="h-[calc(100vh-7.5rem)]">
        {sortedItems.length === 0 ? (
          <div className="flex h-[calc(100vh-7.5rem)] w-full items-center justify-center text-2xl font-semibold">
            暂无内容
          </div>
        ) : (
          <SortableList
            items={sortedItems}
            onItemDelete={(key) => {
              setAlertKey(key);
              setAlertOpen(true);
            }}
            onItemEdit={(item) =>
              setEditItem({
                key: item.key,
                experience: item.experience || "",
                school: item.school || "",
                major: item.major || "",
                startDate: item.startDate || "",
                endDate: item.endDate || "",
              })
            }
            onSortEnd={(event) =>
              handleEditorSortEnd(event, sortedItems, formState, setFormState)
            }
          />
        )}
      </ScrollArea>
      <div className="flex h-14 w-full items-center justify-end space-x-2 px-4">
        <Button
          disabled={submitLoading}
          onClick={() => setAddItemModalOpen(true)}
          variant="outline"
        >
          添加背景
        </Button>
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
      <AddEducationModal
        open={addItemModalOpen}
        onClose={() => setAddItemModalOpen(false)}
        onSubmit={(v) => {
          const key = generateRandomSalt(7);

          setFormState((prev) => ({
            ...prev,
            [key]: {
              experience: v.experience || "",
              sort:
                sortedItems.length === 0
                  ? 0
                  : sortedItems[sortedItems.length - 1].sort + 1,
              school: v.school || "",
              major: v.major || "",
              startDate: v.startDate || "",
              endDate: v.endDate || "",
            },
          }));
        }}
      />
      <ModifyEducationModal
        defaultValue={editItem}
        onClose={() => setEditItem(undefined)}
        onSubmit={(v) => {
          const exist = formState[v.key];
          if (!exist) return;

          setFormState((prev) => ({
            ...prev,
            [v.key]: {
              experience: v.experience || "",
              sort: prev[v.key].sort,
              school: v.school || "",
              major: v.major || "",
              startDate: v.startDate || "",
              endDate: v.endDate || "",
            },
          }));
        }}
      />
      <AlertDialog open={alertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定删除教育背景？该操作不可恢复
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAlertOpen(false)}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleItemDelete}>
              确定
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const AddEducationModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (v: {
    experience: string;
    school: string;
    major: string;
    startDate: string;
    endDate: string;
  }) => void;
}> = ({ open, onClose, onSubmit }) => {
  const { toast } = useToast();
  const { isMobile } = useMediaQuery();

  const [educationExperience, setEducationExperience] = useState("");
  const [educationBasicData, setEducationBasicData] = useState({
    school: "",
    major: "",
    startDate: "",
    endDate: "",
  });

  const handleSubmit = () => {
    try {
      if (!educationBasicData.school) {
        throw new Error("学校不能为空");
      }

      if (!educationBasicData.startDate || !educationBasicData.endDate) {
        throw new Error("开始时间和结束时间不能为空");
      }

      onSubmit({
        experience: checkRichTextOutputIsNull(educationExperience),
        ...educationBasicData,
      });
      onClose();
      clear();
    } catch (e) {
      toast({
        title: "添加失败",
        description: formatError(e),
        duration: 5000,
        variant: "destructive",
      });
    }
  };

  const clear = () => {
    setEducationExperience("");
    setEducationBasicData({
      school: "",
      major: "",
      startDate: "",
      endDate: "",
    });
  };

  if (isMobile) {
    return (
      <Drawer open={open}>
        <DrawerContent className="px-4 pb-4">
          <DrawerHeader>
            <DrawerTitle>添加教育背景</DrawerTitle>
            <VisuallyHidden asChild>
              <DrawerDescription></DrawerDescription>
            </VisuallyHidden>
          </DrawerHeader>
          <ScrollArea className="my-4 h-[calc(50vh-2rem)] w-full">
            <div className="w-full space-y-5">
              <div className="grid grid-cols-1 gap-x-4 gap-y-5 overflow-hidden sm:grid-cols-2">
                <FormInput
                  required
                  value={educationBasicData.school}
                  onValueChange={(v) => {
                    setEducationBasicData((prev) => ({
                      ...prev,
                      school: v,
                    }));
                  }}
                  label="学校"
                />
                <FormInput
                  value={educationBasicData.major}
                  onValueChange={(v) => {
                    setEducationBasicData((prev) => ({
                      ...prev,
                      major: v,
                    }));
                  }}
                  label="专业"
                />
                <FormInput
                  required
                  value={educationBasicData.startDate}
                  onValueChange={(v) => {
                    setEducationBasicData((prev) => ({
                      ...prev,
                      startDate: v,
                    }));
                  }}
                  placeholder="格式：2022.01.01"
                  label="开始时间"
                />
                <FormInput
                  required
                  value={educationBasicData.endDate}
                  onValueChange={(v) => {
                    setEducationBasicData((prev) => ({
                      ...prev,
                      endDate: v,
                    }));
                  }}
                  placeholder="格式：2022.01.01"
                  label="结束时间"
                />
              </div>
              <div className="w-full space-y-1.5">
                <Label>经历</Label>
                <Editor
                  content={educationExperience}
                  onChange={setEducationExperience}
                />
              </div>
            </div>
          </ScrollArea>

          <div className="flex w-full flex-col items-center space-y-2">
            <Button
              className="w-full"
              onClick={handleSubmit}
            >
              添加
            </Button>
            <Button
              className="w-full"
              variant="destructive"
              onClick={() => {
                onClose();
                clear();
              }}
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加教育背景</DialogTitle>
          <VisuallyHidden>
            <DialogDescription></DialogDescription>
          </VisuallyHidden>
        </DialogHeader>
        <ScrollArea className="my-4 h-[calc(50vh-2rem)] w-full">
          <div className="w-full space-y-5">
            <div className="grid grid-cols-1 gap-x-4 gap-y-5 overflow-hidden sm:grid-cols-2">
              <FormInput
                required
                value={educationBasicData.school}
                onValueChange={(v) => {
                  setEducationBasicData((prev) => ({
                    ...prev,
                    school: v,
                  }));
                }}
                label="学校"
              />
              <FormInput
                value={educationBasicData.major}
                onValueChange={(v) => {
                  setEducationBasicData((prev) => ({
                    ...prev,
                    major: v,
                  }));
                }}
                label="专业"
              />
              <FormInput
                required
                value={educationBasicData.startDate}
                onValueChange={(v) => {
                  setEducationBasicData((prev) => ({
                    ...prev,
                    startDate: v,
                  }));
                }}
                placeholder="格式：2022.01.01"
                label="开始时间"
              />
              <FormInput
                required
                value={educationBasicData.endDate}
                onValueChange={(v) => {
                  setEducationBasicData((prev) => ({
                    ...prev,
                    endDate: v,
                  }));
                }}
                placeholder="格式：2022.01.01"
                label="结束时间"
              />
            </div>
            <div className="w-full space-y-1.5">
              <Label>经历</Label>
              <Editor
                content={educationExperience}
                onChange={setEducationExperience}
              />
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={() => {
              onClose();
              clear();
            }}
          >
            取消
          </Button>
          <Button onClick={handleSubmit}>添加</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ModifyEducationModal: React.FC<{
  defaultValue?: {
    key: string;
    experience: string;
    school: string;
    major: string;
    startDate: string;
    endDate: string;
  };
  onClose: () => void;
  onSubmit: (v: {
    key: string;
    experience: string;
    school: string;
    major: string;
    startDate: string;
    endDate: string;
  }) => void;
}> = ({ onClose, onSubmit, defaultValue }) => {
  const { toast } = useToast();
  const { isMobile } = useMediaQuery();

  const [educationExperience, setEducationExperience] = useState("");
  const [educationBasicData, setEducationBasicData] = useState({
    school: "",
    major: "",
    startDate: "",
    endDate: "",
  });

  const handleSubmit = () => {
    try {
      if (!educationBasicData.school) {
        throw new Error("学校不能为空");
      }

      if (!educationBasicData.startDate || !educationBasicData.endDate) {
        throw new Error("开始时间和结束时间不能为空");
      }

      onSubmit({
        key: defaultValue!.key,
        experience: checkRichTextOutputIsNull(educationExperience),
        ...educationBasicData,
      });
      onClose();
      clear();
    } catch (e) {
      toast({
        title: "更改失败",
        description: formatError(e),
        duration: 5000,
        variant: "destructive",
      });
    }
  };

  const clear = () => {
    setEducationExperience("");
    setEducationBasicData({
      school: "",
      major: "",
      startDate: "",
      endDate: "",
    });
  };

  useEffect(() => {
    if (defaultValue) {
      setEducationExperience(defaultValue.experience);
      setEducationBasicData({
        school: defaultValue.school,
        major: defaultValue.major,
        startDate: defaultValue.startDate,
        endDate: defaultValue.endDate,
      });
    }
  }, [defaultValue]);

  if (isMobile) {
    return (
      <Drawer open={Boolean(defaultValue)}>
        <DrawerContent className="px-4 pb-4">
          <DrawerHeader>
            <DrawerTitle>更改教育背景</DrawerTitle>
            <VisuallyHidden asChild>
              <DrawerDescription></DrawerDescription>
            </VisuallyHidden>
          </DrawerHeader>
          <ScrollArea className="my-4 h-[calc(50vh-2rem)] w-full">
            <div className="w-full space-y-5">
              <div className="grid grid-cols-1 gap-x-4 gap-y-5 overflow-hidden sm:grid-cols-2">
                <FormInput
                  required
                  value={educationBasicData.school}
                  onValueChange={(v) => {
                    setEducationBasicData((prev) => ({
                      ...prev,
                      school: v,
                    }));
                  }}
                  label="学校"
                />
                <FormInput
                  value={educationBasicData.major}
                  onValueChange={(v) => {
                    setEducationBasicData((prev) => ({
                      ...prev,
                      major: v,
                    }));
                  }}
                  label="专业"
                />
                <FormInput
                  required
                  value={educationBasicData.startDate}
                  onValueChange={(v) => {
                    setEducationBasicData((prev) => ({
                      ...prev,
                      startDate: v,
                    }));
                  }}
                  placeholder="格式：2022.01.01"
                  label="开始时间"
                />
                <FormInput
                  required
                  value={educationBasicData.endDate}
                  onValueChange={(v) => {
                    setEducationBasicData((prev) => ({
                      ...prev,
                      endDate: v,
                    }));
                  }}
                  placeholder="格式：2022.01.01"
                  label="结束时间"
                />
              </div>
              <div className="w-full space-y-1.5">
                <Label>经历</Label>
                <Editor
                  content={educationExperience}
                  onChange={setEducationExperience}
                />
              </div>
            </div>
          </ScrollArea>

          <div className="flex w-full flex-col items-center space-y-2">
            <Button
              className="w-full"
              onClick={handleSubmit}
            >
              更改
            </Button>
            <Button
              className="w-full"
              variant="destructive"
              onClick={() => {
                onClose();
                clear();
              }}
            >
              取消
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={Boolean(defaultValue)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>更改教育背景</DialogTitle>
          <VisuallyHidden>
            <DialogDescription></DialogDescription>
          </VisuallyHidden>
        </DialogHeader>
        <ScrollArea className="my-4 h-[calc(50vh-2rem)] w-full">
          <div className="w-full space-y-5">
            <div className="grid grid-cols-1 gap-x-4 gap-y-5 overflow-hidden sm:grid-cols-2">
              <FormInput
                required
                value={educationBasicData.school}
                onValueChange={(v) => {
                  setEducationBasicData((prev) => ({
                    ...prev,
                    school: v,
                  }));
                }}
                label="学校"
              />
              <FormInput
                value={educationBasicData.major}
                onValueChange={(v) => {
                  setEducationBasicData((prev) => ({
                    ...prev,
                    major: v,
                  }));
                }}
                label="专业"
              />
              <FormInput
                required
                value={educationBasicData.startDate}
                onValueChange={(v) => {
                  setEducationBasicData((prev) => ({
                    ...prev,
                    startDate: v,
                  }));
                }}
                placeholder="格式：2022.01.01"
                label="开始时间"
              />
              <FormInput
                required
                value={educationBasicData.endDate}
                onValueChange={(v) => {
                  setEducationBasicData((prev) => ({
                    ...prev,
                    endDate: v,
                  }));
                }}
                placeholder="格式：2022.01.01"
                label="结束时间"
              />
            </div>
            <div className="w-full space-y-1.5">
              <Label>经历</Label>
              <Editor
                content={educationExperience}
                onChange={setEducationExperience}
              />
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={() => {
              onClose();
              clear();
            }}
          >
            取消
          </Button>
          <Button onClick={handleSubmit}>更改</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EducationEditor;
