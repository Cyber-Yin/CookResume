import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

interface ViewerProps {
  content: string;
  style?: "default" | "prose";
}

const Viewer = ({ content, style }: ViewerProps) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    editable: false,
  });

  useEffect(() => {
    if (!editor || !content) return;

    editor.commands.setContent(content);
  }, [content]);

  if (!editor) return <></>;

  return (
    <EditorContent
      className="viewer"
      editor={editor}
      readOnly={true}
    />
  );
};

export default Viewer;
