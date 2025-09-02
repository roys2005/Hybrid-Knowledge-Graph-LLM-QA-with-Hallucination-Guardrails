
import React from 'react';
import { ProcessingStep, KGResult } from '../types';
import DatabaseIcon from './icons/DatabaseIcon';
import SparklesIcon from './icons/SparklesIcon';
import LoadingSpinner from './icons/LoadingSpinner';

interface ResultsDisplayProps {
  step: ProcessingStep;
  sparqlQuery: string;
  kgResults: KGResult | null;
  finalAnswer: string;
  error: string | null;
}

const stepMessages: Record<ProcessingStep, string> = {
  [ProcessingStep.IDLE]: '',
  [ProcessingStep.GENERATING_SPARQL]: 'Generating SPARQL query from your question...',
  [ProcessingStep.QUERYING_KG]: 'Querying the DBpedia Knowledge Graph...',
  [ProcessingStep.GENERATING_ANSWER]: 'Generating a natural language answer...',
  [ProcessingStep.DONE]: 'Process complete.',
  [ProcessingStep.ERROR]: 'An error occurred.',
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  step,
  sparqlQuery,
  kgResults,
  finalAnswer,
  error,
}) => {
  const isLoading = [
    ProcessingStep.GENERATING_SPARQL,
    ProcessingStep.QUERYING_KG,
    ProcessingStep.GENERATING_ANSWER,
  ].includes(step);

  if (step === ProcessingStep.IDLE) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 bg-slate-800 rounded-lg border-2 border-dashed border-slate-600">
          <p className="text-slate-400">Your results will appear here.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
       {isLoading && (
        <div className="flex items-center justify-center p-4 bg-slate-800 rounded-lg">
          <LoadingSpinner />
          <p className="ml-3 text-sky-300 font-medium">{stepMessages[step]}</p>
        </div>
      )}

      {error && (
         <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-300">
           <h3 className="font-bold">Error</h3>
           <p>{error}</p>
         </div>
      )}

      {sparqlQuery && (
        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
          <h3 className="flex items-center text-lg font-semibold text-teal-300 mb-2">
            <DatabaseIcon className="w-5 h-5 mr-2" />
            Generated SPARQL Query
          </h3>
          <pre className="bg-slate-900 p-3 rounded-md text-sm text-slate-300 overflow-x-auto">
            <code>{sparqlQuery}</code>
          </pre>
        </div>
      )}

      {kgResults && (
        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
          <h3 className="flex items-center text-lg font-semibold text-teal-300 mb-2">
            <DatabaseIcon className="w-5 h-5 mr-2" />
            Knowledge Graph Facts
          </h3>
          <pre className="bg-slate-900 p-3 rounded-md text-sm text-slate-300 overflow-x-auto max-h-60">
            <code>{JSON.stringify(kgResults, null, 2)}</code>
          </pre>
        </div>
      )}
      
      {finalAnswer && (
        <div className="p-4 bg-sky-900/30 rounded-lg border border-sky-700">
          <h3 className="flex items-center text-lg font-semibold text-sky-300 mb-2">
            <SparklesIcon className="w-5 h-5 mr-2" />
            Final Answer
          </h3>
          <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{finalAnswer}</p>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;
