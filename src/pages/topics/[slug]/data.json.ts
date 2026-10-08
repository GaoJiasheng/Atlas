/**
 * Engine data of one topic as a static file: `/topics/<slug>/data.json`.
 *
 * Parsed and validated with the engine's zod schema at build time (same call as the
 * topic page), merged into one object keyed by `data/*.json` file name. Locale
 * independent: text is bilingual inside. SceneHost fetches it on the client instead of
 * receiving it as island props (which would embed it, roughly doubled, in every page).
 */
import type { APIRoute } from 'astro';
import { getTopics, topicEngineData, type TopicEntry } from '../../../lib/content';

export async function getStaticPaths() {
  const topics = await getTopics();
  return topics.map((topic) => ({ params: { slug: topic.id }, props: { topic } }));
}

export const GET: APIRoute<{ topic: TopicEntry }> = ({ props }) =>
  new Response(JSON.stringify(topicEngineData(props.topic)), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
