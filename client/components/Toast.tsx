import { useEffect, useState } from "react";
import { useContract } from "../context/ContractProvider";

type Props = {
  children: React.ReactNode;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
  open: boolean;
};

export const Toast = ({
  children,
  type = "error",
  duration = 5000,
  open = true,
}: Props) => {
  const [isOpen, setIsOpen] = useState(open);

  const { setContractMessage } = useContract();

  useEffect(() => {
    setTimeout(() => {
      setIsOpen(false);
      setContractMessage({});
    }, duration);
  }, [isOpen]);

  return (
    <div
      className={`fixed top-0 right-0 m-4 p-4 bg-${type}-300 rounded-lg shadow-lg`}
      style={{
        display: isOpen ? "block" : "none",
      }}
      onClick={() => setIsOpen(false)}
    >
      {children}
    </div>
  );
};
