import { MetricsQuery } from 'k-charted-react';
import { InfraMetricsQuery } from '../pages/Dashboard/DashboardCommon'

export interface IstioMetricsOptions extends MetricsQuery {
  direction: Direction;
  filters?: string[];
  requestProtocol?: string;
  reporter: Reporter;
}

// aladdin
export interface InfraMetricsOptions extends InfraMetricsQuery {
  filters?: string[];
  condition?: string;
  status?: string;
  phase?:	string;
  mode?: string;
  id?: string;
  containerName?: string;
  podName?:	string;
}
export type Reporter = 'source' | 'destination';
export type Direction = 'inbound' | 'outbound';
