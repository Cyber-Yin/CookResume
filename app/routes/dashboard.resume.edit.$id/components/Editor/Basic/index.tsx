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
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useIsFirstRender } from "@uidotdev/usehooks";
import { motion } from "framer-motion";
import { Loader2, Menu, Trash2 } from "lucide-react";
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
import { ScrollArea } from "@/components/ScrollArea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/Select";
import { useToast } from "@/components/Toaster/hooks";
import { VisuallyHidden } from "@/components/VisuallyHidden";
import { OPACITY_ANIMATION } from "@/lib/const/animation";
import { BasicDataFormState } from "@/lib/types/resume";
import {
  cn,
  formatError,
  generateRandomSalt,
  handleEditorSortEnd,
} from "@/lib/utils";
import { formatResumeBasicData } from "@/lib/utils/resume";
import { useFetchResume } from "@/routes/dashboard.resume.edit.$id/hooks/useFetchResume";
import useResizeObserver from "@/routes/dashboard.resume.edit.$id/hooks/useResizeObserver";
import { useResumeContent } from "@/routes/dashboard.resume.edit.$id/hooks/useResumeContent";
import { useSubmitResumeSection } from "@/routes/dashboard.resume.edit.$id/hooks/useSubmitResumeSection";

const PlaceholderMap = [
  {
    key: "name",
    placeholder: "例：张三",
  },
  {
    key: "age",
    placeholder: "例：18",
  },
  {
    key: "phone",
    placeholder: "例：18812345678",
  },
  {
    key: "email",
    placeholder: "例：zhangsan@gmail.com",
  },
  {
    key: "job",
    placeholder: "例：前端开发",
  },
  {
    key: "education",
    placeholder: "例：本科",
  },
];

const CheckType = (key: string) => {
  if (["phone", "age"].includes(key)) {
    return "number";
  } else if (key === "email") {
    return "email";
  }
  return "text";
};

type SortableItemProps = {
  item: {
    isCustom: boolean;
    label: string;
    sort: number;
    value: string;
    key: string;
  };
  formState: BasicDataFormState;
  setFormState: React.Dispatch<React.SetStateAction<BasicDataFormState>>;
  onItemDelete: (key: string) => void;
};

type SortableListProps = {
  editorWidth: number;
  items: SortableItemProps["item"][];
  formState: BasicDataFormState;
  setFormState: React.Dispatch<React.SetStateAction<BasicDataFormState>>;
  onSortEnd: (event: DragEndEvent) => void;
  onItemDelete: (key: string) => void;
};

const SortableItem = ({
  item,
  formState,
  setFormState,
  onItemDelete,
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

  const placeholder = PlaceholderMap.find(
    (i) => i.key === item.key,
  )?.placeholder;

  const inputType = CheckType(item.key);

  if (item.key === "gender") {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="relative w-full"
      >
        <div className="w-full space-y-1.5">
          <div className="inline-flex items-center space-x-1">
            <Label>性别</Label>
            <div className="text-xs text-danger-light">*</div>
          </div>
          <Select
            value={formState.gender.value}
            onValueChange={(v) => {
              setFormState((prev) => ({
                ...prev,
                gender: {
                  ...prev.gender,
                  value: v,
                },
              }));
            }}
          >
            <SelectTrigger>
              <SelectValue
                placeholder="请选择性别"
                className="text-custom-secondary placeholder:text-custom-secondary"
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="男">男</SelectItem>
              <SelectItem value="女">女</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="absolute right-0 top-1.5 flex items-center space-x-1">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab"
          >
            <Menu className="h-3.5 w-3.5" />
          </div>
          {item.isCustom && (
            <Trash2
              onClick={() => onItemDelete(item.key)}
              className="h-3.5 w-3.5 cursor-pointer text-danger-light"
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative w-full"
    >
      <FormInput
        required={["name", "age"].includes(item.key)}
        label={item.label}
        placeholder={placeholder || ""}
        type={inputType}
        step={inputType === "number" ? 1 : undefined}
        min={item.key === "age" ? 1 : undefined}
        max={item.key === "age" ? 100 : undefined}
        value={item.value}
        onValueChange={(v, e) => {
          setFormState((prev) => ({
            ...prev,
            [item.key]: {
              ...prev[item.key],
              value: v,
            },
          }));
        }}
      />
      <div className="absolute right-0 top-1.5 flex items-center space-x-1">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab"
        >
          <Menu className="h-3.5 w-3.5" />
        </div>
        {item.isCustom && (
          <Trash2
            onClick={() => onItemDelete(item.key)}
            className="h-3.5 w-3.5 cursor-pointer text-danger-light"
          />
        )}
      </div>
    </div>
  );
};

const SortableList = ({
  editorWidth,
  items,
  formState,
  setFormState,
  onSortEnd,
  onItemDelete,
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
        strategy={rectSortingStrategy}
      >
        <motion.div
          variants={OPACITY_ANIMATION}
          initial="hidden"
          animate="visible"
          className={cn("grid gap-x-4 gap-y-5 overflow-hidden px-5 py-4", {
            "grid-cols-1": editorWidth <= 300,
            "grid-cols-2": editorWidth > 300 && editorWidth <= 900,
            "grid-cols-3": editorWidth > 900,
          })}
        >
          {items.map((item) => (
            <SortableItem
              onItemDelete={onItemDelete}
              key={item.key}
              item={item}
              formState={formState}
              setFormState={setFormState}
            />
          ))}
        </motion.div>
      </SortableContext>
    </DndContext>
  );
};

const BasicEditor: React.FC = () => {
  const { toast } = useToast();

  const { resumeInfo, resumeLoading, resumeValidating } = useFetchResume();
  const { handleFormSubmit, submitLoading } = useSubmitResumeSection();
  const { content, setContent } = useResumeContent();

  const isFirstRender = useIsFirstRender();

  const [formState, setFormState] = useState<BasicDataFormState>({});

  useEffect(() => {
    if (!resumeInfo) return;

    const formattedBasicContent = formatResumeBasicData(
      resumeInfo.content.basic,
    );

    setFormState(formattedBasicContent);
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
      basic: sortedItems.map((item) => ({
        key: item.key,
        label: item.label,
        sort: item.sort,
        value: item.value,
      })),
    });
  }, [sortedItems]);

  const { ref: editorRef, width: editorWidth } = useResizeObserver();

  const [addItemModalOpen, setAddItemModalOpen] = useState(false);

  const handleSubmit = async () => {
    try {
      if (!formState.name.value) {
        throw new Error("姓名不能为空");
      }

      if (!formState.age.value) {
        throw new Error("年龄不能为空");
      }
    } catch (e) {
      toast({
        title: "保存失败",
        description: formatError(e),
        duration: 5000,
        variant: "destructive",
      });

      return;
    }

    await handleFormSubmit({
      content: JSON.stringify({
        ...resumeInfo!.content,
        basic: sortedItems.map((item) => ({
          key: item.key,
          label: item.label,
          sort: item.sort,
          value: item.value,
        })),
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
    <div
      ref={editorRef}
      className="flex h-[calc(100vh-4rem)] w-full flex-col"
    >
      <ScrollArea className="h-[calc(100vh-7.5rem)]">
        <SortableList
          editorWidth={editorWidth}
          items={sortedItems}
          formState={formState}
          setFormState={setFormState}
          onItemDelete={(key) => {
            setAlertKey(key);
            setAlertOpen(true);
          }}
          onSortEnd={(event) =>
            handleEditorSortEnd(event, sortedItems, formState, setFormState)
          }
        />
      </ScrollArea>
      <div className="flex h-14 w-full items-center justify-end space-x-2 px-4">
        <Button
          disabled={submitLoading}
          variant="outline"
          onClick={() => setAddItemModalOpen(true)}
        >
          添加词条
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
      <AddItemModal
        open={addItemModalOpen}
        onClose={() => setAddItemModalOpen(false)}
        onSubmit={(v) => {
          const key = generateRandomSalt(7);

          setFormState((prev) => ({
            ...prev,
            [key]: {
              label: v.label,
              value: v.value,
              sort: sortedItems[sortedItems.length - 1].sort + 1,
              isCustom: true,
            },
          }));
        }}
      />
      <AlertDialog open={alertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定删除自定义词条？该操作不可恢复
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

const AddItemModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (v: { label: string; value: string }) => void;
}> = ({ open, onClose, onSubmit }) => {
  const { toast } = useToast();

  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (!label || !value) {
      toast({
        title: "保存失败",
        description: "标签或值不能为空",
        duration: 5000,
        variant: "destructive",
      });
      return;
    }

    onSubmit({ label, value });
    onClose();
    clear();
  };

  const clear = () => {
    setLabel("");
    setValue("");
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>添加词条</DialogTitle>
          <VisuallyHidden asChild>
            <DialogDescription>添加词条</DialogDescription>
          </VisuallyHidden>
        </DialogHeader>
        <div className="my-4 space-y-4">
          <FormInput
            required
            label="标签"
            placeholder="请输入标签"
            value={label}
            onValueChange={(v) => {
              setLabel(v);
            }}
          />
          <FormInput
            required
            label="值"
            placeholder="请输入值"
            value={value}
            onValueChange={(v) => {
              setValue(v);
            }}
          />
        </div>
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

export default BasicEditor;
