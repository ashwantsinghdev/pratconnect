/* eslint-disable @typescript-eslint/no-explicit-any */
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import type { FC } from "react";

const toolbars: string[] = [
  "heading",
  "|",
  "bold",
  "italic",
  "|",
  "numberedList",
  "bulletedList",
  "|",
  "undo",
  "redo",
];

interface EditorInterface {
  value: string;
  onChange: (v: any) => void;
}

const Editor: FC<EditorInterface> = ({ value, onChange }) => {
 const handleChange = (_: any, editor: any) => {
   const v = editor.getData();
   onChange(v);
 };

  return (
    <CKEditor
      data={value}
      editor={ClassicEditor as any}
      config={{ toolbar: toolbars }}
      onChange={handleChange}
    />
  );
};

export default Editor;
