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
import { FormInput } from "@/components/Input";
import { Label } from "@/components/Label";
import Editor from "@/components/RichText/Editor";
import Viewer from "@/components/RichText/Viewer";
import { ScrollArea } from "@/components/ScrollArea";
import { useToast } from "@/components/Toaster/hooks";
import { VisuallyHidden } from "@/components/VisuallyHidden";
import { OPACITY_ANIMATION } from "@/lib/const/animation";
import { ProjectFormState } from "@/lib/types/resume";
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
    name: string;
    sort: number;
    description: string;
    key: string;
  };
  onItemDelete: (key: string) => void;
  onItemEdit: (item: {
    name: string;
    description: string;
    key: string;
  }) => void;
};

type SortableListProps = {
  items: SortableItemProps["item"][];
  onItemDelete: (key: string) => void;
  onItemEdit: (item: {
    name: string;
    description: string;
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
          <div>{item.name}</div>
        </div>
        <div className="flex items-center space-x-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab"
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
      {item.description && <Viewer content={item.description} />}
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

const ProjectEditor: React.FC = () => {
  const { resumeInfo, resumeLoading, resumeValidating } = useFetchResume();
  const { handleFormSubmit, submitLoading } = useSubmitResumeSection();
  const { content, setContent } = useResumeContent();
  const isFirstRender = useIsFirstRender();

  const [formState, setFormState] = useState<ProjectFormState>({});

  useEffect(() => {
    if (!resumeInfo) return;

    const formattedProjectContent =
      resumeInfo.content.project.reduce<ProjectFormState>((acc, curr) => {
        acc[curr.key] = {
          name: curr.name || "",
          sort: curr.sort,
          description: curr.description || "",
        };
        return acc;
      }, {});

    setFormState(formattedProjectContent);
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
      project: sortedItems,
    });
  }, [sortedItems]);

  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<{
    name: string;
    description: string;
    key: string;
  }>();

  const handleSubmit = async () => {
    await handleFormSubmit({
      content: JSON.stringify({ ...resumeInfo!.content, project: sortedItems }),
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
                name: item.name || "",
                description: item.description || "",
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
          添加项目
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
      <AddProjectModal
        open={addItemModalOpen}
        onClose={() => setAddItemModalOpen(false)}
        onSubmit={(v) => {
          const key = generateRandomSalt(7);

          setFormState((prev) => ({
            ...prev,
            [key]: {
              name: v.name || "",
              description: v.description || "",
              sort:
                sortedItems.length === 0
                  ? 0
                  : sortedItems[sortedItems.length - 1].sort + 1,
            },
          }));
        }}
      />
      <ModifyProjectModal
        defaultValue={editItem}
        onClose={() => setEditItem(undefined)}
        onSubmit={(v) => {
          const exist = formState[v.key];
          if (!exist) return;

          setFormState((prev) => ({
            ...prev,
            [v.key]: {
              name: v.name || "",
              sort: prev[v.key].sort,
              description: v.description || "",
            },
          }));
        }}
      />
      <AlertDialog open={alertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定删除项目经验？该操作不可恢复
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

const AddProjectModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (v: { name: string; description: string }) => void;
}> = ({ open, onClose, onSubmit }) => {
  const { toast } = useToast();

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const handleSubmit = () => {
    try {
      if (!projectName) {
        throw new Error("项目名称不能为空");
      }

      const validDescription = checkRichTextOutputIsNull(projectDescription);

      if (!validDescription) {
        throw new Error("项目描述不能为空");
      }

      onSubmit({
        name: projectName,
        description: validDescription,
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
    setProjectName("");
    setProjectDescription("");
  };

  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加项目经验</DialogTitle>
          <VisuallyHidden>
            <DialogDescription></DialogDescription>
          </VisuallyHidden>
        </DialogHeader>
        <ScrollArea className="my-4 h-[calc(50vh-2rem)] w-full">
          <div className="w-full space-y-5">
            <div className="grid grid-cols-1 gap-x-4 gap-y-5 overflow-hidden">
              <FormInput
                required
                value={projectName}
                onValueChange={(v) => {
                  setProjectName(v);
                }}
                label="项目名称"
              />
            </div>
            <div className="w-full space-y-1.5">
              <div className="inline-flex items-center space-x-1">
                <Label>项目描述</Label>
                <div className="text-xs text-danger-light">*</div>
              </div>

              <Editor
                content={projectDescription}
                onChange={setProjectDescription}
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

const ModifyProjectModal: React.FC<{
  defaultValue?: {
    key: string;
    name: string;
    description: string;
  };
  onClose: () => void;
  onSubmit: (v: { key: string; name: string; description: string }) => void;
}> = ({ defaultValue, onClose, onSubmit }) => {
  const { toast } = useToast();

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const handleSubmit = () => {
    try {
      if (!projectName) {
        throw new Error("项目名称不能为空");
      }

      const validDescription = checkRichTextOutputIsNull(projectDescription);

      if (!validDescription) {
        throw new Error("项目描述不能为空");
      }

      onSubmit({
        key: defaultValue!.key,
        name: projectName,
        description: validDescription,
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
    setProjectName("");
    setProjectDescription("");
  };

  useEffect(() => {
    if (defaultValue) {
      setProjectName(defaultValue.name);
      setProjectDescription(defaultValue.description);
    }
  }, [defaultValue]);

  return (
    <Dialog open={Boolean(defaultValue)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>更改项目经验</DialogTitle>
          <VisuallyHidden>
            <DialogDescription></DialogDescription>
          </VisuallyHidden>
        </DialogHeader>
        <ScrollArea className="my-4 h-[calc(50vh-2rem)] w-full">
          <div className="w-full space-y-5">
            <div className="grid grid-cols-1 gap-x-4 gap-y-5 overflow-hidden">
              <FormInput
                required
                value={projectName}
                onValueChange={(v) => {
                  setProjectName(v);
                }}
                label="项目名称"
              />
            </div>
            <div className="w-full space-y-1.5">
              <div className="inline-flex items-center space-x-1">
                <Label>项目描述</Label>
                <div className="text-xs text-danger-light">*</div>
              </div>

              <Editor
                content={projectDescription}
                onChange={setProjectDescription}
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

export default ProjectEditor;
