"use client";

import React, { useEffect, useState, useCallback } from "react";
import { axiosInstance } from "@/lib/axios";
import {
  LayoutGrid,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  FolderPlus,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AxiosError } from "axios";

interface Category {
  id: string;
  _id?: string;
  name: string;
  description?: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Custom Delete Modal State
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/categories");
      const data = res.data?.data || res.data || [];
      setCategories(Array.isArray(data) ? data : []);
    } catch (error: unknown) {
      console.error("Fetch categories error:", error);
      toast.error("Failed to load categories.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isSubscribed = true;
    const loadData = async () => {
      if (isSubscribed) await fetchCategories();
    };
    loadData();
    return () => {
      isSubscribed = false;
    };
  }, [fetchCategories]);

  // Handle Create or Update Category
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Category name is required!");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        // UPDATE
        const catId = editingCategory.id || editingCategory._id;
        const res = await axiosInstance.patch(`/categories/${catId}`, {
          name,
          description,
        });

        if (res.status === 200 || res.data?.success) {
          toast.success("Category updated successfully!");
          resetForm();
          fetchCategories();
        }
      } else {
        // CREATE
        const res = await axiosInstance.post("/categories", {
          name,
          description,
        });

        if (res.status === 201 || res.status === 200 || res.data?.success) {
          toast.success("Category created successfully!");
          resetForm();
          fetchCategories();
        }
      }
    } catch (error: unknown) {
      console.error("Category submit error:", error);
      const err = error as AxiosError<{ message?: string }>;
      const serverMsg = err.response?.data?.message;
      toast.error(serverMsg || "Failed to save category.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setDescription(category.description || "");
  };

  // Modern Delete Handler
  const confirmDelete = async () => {
    if (!deletingCategory) return;
    const catId = deletingCategory.id || deletingCategory._id;
    if (!catId) return;

    setIsDeleting(true);
    try {
      const res = await axiosInstance.delete(`/categories/${catId}`);

      if (res.status === 200 || res.data?.success) {
        toast.success("Category deleted successfully!");
        setCategories((prev) => prev.filter((c) => (c.id || c._id) !== catId));
        setDeletingCategory(null);
      }
    } catch (error: unknown) {
      console.error("Delete category error:", error);
      const err = error as AxiosError<{ message?: string }>;
      toast.error(err.response?.data?.message || "Could not delete category.");
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setEditingCategory(null);
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <LayoutGrid className="h-6 w-6 text-primary" /> Service Category
          Management
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Add, edit, or remove service categories for marketplace filtering.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-fit space-y-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <FolderPlus className="h-5 w-5 text-primary" />
            {editingCategory ? "Edit Category" : "Add New Category"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. AC Repair, Plumbing"
                required
                className="w-full px-3 py-2 text-sm border rounded-lg border-slate-200 dark:border-slate-800 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of services in this category"
                rows={3}
                className="w-full px-3 py-2 text-sm border rounded-lg border-slate-200 dark:border-slate-800 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingCategory ? (
                  "Update Category"
                ) : (
                  <>
                    <Plus className="h-4 w-4" /> Add Category
                  </>
                )}
              </Button>

              {editingCategory && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="text-xs"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Right Column Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">
              Active Categories ({categories.length})
            </h3>
          </div>

          {categories.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No categories found. Create your first category using the form.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 uppercase text-xs font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Description</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {categories.map((cat) => (
                    <tr
                      key={cat.id || cat._id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition"
                    >
                      <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">
                        {cat.name}
                      </td>
                      <td className="p-4 text-xs text-slate-500 max-w-xs truncate">
                        {cat.description || "N/A"}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(cat)}
                          className="h-8 w-8 p-0 text-slate-600 hover:text-primary"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeletingCategory(cat)}
                          className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Delete */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full shadow-lg border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Delete Category
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Are you sure you want to delete{" "}
              <strong className="text-slate-900 dark:text-slate-200">
                {`"${deletingCategory.name}"`}
              </strong>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setDeletingCategory(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
