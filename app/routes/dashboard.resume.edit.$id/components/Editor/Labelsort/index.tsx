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
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useIsFirstRender } from "@uidotdev/usehooks";
import { motion } from "framer-motion";
import { Loader2, Menu } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/Button";
import { ScrollArea } from "@/components/ScrollArea";
import { OPACITY_ANIMATION } from "@/lib/const/animation";
import { useFetchResume } from "@/routes/dashboard.resume.edit.$id/hooks/useFetchResume";
import { useResumeContent } from "@/routes/dashboard.resume.edit.$id/hooks/useResumeContent";
import { useSubmitResumeSection } from "@/routes/dashboard.resume.edit.$id/hooks/useSubmitResumeSection";

const DefaultLabelSort = [
  {
    key: "basic",
    label: "基本信息",
  },
  {
    key: "education",
    label: "教育背景",
  },
  {
    key: "skill",
    label: "个人技能",
  },
  {
    key: "job",
    label: "工作经历",
  },
  {
    key: "project",
    label: "项目经验",
  },
  {
    key: "custom",
    label: "自定义",
  },
];

type SortableItemProps = {
  item: {
    key: string;
    label: string;
  };
};

type SortableListProps = {
  items: SortableItemProps["item"][];
  onSortEnd: (event: DragEndEvent) => void;
};

const SortableItem = ({ item }: SortableItemProps) => {
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
        <div className="text-sm font-semibold">
          <div>{item.label}</div>
        </div>
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab"
        >
          <Menu className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
};

const SortableList = ({ items, onSortEnd }: SortableListProps) => {
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
            />
          ))}
        </motion.div>
      </SortableContext>
    </DndContext>
  );
};

const LabelsortEditor: React.FC = () => {
  const { resumeInfo, resumeLoading, resumeValidating } = useFetchResume();
  const { handleFormSubmit, submitLoading } = useSubmitResumeSection();
  const { content, setContent } = useResumeContent();

  const isFirstRender = useIsFirstRender();

  const [formState, setFormState] = useState<string[]>([]);

  const labelSortWithLabel = useMemo(() => {
    const result: { key: string; label: string }[] = [];

    formState.forEach((key) => {
      const match = DefaultLabelSort.find((item) => item.key === key);
      if (match) {
        result.push({ key, label: match.label });
      }
    });

    DefaultLabelSort.forEach((item) => {
      if (!formState.includes(item.key)) {
        result.push({ key: item.key, label: item.label });
      }
    });

    return result;
  }, [formState]);

  useEffect(() => {
    if (!resumeInfo) return;

    setFormState(resumeInfo.content.meta.labelSort);
  }, [resumeInfo]);

  useEffect(() => {
    if (isFirstRender) return;

    setContent({
      ...content,
      meta: {
        ...content.meta,
        labelSort: formState,
      },
    });
  }, [formState]);

  const handleSubmit = async () => {
    await handleFormSubmit({
      content: JSON.stringify({
        ...resumeInfo!.content,
        meta: {
          ...resumeInfo!.content.meta,
          labelSort: formState,
        },
      }),
    });
  };

  const handleSortEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id === over.id) return;

    const oldIndex = labelSortWithLabel.findIndex(
      (item) => item.key === active.id,
    );
    const newIndex = labelSortWithLabel.findIndex(
      (item) => item.key === over.id,
    );

    if (oldIndex === -1 || newIndex === -1) return;

    const newItems = arrayMove(labelSortWithLabel, oldIndex, newIndex);

    setFormState(newItems.map((item) => item.key));
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col">
      <ScrollArea className="h-[calc(100vh-7.5rem)]">
        <SortableList
          items={labelSortWithLabel}
          onSortEnd={handleSortEnd}
        />
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
    </div>
  );
};

export default LabelsortEditor;
