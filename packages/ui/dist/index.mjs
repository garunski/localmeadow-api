// src/index.tsx
import { jsx } from "react/jsx-runtime";
function Button({ variant = "primary", children, className = "", ...props }) {
  const base = "px-3 py-2 rounded-md font-medium";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300"
  };
  return /* @__PURE__ */ jsx("button", { className: `${base} ${variants[variant]} ${className}`, ...props, children });
}
export {
  Button
};
