export function SearchBar({
  inputValue,
  onInputChange,
}: {
  inputValue: string;
  onInputChange: (value: string) => void;
}) {
  return (
    <input
      type="text"
      placeholder="Search for a document..."
      className="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
      value={inputValue}
      onChange={(event) => onInputChange(event.target.value)}
    />
  );
}
