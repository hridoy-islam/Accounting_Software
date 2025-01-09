import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronRight, Check } from 'lucide-react';

interface Category {
  name: string;
  categoryId: string;
  children?: Category[];
}

interface NestedCategoryDropdownProps {
  categories: Category[];
  onSelect: (category: string) => void;
}

const NestedCategoryDropdown: React.FC<NestedCategoryDropdownProps> = ({
  categories,
  onSelect
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPath, setSelectedPath] = useState<string[]>([]);

  const handleCategorySelect = (category: Category, parentNames: string[] = []) => {
    const fullPath = [...parentNames, category.name];
    setSelectedPath(fullPath);
    setSelectedCategory(fullPath.join(' > '));
    onSelect(category.name);
  };

  const renderCategories = (cats: Category[], depth = 0, parentNames: string[] = []) => {
    return cats.map((category) => {
      if (!category.children) {
  
        return (
          <DropdownMenuItem
            key={category.categoryId}
            className="flex items-center justify-between px-4 py-2"
            onClick={() => handleCategorySelect(category)}
          >
            <span className="pl-4">{category.name}</span>
            {selectedPath.includes(category.name) && (
              <Check className="h-4 w-4 text-green-500" />
            )}
          </DropdownMenuItem>
        );
      }

      // Parent category with children
      return (
        <DropdownMenu key={category.categoryId}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between  px-4 py-2"
            >
              <span>{category.name}</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56"
            side="right"
            sideOffset={10}
          >
            {renderCategories(
              category.children,
              depth + 1,
              [...parentNames, category.name]
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between shadow-sm transition-colors"
        >
          {selectedCategory || 'Select Category'}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {renderCategories(categories)}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NestedCategoryDropdown;