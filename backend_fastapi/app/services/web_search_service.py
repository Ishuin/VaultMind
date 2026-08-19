from loguru import logger
from typing import List, Dict


class WebSearchService:
    async def search(self, query: str, max_results: int = 5) -> List[Dict]:
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
