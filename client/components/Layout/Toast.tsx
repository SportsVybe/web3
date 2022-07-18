import { useEffect, useState } from "react";
import { useContract } from "../../context/ContractProvider";

type Props = {
  children: React.ReactNode;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
  open?: boolean;
};

export const Toast = ({
  children,
  type = "error",
  duration = 5000,
  open = true,
}: Props) => {
  const [isOpen, setIsOpen] = useState(open);

  const { setContractMessage } = useContract();

  const getColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-100 border-green-500 text-green-700";
      case "error":
        return "bg-red-100 border-red-500 text-red-700";
      case "warning":
        return "bg-orange-100 border-orange-500 text-orange-700";
      case "info":
        return "bg-blue-100 border-blue-500 text-blue-700";
      default:
        return "bg-red-100 border-red-500 text-red-700";
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setIsOpen(false);
      setContractMessage({});
    }, duration);
  }, [isOpen]);

  return (
    <div
      className={`fixed top-0 right-0 m-4 p-4 border-l-4 rounded-lg 
      shadow-lg ${getColor(type)}`}
      style={{
        display: isOpen ? "block" : "none",
      }}
      onClick={() => setIsOpen(false)}
    >
      {children}
    </div>
  );
};
