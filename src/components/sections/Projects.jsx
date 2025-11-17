import { motion } from 'framer-motion';
import ProjectCard from '@/components/ui/ProjectCard';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';

export default function Projects({ projects = [] }) {
  // Fallback data if API fails
  const fallbackProjects = [
    {
      id: 1,
      title: 'Autonomous Delivery Robot',
      description: 'ROS-based delivery robot with computer vision navigation and obstacle avoidance. Reduced delivery times by 40% in warehouse environments.',
      image: '/images/projects/robot-delivery.jpg',
      tech: ['ROS', 'Python', 'OpenCV', 'TensorFlow', 'C++'],
      github: '#',
      demo: '#',
      featured: true
    },
    {
      id: 2,
      title: 'AI-Powered Prosthetic Hand',
      description: 'Machine learning controlled prosthetic hand with EMG sensors and real-time gesture recognition. Provides intuitive control for amputees.',
      image: '/images/projects/prosthetic-hand.jpg',
      tech: ['TensorFlow', 'Arduino', 'EMG Sensors', 'Raspberry Pi', '3D Printing'],
      github: '#',
      demo: '#',
      featured: true
    },
    {
      id: 3,
      title: 'Cloud Robotics Platform',
      description: 'Scalable cloud infrastructure for robot fleet management with real-time data processing and remote diagnostics.',
      image: '/images/projects/cloud-robotics.jpg',
      tech: ['AWS', 'Docker', 'Node.js', 'React', 'WebSockets'],
      github: '#',
      demo: '#',
      featured: true
    }
  ];
  
  const projectList = projects.length > 0 ? projects : fallbackProjects;

  return (
    <section id="projects" className="py-16 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading 
          title="Featured Projects" 
          subtitle="Innovations at the intersection of software and robotics"
        />
        
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projectList.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <Button 
            href="/projects" 
            variant="primary"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            View All Projects
            <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Button>
        </div>
      </div>
    </section>
  );
}
