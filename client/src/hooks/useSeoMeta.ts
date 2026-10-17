import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export interface SeoMetaProps {
  title: string;
  description: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: 'summary_large_image' | 'summary';
}

const DEFAULT_ORIGIN = 'https://collegeride.vercel.app';
const DEFAULT_IMAGE = `${DEFAULT_ORIGIN}/campus-hero-real.jpg`;

/**
 * Lightweight, zero-dependency custom hook to dynamically update document title
 * and Open Graph / Twitter SEO meta tags across client-side routes.
 */
export function useSeoMeta({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogImage = DEFAULT_IMAGE,
  ogUrl,
  twitterCard = 'summary_large_image',
}: SeoMetaProps) {
  const location = useLocation();

  useEffect(() => {
    // 1. Document title
    const fullTitle = title.includes('CampusRide') ? title : `${title} | CampusRide`;
    document.title = fullTitle;

    // Helper to set or create meta tag
    const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Standard description
    setMetaTag('name', 'description', description);

    // 3. Open Graph meta tags
    const targetUrl = ogUrl || `${DEFAULT_ORIGIN}${location.pathname}`;
    setMetaTag('property', 'og:title', ogTitle || fullTitle);
    setMetaTag('property', 'og:description', ogDescription || description);
    setMetaTag('property', 'og:url', targetUrl);
    setMetaTag('property', 'og:image', ogImage.startsWith('http') ? ogImage : `${DEFAULT_ORIGIN}${ogImage}`);
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:site_name', 'CampusRide');

    // 4. Twitter Card meta tags
    setMetaTag('name', 'twitter:card', twitterCard);
    setMetaTag('name', 'twitter:title', ogTitle || fullTitle);
    setMetaTag('name', 'twitter:description', ogDescription || description);
    setMetaTag('name', 'twitter:image', ogImage.startsWith('http') ? ogImage : `${DEFAULT_ORIGIN}${ogImage}`);

    // 5. Canonical link
    const targetCanonical = canonical || targetUrl;
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', targetCanonical);
  }, [
    title,
    description,
    canonical,
    ogTitle,
    ogDescription,
    ogImage,
    ogUrl,
    twitterCard,
    location.pathname,
  ]);
}

