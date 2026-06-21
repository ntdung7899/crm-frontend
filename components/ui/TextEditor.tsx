"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with Quill
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="w-full border border-border rounded-xl px-3 py-2 min-h-[160px] bg-white animate-pulse" />
  ),
});

// Import Quill styles
import "react-quill-new/dist/quill.snow.css";

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function TextEditor({
  value,
  onChange,
  placeholder = "Nhập nội dung...",
  className = "",
}: TextEditorProps) {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["link", "image"],
        ["blockquote", "code-block"],
        ["clean"],
      ],
    }),
    []
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "list",
    "align",
    "link",
    "image",
    "blockquote",
    "code-block",
  ];

  return (
    <div className={`text-editor-wrapper ${className}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
      <style jsx global>{`
        .text-editor-wrapper .ql-toolbar.ql-snow {
          border: 1px solid var(--color-border, #e2e8f0);
          border-radius: 0.75rem 0.75rem 0 0;
          background: #f8fafc;
        }
        .text-editor-wrapper .ql-container.ql-snow {
          border: 1px solid var(--color-border, #e2e8f0);
          border-top: none;
          border-radius: 0 0 0.75rem 0.75rem;
          background: white;
          min-height: 160px;
          font-size: 14px;
        }
        .text-editor-wrapper .ql-editor {
          min-height: 140px;
          line-height: 1.6;
        }
        .text-editor-wrapper .ql-editor.ql-blank::before {
          color: #94a3b8;
          font-style: normal;
        }
        .text-editor-wrapper .ql-toolbar button:hover,
        .text-editor-wrapper .ql-toolbar button.ql-active {
          color: var(--color-primary, #2563eb) !important;
        }
        .text-editor-wrapper .ql-toolbar button:hover .ql-stroke,
        .text-editor-wrapper .ql-toolbar button.ql-active .ql-stroke {
          stroke: var(--color-primary, #2563eb) !important;
        }
        .text-editor-wrapper .ql-toolbar button:hover .ql-fill,
        .text-editor-wrapper .ql-toolbar button.ql-active .ql-fill {
          fill: var(--color-primary, #2563eb) !important;
        }
        .text-editor-wrapper .ql-container:focus-within {
          border-color: var(--color-primary, #2563eb);
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
        }
        .text-editor-wrapper .ql-toolbar.ql-snow:has(+ .ql-container:focus-within) {
          border-color: var(--color-primary, #2563eb);
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
        }
      `}</style>
    </div>
  );
}
