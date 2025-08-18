// Lightweight GPT client for hackathon use.
// Note: Using API keys directly in the browser is insecure. Prefer a server proxy in production.

export interface CityDataForAI {
	size: number;
	population: number;
	populationDensity: number;
	averageIncome: number;
	ageDiversity: number;
	climate: string;
	terrain: string;
	environmentalRisk: number;
}

export async function fetchRoadSuggestions(city: CityDataForAI): Promise<string> {
	const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
	if (!apiKey) {
		return 'Missing VITE_OPENAI_API_KEY. Add it to a .env file and restart: VITE_OPENAI_API_KEY=sk-...';
	}

	const model = (import.meta.env.VITE_OPENAI_MODEL as string) || 'gpt-5';

	const prompt = `You are an urban mobility expert. Given this city context, propose 3-5 concise, actionable road network improvements tailored to a ${city.size}x${city.size} grid.
City data:
- Population: ${city.population.toLocaleString()} (density: ${city.populationDensity}/km²)
- Average income: $${city.averageIncome}
- Age diversity index: ${city.ageDiversity}
- Climate: ${city.climate}
- Terrain: ${city.terrain}
- Environmental risk: ${city.environmentalRisk}

Constraints:
- Favor a clear arterial grid with periodic collectors and some diagonals.
- Note any terrain/climate considerations in 1 line.
- Keep each suggestion under 25 words.
Output as a numbered list.`;

	try {
		const response = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify({
				model,
				messages: [
					{ role: 'system', content: 'You are a helpful urban planning assistant.' },
					{ role: 'user', content: prompt },
				],
				temperature: 0.5,
				max_tokens: 300,
			}),
		});

		if (!response.ok) {
			const text = await response.text();
			return `AI request failed (${response.status}): ${text}`;
		}

		const data = await response.json();
		const content: string | undefined = data?.choices?.[0]?.message?.content;
		return content || 'No suggestions returned.';
	} catch (error: any) {
		return `AI error: ${error?.message || 'Unknown error'}`;
	}
}



