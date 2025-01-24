import { useEffect, useState } from 'react';
import { CategoryTable } from './components/category-table';
import { Category } from './components/category';
import axiosInstance from '@/lib/axios';
import { toast } from '@/components/ui/use-toast';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any>([]);
  const [initialLoading, setInitialLoading] = useState(true); // New state for initial loading
  const fetchData = async () => {
    try {
      if (initialLoading) setInitialLoading(true);
      const response = await axiosInstance.get(`/categories?limit=1000`);
      setCategories(response.data.data.result);
    } catch (error) {
      console.error('Error fetching institutions:', error);
    } finally {
      setInitialLoading(false); // Disable initial loading after the first fetch
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateCategory = async (updatedCategory: Category) => {
    try {
      const response = updatedCategory._id
        ? await axiosInstance.patch(
            `/categories/${updatedCategory._id}`,
            updatedCategory
          )
        : await axiosInstance.post(`/categories`, updatedCategory);

      fetchData();
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await axiosInstance.delete(`/categories/${id}`);
      fetchData();
      toast({
        title: 'Category Deleted successfully',
        className: 'bg-background border-none text-white'
      });
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  return (
    <div className="p-1">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <CategoryTable
          type="inflow"
          categories={categories}
          onUpdate={handleUpdateCategory}
          onDelete={handleDeleteCategory}
        />
        <CategoryTable
          type="outflow"
          categories={categories}
          onUpdate={handleUpdateCategory}
          onDelete={handleDeleteCategory}
        />
      </div>
    </div>
  );
}
