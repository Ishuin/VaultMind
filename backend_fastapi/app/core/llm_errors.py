class LLMProviderError(Exception):
    """Typed provider failure carrying an HTTP status for the API layer."""

    def __init__(self, provider: str, message: str, status_code: int = 502, code: str = "provider_error"):
        self.provider = provider
        self.message = message
        self.status_code = status_code
        self.code = code
        super().__init__(message)


def map_status(status_code: int) -> int:
    if status_code in (401, 403):
        return 401
    if status_code == 429:
        return 429
    if status_code == 400:
        return 400
    if 500 <= status_code < 600:
        return 502
    return 502
