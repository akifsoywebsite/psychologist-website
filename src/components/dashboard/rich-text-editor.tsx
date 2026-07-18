"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import TiptapLink from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  List,
  ListOrdered,
  Loader2,
  Quote,
  Redo2,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { storage } from "@/lib/firebase";
import { compressImage } from "@/lib/compress-image";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

interface ToolbarButton {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  isActive: boolean;
}

export default function RichTextEditor({
  content,
  onChange,
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      // StarterKit bundles its own Link extension; disable it so the
      // explicitly configured one below doesn't collide with it.
      StarterKit.configure({ link: false }),
      TiptapImage,
      TiptapLink.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder: "Bloq məzmununu buraya yazın...",
      }),
    ],
    content,
    onUpdate: ({ editor: updatedEditor }) => {
      onChange(updatedEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  // editor.isActive() reflects the state at the moment it's called, but
  // toggling a mark/block at an empty selection doesn't fire onUpdate (the
  // document itself hasn't changed yet), so nothing would otherwise
  // re-render this component to pick up the new active state. useEditorState
  // subscribes to every transaction so the toolbar highlighting stays live.
  //
  // Its snapshot only invalidates on a real "transaction" event, though —
  // right when `editor` first flips from null to a real instance there's no
  // transaction yet, so the selector can still return the initial null
  // snapshot for a render or two. Fall back to all-inactive rather than
  // gating the whole render on it, otherwise the toolbar would never mount
  // (and never get the chance to fire that first transaction at all).
  const editorState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => {
      if (!currentEditor) return null;
      return {
        isBold: currentEditor.isActive("bold"),
        isItalic: currentEditor.isActive("italic"),
        isHeading2: currentEditor.isActive("heading", { level: 2 }),
        isHeading3: currentEditor.isActive("heading", { level: 3 }),
        isBulletList: currentEditor.isActive("bulletList"),
        isOrderedList: currentEditor.isActive("orderedList"),
        isBlockquote: currentEditor.isActive("blockquote"),
      };
    },
  }) ?? {
    isBold: false,
    isItalic: false,
    isHeading2: false,
    isHeading3: false,
    isBulletList: false,
    isOrderedList: false,
    isBlockquote: false,
  };

  async function handleImageSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !editor) return;

    setIsUploading(true);
    try {
      const compressedFile = await compressImage(file);
      const path = `blog-content/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, compressedFile);
      const url = await getDownloadURL(storageRef);
      editor.chain().focus().setImage({ src: url }).run();
    } catch {
      alert("Şəkil yüklənərkən xəta baş verdi.");
    } finally {
      setIsUploading(false);
    }
  }

  if (!editor) return null;

  const toolbarButtons: ToolbarButton[] = [
    {
      icon: Bold,
      label: "Qalın",
      onClick: () => editor.chain().focus().toggleBold().run(),
      isActive: editorState.isBold,
    },
    {
      icon: Italic,
      label: "Kursiv",
      onClick: () => editor.chain().focus().toggleItalic().run(),
      isActive: editorState.isItalic,
    },
    {
      icon: Heading2,
      label: "Başlıq 2",
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editorState.isHeading2,
    },
    {
      icon: Heading3,
      label: "Başlıq 3",
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editorState.isHeading3,
    },
    {
      icon: List,
      label: "Nöqtəli siyahı",
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editorState.isBulletList,
    },
    {
      icon: ListOrdered,
      label: "Nömrələnmiş siyahı",
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editorState.isOrderedList,
    },
    {
      icon: Quote,
      label: "Sitat",
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editorState.isBlockquote,
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1 rounded-t-[var(--radius)] border border-border bg-card p-2">
        {toolbarButtons.map(({ icon: Icon, label, onClick, isActive }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            aria-label={label}
            aria-pressed={isActive}
            className={`flex h-8 w-8 items-center justify-center rounded transition-colors hover:bg-accent ${
              isActive ? "bg-accent" : ""
            }`}
          >
            <Icon size={16} />
          </button>
        ))}

        <div className="mx-1 h-6 w-px bg-border" />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          aria-label="Şəkil əlavə et"
          className="flex h-8 w-8 items-center justify-center rounded transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <ImagePlus size={16} />
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelected}
          className="hidden"
        />

        <div className="mx-1 h-6 w-px bg-border" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          aria-label="Geri al"
          className="flex h-8 w-8 items-center justify-center rounded transition-colors hover:bg-accent"
        >
          <Undo2 size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          aria-label="Təkrar et"
          className="flex h-8 w-8 items-center justify-center rounded transition-colors hover:bg-accent"
        >
          <Redo2 size={16} />
        </button>
      </div>

      <div className="min-h-[300px] rounded-b-[var(--radius)] border border-t-0 border-border bg-input p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
