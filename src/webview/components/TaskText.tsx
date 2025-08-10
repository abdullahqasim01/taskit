import { useText } from "../contexts/TextContext";

const TaskText = () => {
 const { text, handleTextChange, textAreaRef } = useText();
  return (
    <div className="h-full w-full relative">
      {text === "" && <pre className="absolute p-4 -z-10 text-[var(--vscode-editorLineNumber-foreground)]">
        Hurray! No more tasks. Well Done. All clear for today.{"\n"}{"\n"}
        Add more Tasks using the table or in the following format.{"\n"}
        [ ] Todo Task{"\n"}
        [*] Doing Task{"\n"}
        [x] | [X] Done Task
        </pre>}
      <textarea
        value={text}
        onChange={handleTextChange}
        ref={textAreaRef}
        className="w-full h-full p-4 resize-none"
      />
    </div>
  );
};

export default TaskText;
