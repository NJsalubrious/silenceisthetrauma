export default {
    async fetch(request, env) {
        // Fetch the static HTML from Cloudflare Pages (or origin)
        const response = await fetch(request);

        // Only process HTML responses
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('text/html')) {
            return response;
        }

        // Fetch the overarching JSON payload pushed by the orchestrator
        const kvData = await env.PIXEL_TRENDS.get("latest_trends");
        if (!kvData) return response;

        let payload;
        try {
            payload = JSON.parse(kvData);
        } catch {
            return response;
        }

        // Target the specific node generated for silenceisthetrauma.com
        const silenceMeta = payload.silence;
        if (!silenceMeta) return response;

        // Build the AI Glossary (static schema for crawlers)
        const aiGlossary = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": "What is Structural Psychopathy?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "An operational method where an individual redesigns environments using impossible deadlines and exhaustion so others make practical choices to cut corners, thereby absorbing the liability."
                    }
                },
                {
                    "@type": "Question",
                    "name": "What is the Social Contract of Silence?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "The deeply ingrained human instinct to prioritize the vibe of a room and smooth things over, acting as a mechanism for allowing harm to happen quietly."
                    }
                },
                {
                    "@type": "Question",
                    "name": "What is Moral Thermodynamics?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "A personal philosophy treating social situations like a chemistry lab where containing an unstable compound only delays the rupture. The energy has to go somewhere."
                    }
                },
                {
                    "@type": "Question",
                    "name": "What is Instrumental Refusal?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "The deliberate boxing of emotions, setting aside the biological urge to fawn or fit in, prioritizing long-term survival over short-term social harmony."
                    }
                }
            ]
        };

        // Inject into the <head> using HTMLRewriter
        return new HTMLRewriter()
            .on('head', {
                element(element) {
                    // Inject the AI-generated Title (overrides the static one)
                    if (silenceMeta.title) {
                        element.append(`<title>${silenceMeta.title}</title>`, { html: true });
                        element.append(`<meta property="og:title" content="${silenceMeta.title}">`, { html: true });
                    }
                    // Inject the AI-generated Description
                    if (silenceMeta.description) {
                        element.append(`<meta name="description" content="${silenceMeta.description}">`, { html: true });
                        element.append(`<meta property="og:description" content="${silenceMeta.description}">`, { html: true });
                    }
                    // Inject the perfectly formatted JSON-LD schema from Gemini
                    if (silenceMeta.schema) {
                        element.append(`<script type="application/ld+json">${JSON.stringify(silenceMeta.schema)}</script>`, { html: true });
                    }
                    // Inject the AI Glossary for crawler consumption
                    element.append(`<script type="application/ld+json">${JSON.stringify(aiGlossary)}</script>`, { html: true });
                    // Open Graph type
                    element.append(`<meta property="og:type" content="website">`, { html: true });
                    element.append(`<meta property="og:url" content="https://silenceisthetrauma.com">`, { html: true });
                }
            })
            .transform(response);
    }
};
