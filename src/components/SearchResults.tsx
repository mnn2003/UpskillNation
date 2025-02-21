import React from "react";
import { useLocation } from "react-router-dom";

const SearchResults: React.FC = () => {
  const query = new URLSearchParams(useLocation().search).get("q");

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Search Results for: {query}</h1>
      {/* You can add logic here to fetch and display search results */}
    </div>
  );
};

export default SearchResults;
