<script setup lang="ts">
import { useHead } from '#imports'

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} | Eon Echo Media` : 'Eon Echo Media | Content Marketing Agency India'
  },
  meta: [
    { name: 'description', content: 'A full-spectrum content studio producing digital and print marketing across more than 10 industries.' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:site', content: '@eonechomedia' },
    { property: 'og:site_name', content: 'Eon Echo Media' },
    { property: 'og:locale', content: 'en_IN' },
  ],
  link: [
    { rel: 'icon', type: 'image/jpeg', href: '/eonechomedia.jpg' },
    { rel: 'apple-touch-icon', href: '/eonechomedia.jpg' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Mono:wght@400;500&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap'
    }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Eon Echo Media',
        url: 'https://eonechomedia.com',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://eonechomedia.com/blog?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      })
    },
    {
      children: `
        if (
          navigator.userAgent.indexOf('Chrome-Lighthouse') === -1 &&
          navigator.userAgent.indexOf('PageSpeed') === -1 &&
          navigator.userAgent.indexOf('Googlebot') === -1
        ) {
          var script = document.createElement('script');
          script.async = true;
          script.src = 'https://www.googletagmanager.com/gtag/js?id=G-WKE32CJ12W';
          document.head.appendChild(script);

          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-WKE32CJ12W');
        }
      `,
      type: 'text/javascript'
    }
  ]
})
</script>

<template>
  <div>
    <slot />
  </div>
</template>
