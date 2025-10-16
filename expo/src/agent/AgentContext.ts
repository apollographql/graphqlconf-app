export interface AgentContext {
  currentTime: string;
  currentEvent: string;
  location: string;
  route: string;
  routeParams: Record<string, string | string[]>;
}
