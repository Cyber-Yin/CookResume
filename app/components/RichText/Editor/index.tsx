"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef } from "react";

import EditorToolbar from "../Toolbar";

interface EditorProps {
  content: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

const Editor = ({ content, placeholder, onChange }: EditorProps) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      if (!rendered.current) {
        rendered.current = true;
      }

      onChange(editor.getHTML());
    },
  });

  const rendered = useRef(false);

  // BUG: not render content when farther component uses 'useEffect' hook to set content
  // FIX: when content is set, editor will render the content, and only once
  useEffect(() => {
    if (rendered.current) return;

    if (!editor || !content) return;

    rendered.current = true;
    editor.commands.setContent(content);
  }, [content]);

  if (!editor) return <></>;

  return (
    <div className="w-full border border-custom bg-custom">
      <EditorToolbar editor={editor} />
      <div className="editor">
        <EditorContent
          className="outline-none"
          editor={editor}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

export default Editor;
