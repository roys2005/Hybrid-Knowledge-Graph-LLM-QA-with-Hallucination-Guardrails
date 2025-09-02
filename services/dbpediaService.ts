
import { KGResult } from '../types';

const DBPEDIA_ENDPOINT = "https://dbpedia.org/sparql";

export const executeSparqlQuery = async (query: string): Promise<KGResult> => {
  const url = new URL(DBPEDIA_ENDPOINT);
  url.searchParams.append("query", query);
  url.searchParams.append("format", "application/sparql-results+json");
  url.searchParams.append("timeout", "30000");

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Accept': 'application/sparql-results+json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DBpedia query failed with status ${response.status}: ${errorText}`);
  }

  const data: KGResult = await response.json();
  return data;
};
