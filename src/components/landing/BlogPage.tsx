import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, User, Clock, ArrowLeft, TrendingUp, Star, Heart, MessageCircle, Send } from 'lucide-react';

interface Comment {
  id: number;
  author: string;
  date: string;
  content: string;
  replies: Reply[];
}

interface Reply {
  id: number;
  author: string;
  date: string;
  content: string;
}

interface BlogPost {
  id: number;
  title: string;
  titleNe: string;
  excerpt: string;
  excerptNe: string;
  content: string;
  contentNe: string;
  author: string;
  date: string;
  category: string;
  categoryNe: string;
  readTime: string;
  image: string;
  tags: string[];
  tagsNe: string[];
  rating: number;
  totalRatings: number;
  likes: number;
  comments: Comment[];
}

const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: 'The Future of Auto Parts Inventory: How Technology Will Transform Management in 2025',
    titleNe: 'अटो पार्ट्स सूचीको भविष्य: २०२५ मा प्रविधिले व्यवस्थापनलाई कसरी रूपान्तरण गर्नेछ',
    excerpt: 'Discover how emerging technologies are revolutionizing auto parts inventory management.',
    excerptNe: 'उभरिरहेका प्रविधिहर��ले अटो पार्ट्स सूची व्यवस्थापनमा कसरी क्रान्ति ल्याइरहेका छन् पत्ता लगाउनुहोस्।',
    content: `By 2025, restaurant customers are coming today. They will know it hours or days in advance.

AI-powered predictive analytics can forecast:

• Expected footfall
• Hourly demand peaks
• Best-selling dishes for the day
• Required staffing levels
• Peak dining times prediction
• Best price points for each dish
• Optimal portions for stock-outs

This level of precision saves restaurants from the two biggest killers:

**Over-preparation (waste)**

**Under-preparation (missed revenue)**

In markets like Singapore and UAE, AI forecasting has already reduced food waste by 18-25% and improved revenue margin by 10-18%.

ServeIQ is bringing this capability to 58 nations making predictive intelligence accessible from cafés to 300-seat franchise outlets.`,
    contentNe: `२०२५ सम्ममा, रेस्टुरेन्ट ग्राहकहरू आज आइरहेका छन्। उनीहरूले यो घण्टा वा दिन अगाडि थाहा पाउनेछन्।

AI-संचालित भविष्यवाणी विश्लेषणले पूर्वानुमान गर्न सक्छ:

• अपेक्षित फुटफल
• प्रति घण्टा माग शिखर
• दिनको लागि सबैभन्दा राम्रो बिक्री हुने परिकारहरू
• आवश्यक कर्मचारी स्तर
• शिखर भोजन समय भविष्यवाणी
• प्रत्येक परिकारको लागि उत्तम मूल्य बिन्दुहरू
• स्टक-आउटका लागि इष्टतम भागहरू

यो स्तरको परिशुद्धताले रेस्टुरेन्टहरूलाई दुई ठूलो हत्याराहरूबाट बचाउँछ:

**अति-तयारी (बर्बादी)**

**कम-तयारी (छुटेको राजस्व)**

सिङ्गापुर र संयुक्त अरब अमिरात जस्ता बजारहरूमा, AI पूर्वानुमानले खाद्य फोहोर १८-२५% ले घटाएको छ र राजस्व मार्जिन १०-१८% ले सुधार गरेको छ।

ServeIQ ले यो क्षमता ५८ राष्ट्रहरूमा ल्याइरहेको छ जसले क्याफेदेखि ३००-सीट फ्रान्चाइज आउटलेटहरूमा भविष्यवाणी बुद्धिमत्ता पहुँचयोग्य बनाउँछ।`,
    author: 'Serve Spares Research',
    date: 'Jan 2024',
    category: 'Technology',
    categoryNe: 'प्रविधि',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=500&fit=crop',
    tags: ['AI', 'Technology', 'Future'],
    tagsNe: ['AI', 'प्रविधि', 'भविष्य'],
    rating: 4.5,
    totalRatings: 120,
    likes: 85,
    comments: [
      {
        id: 1,
        author: 'John Doe',
        date: 'Jan 15, 2024',
        content: 'Great article! This is exactly what I needed.',
        replies: [
          {
            id: 1,
            author: 'Serve Spares Research',
            date: 'Jan 16, 2024',
            content: 'Thank you, John! We\'re glad to help.'
          }
        ]
      }
    ]
  },
  {
    id: 2,
    title: '10 Tips for Efficient Auto Parts Inventory Management',
    titleNe: 'प्रभावकारी अटो पार्ट्स सूची व्यवस्थापनका लागि १० सुझावहरू',
    excerpt: 'Learn proven strategies to optimize your inventory management.',
    excerptNe: 'आफ्नो सूची व्यवस्थापन अनुकूलन गर्न प्रमाणित रणनीतिहरू सिक्नुहोस्।',
    content: 'Managing auto parts inventory efficiently is crucial...',
    contentNe: 'अटो पार्ट्स सूची प्रभावकारी रूपमा व्यवस्थापन गर्नु महत्त्वपूर्ण छ...',
    author: 'Rajesh Sharma',
    date: 'Nov 2024',
    category: 'Management',
    categoryNe: 'व्यवस्थापन',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=500&fit=crop',
    tags: ['Inventory', 'Tips'],
    tagsNe: ['सूची', 'सुझावहरू'],
    rating: 4.0,
    totalRatings: 80,
    likes: 50,
    comments: [
      {
        id: 1,
        author: 'Jane Smith',
        date: 'Nov 20, 2024',
        content: 'Very helpful tips! Thanks.',
        replies: []
      }
    ]
  },
  {
    id: 3,
    title: '10 Game-Changing Inventory Strategies',
    titleNe: '१० खेल-परिवर्तन गर्ने सूची रणनीतिहरू',
    excerpt: 'From digital menus to dynamic pricing.',
    excerptNe: 'डिजिटल मेनुदेखि गतिशील मूल्य निर्धारणसम्म।',
    content: 'Digital transformation in inventory...',
    contentNe: 'सूचीमा डिजिटल रूपान्तरण...',
    author: 'Serve Spares',
    date: 'Dec 2024',
    category: 'Strategy',
    categoryNe: 'रणनीति',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
    tags: ['Strategy', 'Innovation'],
    tagsNe: ['रणनीति', 'नवीनता'],
    rating: 4.8,
    totalRatings: 150,
    likes: 100,
    comments: [
      {
        id: 1,
        author: 'Alice Johnson',
        date: 'Dec 10, 2024',
        content: 'Innovative strategies! Well done.',
        replies: []
      }
    ]
  },
  {
    id: 4,
    title: 'The Ultimate Guide to Multi-Branch Management',
    titleNe: 'बहु-शाखा व्यवस्थापनको अन्तिम गाइड',
    excerpt: 'Start strong! From planning to execution.',
    excerptNe: 'बलियो सुरु गर्नुहोस्! योजनादेखि कार्यान्वयनसम्म।',
    content: 'Best practices for managing multiple locations...',
    contentNe: 'धेरै स्थानहरू व्यवस्थापन गर्नका लागि उत्तम अभ्यासहरू...',
    author: 'Sita Thapa',
    date: 'Oct 2024',
    category: 'Business',
    categoryNe: 'व्यवसाय',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=500&fit=crop',
    tags: ['Multi-Branch', 'Growth'],
    tagsNe: ['बहु-शाखा', 'वृद्धि'],
    rating: 4.2,
    totalRatings: 100,
    likes: 60,
    comments: [
      {
        id: 1,
        author: 'Bob Brown',
        date: 'Oct 25, 2024',
        content: 'Detailed guide! Thanks for sharing.',
        replies: []
      }
    ]
  },
  {
    id: 5,
    title: 'Why Table Management Systems Save Empty Seats',
    titleNe: 'किन टेबल व्यवस्थापन प्रणालीहरूले खाली सिटहरू बचाउँछन्',
    excerpt: 'May empty seats be eliminated.',
    excerptNe: 'खाली सिटहरू हटाउन सकिन्छ।',
    content: 'Optimize seating and maximize revenue...',
    contentNe: 'बसाइ अनुकूलन गर्नुहोस् र राजस्व अधिकतम गर्नुहोस्...',
    author: 'Serve Spares',
    date: 'Sep 2024',
    category: 'Operations',
    categoryNe: 'सञ्चालन',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&h=500&fit=crop',
    tags: ['Operations', 'Efficiency'],
    tagsNe: ['सञ्चालन', 'दक्षता'],
    rating: 4.3,
    totalRatings: 90,
    likes: 55,
    comments: [
      {
        id: 1,
        author: 'Charlie Davis',
        date: 'Sep 15, 2024',
        content: 'Useful information! Thanks.',
        replies: []
      }
    ]
  },
  {
    id: 6,
    title: 'The Power of Data Analytics in Parts Business',
    titleNe: 'पार्ट्स व्यवसायमा डाटा विश्लेषणको शक्ति',
    excerpt: 'OR menu reduce, boost profits.',
    excerptNe: 'वा मेनु घटाउनुहोस्, नाफा बढाउनुहोस्।',
    content: 'Use data to make better business decisions...',
    contentNe: 'राम्रो व्यापार निर्णयहरू गर्न डाटा प्रयोग गर्नुहोस्...',
    author: 'Amit Patel',
    date: 'Aug 2024',
    category: 'Analytics',
    categoryNe: 'विश्लेषण',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop',
    tags: ['Data', 'Analytics'],
    tagsNe: ['डाटा', 'विश्लेषण'],
    rating: 4.7,
    totalRatings: 140,
    likes: 90,
    comments: [
      {
        id: 1,
        author: 'David Wilson',
        date: 'Aug 20, 2024',
        content: 'Insightful analysis! Thanks.',
        replies: []
      }
    ]
  },
  {
    id: 7,
    title: 'How Barcode Scanning Transforms Operations',
    titleNe: 'कसरी बारकोड स्क्यानिङले सञ्चालन रूपान्तरण गर्छ',
    excerpt: 'Labor shortages are forcing transformation.',
    excerptNe: 'श्रम अभावले रूपान्तरण बाध्य गरिरहेको छ।',
    content: 'Revolutionize your operations with barcode technology...',
    contentNe: 'बारकोड प्रविधिको साथ आफ्नो सञ्चालन क्रान्ति गर्नुहोस्...',
    author: 'Serve Spares',
    date: 'Jul 2024',
    category: 'Technology',
    categoryNe: 'प्रविधि',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop',
    tags: ['Barcode', 'Technology'],
    tagsNe: ['बारकोड', 'प्रविधि'],
    rating: 4.4,
    totalRatings: 110,
    likes: 70,
    comments: [
      {
        id: 1,
        author: 'Eve Green',
        date: 'Jul 15, 2024',
        content: 'Efficient solution! Thanks.',
        replies: []
      }
    ]
  },
  {
    id: 8,
    title: 'Why Online Reviews Can Make or Break Your Business',
    titleNe: 'किन अनलाइन समीक्षाहरूले तपाईंको व्यवसाय बनाउन वा तोड्न सक्छ',
    excerpt: 'One review can influence thousands.',
    excerptNe: 'एक समीक्षाले हजारौंलाई प्रभाव पार्न सक्छ।',
    content: 'Manage your online reputation effectively...',
    contentNe: 'आफ्नो अनलाइन प्रतिष्ठा प्रभावकारी रूपमा व्यवस्थापन गर्नुहोस्...',
    author: 'Serve Spares',
    date: 'Jun 2024',
    category: 'Marketing',
    categoryNe: 'मार्केटिङ',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop',
    tags: ['Reviews', 'Marketing'],
    tagsNe: ['समीक्षा', 'मार्केटिङ'],
    rating: 4.6,
    totalRatings: 130,
    likes: 80,
    comments: [
      {
        id: 1,
        author: 'Frank White',
        date: 'Jun 25, 2024',
        content: 'Important insights! Thanks.',
        replies: []
      }
    ]
  },
  {
    id: 9,
    title: 'How a Single Dashboard Simplifies Everything',
    titleNe: 'कसरी एकल ड्यासबोर्डले सबै कुरा सरल बनाउँछ',
    excerpt: 'Unified hospitality for seamless operations.',
    excerptNe: 'सहज सञ्चालनका लागि एकीकृत आतिथ्य।',
    content: 'Control everything from one place...',
    contentNe: 'एक ठाउँबाट सबै कुरा नियन्त्रण गर्नुहोस्...',
    author: 'Serve Spares',
    date: 'May 2024',
    category: 'Software',
    categoryNe: 'सफ्टवेयर',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
    tags: ['Dashboard', 'Software'],
    tagsNe: ['ड्यासबोर्ड', 'सफ्टवेयर'],
    rating: 4.9,
    totalRatings: 160,
    likes: 110,
    comments: [
      {
        id: 1,
        author: 'Grace Black',
        date: 'May 15, 2024',
        content: 'Great tool! Thanks.',
        replies: []
      }
    ]
  }
];

interface BlogPageProps {
  language: 'en' | 'ne';
}

export const BlogPage: React.FC<BlogPageProps> = ({ language }) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [userRating, setUserRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [localLikes, setLocalLikes] = useState<number>(0);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [newComment, setNewComment] = useState<string>('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState<string>('');
  const [localComments, setLocalComments] = useState<Comment[]>([]);

  // Update local state when post changes
  React.useEffect(() => {
    if (selectedPost) {
      setLocalLikes(selectedPost.likes);
      setLocalComments(selectedPost.comments);
      setUserRating(0);
      setIsLiked(false);
      setShowComments(false);
      setNewComment('');
      setReplyingTo(null);
      setReplyContent('');
    }
  }, [selectedPost]);

  const handleRating = (rating: number) => {
    setUserRating(rating);
    // In a real app, this would save to backend
  };

  const handleLike = () => {
    if (isLiked) {
      setLocalLikes(prev => prev - 1);
      setIsLiked(false);
    } else {
      setLocalLikes(prev => prev + 1);
      setIsLiked(true);
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: localComments.length + 1,
        author: 'Anonymous User',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        content: newComment,
        replies: []
      };
      setLocalComments([...localComments, comment]);
      setNewComment('');
    }
  };

  const handleAddReply = (commentId: number) => {
    if (replyContent.trim()) {
      const reply: Reply = {
        id: Date.now(),
        author: 'Anonymous User',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        content: replyContent
      };
      
      setLocalComments(localComments.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, replies: [...comment.replies, reply] };
        }
        return comment;
      }));
      
      setReplyContent('');
      setReplyingTo(null);
    }
  };

  const getRelatedPosts = (currentPostId: number) => {
    return blogPosts.filter(post => post.id !== currentPostId).slice(0, 8);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {selectedPost ? (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar - Related Blogs */}
            <div className="lg:w-1/3 order-2 lg:order-1">
              <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-6 sticky top-24">
                {/* Back Button */}
                <button
                  onClick={() => setSelectedPost(null)}
                  className="mb-6 flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <ArrowLeft size={18} />
                  <span className="font-semibold">Back to all blogs</span>
                </button>

                <h3 className="text-indigo-600 font-bold text-lg mb-6">RELATED BLOGS</h3>
                
                <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
                  {getRelatedPosts(selectedPost.id).map((post) => (
                    <motion.div
                      key={post.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedPost(post)}
                      className="bg-white border-2 border-gray-200 rounded-xl p-4 cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all"
                    >
                      <img
                        src={post.image}
                        alt={language === 'en' ? post.title : post.titleNe}
                        className="w-full h-24 object-cover rounded-lg mb-3"
                      />
                      <h4 className="font-bold text-sm mb-2 line-clamp-2 text-gray-900">
                        {language === 'en' ? post.title : post.titleNe}
                      </h4>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {language === 'en' ? post.excerpt : post.excerptNe}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center">
                          <User size={12} className="mr-1" />
                          {post.author}
                        </span>
                        <span className="flex items-center">
                          <Clock size={12} className="mr-1" />
                          {post.readTime}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-2/3 order-1 lg:order-2">
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden"
              >
                {/* Title */}
                <div className="p-8 pb-6">
                  <h1 className="text-4xl md:text-5xl font-bold text-indigo-600 mb-6 leading-tight">
                    {language === 'en' ? selectedPost.title : selectedPost.titleNe}
                  </h1>
                </div>

                {/* Featured Image */}
                <div className="px-8 pb-6">
                  <img
                    src={selectedPost.image}
                    alt={language === 'en' ? selectedPost.title : selectedPost.titleNe}
                    className="w-full h-80 object-cover rounded-xl shadow-md"
                  />
                </div>

                {/* Author Info */}
                <div className="px-8 pb-6 flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                    <TrendingUp className="text-white" size={24} />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{selectedPost.author}</div>
                    <div className="text-sm text-gray-600">{selectedPost.date}</div>
                  </div>
                </div>

                {/* Content */}
                <div className="px-8 pb-8">
                  <div className="prose max-w-none">
                    {(language === 'en' ? selectedPost.content : selectedPost.contentNe)
                      .split('\n\n')
                      .map((paragraph, idx) => {
                        // Check if it's a bullet list
                        if (paragraph.startsWith('•')) {
                          const items = paragraph.split('\n').filter(item => item.trim());
                          return (
                            <ul key={idx} className="space-y-2 mb-6 ml-6">
                              {items.map((item, i) => (
                                <li key={i} className="text-gray-700 text-lg leading-relaxed">
                                  {item.replace('• ', '')}
                                </li>
                              ))}
                            </ul>
                          );
                        }
                        
                        // Check if it's bold text (heading)
                        if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                          return (
                            <h3 key={idx} className="text-2xl font-bold text-indigo-600 mb-4 mt-6">
                              {paragraph.replace(/\*\*/g, '')}
                            </h3>
                          );
                        }
                        
                        // Regular paragraph
                        return (
                          <p key={idx} className="text-gray-700 text-lg leading-relaxed mb-6">
                            {paragraph}
                          </p>
                        );
                      })}
                  </div>

                  {/* Tags */}
                  <div className="mt-8 pt-6 border-t-2 border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      {(language === 'en' ? selectedPost.tags : selectedPost.tagsNe).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full text-sm font-semibold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Rating and Likes */}
                <div className="px-8 pb-6 flex items-center space-x-4">
                  <div className="flex items-center">
                    <Star
                      size={20}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredRating(1)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => handleRating(1)}
                      fill={userRating >= 1 || hoveredRating >= 1 ? 'gold' : 'none'}
                    />
                    <Star
                      size={20}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredRating(2)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => handleRating(2)}
                      fill={userRating >= 2 || hoveredRating >= 2 ? 'gold' : 'none'}
                    />
                    <Star
                      size={20}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredRating(3)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => handleRating(3)}
                      fill={userRating >= 3 || hoveredRating >= 3 ? 'gold' : 'none'}
                    />
                    <Star
                      size={20}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredRating(4)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => handleRating(4)}
                      fill={userRating >= 4 || hoveredRating >= 4 ? 'gold' : 'none'}
                    />
                    <Star
                      size={20}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredRating(5)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => handleRating(5)}
                      fill={userRating >= 5 || hoveredRating >= 5 ? 'gold' : 'none'}
                    />
                  </div>
                  <div className="flex items-center">
                    <Heart
                      size={20}
                      className="cursor-pointer"
                      onClick={handleLike}
                      fill={isLiked ? 'red' : 'none'}
                    />
                    <span className="ml-2 text-gray-600">{localLikes}</span>
                  </div>
                </div>

                {/* Comments */}
                <div className="px-8 pb-6">
                  <button
                    className="text-indigo-600 font-bold cursor-pointer"
                    onClick={() => setShowComments(!showComments)}
                  >
                    {showComments ? 'Hide Comments' : 'Show Comments'}
                  </button>
                  {showComments && (
                    <div className="mt-4">
                      <div className="flex items-center space-x-4">
                        <User size={20} className="text-gray-500" />
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="border-2 border-gray-300 rounded-full px-4 py-2 w-full"
                        />
                        <button
                          className="bg-indigo-600 text-white px-4 py-2 rounded-full"
                          onClick={handleAddComment}
                        >
                          <Send size={16} />
                        </button>
                      </div>
                      <div className="mt-4">
                        {localComments.map(comment => (
                          <div key={comment.id} className="mb-4">
                            <div className="flex items-center space-x-4">
                              <User size={20} className="text-gray-500" />
                              <div>
                                <div className="font-bold text-gray-900">{comment.author}</div>
                                <div className="text-sm text-gray-600">{comment.date}</div>
                              </div>
                            </div>
                            <p className="text-gray-700 text-lg leading-relaxed mt-2">{comment.content}</p>
                            <div className="mt-2">
                              <button
                                className="text-indigo-600 font-bold cursor-pointer"
                                onClick={() => setReplyingTo(comment.id)}
                              >
                                Reply
                              </button>
                              {replyingTo === comment.id && (
                                <div className="mt-2">
                                  <div className="flex items-center space-x-4">
                                    <User size={20} className="text-gray-500" />
                                    <input
                                      type="text"
                                      placeholder="Add a reply..."
                                      value={replyContent}
                                      onChange={(e) => setReplyContent(e.target.value)}
                                      className="border-2 border-gray-300 rounded-full px-4 py-2 w-full"
                                    />
                                    <button
                                      className="bg-indigo-600 text-white px-4 py-2 rounded-full"
                                      onClick={() => handleAddReply(comment.id)}
                                    >
                                      <Send size={16} />
                                    </button>
                                  </div>
                                </div>
                              )}
                              {comment.replies.map(reply => (
                                <div key={reply.id} className="ml-8 mt-2">
                                  <div className="flex items-center space-x-4">
                                    <User size={20} className="text-gray-500" />
                                    <div>
                                      <div className="font-bold text-gray-900">{reply.author}</div>
                                      <div className="text-sm text-gray-600">{reply.date}</div>
                                    </div>
                                  </div>
                                  <p className="text-gray-700 text-lg leading-relaxed mt-2">{reply.content}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.article>
            </div>
          </div>
        ) : (
          // Blog List View
          <div>
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                {language === 'en' ? 'Latest Blog Posts' : 'नवीनतम ब्लग पोष्टहरू'}
              </h1>
              <p className="text-xl text-gray-600">
                {language === 'en' 
                  ? 'Insights, tips, and best practices for auto parts inventory management'
                  : 'अटो पार्ट्स सूची व्यवस्थापनका लागि अन्तर्दृष्टि, सुझावहरू, र उत्तम अभ्यासहरू'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  onClick={() => setSelectedPost(post)}
                  className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden cursor-pointer hover:border-indigo-400 hover:shadow-xl transition-all"
                >
                  <img
                    src={post.image}
                    alt={language === 'en' ? post.title : post.titleNe}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full text-xs font-bold">
                        {language === 'en' ? post.category : post.categoryNe}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center">
                        <Clock size={14} className="mr-1" />
                        {post.readTime}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-xl mb-3 text-gray-900 line-clamp-2">
                      {language === 'en' ? post.title : post.titleNe}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {language === 'en' ? post.excerpt : post.excerptNe}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                      <span className="flex items-center">
                        <User size={14} className="mr-1" />
                        {post.author}
                      </span>
                      <span className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        {post.date}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};