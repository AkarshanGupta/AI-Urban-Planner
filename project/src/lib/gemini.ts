import { GoogleGenerativeAI } from '@google/generative-ai';

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

function getClient() {
	const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
	if (!apiKey) return null;
	return new GoogleGenerativeAI(apiKey);
}

export async function geminiRoadSuggestions(city: CityDataForAI): Promise<string> {
	const client = getClient();
	if (!client) return 'Missing VITE_GEMINI_API_KEY. Add it to a .env file and restart.';
	const modelName = (import.meta.env.VITE_GEMINI_MODEL as string) || 'gemini-1.5-flash';
	const model = client.getGenerativeModel({ model: modelName });
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

	const res = await model.generateContent(prompt);
	return res.response.text() || 'No suggestions returned.';
}

export async function geminiAnalytics(userPrompt: string, city: CityDataForAI): Promise<string> {
	const client = getClient();
	if (!client) return 'Missing VITE_GEMINI_API_KEY. Add it to a .env file and restart.';
	const modelName = (import.meta.env.VITE_GEMINI_MODEL as string) || 'gemini-1.5-flash';
	const model = client.getGenerativeModel({ model: modelName });
	const sys = 'You are a smart-city analytics assistant. Use the provided city parameters to ground your analysis. Be concise and structured.';
	const prompt = `${sys}\n\nCity parameters:\nsize=${'${city.size}'}\npopulation=${'${city.population}'}\ndensity=${'${city.populationDensity}'}\naverageIncome=${'${city.averageIncome}'}\nageDiversity=${'${city.ageDiversity}'}\nclimate=${'${city.climate}'}\nterrain=${'${city.terrain}'}\nenvironmentalRisk=${'${city.environmentalRisk}'}\n\nUser question:\n${'${userPrompt}'}\n\nReturn a brief answer with bullet points where helpful.`;

	const res = await model.generateContent(prompt);
	return res.response.text() || 'No analysis available.';
}




