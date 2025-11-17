import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import profilePic from '@/public/images/profile.jpg';

export default function Hero() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8">
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block mb-6"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full blur opacity-75 dark:opacity-50 group-hover:opacity-100 transition duration-500" />
              <div className="relative inline-flex">
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full opacity-50 blur-lg animate-pulse" />
                <div className="relative bg-gray-800 dark:bg-gray-900 border-2 border-blue-500 rounded-full overflow-hidden">
                  <Image 
                    src={profilePic} 
                    alt="Alex Chen - Software Developer & Robotics Engineer" 
                    width={120} 
                    height={120} 
                    priority
                    className="rounded-full transform transition-transform duration-300 hover:scale-105"
                  />
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl"
          >
            <span className="block xl:inline">Building the Future,</span>{' '}
            <span className="block text-blue-600 dark:text-blue-400 xl:inline">One Line of Code at a Time</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
          >
            Software Developer & Robotics Engineer focused on creating intelligent systems that bridge the digital and physical worlds. 
            Specializing in AI-driven robotics, embedded systems, and full-stack development.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 flex justify-center gap-4 flex-wrap"
          >
            <Button 
              href="#projects" 
              variant="primary"
              className="px-6 py-3 text-lg font-medium"
            >
              View My Projects
            </Button>
            <Button 
              href="/blog" 
              variant="outline"
              className="px-6 py-3 text-lg font-medium"
            >
              Latest Articles
            </Button>
          </motion.div>
        </div>
        
        {/* Animated tech tags */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {['Robotics', 'AI/ML', 'Full-Stack', 'Embedded Systems', 'Computer Vision', 'IoT', 'Cloud Architecture', 'ROS'].map((tech, index) => (
            <motion.div
              key={tech}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 + (index * 0.1) }}
              whileHover={{ scale: 1.05 }}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-blue-600 dark:text-blue-400 font-medium">{tech}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
