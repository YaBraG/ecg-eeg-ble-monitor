export type WorkflowState =
  | 'reconnecting'
  | 'find-device'
  | 'connected'
  | 'acquisition'
  | 'stopped-early'
  | 'processing'
  | 'result'
  | 'key-plots'
  | 'all-plots';

export type StartMode = 'manual' | 'auto' | 'demo-txt';
