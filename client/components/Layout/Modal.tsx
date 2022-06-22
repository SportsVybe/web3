//https://biagio.dev/posts/tailwindcss-react-modal

type Props = {
  open: boolean;
  onClose: (params: string | any) => {};
  children: JSX.Element;
};

// components/Modal.js
import { useEffect } from "react";
import { createPortal } from "react-dom";
export default function Modal({ open, onClose, children }: Props) {
  function escHandler({ key }: any) {
    if (key === "Escape") {
      onClose(key);
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", escHandler);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("keydown", escHandler);
      }
    };
  }, []);

  if (typeof document !== "undefined") {
    return createPortal(
      <div className={`fixed inset-0 ${open ? "" : "pointer-events-none"}`}>
        {/* backdrop */}
        <div
          className={`fixed inset-0 bg-black ${
            open ? "opacity-50" : "pointer-events-none opacity-0"
          } transition-opacity duration-300 ease-in-out`}
          onClick={onClose}
        />

        {/* content */}
        <div
          className={`fixed overflow-x-scroll right-0 h-full bg-white shadow-lg w-full max-w-screen-sm p-4 ${
            open ? "opacity-100" : "pointer-events-none opacity-0"
          } transition-opacity duration-300 ease-in-out`}
        >
          <div>
            <button className="font-bold" onClick={onClose}>
              Close
            </button>
          </div>
          {children}
        </div>
      </div>,
      document.body
    );
  } else {
    return null;
  }
}
