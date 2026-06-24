import json
import time
import urllib.request
import urllib.error

from config import OLLAMA_BASE, OLLAMA_DEFAULT_MODEL, OLLAMA_TIMEOUT, OLLAMA_MAX_RETRIES

SYSTEM_PROMPTS = {
    "coder": "You are Nemo-Code, an expert Python/JS/HTML developer. Generate clean, working, production-ready code. Output ONLY code blocks (```...```).",
    "researcher": "You are Nemo-Res, a technical research analyst. Synthesize findings into clear, structured reports. Be concise and factual.",
    "reviewer": "You are Nemo-Rev, a senior code reviewer. Analyze code for bugs, security issues, style problems, and performance. Be critical but constructive.",
}


def _post(path, body):
    url = f"{OLLAMA_BASE}/{path}"
    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    last_error = None
    for attempt in range(1 + OLLAMA_MAX_RETRIES):
        try:
            with urllib.request.urlopen(req, timeout=OLLAMA_TIMEOUT) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except (urllib.error.URLError, urllib.error.HTTPError, OSError) as e:
            last_error = str(e)
            if attempt < OLLAMA_MAX_RETRIES:
                time.sleep(2 ** attempt)
    raise RuntimeError(f"LLM call failed after {OLLAMA_MAX_RETRIES + 1} attempts: {last_error}")


def chat(messages, model=None, temperature=0.7, max_tokens=4096):
    body = {
        "model": model or OLLAMA_DEFAULT_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": False,
    }
    result = _post("chat/completions", body)
    choice = result.get("choices", [{}])[0]
    return choice.get("message", {}).get("content", "").strip()


def ask(prompt, role="coder", model=None):
    system = SYSTEM_PROMPTS.get(role, SYSTEM_PROMPTS["coder"])
    messages = [{"role": "system", "content": system}, {"role": "user", "content": prompt}]
    return chat(messages, model=model)
