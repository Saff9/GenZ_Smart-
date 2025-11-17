import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { motion } from 'framer-motion';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import ReactMarkdown from 'react-markdown';
import { getPostBySlug, getAllPosts } from '@/lib/db';
import { SEO } from '@/lib/seo';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';

export default function BlogPost({ post, morePosts }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (router.isFallback || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Post Not Found</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">The article you're looking for doesn't exist.</p>
          <Button href="/blog" className="mt-4">Back to Blog</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={`${post.title} | Alex Chen's Blog`} 
        description={post.excerpt}
        image={post.featuredImage}
        type="article"
      />
      
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <Button 
              href="/blog" 
              variant="ghost" 
              icon="arrow-left"
              className="mb-4 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Back to Blog
            </Button>
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-sm font-medium rounded-full">
              {post.category || 'Technology'}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            {post.title}
          </h1>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4 sm:mb-0">
              <Image 
                src={post.author.image || '/images/profile.jpg'} 
                alt={post.author.name} 
                width={48} 
                height={48} 
                className="rounded-full mr-3"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{post.author.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Math.ceil(post.content.split(' ').length / 200)} min read
              </span>
              <div className="flex space-x-2">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
          
          {post.featuredImage && (
            <div className="relative w-full h-80 md:h-96 mb-8 rounded-xl overflow-hidden">
              <Image 
                src={post.featuredImage} 
                alt={post.title} 
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <h2 className="text-xl font-bold">{post.title}</h2>
                <p className="mt-1 opacity-90">{post.excerpt}</p>
              </div>
            </div>
          )}
          
          <div className="prose dark:prose-dark max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                img: ({ node, ...props }) => (
                  <Image 
                    {...props} 
                    width={800} 
                    height={450} 
                    className="rounded-lg shadow-md" 
                    alt={props.alt || post.title}
                  />
                ),
                a: ({ node, ...props }) => (
                  <a 
                    {...props} 
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),
                code: ({ node, inline, className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline ? (
                    <div className="not-prose my-6">
                      <pre className={`${className} rounded-lg overflow-x-auto p-4 bg-gray-800 text-gray-100`}>
                        <code {...props} className={className}>
                          {children}
                        </code>
                      </pre>
                    </div>
                  ) : (
                    <code {...props} className={`${className} px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm`}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <div className="flex items-center">
                <Image 
                  src={post.author.image || '/images/profile.jpg'} 
                  alt={post.author.name} 
                  width={60} 
                  height={60} 
                  className="rounded-full"
                />
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{post.author.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{post.author.bio}</p>
                </div>
              </div>
              
              <div className="mt-4 sm:mt-0 flex space-x-4">
                <Button variant="outline" icon="share">
                  Share
                </Button>
                <Button variant="outline" icon="bookmark">
                  Save
                </Button>
              </div>
            </div>
          </div>
          
          {morePosts.length > 0 && (
            <div className="mt-16">
              <SectionHeading title="Related Articles" />
              
              <div className="mt-8 grid gap-8 md:grid-cols-2">
                {morePosts.slice(0, 2).map((relatedPost) => (
                  <motion.div
                    key={relatedPost.slug}
                    whileHover={{ y: -5 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {relatedPost.featuredImage && (
                      <div className="relative h-48">
                        <Image 
                          src={relatedPost.featuredImage} 
                          alt={relatedPost.title} 
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="p-6">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-sm font-medium rounded-full mb-3">
                        {relatedPost.category || 'Technology'}
                      </span>
                      
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {relatedPost.title}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                      
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Image 
                          src={relatedPost.author.image || '/images/profile.jpg'} 
                          alt={relatedPost.author.name} 
                          width={24} 
                          height={24} 
                          className="rounded-full mr-2"
                        />
                        <span>{relatedPost.author.name} · {new Date(relatedPost.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      
                      <Button 
                        href={`/blog/${relatedPost.slug}`} 
                        variant="ghost" 
                        className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                      >
                        Read Article →
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </article>
    </>
  );
}

export async function getStaticPaths() {
  const posts = await getAllPosts(['slug']);
  
  return {
    paths: posts.map((post) => ({
      params: {
        slug: post.slug,
      },
    })),
    fallback: true,
  };
}

export async function getStaticProps({ params }) {
  try {
    const post = await getPostBySlug(params.slug, [
      'title',
      'excerpt',
      'content',
      'slug',
      'featuredImage',
      'category',
      'publishedAt',
      'author',
    ]);
    
    const morePosts = await getAllPosts([
      'title',
      'excerpt',
      'slug',
      'featuredImage',
      'category',
      'publishedAt',
      'author',
    ]);
    
    return {
      props: {
        post,
        morePosts: morePosts.filter(p => p.slug !== post.slug),
        revalidate: 60 // Regenerate page every 60 seconds
      }
    };
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return {
      notFound: true
    };
  }
}
