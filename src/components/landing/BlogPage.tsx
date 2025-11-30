import React, { useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { Calendar, User, ArrowRight, Tag, Clock, X } from 'lucide-react';

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
}

const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: '10 Tips for Efficient Auto Parts Inventory Management',
    titleNe: 'प्रभावकारी अटो पार्ट्स सूची व्यवस्थापनका लागि १० सुझावहरू',
    excerpt: 'Learn how to optimize your inventory management with these proven strategies for auto parts businesses.',
    excerptNe: 'अटो पार्ट्स व्यवसायहरूको लागि यी प्रमाणित रणनीतिहरूको साथ आफ्नो सूची व्यवस्थापन अनुकूलन गर्न सिक्नुहोस्।',
    content: `Managing auto parts inventory efficiently is crucial for the success of your business. Here are 10 proven tips:

1. **Implement Barcode Scanning**: Speed up inventory tracking and reduce human errors with barcode technology.

2. **Use Real-Time Tracking**: Keep track of stock levels in real-time to avoid stockouts and overstock situations.

3. **Categorize Your Parts**: Organize parts by vehicle type, brand, and category for easier management.

4. **Set Reorder Points**: Establish minimum stock levels and automate reorder processes.

5. **Regular Audits**: Conduct periodic physical counts to ensure accuracy.

6. **Multi-Location Management**: If you have multiple branches, use centralized inventory management.

7. **Supplier Relationships**: Maintain good relationships with suppliers for better pricing and faster delivery.

8. **Analyze Sales Data**: Use analytics to identify fast-moving and slow-moving items.

9. **Train Your Staff**: Ensure all team members understand the inventory system.

10. **Use Modern Software**: Invest in comprehensive inventory management software like Serve Spares.

By implementing these strategies, you can significantly improve your inventory efficiency and reduce costs.`,
    contentNe: `अटो पार्ट्स सूची प्रभावकारी रूपमा व्यवस्थापन गर्नु तपाईंको व्यवसायको सफलताको लागि महत्त्वपूर्ण छ। यहाँ १० प्रमाणित सुझावहरू छन्:

१. **बारकोड स्क्यानिङ लागू गर्नुहोस्**: बारकोड प्रविधिको साथ सूची ट्र्याकिङ छिटो बनाउनुहोस् र मानवीय त्रुटिहरू कम गर्नुहोस्।

२. **वास्तविक समय ट्र्याकिङ प्रयोग गर्नुहोस्**: स्टक सकिने र अत्यधिक स्टक अवस्थाबाट बच्न वास्तविक समयमा स्टक स्तरहरू ट्र्याक राख्नुहोस्।

३. **आफ्नो पार्ट्स वर्गीकरण गर्नुहोस्**: सजिलो व्यवस्थापनको लागि सवारी प्रकार, ब्रान्ड, र कोटी अनुसार पार्ट्स व्यवस्थित गर्नुहोस्।

४. **पुन: अर्डर बिन्दुहरू सेट गर्नुहोस्**: न्यूनतम स्टक स्तरहरू स्थापना गर्नुहोस् र पुन: अर्डर प्रक्रियाहरू स्वचालित गर्नुहोस्।

५. **नियमित लेखापरीक्षण**: शुद्धता सुनिश्चित गर्न आवधिक भौतिक गणनाहरू सञ्चालन गर्नुहोस्।

६. **बहु-स्थान व्यवस्थापन**: यदि तपाईंसँग धेरै शाखाहरू छन् भने, केन्द्रीकृत सूची व्यवस्थापन प्रयोग गर्नुहोस्।

७. **आपूर्तिकर्ता सम्बन्धहरू**: राम्रो मूल्य निर्धारण र छिटो डेलिभरीको लागि आपूर्तिकर्ताहरूसँग राम्रो सम्बन्ध कायम राख्नुहोस्।

८. **बिक्री डाटा विश्लेषण गर्नुहोस्**: छिटो-चल्ने र ढिलो-चल्ने वस्तुहरू पहिचान गर्न विश्लेषण प्रयोग गर्नुहोस्।

९. **आफ्नो कर्मचारीहरूलाई तालिम दिनुहोस्**: सबै टोली सदस्यहरूले सूची प्रणाली बुझ्ने सुनिश्चित गर्नुहोस्।

१०. **आधुनिक सफ्टवेयर प्रयोग गर्नुहोस्**: सर्भ स्पेयर्स जस्तो व्यापक सूची व्यवस्थापन सफ्टवेयरमा लगानी गर्नुहोस्।

यी रणनीतिहरू लागू गरेर, तपाईं आफ्नो सूची दक्षता उल्लेखनीय रूपमा सुधार गर्न र लागत घटाउन सक्नुहुन्छ।`,
    author: 'Rajesh Sharma',
    date: '2024-11-25',
    category: 'Inventory Management',
    categoryNe: 'सूची व्यवस्थापन',
    readTime: '5 min',
    image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=500&fit=crop',
    tags: ['Inventory', 'Tips', 'Management'],
    tagsNe: ['सूची', 'सुझावहरू', 'व्यवस्थापन']
  },
  {
    id: 2,
    title: 'How Barcode Scanning Revolutionizes Parts Tracking',
    titleNe: 'कसरी बारकोड स्क्यानिङले पार्ट्स ट्र्याकिङमा क्रान्ति ल्याउँछ',
    excerpt: 'Discover how implementing barcode technology can transform your auto parts business operations.',
    excerptNe: 'बारकोड प्रविधि लागू गर्दा तपाईंको अटो पार्ट्स व्यवसाय सञ्चालन कसरी रूपान्तरण हुन सक्छ पत्ता लगाउनुहोस्।',
    content: `Barcode scanning has become an essential tool for modern auto parts inventory management. Here's why:

**Benefits of Barcode Scanning:**

1. **Speed and Accuracy**: Scan parts in seconds instead of manual entry, reducing errors by 99%.

2. **Real-Time Updates**: Inventory levels update instantly across all systems and locations.

3. **Easy Tracking**: Track parts movement from receiving to sale with complete history.

4. **Quick Billing**: Speed up checkout process by scanning items directly into invoices.

5. **Inventory Audits**: Conduct physical counts faster and more accurately.

**Implementation Steps:**

- Choose the right barcode format (QR codes, barcodes, etc.)
- Print labels for all existing inventory
- Train staff on scanning procedures
- Integrate with your inventory management software

**ROI Results:**

Businesses that implement barcode scanning typically see:
- 80% reduction in data entry time
- 95% improvement in inventory accuracy
- 60% faster order processing
- Better customer satisfaction

Serve Spares includes built-in barcode scanning with bulk import/export capabilities, making implementation seamless.`,
    contentNe: `बारकोड स्क्यानिङ आधुनिक अटो पार्ट्स सूची व्यवस्थापनको लागि एक आवश्यक उपकरण बनेको छ। यहाँ किन छ:

**बारकोड स्क्यानिङका फाइदाहरू:**

१. **गति र शुद्धता**: म्यानुअल प्रविष्टिको सट्टा सेकेन्डमा पार्ट्स स्क्यान गर्नुहोस्, त्रुटिहरू ९९% ले घटाउँदै।

२. **वास्तविक समय अपडेटहरू**: सबै प्रणाली र स्थानहरूमा सूची स्तरहरू तुरुन्तै अपडेट हुन्छन्।

३. **सजिलो ट्र्याकिङ**: प्राप्तिदेखि बिक्रीसम्म पूर्ण इतिहासको साथ पार्ट्स चालचलन ट्र्याक गर्नुहोस्।

४. **द्रुत बिलिङ**: सीधै इनभ्वाइसहरूमा वस्तुहरू स्क्यान गरेर चेकआउट प्रक्रिया छिटो बनाउनुहोस्।

५. **सूची लेखापरीक्षण**: भौतिक गणनाहरू छिटो र अधिक सटीक रूपमा सञ्चालन गर्नुहोस्।

**कार्यान्वयन चरणहरू:**

- सही बारकोड ढाँचा छान्नुहोस् (QR कोड, बारकोड, आदि)
- सबै अवस्थित सूचीको लागि लेबलहरू प्रिन्ट गर्नुहोस्
- स्क्यानिङ प्रक्रियाहरूमा कर्मचारीहरूलाई तालिम दिनुहोस्
- आफ्नो सूची व्यवस्थापन सफ्टवेयरसँग एकीकृत गर्नुहोस्

**ROI परिणामहरू:**

बारकोड स्क्यानिङ लागू गर्ने व्यवसायहरूले सामान्यतया देख्छन्:
- डाटा प्रविष्टि समयमा ८०% कमी
- सूची शुद्धतामा ९५% सुधार
- ६०% छिटो अर्डर प्रशोधन
- राम्रो ग्राहक सन्तुष्टि

सर्भ स्पेयर्समा बल्क आयात/निर्यात क्षमताहरूको साथ निर्मित बारकोड स्क्यानिङ समावेश छ, कार्यान्वयन सहज बनाउँदै।`,
    author: 'Amit Patel',
    date: '2024-11-20',
    category: 'Technology',
    categoryNe: 'प्रविधि',
    readTime: '4 min',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop',
    tags: ['Barcode', 'Technology', 'Efficiency'],
    tagsNe: ['बारकोड', 'प्रविधि', 'दक्षता']
  },
  {
    id: 3,
    title: 'Multi-Branch Inventory: Best Practices',
    titleNe: 'बहु-शाखा सूची: उत्तम अभ्यासहरू',
    excerpt: 'Managing inventory across multiple locations? Learn the best practices for multi-branch operations.',
    excerptNe: 'धेरै स्थानहरूमा सूची व्यवस्थापन गर्दै हुनुहुन्छ? बहु-शाखा सञ्चालनका लागि उत्तम अभ्यासहरू सिक्नुहोस्।',
    content: `Operating multiple auto parts shops requires sophisticated inventory management. Here are the best practices:

**Centralized Control:**
- Use a single system to manage all branches
- Real-time visibility across all locations
- Centralized reporting and analytics

**Stock Transfer:**
- Enable inter-branch stock transfers
- Track movement between locations
- Automate transfer requests based on demand

**Location-Specific Pricing:**
- Set different prices for different locations
- Manage local promotions separately
- Track location-specific profitability

**Access Control:**
- Role-based permissions for each branch
- Branch managers can view only their data
- Central admin has full visibility

**Inventory Optimization:**
- Analyze demand patterns per location
- Optimize stock levels for each branch
- Reduce overall holding costs

**Benefits:**
- Reduced stockouts at individual branches
- Better utilization of inventory
- Improved customer satisfaction
- Lower overall inventory costs

Serve Spares provides comprehensive multi-branch management with all these features built-in.`,
    contentNe: `धेरै अटो पार्ट्स पसलहरू सञ्चालन गर्न परिष्कृत सूची व्यवस्थापन आवश्यक छ। यहाँ उत्तम अभ्यासहरू छन्:

**केन्द्रीकृत नियन्त्रण:**
- सबै शाखाहरू व्यवस्थापन गर्न एकल प्रणाली प्रयोग गर्नुहोस्
- सबै स्थानहरूमा वास्तविक समय दृश्यता
- केन्द्रीकृत रिपोर्टिङ र विश्लेषण

**स्टक स्थानान्तरण:**
- अन्तर-शाखा स्टक स्थानान्तरण सक्षम गर्नुहोस्
- स्थानहरू बीच चालचलन ट्र्याक गर्नुहोस्
- माग अनुसार स्थानान्तरण अनुरोधहरू स्वचालित गर्नुहोस्

**स्थान-विशिष्ट मूल्य निर्धारण:**
- विभिन्न स्थानहरूको लागि फरक मूल्यहरू सेट गर्नुहोस्
- स्थानीय प्रवर्द्धनहरू अलग व्यवस्थापन गर्नुहोस्
- स्थान-विशिष्ट लाभप्रदता ट्र्याक गर्नुहोस्

**पहुँच नियन्त्रण:**
- प्रत्येक शाखाको लागि भूमिका-आधारित अनुमतिहरू
- शाखा प्रबन्धकहरूले केवल आफ्नो डाटा हेर्न सक्छन्
- केन्द्रीय प्रशासकसँग पूर्ण दृश्यता छ

**सूची अनुकूलन:**
- प्रति स्थान माग ढाँचाहरू विश्लेषण गर्नुहोस्
- प्रत्येक शाखाको लागि स्टक स्तरहरू अनुकूलन गर्नुहोस्
- समग्र होल्डिङ लागत घटाउनुहोस्

**फाइदाहरू:**
- व्यक्तिगत शाखाहरूमा स्टकआउट कम
- सूचीको राम्रो उपयोग
- सुधारिएको ग्राहक सन्तुष्टि
- कम समग्र सूची लागत

सर्भ स्पेयर्सले यी सबै सुविधाहरू निर्मित संग व्यापक बहु-शाखा व्यवस्थापन प्रदान गर्दछ।`,
    author: 'Sita Thapa',
    date: '2024-11-15',
    category: 'Business Strategy',
    categoryNe: 'व्यापार रणनीति',
    readTime: '6 min',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=500&fit=crop',
    tags: ['Multi-Branch', 'Strategy', 'Growth'],
    tagsNe: ['बहु-शाखा', 'रणनीति', 'वृद्धि']
  },
  {
    id: 4,
    title: 'Choosing the Right Auto Parts Software in 2024',
    titleNe: '२०२४ मा सही अटो पार्ट्स सफ्टवेयर छनोट गर्दै',
    excerpt: 'A comprehensive guide to selecting the perfect inventory management software for your auto parts business.',
    excerptNe: 'तपाईंको अटो पार्ट्स व्यवसायको लागि उत्तम सूची व्यवस्थापन सफ्टवेयर चयन गर्ने व्यापक गाइड।',
    content: `Choosing the right inventory management software is crucial for your auto parts business. Here's what to look for:

**Essential Features:**

1. **Inventory Tracking**: Real-time stock management with barcode support
2. **Multi-Role Access**: Different permissions for different staff
3. **Order Management**: Complete order lifecycle tracking
4. **Billing System**: Integrated invoicing and payment processing
5. **Reporting**: Comprehensive analytics and insights
6. **Multi-Branch**: Support for multiple locations
7. **Mobile Access**: Responsive design for smartphones and tablets

**Important Considerations:**

- **Local Support**: Choose software with Nepal-specific features (NPR currency, eSewa/FonePay)
- **Language Support**: Multi-language interface for your team
- **Scalability**: Can it grow with your business?
- **Training**: Is onboarding and training provided?
- **Pricing**: Transparent pricing with no hidden costs
- **Security**: Bank-level data protection

**Why Serve Spares Stands Out:**

✓ Built specifically for Nepal market
✓ NPR currency and local payment methods
✓ 8 language support including Nepali
✓ 5 user roles with custom permissions
✓ Real-time multi-branch sync
✓ Comprehensive training and support
✓ Affordable pricing for all business sizes

**Making the Decision:**

1. List your must-have features
2. Try demo or free trial
3. Check customer reviews
4. Evaluate customer support
5. Compare pricing plans
6. Make an informed decision

Invest in software that will help your business grow and succeed in the long term.`,
    contentNe: `सही सूची व्यवस्थापन सफ्टवेयर छनोट गर्नु तपाईंको अटो पार्ट्स व्यवसायको लागि महत्त्वपूर्ण छ। यहाँ के हेर्ने छ:

**आवश्यक सुविधाहरू:**

१. **सूची ट्र्याकिङ**: बारकोड समर्थनको साथ वास्तविक समय स्टक व्यवस्थापन
२. **बहु-भूमिका पहुँच**: विभिन्न कर्मचारीहरूको लागि फरक अनुमतिहरू
३. **अर्डर व्यवस्थापन**: पूर्ण अर्डर जीवनचक्र ट्र्याकिङ
४. **बिलिङ प्रणाली**: एकीकृत इनभ्वाइसिङ र भुक्तानी प्रशोधन
५. **रिपोर्टिङ**: व्यापक विश्लेषण र अन्तर्दृष्टि
६. **बहु-शाखा**: धेरै स्थानहरूको लागि समर्थन
७. **मोबाइल पहुँच**: स्मार्टफोन र ट्याब्लेटहरूको लागि उत्तरदायी डिजाइन

**महत्त्वपूर्ण विचारहरू:**

- **स्थानीय समर्थन**: नेपाल-विशिष्ट सुविधाहरू भएको सफ्टवेयर छान्नुहोस् (NPR मुद्रा, eSewa/FonePay)
- **भाषा समर्थन**: तपाईंको टोलीको लागि बहु-भाषा इन्टरफेस
- **स्केलेबिलिटी**: यो तपाईंको व्यवसायसँग बढ्न सक्छ?
- **तालिम**: ओनबोर्डिङ र तालिम प्रदान गरिएको छ?
- **मूल्य निर्धारण**: कुनै लुकेको लागत बिना पारदर्शी मूल्य निर्धारण
- **सुरक्षा**: बैंक-स्तर डाटा सुरक्षा

**किन सर्भ स्पेयर्स फरक छ:**

✓ विशेष रूपमा नेपाल बजारको लागि निर्मित
✓ NPR मुद्रा र स्थानीय भुक्तानी विधिहरू
✓ नेपाली सहित ८ भाषा समर्थन
✓ अनुकूलन अनुमतिहरूको साथ ५ प्रयोगकर्ता भूमिकाहरू
✓ वास्तविक समय बहु-शाखा सिङ्क
✓ व्यापक तालिम र समर्थन
✓ सबै व्यवसाय आकारहरूको लागि किफायती मूल्य निर्धारण

**निर्णय गर्दै:**

१. तपाईंको अवश्य-भएका सुविधाहरू सूचीबद्ध गर्नुहोस्
२. डेमो वा निःशुल्क परीक्षण प्रयास गर्नुहोस्
३. ग्राहक समीक्षाहरू जाँच गर्नुहोस्
४. ग्राहक समर्थन मूल्याङ्कन गर्नुहोस्
५. मूल्य निर्धारण योजनाहरू तुलना गर्नुहोस्
६. सूचित निर्णय गर्नुहोस्

सफ्टवेयरमा लगानी गर्नुहोस् जसले तपाईंको व्यवसायलाई लामो अवधिमा बढ्न र सफल हुन मद्दत गर्नेछ।`,
    author: 'Krishna Khadka',
    date: '2024-11-10',
    category: 'Software Selection',
    categoryNe: 'सफ्टवेयर चयन',
    readTime: '7 min',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
    tags: ['Software', 'Guide', 'Selection'],
    tagsNe: ['सफ्टवेयर', 'गाइड', 'चयन']
  }
];

interface BlogPageProps {
  language?: 'en' | 'ne';
}

export const BlogPage: React.FC<BlogPageProps> = ({ language = 'en' }) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  return (
    <div className="pt-20">
      {selectedPost ? (
        <BlogPostDetail post={selectedPost} onClose={() => setSelectedPost(null)} language={language} />
      ) : (
        <>
          <HeroSection language={language} />
          <BlogGrid posts={blogPosts} onSelectPost={setSelectedPost} language={language} />
        </>
      )}
    </div>
  );
};

const HeroSection: React.FC<{ language: 'en' | 'ne' }> = ({ language }) => {
  return (
    <section className="relative min-h-[50vh] flex items-center bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-white"
        >
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            {language === 'en' ? 'Our Blog' : 'हाम्रो ब्लग'}
          </h1>
          <p className="text-2xl max-w-3xl mx-auto">
            {language === 'en' 
              ? 'Tips, guides, and insights for auto parts inventory management'
              : 'अटो पार्ट्स सूची व्यवस्थापनका लागि सुझावहरू, गाइडहरू, र अन्तर्दृष्टिहरू'}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

const BlogGrid: React.FC<{ 
  posts: BlogPost[]; 
  onSelectPost: (post: BlogPost) => void;
  language: 'en' | 'ne';
}> = ({ posts, onSelectPost, language }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {posts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelectPost(post)}
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer group"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={post.image} 
                  alt={language === 'en' ? post.title : post.titleNe}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    {language === 'en' ? post.category : post.categoryNe}
                  </span>
                </div>
              </div>

              <div className="p-8">
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock size={16} />
                    <span>{post.readTime}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User size={16} />
                    <span>{post.author}</span>
                  </div>
                </div>

                <h2 className="text-2xl font-bold mb-3 group-hover:text-indigo-600 transition-colors">
                  {language === 'en' ? post.title : post.titleNe}
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {language === 'en' ? post.excerpt : post.excerptNe}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {(language === 'en' ? post.tags : post.tagsNe).map((tag, i) => (
                    <span key={i} className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-sm flex items-center space-x-1">
                      <Tag size={14} />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>

                <button className="text-indigo-600 font-semibold flex items-center space-x-2 group-hover:translate-x-2 transition-transform">
                  <span>{language === 'en' ? 'Read More' : 'थप पढ्नुहोस्'}</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

const BlogPostDetail: React.FC<{ 
  post: BlogPost; 
  onClose: () => void;
  language: 'en' | 'ne';
}> = ({ post, onClose, language }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-white"
    >
      {/* Header Image */}
      <div className="relative h-96 overflow-hidden">
        <img 
          src={post.image} 
          alt={language === 'en' ? post.title : post.titleNe}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white text-gray-800 p-3 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <span className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
            {language === 'en' ? post.category : post.categoryNe}
          </span>
        </div>

        <h1 className="text-5xl font-bold mb-6">
          {language === 'en' ? post.title : post.titleNe}
        </h1>

        <div className="flex items-center space-x-6 text-gray-600 mb-8 pb-8 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <User size={20} />
            <span>{post.author}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar size={20} />
            <span>{post.date}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock size={20} />
            <span>{post.readTime}</span>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="text-gray-700 leading-relaxed whitespace-pre-line">
            {language === 'en' ? post.content : post.contentNe}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="font-bold mb-4">{language === 'en' ? 'Tags:' : 'ट्यागहरू:'}</h3>
          <div className="flex flex-wrap gap-2">
            {(language === 'en' ? post.tags : post.tagsNe).map((tag, i) => (
              <span key={i} className="bg-indigo-100 text-indigo-600 px-4 py-2 rounded-full flex items-center space-x-2">
                <Tag size={16} />
                <span>{tag}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <span>{language === 'en' ? '← Back to Blog' : '← ब्लगमा फर्कनुहोस्'}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
