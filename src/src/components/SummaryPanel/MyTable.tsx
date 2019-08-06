import * as React from 'react';

export type MyTablePropType = {
  id: number;
  service: string;
  workload: string;
  requests: number;
  p50Latency: number;
  p90Latency: number;
  p99Latency: number;
  successRate: number;
};

export class MyTable extends React.Component<MyTablePropType, {}> {
  render() {
    return (
        <tr>
          <td>{this.props.service}</td>
          <td>{this.props.workload}</td>
          <td>{this.props.requests.toFixed(2)} ops</td>
          <td>{this.props.p50Latency.toFixed(2)} ms</td>
          <td>{this.props.p90Latency.toFixed(2)} ms</td>
          <td>{this.props.p99Latency.toFixed(2)} ms</td>
          <td>{this.props.successRate}%</td>
        </tr>
    );
  }
}