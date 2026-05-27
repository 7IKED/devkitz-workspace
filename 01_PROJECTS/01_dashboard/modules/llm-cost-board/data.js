// DkZ LLM Cost Board — Model Data
const MODELS = {
    llm: [
        // OpenAI
        { id: 'gpt4o', name: 'GPT-4o', provider: 'OpenAI', cat: 'openai', input: 2.50, output: 10.00, ctx: 128000, uncensored: false, local: false, notes: 'Flagship multimodal' },
        { id: 'gpt4omini', name: 'GPT-4o Mini', provider: 'OpenAI', cat: 'openai', input: 0.15, output: 0.60, ctx: 128000, uncensored: false, local: false, notes: 'Budget option' },
        { id: 'gpt52', name: 'GPT-5.2', provider: 'OpenAI', cat: 'openai', input: 5.00, output: 20.00, ctx: 256000, uncensored: false, local: false, notes: 'Latest flagship' },
        { id: 'gpt54', name: 'GPT-5.4', provider: 'OpenAI', cat: 'openai', input: 8.00, output: 30.00, ctx: 256000, uncensored: false, local: false, notes: 'Reasoning specialist' },
        // Anthropic
        { id: 'opus46', name: 'Claude Opus 4.6', provider: 'Anthropic', cat: 'anthropic', input: 5.00, output: 25.00, ctx: 200000, uncensored: false, local: false, notes: 'Most capable' },
        { id: 'sonnet46', name: 'Claude Sonnet 4.6', provider: 'Anthropic', cat: 'anthropic', input: 3.00, output: 15.00, ctx: 200000, uncensored: false, local: false, notes: 'Balanced' },
        { id: 'haiku45', name: 'Claude Haiku 4.5', provider: 'Anthropic', cat: 'anthropic', input: 1.00, output: 5.00, ctx: 200000, uncensored: false, local: false, notes: 'Fastest' },
        // Google Gemini
        { id: 'gem31pro', name: 'Gemini 3.1 Pro', provider: 'Google', cat: 'google', input: 2.00, output: 12.00, ctx: 200000, uncensored: false, local: false, notes: 'Latest Pro' },
        { id: 'gem3flash', name: 'Gemini 3 Flash', provider: 'Google', cat: 'google', input: 0.50, output: 3.00, ctx: 1000000, uncensored: false, local: false, notes: 'Fast + cheap' },
        { id: 'gem25pro', name: 'Gemini 2.5 Pro', provider: 'Google', cat: 'google', input: 1.25, output: 10.00, ctx: 1000000, uncensored: false, local: false, notes: 'Previous Pro' },
        { id: 'gem25flash', name: 'Gemini 2.5 Flash', provider: 'Google', cat: 'google', input: 0.30, output: 2.50, ctx: 1000000, uncensored: false, local: false, notes: 'Speed optimized' },
        { id: 'gem25flite', name: 'Gemini 2.5 Flash-Lite', provider: 'Google', cat: 'google', input: 0.10, output: 0.40, ctx: 1000000, uncensored: false, local: false, notes: 'Ultra budget' },
        { id: 'gemfast', name: 'Gemini Fast', provider: 'Google', cat: 'google', input: 0.05, output: 0.20, ctx: 128000, uncensored: false, local: false, notes: 'AI Studio free tier speed' },
        // xAI Grok
        { id: 'grok41f', name: 'Grok 4.1 Fast', provider: 'xAI', cat: 'xai', input: 0.20, output: 0.50, ctx: 131072, uncensored: true, local: false, notes: 'Ultra fast, less censored' },
        { id: 'grok4', name: 'Grok 4', provider: 'xAI', cat: 'xai', input: 3.00, output: 15.00, ctx: 131072, uncensored: true, local: false, notes: 'Flagship reasoning' },
        { id: 'grok3', name: 'Grok 3', provider: 'xAI', cat: 'xai', input: 3.00, output: 15.00, ctx: 131072, uncensored: true, local: false, notes: 'Previous gen' },
        { id: 'grok41ft', name: 'Grok 4.1 Fast Thinking', provider: 'xAI', cat: 'xai', input: 0.50, output: 1.50, ctx: 131072, uncensored: true, local: false, notes: 'Reasoning + speed' },
        // DeepSeek
        { id: 'dsv32', name: 'DeepSeek V3.2', provider: 'DeepSeek', cat: 'deepseek', input: 0.28, output: 0.42, ctx: 128000, uncensored: false, local: false, notes: 'Cheapest high-quality' },
        { id: 'dsr1', name: 'DeepSeek R1', provider: 'DeepSeek', cat: 'deepseek', input: 0.55, output: 2.19, ctx: 128000, uncensored: false, local: true, notes: 'Open-source reasoning' },
        { id: 'dsr1lite', name: 'DeepSeek R1-Lite', provider: 'DeepSeek', cat: 'deepseek', input: 0.10, output: 0.40, ctx: 64000, uncensored: false, local: true, notes: 'Lightweight reasoning' },
        // Qwen
        { id: 'qwen3max', name: 'Qwen3 Max', provider: 'Alibaba', cat: 'alibaba', input: 1.20, output: 6.00, ctx: 128000, uncensored: false, local: false, notes: 'Flagship Qwen' },
        { id: 'qwen3cod', name: 'Qwen3 Coder Plus', provider: 'Alibaba', cat: 'alibaba', input: 0.65, output: 3.25, ctx: 128000, uncensored: false, local: false, notes: 'Code specialist' },
        { id: 'qwen35p', name: 'Qwen 3.5 Plus', provider: 'Alibaba', cat: 'alibaba', input: 0.26, output: 1.56, ctx: 256000, uncensored: false, local: false, notes: 'Latest balanced' },
        { id: 'qwen3_32b', name: 'Qwen3 32B', provider: 'Alibaba', cat: 'alibaba', input: 0.08, output: 0.24, ctx: 128000, uncensored: true, local: true, notes: 'Open weights, uncensored possible' },
        { id: 'qwen3_8b', name: 'Qwen3 8B', provider: 'Alibaba', cat: 'alibaba', input: 0.05, output: 0.40, ctx: 128000, uncensored: true, local: true, notes: 'Local runner' },
        { id: 'qwencoder7b', name: 'Qwen Coder 7B', provider: 'Alibaba', cat: 'alibaba', input: 0.03, output: 0.10, ctx: 32000, uncensored: true, local: true, notes: 'Code specialist, local' },
        // Kimi
        { id: 'kimi25', name: 'Kimi K2.5', provider: 'Moonshot', cat: 'moonshot', input: 0.60, output: 3.00, ctx: 256000, uncensored: false, local: false, notes: 'Multimodal, long context' },
        // MiniMax
        { id: 'mm25', name: 'MiniMax M2.5', provider: 'MiniMax', cat: 'minimax', input: 0.15, output: 1.20, ctx: 200000, uncensored: false, local: false, notes: 'Standard speed' },
        { id: 'mm25l', name: 'MiniMax M2.5 Lightning', provider: 'MiniMax', cat: 'minimax', input: 0.30, output: 2.40, ctx: 200000, uncensored: false, local: false, notes: '100 TPS fast' },
        { id: 'mm2', name: 'MiniMax M2', provider: 'MiniMax', cat: 'minimax', input: 0.255, output: 1.00, ctx: 197000, uncensored: false, local: false, notes: 'Previous gen' },
        // GLM (Zhipu)
        { id: 'glm5', name: 'GLM-5', provider: 'Zhipu AI', cat: 'zhipu', input: 0.80, output: 2.56, ctx: 203000, uncensored: false, local: false, notes: 'Latest flagship' },
        { id: 'glm47', name: 'GLM-4.7', provider: 'Zhipu AI', cat: 'zhipu', input: 0.60, output: 2.20, ctx: 200000, uncensored: false, local: false, notes: 'Fast reasoning' },
        { id: 'glm45x', name: 'GLM-4.5-X', provider: 'Zhipu AI', cat: 'zhipu', input: 2.20, output: 8.90, ctx: 128000, uncensored: false, local: false, notes: 'Premium tier' },
        { id: 'glm45', name: 'GLM-4.5', provider: 'Zhipu AI', cat: 'zhipu', input: 0.60, output: 2.20, ctx: 128000, uncensored: false, local: false, notes: 'Standard' },
        { id: 'glm45a', name: 'GLM-4.5-Air', provider: 'Zhipu AI', cat: 'zhipu', input: 0.20, output: 1.10, ctx: 128000, uncensored: false, local: false, notes: 'Budget' },
        { id: 'glm45f', name: 'GLM-4.5-Flash', provider: 'Zhipu AI', cat: 'zhipu', input: 0, output: 0, ctx: 128000, uncensored: false, local: false, notes: 'FREE tier' },
        { id: 'glm46', name: 'GLM-4.6', provider: 'Zhipu AI', cat: 'zhipu', input: 0.35, output: 1.50, ctx: 203000, uncensored: false, local: false, notes: 'Balanced option' },
        // Mistral
        { id: 'mistlarge', name: 'Mistral Large 2', provider: 'Mistral', cat: 'mistral', input: 2.00, output: 6.00, ctx: 128000, uncensored: true, local: false, notes: 'Flagship' },
        { id: 'mistmed', name: 'Mistral Medium', provider: 'Mistral', cat: 'mistral', input: 0.80, output: 2.40, ctx: 128000, uncensored: true, local: false, notes: 'Balanced' },
        { id: 'mistsmall', name: 'Mistral Small 3.1', provider: 'Mistral', cat: 'mistral', input: 0.10, output: 0.30, ctx: 128000, uncensored: true, local: true, notes: '24B, open weights' },
        { id: 'mistocr', name: 'Mistral OCR 0.8', provider: 'Mistral', cat: 'mistral', input: 0.15, output: 0.60, ctx: 64000, uncensored: false, local: true, notes: 'Specialized OCR' },
        { id: 'mistnemo', name: 'Mistral Nemo 12B', provider: 'Mistral', cat: 'mistral', input: 0.04, output: 0.12, ctx: 128000, uncensored: true, local: true, notes: 'Open, uncensored' },
        { id: 'codestral', name: 'Codestral 25.01', provider: 'Mistral', cat: 'mistral', input: 0.30, output: 0.90, ctx: 256000, uncensored: false, local: true, notes: 'Code gen' },
        // Perplexity
        { id: 'pplxsonarlg', name: 'Perplexity Sonar Large', provider: 'Perplexity', cat: 'openai', input: 1.00, output: 5.00, ctx: 128000, uncensored: false, local: false, notes: 'Search-augmented' },
        { id: 'pplxsonarsm', name: 'Perplexity Sonar Small', provider: 'Perplexity', cat: 'openai', input: 0.20, output: 1.00, ctx: 128000, uncensored: false, local: false, notes: 'Budget search' },
        // Meta / Local
        { id: 'llama4_70b', name: 'Llama 4 70B', provider: 'Meta', cat: 'meta', input: 0.18, output: 0.50, ctx: 128000, uncensored: true, local: true, notes: 'Open weights' },
        { id: 'llama4_405b', name: 'Llama 4 405B', provider: 'Meta', cat: 'meta', input: 1.80, output: 5.00, ctx: 128000, uncensored: true, local: true, notes: 'Largest open model' },
        { id: 'llama4_8b', name: 'Llama 4 8B', provider: 'Meta', cat: 'meta', input: 0.02, output: 0.06, ctx: 128000, uncensored: true, local: true, notes: 'Nano model' },
    ],

    // Image generation
    image: [
        { id: 'dalle3', name: 'DALL-E 3', provider: 'OpenAI', cost: 0.04, costHd: 0.08, unit: 'per image', resolution: '1024x1024', notes: 'Standard quality' },
        { id: 'dalle3hd', name: 'DALL-E 3 HD', provider: 'OpenAI', cost: 0.08, costHd: 0.12, unit: 'per image', resolution: '1792x1024', notes: 'HD quality' },
        { id: 'gptimg1', name: 'GPT Image 1 Mini', provider: 'OpenAI', cost: 0.005, costHd: 0.02, unit: 'per image', resolution: '1024x1024', notes: 'Cheapest' },
        { id: 'gptimg15', name: 'GPT Image 1.5', provider: 'OpenAI', cost: 0.04, costHd: 0.167, unit: 'per image', resolution: '2048x2048', notes: 'Latest gen' },
        { id: 'flux2pro', name: 'Flux 2 Pro', provider: 'BFL', cost: 0.055, costHd: 0.055, unit: 'per image', resolution: '1MP', notes: 'Best quality open' },
        { id: 'flux2dev', name: 'Flux 2 Dev', provider: 'BFL', cost: 0.025, costHd: 0.03, unit: 'per image', resolution: '1MP', notes: 'Developer model' },
        { id: 'fluxschnell', name: 'Flux Schnell', provider: 'BFL', cost: 0.003, costHd: 0.003, unit: 'per image', resolution: '1024x1024', notes: 'Ultra fast, free local' },
        { id: 'sd35', name: 'Stable Diffusion 3.5', provider: 'Stability', cost: 0.04, costHd: 0.08, unit: 'per image', resolution: '1024x1024', notes: 'Open source' },
        { id: 'sdultra', name: 'Stable Image Ultra', provider: 'Stability', cost: 0.08, costHd: 0.08, unit: 'per image', resolution: '2048x2048', notes: 'Premium' },
        { id: 'sdcore', name: 'Stable Image Core', provider: 'Stability', cost: 0.03, costHd: 0.03, unit: 'per image', resolution: '1024x1024', notes: 'Balanced' },
        { id: 'midjourney', name: 'Midjourney v7', provider: 'Midjourney', cost: 0.05, costHd: 0.10, unit: 'per image', resolution: '2048x2048', notes: '~200 images on $10 plan' },
        { id: 'ideogram', name: 'Ideogram 3', provider: 'Ideogram', cost: 0.04, costHd: 0.08, unit: 'per image', resolution: '1024x1024', notes: 'Excellent text render' },
    ],

    // Video generation
    video: [
        { id: 'sora2', name: 'Sora 2', provider: 'OpenAI', cost: 0.10, unit: 'per second', notes: '15-60s clips' },
        { id: 'runway3', name: 'Runway Gen-3 Alpha', provider: 'Runway', cost: 0.05, unit: 'per second', notes: 'Professional quality' },
        { id: 'kling2', name: 'Kling 2.0', provider: 'Kuaishou', cost: 0.02, unit: 'per second', notes: 'Chinese leader' },
        { id: 'minimax_video', name: 'MiniMax Video-01', provider: 'MiniMax', cost: 0.03, unit: 'per second', notes: 'Hailuo video' },
        { id: 'pika2', name: 'Pika 2.0', provider: 'Pika', cost: 0.04, unit: 'per second', notes: 'Motion effects' },
        { id: 'luma', name: 'Luma Dream Machine', provider: 'Luma', cost: 0.03, unit: 'per second', notes: '3D style' },
        { id: 'cogvideox', name: 'CogVideoX', provider: 'Zhipu', cost: 0.00, unit: 'per second', notes: 'Open source, local free' },
    ],

    // TTS / Speech
    speech: [
        { id: 'fish', name: 'Fish Speech', provider: 'Fish Audio', cost: 15.00, unit: 'per 1M UTF-8 bytes', notes: '~12h speech, voice clone included' },
        { id: 'elevenlabs', name: 'ElevenLabs TTS', cost: 0.30, unit: 'per 1K chars (Creator)', notes: 'Starting $11/mo, clone from Creator' },
        { id: 'goog_tts', name: 'Google Cloud TTS', provider: 'Google', cost: 4.00, unit: 'per 1M chars (standard)', notes: 'WaveNet $16/1M' },
        { id: 'gemini_tts', name: 'Gemini 2.5 Flash TTS', provider: 'Google', cost: 10.00, unit: 'per 1M audio tokens out', notes: 'Input $0.50/1M text tokens' },
        { id: 'gemini_pro_tts', name: 'Gemini 2.5 Pro TTS', provider: 'Google', cost: 20.00, unit: 'per 1M audio tokens out', notes: 'Input $1.00/1M text tokens' },
        { id: 'polly', name: 'Amazon Polly', provider: 'AWS', cost: 4.00, unit: 'per 1M chars (standard)', notes: 'Neural $16, Generative $30' },
        { id: 'azure_tts', name: 'Azure TTS', provider: 'Microsoft', cost: 16.00, unit: 'per 1M chars (neural)', notes: '0.5M free/mo' },
        { id: 'playht', name: 'Play.ht', provider: 'Play.ht', cost: 0.014, unit: 'estimated per min', notes: 'From $14/mo, 900+ voices' },
        { id: 'murf', name: 'Murf.ai', provider: 'Murf', cost: 0.019, unit: 'estimated per min', notes: '$19/mo Creator, clone from $66/mo' },
        { id: 'resemble', name: 'Resemble AI', cost: 0.001, unit: 'per second', notes: '$1/mo Creator, 10K sec free' },
        { id: 'openai_tts', name: 'OpenAI TTS', provider: 'OpenAI', cost: 15.00, unit: 'per 1M chars', notes: '6 voices, no cloning' },
        { id: 'qwen_tts', name: 'Qwen Audio / MultiSpeak', provider: 'Alibaba', cost: 0.00, unit: 'open source', notes: 'Free local, multilingual' },
    ],

    // OCR Models
    ocr: [
        { id: 'mistocr08', name: 'Mistral OCR 0.8', provider: 'Mistral', input: 0.15, output: 0.60, notes: 'Best dedicated OCR model' },
        { id: 'goocr', name: 'Google Document AI OCR', provider: 'Google', input: 0.065, output: 0, notes: 'Per page, enterprise' },
        { id: 'azure_ocr', name: 'Azure AI Vision OCR', provider: 'Microsoft', input: 1.50, output: 0, notes: 'Per 1000 pages' },
        { id: 'tesseract', name: 'Tesseract OCR', provider: 'Open Source', input: 0, output: 0, notes: 'Free, local, 100+ languages' },
        { id: 'surya', name: 'Surya OCR', provider: 'Open Source', input: 0, output: 0, notes: 'Free, ML-based, tables+layouts' },
        { id: 'easyocr', name: 'EasyOCR', provider: 'Open Source', input: 0, output: 0, notes: 'Free, 80+ languages, Python' },
        { id: 'paddleocr', name: 'PaddleOCR', provider: 'Baidu', input: 0, output: 0, notes: 'Free, best for CJK languages' },
        { id: 'doctr', name: 'docTR', provider: 'Mindee', input: 0, output: 0, notes: 'Free OSS, deep learning' },
        { id: 'gemini_ocr', name: 'Gemini Vision OCR', provider: 'Google', input: 0.10, output: 0.40, notes: 'Via multimodal, high accuracy' },
        { id: 'gpt4v_ocr', name: 'GPT-4V OCR', provider: 'OpenAI', input: 2.50, output: 10.00, notes: 'Via vision capability' },
    ],

    // NotebookLM
    notebooklm: {
        tiers: [
            { name: 'Free', price: 0, notebooks: 100, sources: 50, audioOverviews: 3, notes: 'Light use' },
            { name: 'Plus (AI Pro)', price: 19.99, notebooks: 500, sources: 250, audioOverviews: 15, notes: '5x more, 2TB storage' },
            { name: 'Pro (Enterprise)', price: 9.00, notebooks: 1000, sources: 500, audioOverviews: 50, notes: 'Per license, annual discount' },
            { name: 'Ultra (AI Ultra)', price: 249.99, notebooks: 5000, sources: 600, audioOverviews: 200, notes: '50x gen, watermark-free, video' },
        ],
        products: [
            { name: 'Podcast (Audio Overview)', estCostPer: '$0.25-$1.00 per 100 pages', included: true },
            { name: 'Infographic', estCostPer: 'Included in tier', included: true },
            { name: 'Presentation', estCostPer: 'Included in tier', included: true },
            { name: 'Explainer Video', estCostPer: 'Ultra tier only ($249.99/mo)', included: false },
            { name: 'Mind Maps', estCostPer: 'Included in tier', included: true },
        ],
        unusable: ['Real-time collaboration editing', 'Custom domain hosting', 'Direct API access (use Vertex)', 'Webhook integrations', 'White-label branding (below Ultra)']
    },

    // Google AI Studio
    googleAIStudio: {
        tiers: [
            { name: 'Free Tier', price: 0, notes: 'Free dev environment, rate-limited Gemini access' },
            { name: 'Pay-as-you-go', price: 'Usage-based', notes: 'Token-based via Gemini API' },
            { name: 'AI Pro', price: 19.99, notes: 'Gemini Adv + NotebookLM Plus + 2TB' },
            { name: 'AI Ultra', price: 249.99, notes: 'Top Gemini + NotebookLM Ultra + Video' },
            { name: 'Developer Program', price: 45.00, notes: 'Per user/mo, GenAI credits incl.' },
        ],
        unusable: ['Offline mode', 'Self-hosted deployment', 'Custom model training (use Vertex)', 'SLA guarantees (free tier)']
    },

    // OpenClaw / NanoBot / PicoClaw
    openclaw: [
        { id: 'nanobot_mini', name: 'NanoBot Mini', type: 'Orchestrator', monthlyCost: 0, notes: 'Open source, self-hosted' },
        { id: 'picoclaw', name: 'PicoClaw', type: 'Micro-agent', monthlyCost: 0, notes: 'Minimal resource agent' },
        { id: 'openclaw_core', name: 'OpenClaw Core', type: 'Orchestrator', monthlyCost: 0, notes: 'Docker-based, free' },
    ],

    // Nano/Mini Models for OpenClaw
    nanoModels: [
        { name: 'Phi-3.5 Mini 3.8B', provider: 'Microsoft', vram: '3GB', quality: 7, uncensored: false },
        { name: 'Gemma 2 2B', provider: 'Google', vram: '2GB', quality: 6, uncensored: false },
        { name: 'TinyLlama 1.1B', provider: 'Community', vram: '1GB', quality: 4, uncensored: true },
        { name: 'Qwen2.5 0.5B', provider: 'Alibaba', vram: '1GB', quality: 5, uncensored: true },
        { name: 'Qwen2.5 1.5B', provider: 'Alibaba', vram: '1.5GB', quality: 6, uncensored: true },
        { name: 'Qwen2.5 3B', provider: 'Alibaba', vram: '2.5GB', quality: 7, uncensored: true },
        { name: 'SmolLM2 1.7B', provider: 'HuggingFace', vram: '1.5GB', quality: 6, uncensored: true },
        { name: 'StableLM Zephyr 3B', provider: 'Stability', vram: '2.5GB', quality: 6, uncensored: true },
        { name: 'Llama 3.2 1B', provider: 'Meta', vram: '1GB', quality: 5, uncensored: true },
        { name: 'Llama 3.2 3B', provider: 'Meta', vram: '2.5GB', quality: 7, uncensored: true },
        { name: 'Danube3 500M', provider: 'H2O', vram: '0.5GB', quality: 3, uncensored: true },
        { name: 'MiniCPM 2B', provider: 'OpenBMB', vram: '2GB', quality: 6, uncensored: false },
        { name: 'InternLM2 1.8B', provider: 'Shanghai AI', vram: '1.5GB', quality: 6, uncensored: false },
        { name: 'Yi-Coder 1.5B', provider: '01.AI', vram: '1.5GB', quality: 5, uncensored: true },
        { name: 'DeepSeek Coder 1.3B', provider: 'DeepSeek', vram: '1.5GB', quality: 6, uncensored: true },
    ],

    // Debug Models & Best Pairings
    debugModels: [
        { name: 'Aider + DeepSeek R1', type: 'Code debug', notes: 'Best cost/perf for automated debugging' },
        { name: 'Aider + Claude Sonnet', type: 'Code debug', notes: 'Highest accuracy, expensive' },
        { name: 'SWE-Agent + GPT-4o', type: 'GitHub issues', notes: 'Automated PR generation' },
        { name: 'Continue.dev + Qwen Coder 7B', type: 'IDE debug', notes: 'Free local, good for small fixes' },
        { name: 'Continue.dev + Codestral', type: 'IDE debug', notes: 'Best local code completion' },
        { name: 'Cursor + Claude Sonnet', type: 'IDE debug', notes: 'Premium IDE experience' },
        { name: 'Tabby + StarCoder2 3B', type: 'Code completion', notes: 'Local, lightweight' },
        { name: 'OpenHands + DeepSeek V3', type: 'Full-stack debug', notes: 'Cheapest cloud agent' },
    ],

    // Voice Bot API costs
    voiceBots: [
        { name: 'Vapi.ai', costPerMin: 0.05, notes: 'Full voice agent platform' },
        { name: 'Retell.ai', costPerMin: 0.08, notes: 'Conversation AI' },
        { name: 'Bland.ai', costPerMin: 0.09, notes: 'Phone calls' },
        { name: 'ElevenLabs Conv. AI', costPerMin: 0.12, notes: 'Highest quality voice' },
        { name: 'PlayAI Agent', costPerMin: 0.06, notes: 'Customizable' },
        { name: 'Google Dialogflow CX', costPerMin: 0.007, notes: 'Per request, not per minute' },
        { name: 'Gemini Fast Bot', costPerMin: 0.002, notes: 'AI Studio, text-based' },
        { name: 'Grok Fast Bot', costPerMin: 0.003, notes: 'API, text-based' },
    ]
};

const ROLES = [
    { id: 'coder', name: '🧑‍💻 Coder / Developer', desc: 'Code generation, debugging, refactoring' },
    { id: 'researcher', name: '🔬 Researcher', desc: 'Deep analysis, paper reading, summarization' },
    { id: 'writer', name: '✍️ Content Writer', desc: 'Blog posts, marketing, documentation' },
    { id: 'analyst', name: '📊 Data Analyst', desc: 'Data processing, visualization, reporting' },
    { id: 'assistant', name: '🤖 General Assistant', desc: 'Q&A, tasks, scheduling, emails' },
    { id: 'translator', name: '🌐 Translator', desc: 'Multi-language translation' },
    { id: 'designer', name: '🎨 Creative / Design', desc: 'Image gen prompts, UI/UX ideas' },
    { id: 'security', name: '🔒 Security / Audit', desc: 'Code review, vulnerability scanning' },
];
