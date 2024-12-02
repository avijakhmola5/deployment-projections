function Select({ value, onValueChange, children }) {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm"
    >
      {children}
    </select>
  );
}

function SelectTrigger() {
  return null;
}

function SelectContent({ children }) {
  return children;
}

function SelectItem({ value, children }) {
  return (
    <option value={value}>
      {children}
    </option>
  );
}

function SelectValue() {
  return null;
}

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };
