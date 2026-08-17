from loguru import logger
from typing import List, Dict
from app.core.config import settings


class WebSearchService:
    async def search(self, query: str, max_results: int = 5) -> List[Dict]:
        if settings.USE_WEB_SEARCH_FALLBACK:
            logger.info("Using web search fallback.")
            return []
        try:
            from ddgs import DDGS
            with DDGS() as ddgs:
                results = list(ddgs.text(query, max_results=max_results))
            logger.info(f"Web search for '{query}' returned {len(results)} results")
            return [
                {
                    "title": r.get("title", ""),
                    "snippet": r.get("body", ""),
                    "url": r.get("href", ""),
                }
                for r in results
            ]
        except Exception as e:
            logger.error(f"Web search failed for '{query}': {e}")
            return []


web_search_service = WebSearchService()
