import { defineCollection, z } from 'astro:content'

export const collections = {
  blog: defineCollection({
    type: 'content',
    schema: z.object({
      title: z.string(),
      pubDate: z.date(),
      description: z.string().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).optional(),
    }),
  }),
  papers: defineCollection({
    type: 'content',
    schema: z.object({
      title: z.string(),
      authors: z.array(z.string()).optional(), // Made authors optional
      venue: z.string().optional(),
      date: z.date().optional(), // Changed from year to date
      year: z.number().optional(), // Keep year as fallback for backwards compatibility
      url: z.string().url().optional(),
      image: z.string().optional(),
      tldr: z.string().optional(),
      arxivUrl: z.string().url().optional().or(z.string()), // Allow non-URL strings
      blogUrl: z.string().optional(),
      talkUrl: z.string().optional(),
      codeUrl: z.string().url().optional().or(z.string()), // Allow non-URL strings
      projectUrl: z.string().url().optional().or(z.string()), // Allow non-URL strings
      draft: z.boolean().optional(),
    }),
  }),
  talks: defineCollection({
    type: 'content',
    schema: z.object({
      title: z.string(),
      event: z.string().optional(),
      date: z.date().optional(),
      slides: z.string().url().optional(),
    }),
  }),
  news: defineCollection({
    type: 'content',
    schema: z.object({
      title: z.string(),
      date: z.date(),
      description: z.string(),
      link: z.string().url().optional(),
      type: z.enum(['presentation', 'publication', 'award', 'general']).optional(),
    }),
  }),
}
