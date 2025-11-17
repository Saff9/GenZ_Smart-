import Head from 'next/head';
import { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Skills from '@/components/sections/Skills';
import Projects from '@/components/sections/Projects';
import Blog from '@/components/sections/Blog';
import Contact from '@/components/sections/Contact';
import { getFeaturedProjects } from '@/lib/db';
import { getRecentPosts } from '@/lib/db';
import { SEO } from '@/lib/seo';

export default function Home({ featuredProjects, recentPosts }) {
  const [ref, inView] = useInView({ triggerOnce: true });
  const animation = useAnimation();

  useEffect(() => {
    if (inView) {
      animation.start('visible');
    }
  }, [animation, inView]);

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <>
      <SEO 
        title="Alex Chen | Software Developer & Robotics Engineer" 
        description="Building intelligent systems at the intersection of software and robotics. Portfolio showcasing projects, research, and technical insights."
        keywords={['software developer', 'robotics engineer', 'AI', 'machine learning', 'full-stack development']}
      />
      
      <div className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-indigo-100/60 dark:from-gray-900/80 dark:to-blue-900/40" />
          <svg className="absolute top-0 right-0 -mt-20 -mr-20 opacity-30 dark:opacity-20" width="404" height="404" fill="none" viewBox="0 0 404 404">
            <defs>
              <pattern id="grid-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1" fill="currentColor" className="text-blue-400 dark:text-blue-700" />
              </pattern>
            </defs>
            <rect width="404" height="404" fill="url(#grid-pattern)" />
          </svg>
        </div>
        
        <div className="relative z-10">
          <Hero />
          
          <motion.div 
            ref={ref}
            initial="hidden"
            animate={animation}
            variants={container}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
          >
            <motion.div variants={item}>
              <About />
            </motion.div>
            
            <motion.div variants={item} className="mt-24">
              <Skills />
            </motion.div>
            
            <motion.div variants={item} className="mt-24">
              <Projects projects={featuredProjects} />
            </motion.div>
            
            <motion.div variants={item} className="mt-24">
              <Blog posts={recentPosts} />
            </motion.div>
            
            <motion.div variants={item} className="mt-24">
              <Contact />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export async function getStaticProps() {
  try {
    const featuredProjects = await getFeaturedProjects(3);
    const recentPosts = await getRecentPosts(3);
    
    return {
      props: {
        featuredProjects,
        recentPosts,
        revalidate: 60 // Rebuild every 60 seconds for fresh content
      }
    };
  } catch (error) {
    console.error('Error fetching homepage ', error);
    return {
      props: {
        featuredProjects: [],
        recentPosts: []
      }
    };
  }
}
