
import React, { useState, useCallback } from 'react';
import { ProcessingStep, KGResult } from './types';
import { generateSparqlQuery, generateAnswerFromFacts, generateGeneralAnswer } from './services/geminiService';
import { executeSparqlQuery } from './services/dbpediaService';
import QueryInput from './components/QueryInput';
import ResultsDisplay from './components/ResultsDisplay';

const App: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [sparqlQuery, setSparqlQuery] = useState<string>('');
  const [kgResults, setKgResults] = useState<KGResult | null>(null);
  const [finalAnswer, setFinalAnswer] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<ProcessingStep>(ProcessingStep.IDLE);
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setSparqlQuery('');
    setKgResults(null);
    setFinalAnswer('');
    setError(null);
    setCurrentStep(ProcessingStep.IDLE);
  };

  const handleSubmit = useCallback(async () => {
    if (!query.trim()) return;

    resetState();
    setCurrentStep(ProcessingStep.GENERATING_SPARQL);

    try {
      // Step 1: Generate SPARQL query
      const sQuery = await generateSparqlQuery(query);
      setSparqlQuery(sQuery);
      setCurrentStep(ProcessingStep.QUERYING_KG);

      // Step 2: Execute SPARQL query
      const results = await executeSparqlQuery(sQuery);
      setKgResults(results);
      setCurrentStep(ProcessingStep.GENERATING_ANSWER);
      
      // Step 3: Generate final answer from facts
      const answer = await generateAnswerFromFacts(query, results);
      setFinalAnswer(answer);
      setCurrentStep(ProcessingStep.DONE);

    } catch (e: any) {
        console.error("An error occurred during the process:", e);
        setError(`Error at step ${currentStep}: ${e.message}. Attempting to generate a general answer.`);
        setCurrentStep(ProcessingStep.ERROR);
        // Fallback to general LLM answer if any step fails
        try {
            const generalAnswer = await generateGeneralAnswer(query);
            setFinalAnswer(generalAnswer);
        } catch (fallbackError: any) {
             setError(`The entire pipeline failed. Initial Error: ${e.message}. Fallback Error: ${fallbackError.message}`);
        }
    }
  }, [query, currentStep]);

  const isLoading = currentStep !== ProcessingStep.IDLE && currentStep !== ProcessingStep.DONE && currentStep !== ProcessingStep.ERROR;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <main className="container mx-auto p-4 md:p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-teal-300">
            Knowledge-Grounded Q&A
          </h1>
          <p className="mt-2 text-lg text-slate-400">
            Combining Knowledge Graphs with LLMs to reduce hallucinations.
          </p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg">
            <QueryInput 
              query={query}
              setQuery={setQuery}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
          <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg min-h-[20rem]">
            <ResultsDisplay
              step={currentStep}
              sparqlQuery={sparqlQuery}
              kgResults={kgResults}
              finalAnswer={finalAnswer}
              error={error}
            />
          </div>
        </div>
         <footer className="text-center mt-12 text-slate-500 text-sm">
            <p>Powered by Gemini and DBpedia SPARQL</p>
        </footer>
      </main>
    </div>
  );
};

export default App;
