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
	const prompt = `You are an urban mobility expert. Given this city context, propose 3-5 concise, actionable road network improvements tailored to a ${city.size}x${city.size} grid. Do not use Markdown; return plain text only.
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
Output as a numbered list in plain text.`;

	try {
		const res = await model.generateContent(prompt);
		const text = res.response.text() || 'No suggestions returned.';
		return toPlainText(text);
	} catch (err: any) {
		return `Gemini error: ${err?.message || 'Unknown error'}`;
	}
}

export async function geminiAnalytics(userPrompt: string, city: CityDataForAI): Promise<string> {
	const client = getClient();
	if (!client) return 'Missing VITE_GEMINI_API_KEY. Add it to a .env file and restart.';
	const modelName = (import.meta.env.VITE_GEMINI_MODEL as string) || 'gemini-1.5-flash';
	const model = client.getGenerativeModel({ model: modelName });
	const sys = 'You are a smart-city analytics assistant. Use the provided city parameters to ground your analysis. Be concise and structured. Do not use Markdown; return plain text only.';
	const prompt = `${sys}\n\nCity parameters:\nsize=${city.size}\npopulation=${city.population}\ndensity=${city.populationDensity}\naverageIncome=${city.averageIncome}\nageDiversity=${city.ageDiversity}\nclimate=${city.climate}\nterrain=${city.terrain}\nenvironmentalRisk=${city.environmentalRisk}\n\nUser question:\n${userPrompt}\n\nReturn a brief answer in plain text with numbered lines if listing items.`;

	try {
		const res = await model.generateContent(prompt);
		const text = res.response.text() || 'No analysis available.';
		return toPlainText(text);
	} catch (err: any) {
		return `Gemini error: ${err?.message || 'Unknown error'}`;
	}
}

// Best-effort sanitizer to remove Markdown formatting from model outputs
function toPlainText(input: string): string {
	let output = input;
	// Code fences
	output = output.replace(/```[\s\S]*?```/g, (block) => block.replace(/```/g, ''));
	// Inline code
	output = output.replace(/`([^`]*)`/g, '$1');
	// Images ![alt](url) -> alt
	output = output.replace(/!\[([^\]]*)\]\([^\)]*\)/g, '$1');
	// Links [text](url) -> text
	output = output.replace(/\[([^\]]+)\]\([^\)]*\)/g, '$1');
	// Bold/italic
	output = output.replace(/\*\*([^*]+)\*\*/g, '$1');
	output = output.replace(/__([^_]+)__/g, '$1');
	output = output.replace(/\*([^*]+)\*/g, '$1');
	output = output.replace(/_([^_]+)_/g, '$1');
	// Headings
	output = output.replace(/^\s{0,3}#{1,6}\s+/gm, '');
	// Blockquotes
	output = output.replace(/^\s*>\s?/gm, '');
	// Horizontal rules
	output = output.replace(/^\s*(-{3,}|\*{3,}|_{3,})\s*$/gm, '');
	// List markers: keep numbering, normalize bullets to "- " without extra symbols
	output = output.replace(/^\s*[\-*+]\s+/gm, '- ');
	output = output.replace(/^\s*(\d+)\.\s+/gm, '$1. ');
	// Excess spaces and blank lines
	output = output.replace(/\s+$/gm, '');
	output = output.replace(/\n{3,}/g, '\n\n');
	return output.trim();
}








