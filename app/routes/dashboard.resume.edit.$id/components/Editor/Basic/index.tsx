"use client";

import { useParams } from "@remix-run/react";
import axios from "axios";
import { ArrowDown, ArrowUp, Loader2, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

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
import { ResumeData } from "@/lib/types/resume";
import { cn, formatError, generateRandomSalt, varifyInt } from "@/lib/utils";
import useResizeObserver from "@/routes/dashboard.resume.edit.$id/hooks/useResizeObserver";

type FormState = {
  [key: string]: {
    isCustom: boolean;
    label: string;
    sort: number;
    value: string;
  };
};

const Fields = [
  {
    key: "name",
    label: "姓名",
  },
  {
    key: "age",
    label: "年龄",
  },
  {
    key: "gender",
    label: "性别",
    default: "男",
  },
  {
    key: "phone",
    label: "电话",
  },
  {
    key: "email",
    label: "邮箱",
  },
  {
    key: "job",
    label: "意向岗位",
  },
  {
    key: "education",
    label: "学历",
  },
];

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

const BasicEditor: React.FC<{
  data: ResumeData;
}> = ({ data }) => {
  const { toast } = useToast();
  const { id } = useParams();

  const [formState, setFormState] = useState<FormState>(() => {
    const basicData = data.basic || [];

    const initialState = Fields.reduce<FormState>((acc, field, index) => {
      return {
        ...acc,
        [field.key]: {
          label: field.label,
          isCustom: false,
          sort: index,
          value: field.default || "",
        },
      };
    }, {});

    basicData.forEach((item) => {
      if (initialState[item.key]) {
        initialState[item.key].sort = item.sort;
        initialState[item.key].value = item.value;
      } else {
        initialState[item.key] = {
          label: item.label || item.key,
          sort: item.sort,
          isCustom: true,
          value: item.value,
        };
      }
    });

    return initialState;
  });

  const formItems = useMemo(
    () =>
      Object.entries(formState)
        .map(([key, item]) => ({ key, ...item }))
        .sort((a, b) => a.sort - b.sort),
    [formState],
  );

  const { ref: editorRef, width: editorWidth } = useResizeObserver();

  const [submitLoading, setSubmitLoading] = useState(false);
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);

  const handleSubmit = async () => {
    try {
      if (!id) {
        throw new Error("简历 ID 不存在");
      }

      try {
        varifyInt.parse(parseInt(id));
      } catch (e) {
        throw new Error("ID 非法");
      }

      const updateData = Object.entries(formState).map(([key, value]) => ({
        key,
        label: value.label,
        sort: value.sort,
        value: value.value,
      }));

      setSubmitLoading(true);

      const { data: resumeUpdateResponse } = await axios.post<{
        data: {
          content: string;
        };
      }>("/api/resume/update", {
        resume_id: parseInt(id),
        content: JSON.stringify({
          ...data,
          basic: updateData,
        }),
      });

      const updatedContent: ResumeData = JSON.parse(
        resumeUpdateResponse.data.content,
      );

      if (updatedContent.basic) {
        setFormState(() => {
          return updatedContent.basic.reduce<FormState>((acc, item) => {
            const defaultItem = Fields.find((i) => i.key === item.key);

            return {
              ...acc,
              [item.key]: {
                isCustom: defaultItem ? false : true,
                label: item.label,
                sort: item.sort,
                value: item.value,
              },
            };
          }, {});
        });
      }

      toast({
        title: "保存成功",
        description: "简历已成功保存",
        duration: 5000,
      });
    } catch (e) {
      toast({
        title: "保存失败",
        description: formatError(e),
        duration: 5000,
        variant: "destructive",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div
      ref={editorRef}
      className="flex h-[calc(100vh-4rem)] w-full flex-col"
    >
      <ScrollArea className="h-[calc(100vh-7.5rem)]">
        <div
          className={cn("grid gap-x-4 gap-y-5 overflow-hidden px-5 py-4", {
            "grid-cols-1": editorWidth <= 300,
            "grid-cols-2": editorWidth > 300 && editorWidth <= 900,
            "grid-cols-3": editorWidth > 900,
          })}
        >
          {formItems.map((item) => {
            const placeholder = PlaceholderMap.find(
              (i) => i.key === item.key,
            )?.placeholder;

            if (item.key === "gender") {
              return (
                <SortTool
                  key="gender"
                  item={item}
                  setFormState={setFormState}
                >
                  <div className="w-full space-y-1.5">
                    <Label>性别</Label>
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
                item={item}
                setFormState={setFormState}
                key={item.key}
              >
                <FormInput
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
        </div>
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
          disabled={submitLoading}
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
          const sort = formItems.length;
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
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
}> = ({ children, item, setFormState }) => {
  return (
    <div className="group relative w-full">
      {children}
      <div className="absolute right-0 top-1.5 hidden items-center space-x-1 group-hover:flex">
        <ArrowUp
          onClick={() => {
            setFormState((prev) => {
              const currentIndex = prev[item.key].sort;

              const items = Object.entries(prev).map(([key, value]) => ({
                key,
                sort: value.sort,
              }));

              const prevItemIndex = items.findIndex(
                (i) => i.sort === currentIndex - 1,
              );

              if (prevItemIndex !== -1) {
                const prevItemKey = items[prevItemIndex].key;
                return {
                  ...prev,
                  [item.key]: {
                    ...prev[item.key],
                    sort: prev[item.key].sort - 1,
                  },
                  [prevItemKey]: {
                    ...prev[prevItemKey],
                    sort: prev[prevItemKey].sort + 1,
                  },
                };
              }

              return prev;
            });
          }}
          className="h-3.5 w-3.5 cursor-pointer transition-colors hover:text-primary"
        />
        <ArrowDown
          onClick={() => {
            setFormState((prev) => {
              const currentIndex = prev[item.key].sort;

              const items = Object.entries(prev).map(([key, value]) => ({
                key,
                sort: value.sort,
              }));

              const prevItemIndex = items.findIndex(
                (i) => i.sort === currentIndex + 1,
              );

              if (prevItemIndex !== -1) {
                const prevItemKey = items[prevItemIndex].key;
                return {
                  ...prev,
                  [item.key]: {
                    ...prev[item.key],
                    sort: prev[item.key].sort + 1,
                  },
                  [prevItemKey]: {
                    ...prev[prevItemKey],
                    sort: prev[prevItemKey].sort - 1,
                  },
                };
              }

              return prev;
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
