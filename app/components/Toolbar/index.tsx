"use client";

import {
  ToggleGroup as ToggleGroupPrimitive,
  Toolbar as ToolbarPrimitive,
} from "@radix-ui/react-toolbar";
import React from "react";

import { cn } from "@/lib/utils";

interface ToolbarProps {
  children: React.ReactNode;
  className?: string;
}

const Toolbar = ({ children, className }: ToolbarProps) => {
  return (
    <ToolbarPrimitive
      className={cn("my-2 w-full rounded-sm bg-custom px-4 py-2", className)}
    >
      {children}
    </ToolbarPrimitive>
  );
};

const ToggleGroup = ToggleGroupPrimitive;

ToggleGroup.displayName = ToggleGroupPrimitive.displayName;

export { Toolbar, ToggleGroup };
