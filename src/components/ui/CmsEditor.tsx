"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Quote,
  Link as LinkIcon,
  Code,
  Eraser,
  Eye,
} from "lucide-react";

interface CmsEditorProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  containerClassName?: string;
}

export const CmsEditor: React.FC<CmsEditorProps> = ({
  label,
  value,
  onChange,
  placeholder = "Write content here...",
  containerClassName = "",
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<"visual" | "code">("visual");

  // Keep visual content editable div in sync with external value
  useEffect(() => {
    if (editorRef.current && viewMode === "visual") {
      if (editorRef.current.innerHTML !== (value || "")) {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [value, viewMode]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command: string, arg: string | undefined = undefined) => {
    if (viewMode === "code") return;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, arg);
    handleInput();
  };

  const handleCreateLink = () => {
    if (viewMode === "code") return;
    const url = prompt("Enter URL:", "https://");
    if (url) {
      executeCommand("createLink", url);
    }
  };

  const handleClearFormat = () => {
    if (viewMode === "code") return;
    executeCommand("removeFormat");
    executeCommand("formatBlock", "<p>");
  };

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            {label}
          </label>
          <span className="text-[11px] text-gray-400 font-medium">CMS Rich Text</span>
        </div>
      )}

      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-2xs focus-within:border-[#09A64A] focus-within:ring-2 focus-within:ring-[#09A64A]/10 transition-all">
        {/* Formatting Toolbar */}
        <div className="flex items-center justify-between px-2.5 py-1.5 bg-gray-50/90 border-b border-gray-200 gap-1 flex-wrap text-gray-600">
          <div className="flex items-center gap-0.5 flex-wrap">
            {/* Bold */}
            <button
              type="button"
              onClick={() => executeCommand("bold")}
              className="p-1.5 rounded-lg hover:bg-gray-200/80 text-gray-700 transition-colors"
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>

            {/* Italic */}
            <button
              type="button"
              onClick={() => executeCommand("italic")}
              className="p-1.5 rounded-lg hover:bg-gray-200/80 text-gray-700 transition-colors"
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>

            {/* Underline */}
            <button
              type="button"
              onClick={() => executeCommand("underline")}
              className="p-1.5 rounded-lg hover:bg-gray-200/80 text-gray-700 transition-colors"
              title="Underline"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-px bg-gray-300 mx-1" />

            {/* Heading 2 */}
            <button
              type="button"
              onClick={() => executeCommand("formatBlock", "<h2>")}
              className="p-1.5 rounded-lg hover:bg-gray-200/80 text-gray-700 transition-colors font-bold text-xs"
              title="Heading 2"
            >
              <Heading2 className="w-3.5 h-3.5" />
            </button>

            {/* Heading 3 */}
            <button
              type="button"
              onClick={() => executeCommand("formatBlock", "<h3>")}
              className="p-1.5 rounded-lg hover:bg-gray-200/80 text-gray-700 transition-colors font-bold text-xs"
              title="Heading 3"
            >
              <Heading3 className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-px bg-gray-300 mx-1" />

            {/* Bullet List */}
            <button
              type="button"
              onClick={() => executeCommand("insertUnorderedList")}
              className="p-1.5 rounded-lg hover:bg-gray-200/80 text-gray-700 transition-colors"
              title="Bullet List"
            >
              <List className="w-3.5 h-3.5" />
            </button>

            {/* Numbered List */}
            <button
              type="button"
              onClick={() => executeCommand("insertOrderedList")}
              className="p-1.5 rounded-lg hover:bg-gray-200/80 text-gray-700 transition-colors"
              title="Numbered List"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>

            {/* Blockquote */}
            <button
              type="button"
              onClick={() => executeCommand("formatBlock", "<blockquote>")}
              className="p-1.5 rounded-lg hover:bg-gray-200/80 text-gray-700 transition-colors"
              title="Quote"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>

            {/* Link */}
            <button
              type="button"
              onClick={handleCreateLink}
              className="p-1.5 rounded-lg hover:bg-gray-200/80 text-gray-700 transition-colors"
              title="Insert Link"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>

            {/* Clear Format */}
            <button
              type="button"
              onClick={handleClearFormat}
              className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600 transition-colors"
              title="Clear Formatting"
            >
              <Eraser className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mode Switch (Visual / Code) */}
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-0.5 bg-white shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("visual")}
              className={`px-2 py-0.5 text-[11px] font-bold rounded-md flex items-center gap-1 transition-colors ${
                viewMode === "visual"
                  ? "bg-[#09A64A] text-white"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Visual</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("code")}
              className={`px-2 py-0.5 text-[11px] font-bold rounded-md flex items-center gap-1 transition-colors ${
                viewMode === "code"
                  ? "bg-[#09A64A] text-white"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Code className="w-3 h-3" />
              <span>HTML</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        {viewMode === "visual" ? (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onBlur={handleInput}
            className="p-3.5 min-h-[140px] max-h-[320px] overflow-y-auto text-sm text-gray-800 leading-relaxed focus:outline-none prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h2]:text-base [&_h2]:font-bold [&_h2]:my-2 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:my-1.5 [&_blockquote]:border-l-4 [&_blockquote]:border-[#09A64A] [&_blockquote]:pl-3 [&_blockquote]:italic [&_a]:text-blue-600 [&_a]:underline"
            data-placeholder={placeholder}
          />
        ) : (
          <textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            rows={6}
            placeholder="<p>Enter HTML code here...</p>"
            className="w-full p-3 font-mono text-xs text-gray-800 bg-gray-900/5 focus:outline-none resize-y min-h-[140px]"
          />
        )}
      </div>
    </div>
  );
};
