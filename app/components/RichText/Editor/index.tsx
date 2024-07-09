import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

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
      onChange(editor.getHTML());
    },
  });

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
