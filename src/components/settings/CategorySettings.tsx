"use client";

import { useState } from "react";
import {
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
} from "@/lib/services/settingsApi";
import { Category } from "../../../types";
import { Blocks, Edit2, Loader2, Plus, Tags, Trash2 } from "lucide-react";
import AddCategoryModal from "../pos/AddCategoryModal";
import { settingsToast } from "./ui/customToast";

export default function CategorySettings() {
  const { data: categoriesData, isLoading: isFetching } =
    useGetCategoriesQuery();
  const [deleteCategory] = useDeleteCategoryMutation();

  const categories: Category[] = categoriesData ?? [];
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  const handleOpenCreate = () => {
    setCategoryToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setCategoryToEdit(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    settingsToast.confirmDelete(name, async () => {

      try {
        // TEMPORARY: Since the backend endpoint is missing, we just show success.
        // Once the API is ready, uncomment the next line:
        await deleteCategory(id).unwrap();
        
        settingsToast.success(
          "Category Deleted", 
          `The category "${name}" was successfully removed.`
        );
      } catch (error: any) {
        settingsToast.error(
          "Failed to Delete", 
          error?.data?.message || "An error occurred while deleting."
        );
      }

    });

  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center p-12 bg-white rounded-[24px] shadow-sm border border-gray-100">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
      {/* --- HEADER ---*/}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-[12px] flex items-center justify-center border border-emerald-100">
            <Tags className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-[18px] font-black tracking-tight text-gray-900">
              Category Management
            </h2>
            <p className="text-[12px] font-bold text-gray-400 mt-0.5">
              Create, edit, and organize product categories for your inventory
            </p>
          </div>
        </div>

        {/* ADD BUTTON */}
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-[#1e40af] hover:bg-blue-800 text-white px-5 py-2.5 rounded-[12px] text-[13px] font-bold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="p-6">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-gray-100 rounded-[20px] bg-gray-50/50">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-4">
              <Blocks className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-[15px] font-black text-gray-900 mb-1">
              No categories yet
            </h3>
            <p className="text-[13px] font-medium text-gray-500 mb-6 text-center max-w-sm">
              Get started by creating your first product category to help
              organize your inventory.
            </p>
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-[12px] text-[13px] font-bold transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create First Category
            </button>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-4 bg-white rounded-[16px] border border-gray-200 hover:border-blue-200 hover:shadow-sm transition-all"
              >
                <div>
                  <h4 className="text-[14px] font-bold text-gray-900 flex items-center gap-2">
                    {cat.categoryName}
                  </h4>
                  {cat.description && (
                    <p className="text-[12px] font-medium text-gray-500 mt-1">
                      {cat.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-2.5 text-gray-500 bg-gray-50 hover:text-[#1e40af] hover:bg-blue-50 rounded-[10px] transition-colors border border-transparent hover:border-blue-100"
                    title="Edit Category"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id, cat.categoryName)}
                    className="p-2.5 text-gray-500 bg-gray-50 hover:text-red-600 hover:bg-red-50 rounded-[10px] transition-colors border border-transparent hover:border-red-100"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- REFACTORED MODAL --- */}
      <AddCategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
        }}
        categoryToEdit={categoryToEdit}
      />
    </div>
  );
}
