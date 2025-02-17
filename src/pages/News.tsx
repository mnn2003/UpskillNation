import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";

const API_KEY = "5b3e6c348cd362ec04a17f0a58ed851c"; // Your GNews API Key

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("stocks");

  useEffect(() => {
    fetchNews();
  }, [category]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://gnews.io/api/v4/search?q=${category}&lang=en&sortby=publishedAt&token=${API_KEY}`
      );
      const data = await response.json();
      setNews(data.articles || []);
    } catch (error) {
      console.error("Error fetching news:", error);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredNews = news.filter((article) =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Latest News</h1>
          <p className="text-xl text-gray-600">Stay updated with the latest trends</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search news..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-md border border-gray-300 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="stocks">Stocks</option>
                <option value="general knowledge">General Knowledge</option>
                <option value="artificial intelligence">AI</option>
                <option value="technology">Technology</option>
                <option value="sports">Sports</option>
                <option value="health">Health</option>
              </select>
            </div>
          </div>
        </div>

        {/* News Grid */}
        {loading ? (
          <div className="text-center py-12">Loading news...</div>
        ) : filteredNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNews.map((article, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                {article.image && (
                  <img src={article.image} alt={article.title} className="w-full h-48 object-cover" />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
                  <p className="text-gray-600 mb-4">{article.description}</p>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline"
                  >
                    Read more
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No news found for "{category}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default News;
