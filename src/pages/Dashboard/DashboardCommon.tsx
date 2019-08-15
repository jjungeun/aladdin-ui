import * as M from '../../types/Metrics';
import { Response } from '../../services/Api';

export const mergeInfraMetricsResponses = (promises: Promise<Response<M.InfraMetrics>>[]): Promise<Response<M.InfraMetrics>> => {
  return Promise.all(promises).then(responses => {
    const metrics: M.InfraMetrics = {
      metrics: {}
    };
    responses.forEach(r => {
      Object.keys(r.data.metrics).forEach(k => {
        metrics.metrics[k] = r.data.metrics[k];
      });
    });
    return {
      data: metrics
    };
  });
};

export interface InfraMetricsQuery {
  rateInterval?: string;
  rateFunc?: string;
  avg?: boolean;
  byLabels?: string[];
}