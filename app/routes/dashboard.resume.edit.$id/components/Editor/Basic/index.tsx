"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Loader2, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
import { cn, formatError, generateRandomSalt } from "@/lib/utils";
import { useFetchResume } from "@/routes/dashboard.resume.edit.$id/hooks/useFetchResume";
import useResizeObserver from "@/routes/dashboard.resume.edit.$id/hooks/useResizeObserver";
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

const BasicEditor: React.FC = () => {
  const { toast } = useToast();

  const { resumeInfo, resumeLoading, resumeValidating } = useFetchResume();
  const { handleFormSubmit, submitLoading } = useSubmitResumeSection();

  const [formState, setFormState] = useState<BasicDataFormState>({});

  const sortedItems = useMemo(
    () =>
      Object.entries(formState)
        .map(([key, item]) => ({ key, ...item }))
        .sort((a, b) => a.sort - b.sort),
    [formState],
  );

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

    const updateData = Object.entries(formState).map(([key, value]) => ({
      key,
      label: value.label,
      sort: value.sort,
      value: value.value,
    }));

    await handleFormSubmit(updateData, "basic");
  };

  useEffect(() => {
    if (!resumeInfo) return;

    setFormState(resumeInfo.formattedContent.basic);
  }, [resumeInfo]);

  return (
    <div
      ref={editorRef}
      className="flex h-[calc(100vh-4rem)] w-full flex-col"
    >
      <ScrollArea className="h-[calc(100vh-7.5rem)]">
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
          {sortedItems.map((item) => {
            const placeholder = PlaceholderMap.find(
              (i) => i.key === item.key,
            )?.placeholder;

            if (item.key === "gender") {
              return (
                <SortTool
                  sortedItems={sortedItems}
                  key="gender"
                  item={item}
                  setFormState={setFormState}
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
                </SortTool>
              );
            }

            const inputType = CheckType(item.key);

            return (
              <SortTool
                sortedItems={sortedItems}
                item={item}
                setFormState={setFormState}
                key={item.key}
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
              </SortTool>
            );
          })}
        </motion.div>
      </ScrollArea>
      <div className="flex h-14 w-full items-center justify-end space-x-2 px-4">
        <Button
          disabled={submitLoading}
          onClick={() => setAddItemModalOpen(true)}
          className="border border-custom bg-custom text-custom hover:border-primary hover:text-primary"
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
          const key = generateRandomSalt(6);

          // use last item sort as base
          const sort = sortedItems[sortedItems.length - 1].sort + 1;
          setFormState((prev) => ({
            ...prev,
            [key]: {
              label: v.label,
              value: v.value,
              sort,
              isCustom: true,
            },
          }));
        }}
      />
    </div>
  );
};

const SortTool: React.FC<{
  children: React.ReactNode;
  item: {
    key: string;
    sort: number;
    isCustom: boolean;
    value: string;
  };
  sortedItems: {
    isCustom: boolean;
    label: string;
    sort: number;
    value: string;
    key: string;
  }[];
  setFormState: React.Dispatch<React.SetStateAction<BasicDataFormState>>;
}> = ({ children, item, sortedItems, setFormState }) => {
  return (
    <div className="group relative w-full">
      {children}
      <div className="absolute right-0 top-1.5 hidden items-center space-x-1 group-hover:flex">
        <ArrowUp
          onClick={() => {
            setFormState((prev) => {
              const currentIndex = sortedItems.findIndex(
                (i) => i.key === item.key,
              );

              // not first item and found
              if (currentIndex < 1) return prev;

              const prevItem = sortedItems[currentIndex - 1];

              if (!prevItem) return prev;

              return {
                ...prev,
                [item.key]: {
                  ...prev[item.key],
                  sort: prevItem.sort,
                },
                [prevItem.key]: {
                  ...prev[prevItem.key],
                  sort: item.sort,
                },
              };
            });
          }}
          className="h-3.5 w-3.5 cursor-pointer transition-colors hover:text-primary"
        />
        <ArrowDown
          onClick={() => {
            setFormState((prev) => {
              const currentIndex = sortedItems.findIndex(
                (i) => i.key === item.key,
              );

              // not last item and found
              if (
                currentIndex === sortedItems.length - 1 ||
                currentIndex === -1
              )
                return prev;

              const nextItem = sortedItems[currentIndex + 1];

              if (!nextItem) return prev;

              return {
                ...prev,
                [item.key]: {
                  ...prev[item.key],
                  sort: nextItem.sort,
                },
                [nextItem.key]: {
                  ...prev[nextItem.key],
                  sort: item.sort,
                },
              };
            });
          }}
          className="h-3.5 w-3.5 cursor-pointer transition-colors hover:text-primary"
        />
        {item.isCustom && (
          <Trash2
            onClick={() => {
              setFormState((prev) => {
                const { [item.key]: _, ...rest } = prev;
                return rest;
              });
            }}
            className="h-3.5 w-3.5 cursor-pointer text-danger-light"
          />
        )}
      </div>
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
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          clear();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加词条</DialogTitle>
          <VisuallyHidden asChild>
            <DialogDescription>添加词条</DialogDescription>
          </VisuallyHidden>
        </DialogHeader>
        <div className="my-4 space-y-4">
          <FormInput
            label="标签"
            placeholder="请输入标签"
            value={label}
            onValueChange={(v) => {
              setLabel(v);
            }}
          />
          <FormInput
            label="值"
            placeholder="请输入值"
            value={value}
            onValueChange={(v) => {
              setValue(v);
            }}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BasicEditor;
