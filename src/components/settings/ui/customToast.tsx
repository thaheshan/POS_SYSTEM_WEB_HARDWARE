import { toast } from "sonner";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, Trash2 } from "lucide-react";
import React from "react";

export const settingsToast = {
  success: (title: string, description?: string) => {
    toast.success(title, {
      description,
      unstyled: true,
      icon: <CheckCircle2 className="w-6 h-6 text-[#27ae60]" strokeWidth={2.5} />,
      className:
        "bg-white border-none shadow-xl rounded-[16px] p-5 w-full flex items-start gap-3",
      classNames: {
        title: "text-gray-900 font-bold text-[16px] leading-none mb-1.5",
        description: "text-gray-500 font-medium text-[14px] leading-snug",
        closeButton:
          "text-gray-500 hover:text-gray-700 hover:bg-gray-200 bg-transparent border-none right-4 top-4",
      },
    });
  },

  error: (title: string, description?: string) => {
    toast.error(title, {
      description,
      unstyled: true,
      icon: <AlertCircle className="w-6 h-6 text-[#e74c3c]" strokeWidth={2.5} />,
      className:
        "bg-white border-none shadow-xl rounded-[16px] p-5 w-full flex items-start gap-3",
      classNames: {
        title: "text-gray-900 font-bold text-[16px] leading-none mb-1.5",
        description: "text-gray-500 font-medium text-[14px] leading-snug",
        closeButton:
          "text-gray-500 hover:text-gray-700 hover:bg-gray-200 bg-transparent border-none right-4 top-4",
      },
    });
  },

  warning: (title: string, description?: string) => {
    toast.warning(title, {
      description,
      icon: <AlertTriangle className="w-6 h-6 text-white" strokeWidth={2.5} />,
      className:
        "bg-[#f39c12] border-none shadow-xl rounded-[16px] p-5 w-full flex items-start gap-3",
      classNames: {
        title: "text-white font-bold text-[16px] leading-none mb-1.5",
        description: "text-white/90 font-medium text-[14px] leading-snug",
        closeButton:
          "text-white hover:text-white hover:bg-white/20 bg-transparent border-none right-4 top-4",
      },
    });
  },

  info: (title: string, description?: string) => {
    toast.info(title, {
      description,
      icon: <Info className="w-6 h-6 text-white" strokeWidth={2.5} />,
      className:
        "bg-[#3498db] border-none shadow-xl rounded-[16px] p-5 w-full flex items-start gap-3",
      classNames: {
        title: "text-white font-bold text-[16px] leading-none mb-1.5",
        description: "text-white/90 font-medium text-[14px] leading-snug",
        closeButton:
          "text-white hover:text-white hover:bg-white/20 bg-transparent border-none right-4 top-4",
      },
    });
  },

  confirmDelete: (itemName: string, onConfirm: () => void) => {
    toast.custom(
      (t) => (
        <div className="bg-white border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[16px] p-5 w-full flex flex-col gap-4 relative overflow-hidden pointer-events-auto">

          <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />

          <div className="flex gap-4 items-start mt-1">
            <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center shrink-0 border border-red-100">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div className="pt-0.5">
              <h3 className="text-gray-900 font-black text-[15px] mb-1">
                Delete Category?
              </h3>
              <p className="text-gray-500 font-medium text-[13px] leading-snug pr-4">
                Are you sure you want to delete{" "}
                <span className="font-bold text-gray-800">"{itemName}"</span>?
                This action cannot be undone.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pl-14">
            <button
              onClick={() => toast.dismiss(t)}
              className="flex-1 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-[13px] font-bold rounded-[10px] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t);
                onConfirm();
              }}
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-[13px] font-bold rounded-[10px] transition-colors shadow-sm"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        className: "w-full md:w-[400px]", 
      }
    );
  },
};
