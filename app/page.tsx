'use client';

import { useEffect, useState } from 'react';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  thumbnail: string;
}

const usePBSNews = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('https://proxy.corsfix.com/?https://www.pbs.org/newshour/feeds/rss/politics');
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "application/xml");
        const items = xmlDoc.querySelectorAll("item");
        
        const parsedItems = Array.from(items).map(item => {
          const mediaContent = item.getElementsByTagName('media:content')[0];
          const thumbnail = mediaContent?.getAttribute('url') || '';
          
          return {
            title: item.querySelector("title")?.textContent || '',
            link: item.querySelector("link")?.textContent || '',
            pubDate: item.querySelector("pubDate")?.textContent || '',
            description: item.querySelector("description")?.textContent || '',
            thumbnail,
          };
        });
        
        setNewsItems(parsedItems);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  return { newsItems, isLoading };
};

const NewsItem = ({ title, link, pubDate, description, thumbnail }: NewsItem) => (
  <article className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow overflow-hidden">
    {thumbnail && (
      <div className="w-full h-48 relative">
        <img 
          src={thumbnail} 
          alt={title}
          className="object-cover w-full h-full"
        />
      </div>
    )}
    <div className="p-6 space-y-3">
      <h2 className="text-xl font-semibold leading-none tracking-tight">
        <a href={link} target="_blank" rel="noopener noreferrer" className="hover:underline">
          {title}
        </a>
      </h2>
      <p className="text-sm text-muted-foreground leading-relaxed" 
         dangerouslySetInnerHTML={{ __html: description }} />
      <time className="block text-sm text-muted-foreground">
        {new Date(pubDate).toLocaleDateString(undefined, { 
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </time>
    </div>
  </article>
);

export default function Home() {
  const { newsItems, isLoading } = usePBSNews();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading news...</div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-10 min-h-screen">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-8">
        PBS NewsHour Politics
      </h1>
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {newsItems.map((item, index) => (
          <NewsItem key={index} {...item} />
        ))}
      </section>
    </main>
  );
}
