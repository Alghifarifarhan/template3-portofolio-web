import { Metadata } from 'next';
import PostContent from './PostContent';
import { postsConfig } from '@/config/posts';
import { siteConfig } from '@/config/content';
import { db, formatGoogleDriveUrl } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

async function getPostData(slug: string) {
  const normalizedSlug = slug.replace(/^posts\//, '').replace(/^\//, '');
  if (!normalizedSlug || normalizedSlug === '_') return null;

  // 1. Try to fetch from Firestore
  try {
    const docRef = doc(db, 'site_content', 'main');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const posts = data?.posts?.items || [];
      const found = posts.find((p: any) => {
        const pCleanSlug = (p.slug || '').replace(/^posts\//, '').replace(/^\//, '');
        return pCleanSlug === normalizedSlug || p.id === normalizedSlug;
      });
      if (found) return found;
    }
  } catch {
    // fallback if Firestore is unreachable during static build
  }

  // 2. Fallback to default postsConfig
  const foundInConfig = postsConfig.posts.find((p: any) => {
    const pCleanSlug = (p.slug || '').replace(/^posts\//, '').replace(/^\//, '');
    return pCleanSlug === normalizedSlug || p.id === normalizedSlug;
  });

  return foundInConfig || null;
}

export async function generateStaticParams() {
  const slugs = new Set<string>();

  // Always include fallback template '_'
  slugs.add('_');

  try {
    const docRef = doc(db, 'site_content', 'main');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const posts = data?.posts?.items || [];
      posts.forEach((p: any) => {
        if (p.slug) {
          slugs.add(p.slug.replace(/^posts\//, '').replace(/^\//, ''));
        }
      });
    }
  } catch {
    // fallback
  }

  if (postsConfig.posts) {
    postsConfig.posts.forEach((p) => {
      slugs.add(p.slug.replace(/^posts\//, '').replace(/^\//, ''));
    });
  }

  return Array.from(slugs).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostData(slug);

  if (!post) {
    return {
      title: `Artikel | ${siteConfig.name}`,
      description: siteConfig.description,
    };
  }

  const title = post.title || 'Artikel';
  const description = post.description || (post.content ? post.content.slice(0, 160) : siteConfig.description);
  const rawImageUrl = post.imageUrl || (post as any).image || '';
  const formattedImageUrl = rawImageUrl ? formatGoogleDriveUrl(rawImageUrl) : '';

  const images = formattedImageUrl
    ? [
        {
          url: formattedImageUrl,
          alt: title,
        },
      ]
    : [
        {
          url: '/assets/images/olifyhub.png',
          alt: title,
          width: 512,
          height: 512,
        },
      ];

  return {
    title: `${title} | ${siteConfig.name}`,
    description: description,
    icons: {
      icon: '/assets/images/olifyhub.png',
      shortcut: '/assets/images/olifyhub.png',
      apple: '/assets/images/olifyhub.png',
    },
    openGraph: {
      title: title,
      description: description,
      type: 'article',
      publishedTime: post.createdAt || post.date,
      images: images,
    },
    twitter: {
      card: formattedImageUrl ? 'summary_large_image' : 'summary',
      title: title,
      description: description,
      images: formattedImageUrl ? [formattedImageUrl] : ['/assets/images/olifyhub.png'],
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PostContent slug={slug} />;
}