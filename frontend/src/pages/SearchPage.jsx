import { useState } from 'react';
import SearchBar from '../components/Search/SearchBar';
import SearchResults from '../components/Search/SearchResults';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    status: '',
    priority: '',
    project: ''
  });

  const handleSearch = (searchQuery, searchFilters) => {
    setQuery(searchQuery);
    setFilters(searchFilters);
  };

  const handleResultClick = (result) => {
    console.log('Result clicked:', result);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Suche</h1>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <SearchBar onSearch={handleSearch} placeholder="Projekte, Aufgaben, Kontexte, Agenten..." />
      </div>

      <SearchResults query={query} filters={filters} onResultClick={handleResultClick} />
    </div>
  );
}
