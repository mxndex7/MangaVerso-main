import re
import bleach


def validate_cep(cep: str) -> bool:
    if not cep:
        return False

                                     
    cep_clean = re.sub(r'\D', '', cep)

                                   
    if len(cep_clean) != 8:
        return False

    return True


def sanitize_string(text: str, max_length: int = 1000) -> str:
    if not text:
        return ""

                    
    sanitized = bleach.clean(text, tags=[], strip=True)

                     
    if len(sanitized) > max_length:
        sanitized = sanitized[:max_length]

    return sanitized.strip()