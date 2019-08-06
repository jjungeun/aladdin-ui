import * as React from 'react';
import { InfraMetricsOptions } from '../../../src/types/MetricsOptions';
import * as API from '../../services/Api';
import { CancelablePromise, makeCancelablePromise } from '../../utils/CancelablePromises';
import { Response } from '../../services/Api';
import { InfraMetrics } from '../../types/Metrics';
import { mergeInfraMetricsResponses } from './DashBoardCommon';
// jungeun
type Props = {
  name: string;
};

type State = {
  node: string[];
//  values: number[];
};

class DashBoardCardContent extends React.Component<Props, State> {
  private metricsPromise?: CancelablePromise<Response<InfraMetrics>>;

  constructor(props: Props) {
    super(props);
    this.state = {
      node: [],
//      values: [],
    };
  }

  render() {
    if ( this.props.name === 'Nodes') {
      const options: InfraMetricsOptions = {
        filters: ['node_labels'],
      };
      const infraprom = API.getInfraMetrics(options);
      
      this.metricsPromise = makeCancelablePromise(mergeInfraMetricsResponses([infraprom]));
      this.metricsPromise.promise
      .then(response => {
        const metrics = response.data.metrics;
        for (let j = 0; j < metrics.node_labels.matrix.length; j++) {
          this.state.node.push(metrics.node_labels.matrix[j].metric.node);
        }
//        this.state.values.push(metrics.node_labels.matrix.length)
        
      });
      return (
        <div>{this.state.node}</div>
      );
    }
    return (
      <div>{'ddd'}</div>
    );
  }
}

export default DashBoardCardContent;