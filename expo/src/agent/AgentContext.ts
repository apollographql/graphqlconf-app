export interface AgentContext {
  currentTime: string;
  currentEvent: string;
  location: string;
  route: string;
  routeParams: Record<string, string | string[]>;
}

export interface AgentInternalContext extends AgentContext {
  executeQuery: (
    query: string,
    variables?: Record<string, any>
  ) => Promise<any>;
}
