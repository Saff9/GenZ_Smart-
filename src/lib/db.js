import { PrismaClient } from '@prisma/client';
import { unstable_noStore as noStore } from 'next/cache';

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Project functions
export async function getFeaturedProjects(limit = 3) {
  noStore();
  try {
    return await prisma.project.findMany({
      where: { featured: true },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        description: true,
        shortDescription: true,
        image: true,
        tech: true,
        github: true,
        demo: true,
        featured: true
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    return [];
  }
}

export async function getAllProjects() {
  noStore();
  try {
    return await prisma.project.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        shortDescription: true,
        image: true,
        tech: true,
        github: true,
        demo: true,
        featured: true,
        category: true,
        createdAt: true,
        updatedAt: true
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    return [];
  }
}

// Blog functions
export async function getRecentPosts(limit = 3) {
  noStore();
  try {
    return await prisma.post.findMany({
      where: { status: 'published' },
      orderBy: { publishedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        excerpt: true,
        slug: true,
        featuredImage: true,
        category: true,
        publishedAt: true,
        author: {
          select: {
            name: true,
            image: true
          }
        }
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    return [];
  }
}

export async function getPostBySlug(slug, fields = []) {
  noStore();
  const selectFields = {
    id: true,
    title: true,
    excerpt: true,
    content: true,
    slug: true,
    featuredImage: true,
    category: true,
    publishedAt: true,
    updatedAt: true,
    status: true,
    tags: true,
    author: {
      select: {
        name: true,
        email: true,
        bio: true,
        image: true
      }
    }
  };
  
  // Filter select fields based on requested fields
  Object.keys(selectFields).forEach(key => {
    if (!fields.includes(key) && fields.length > 0) {
      delete selectFields[key];
    }
  });

  try {
    return await prisma.post.findUnique({
      where: { slug },
      select: selectFields
    });
  } catch (error) {
    console.error('Database error:', error);
    return null;
  }
}

export async function getAllPosts(fields = []) {
  noStore();
  const selectFields = {
    id: true,
    title: true,
    excerpt: true,
    slug: true,
    featuredImage: true,
    category: true,
    publishedAt: true,
    author: {
      select: {
        name: true,
        image: true
      }
    }
  };
  
  // Filter select fields based on requested fields
  Object.keys(selectFields).forEach(key => {
    if (!fields.includes(key) && fields.length > 0) {
      delete selectFields[key];
    }
  });

  try {
    return await prisma.post.findMany({
      where: { status: 'published' },
      orderBy: { publishedAt: 'desc' },
      select: selectFields
    });
  } catch (error) {
    console.error('Database error:', error);
    return [];
  }
}

// Newsletter functions
export async function addSubscriber(email) {
  noStore();
  try {
    // Check if email exists
    const existing = await prisma.subscriber.findUnique({
      where: { email }
    });
    
    if (existing) {
      return { success: false, message: 'Email already subscribed' };
    }
    
    // Create new subscriber
    const subscriber = await prisma.subscriber.create({
       {
        email,
        subscribedAt: new Date()
      }
    });
    
    // TODO: Send confirmation email
    
    return { success: true, subscriber };
  } catch (error) {
    console.error('Subscription error:', error);
    return { success: false, message: 'Failed to subscribe' };
  }
}

// Admin functions
export async function createPost(data) {
  noStore();
  try {
    // Generate slug if not provided
    let slug = data.slug;
    if (!slug) {
      slug = data.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    
    // Ensure unique slug
    let uniqueSlug = slug;
    let counter = 1;
    while (await prisma.post.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
    
    return await prisma.post.create({
       {
        ...data,
        slug: uniqueSlug,
        publishedAt: data.status === 'published' ? new Date() : null,
        author: {
          connect: { email: data.author.email }
        }
      }
    });
  } catch (error) {
    console.error('Create post error:', error);
    throw new Error('Failed to create post');
  }
}

export async function updatePost(id, data) {
  noStore();
  try {
    return await prisma.post.update({
      where: { id },
       {
        ...data,
        publishedAt: data.status === 'published' ? new Date() : null
      }
    });
  } catch (error) {
    console.error('Update post error:', error);
    throw new Error('Failed to update post');
  }
}

export async function getAdminPosts() {
  noStore();
  try {
    return await prisma.post.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        publishedAt: true,
        updatedAt: true,
        featuredImage: true
      }
    });
  } catch (error) {
    console.error('Get admin posts error:', error);
    return [];
  }
}
