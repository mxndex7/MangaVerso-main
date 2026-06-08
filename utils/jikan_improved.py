import concurrent.futures
from functools import lru_cache
import time
from jikan_client import search_manga, search_anime, top_manga


                                           
@lru_cache(maxsize=128)
def _cached_search_manga(query: str, limit: int = 10, _timestamp=None):
    from jikan_client import search_manga as original_search_manga
    return original_search_manga(query, limit)


@lru_cache(maxsize=128)
def _cached_top_manga(limit: int = 20, page: int = 1, _timestamp=None):
    from jikan_client import top_manga as original_top_manga
    return original_top_manga(limit, page)


def search_manga(query: str, limit: int = 10):
    return _cached_search_manga(query, limit, _timestamp=int(time.time() / 300))


def top_manga(limit: int = 20, page: int = 1):
    return _cached_top_manga(limit, page, _timestamp=int(time.time() / 300))


@lru_cache(maxsize=128)
def _cached_search_anime(query: str, limit: int = 10, _timestamp=None):
    from jikan_client import search_anime as original_search_anime
    return original_search_anime(query, limit)


def search_anime(query: str, limit: int = 10):
    return _cached_search_anime(query, limit, _timestamp=int(time.time() / 300))


def search_multiple_manga_parallel(queries, limit_per_query=5):
    if not queries:
        return {}

    results = {}
    for query in queries:
        try:
            items = search_manga(query, limit_per_query)
            if items:
                results[query] = items[0]
        except Exception as e:
            print(f"Erro ao buscar {query}: {e}")
            continue

    return results