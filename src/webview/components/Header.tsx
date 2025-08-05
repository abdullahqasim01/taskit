interface HeaderProps {
  view: string;
  setView: any;
  done: number;
  total: number;
}

const Header = ({ view, setView, done, total }: HeaderProps) => {
  const button = "p-1 px-2";
  const buttonInactive = "text-[var(--vscode-editorLineNumber-foreground)]";
  const buttonActive =
    "text-[var(--vscode-statusBar-foreground)] border-[var(--vscode-editorLineNumber-foreground)] rounded-md border-1";

  return (
    <div className="flex flex-row justify-between w-full">
      <div className="flex flex-row gap-2 bg-[var(--vscode-input-background)] p-1 font-bold rounded-lg">
        <button
          className={`${button} ${
            view === "combined" ? buttonActive : buttonInactive
          } `}
          onClick={() => setView("combined")}
        >
          Combined
        </button>
        <button
          className={`${button} ${
            view === "table" ? buttonActive : buttonInactive
          }`}
          onClick={() => setView("table")}
        >
          Table
        </button>
        <button
          className={`${button} ${
            view === "text" ? buttonActive : buttonInactive
          }`}
          onClick={() => setView("text")}
        >
          Text
        </button>
      </div>
      <div className="flex flex-col gap-1 items-center">
        <p className="text-[var(--vscode-editorLineNumber-foreground)]">
          {done}/{total} Tasks Completed
        </p>
        <div className="w-full bg-[var(--vscode-input-background)] h-2 rounded-lg">
          {done > 0 && (
            <div
              className={`h-2 bg-primary rounded-lg`}
              style={{ width: `${(done / total) * 100}%` }}
            ></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
