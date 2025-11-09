import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const CodeEditor = ({ value, onChange }: CodeEditorProps) => {
  return (
    <div className="w-full h-full border border-primary/30 rounded-lg overflow-hidden">
      <CodeMirror
        value={value}
        height="100%"
        theme={oneDark}
        extensions={[javascript({ jsx: true })]}
        onChange={onChange}
        className="text-sm"
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          foldGutter: true,
        }}
      />
    </div>
  );
};
