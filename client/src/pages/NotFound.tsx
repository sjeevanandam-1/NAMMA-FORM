import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
        <Sprout className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Page Not Found</h1>
      <p className="text-xs text-slate-500 max-w-sm mb-6">
        The requested agricultural page or listing could not be located.
      </p>
      <Link
        to="/"
        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md"
      >
        Return to Home →
      </Link>
    </div>
  );
};
