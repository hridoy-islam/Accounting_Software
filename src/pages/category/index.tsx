import { useEffect, useState } from 'react';
import { CategoryTable } from './components/category-table';
import { Category } from './components/category';
import axiosInstance from '@/lib/axios';
import { toast } from '@/components/ui/use-toast';

import { useParams } from 'react-router-dom';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any>([]);
  const {id} = useParams()
  const [initialLoading, setInitialLoading] = useState(true); // New state for initial loading
  const fetchData = async () => {
    try {
      if (initialLoading) setInitialLoading(true);
      const response = await axiosInstance.get(`/categories/company/${id}?limit=10000`);
      setCategories(response.data.data.result);
      console.log(categories)
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
      const payload = { ...updatedCategory, companyId: id }; // Ensure companyId is added
      
  
      const response = updatedCategory._id
        ? await axiosInstance.patch(`/categories/${updatedCategory._id}`, payload)
        : await axiosInstance.post(`/categories`, payload);
  
      fetchData();
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };
  

  const handleDeleteCategory = async (id: string) => {
    try {
      await axiosInstance.delete(`/categories/${id}`);
      fetchData();
      toast({
        title: 'Category Deleted successfully',
        className: 'bg-theme border-none text-white'
      });
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  return (
    <div className="flex flex-col gap-4">
         
      
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
