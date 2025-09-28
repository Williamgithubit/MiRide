import React from 'react';
import { Calendar, ArrowRight, User } from 'lucide-react';

const LatestNews: React.FC = () => {
  const newsArticles = [
    {
      id: 1,
      title: 'Best Places to Visit with a Rental Car',
      excerpt: 'Discover amazing destinations that are perfect for road trips and explore hidden gems with the freedom of your own rental car.',
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      author: 'Sarah Mitchell',
      date: '2024-01-15',
      category: 'Travel Tips',
      readTime: '5 min read'
    },
    {
      id: 2,
      title: 'The Future of Electric Car Rentals',
      excerpt: 'Learn about our commitment to sustainability and how electric vehicles are revolutionizing the car rental industry.',
      image: 'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      author: 'David Chen',
      date: '2024-01-12',
      category: 'Innovation',
      readTime: '7 min read'
    },
    {
      id: 3,
      title: 'Complete Car Rental Guide for Beginners',
      excerpt: 'Everything you need to know about renting a car for the first time, from booking to returning your vehicle safely.',
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      author: 'Emily Johnson',
      date: '2024-01-10',
      category: 'Guide',
      readTime: '8 min read'
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <section className="py-20 bg-gray-50 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Latest News
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Stay updated with the latest trends, tips, and insights from the world of car rentals and travel.
          </p>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsArticles.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group"
            >
              {/* Article Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {article.category}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Article Content */}
              <div className="p-6">
                {/* Meta Information */}
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <div className="flex items-center mr-4">
                    <User className="h-4 w-4 mr-1" />
                    <span>{article.author}</span>
                  </div>
                  <div className="flex items-center mr-4">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{formatDate(article.date)}</span>
                  </div>
                  <span className="text-green-600">{article.readTime}</span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors duration-200">
                  {article.title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {article.excerpt}
                </p>

                {/* Read More Link */}
                <button className="flex items-center text-green-600 hover:text-green-700 font-semibold transition-colors duration-200 group/link">
                  <span>Read More</span>
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-200 group-hover/link:translate-x-1" />
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button className="bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold">
            View All Articles
          </button>
        </div>
      </div>
    </section>
  );
};

export default LatestNews;
