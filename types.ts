
export enum ProcessingStep {
  IDLE = "IDLE",
  GENERATING_SPARQL = "GENERATING_SPARQL",
  QUERYING_KG = "QUERYING_KG",
  GENERATING_ANSWER = "GENERATING_ANSWER",
  DONE = "DONE",
  ERROR = "ERROR",
}

export interface KGResult {
  head: {
    vars: string[];
  };
  results: {
    bindings: Record<string, { type: string; value: string }>[];
  };
}
