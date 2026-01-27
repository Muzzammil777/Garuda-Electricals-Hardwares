import { Link } from 'react-router-dom';
import { 
  Cable, 
  ToggleLeft, 
  Lightbulb, 
  Cylinder, 
  Wrench, 
  Settings 
} from 'lucide-react';

const iconMap = {
  'cable': Cable,
  'toggle-left': ToggleLeft,
  'lightbulb': Lightbulb,
  'cylinder': Cylinder,
  'wrench': Wrench,
  'settings': Settings,
};

const CategoryCard = ({ category }) => {
  const Icon = iconMap[category.icon] || Cable;

  return (
    <Link
      to={`/products?category=${category.slug}`}
      className="card-hover p-6 text-center group"
    >
      <div className="w-14 h-14 mx-auto mb-4 bg-primary-50 rounded-xl flex items-center justify-center group-hover:bg-primary-100 transition-colors">
        <Icon className="w-7 h-7 text-primary-600" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
        {category.name}
      </h3>
      {category.product_count !== undefined && (
        <p className="text-sm text-gray-500">
          {category.product_count} products
        </p>
      )}
    </Link>
  );
};

export default CategoryCard;
