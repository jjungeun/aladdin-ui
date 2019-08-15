import * as React from 'react';
import { CancelablePromise, makeCancelablePromise } from '../../utils/CancelablePromises';
import { IstioMetricsOptions } from '../../types/MetricsOptions';
import * as API from '../../services/Api';
import { Response } from '../../services/Api';
import { Metrics } from '../../types/Metrics';
import { SummaryPanelPropType } from '../../types/Graph';
import { MyTable } from '../../components/SummaryPanel/MyTable';
import { shouldRefreshData } from './SummaryPanelCommon';
import { mergeMetricsResponses } from './SummaryPanelCommon';
import update from 'react-addons-update';

type MyTableState = {
  loading: boolean
  meshData: [
    {
      id: number;
      service: string;
      workload: string;
      requests: number;
      p50Latency: number;
      p90Latency: number;
      p99Latency: number;
      successRate: number;
    }
  ]
};

export class MyTablePage extends React.Component<SummaryPanelPropType, MyTableState> {
  private metricsPromise?: CancelablePromise<Response<Metrics>>;
  constructor(props: SummaryPanelPropType) {
    super(props);
    this.state = {
      loading: false,
      meshData: [
        {
          id: 0,
          service: '',
          workload: '',
          p50Latency: 0,
          p90Latency: 0,
          p99Latency: 0,
          requests: 0,
          successRate: 0
        }
      ]
    };
  }

  componentDidMount() {
    if (this.shouldShowMyTable()) {
      this.updateMyTable(this.props);
      this.setState({
        loading: true,
      });
    }
  }

  componentDidUpdate(prevProps: SummaryPanelPropType) {
    if (shouldRefreshData(prevProps, this.props)) {
      if (this.shouldShowMyTable()) {
        this.updateMyTable(this.props);
      }
    }
  }

  componentWillUnmount() {
    if (this.metricsPromise) {
      this.metricsPromise.cancel();
    }
  }

  render() {
    return (
      <div>
        <table className="table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Workload</th>
              <th>Requests</th>
              <th>P50 Latency</th>
              <th>P90 Latency</th>
              <th>P99 Latency</th>
              <th>Success Rate</th>
            </tr>
          </thead>
          <tbody>
            {(this.state.meshData || []).map((mesh, id) => {
              return(
                <MyTable 
                  key={id}
                  id={id}
                  service={mesh.service}
                  workload={mesh.workload}
                  requests={mesh.requests}
                  p50Latency={mesh.p50Latency}
                  p90Latency={mesh.p90Latency}
                  p99Latency={mesh.p99Latency}
                  successRate={mesh.successRate}
                />);
            })}
          </tbody>
        </table>
      </div>
    );
  }

  private shouldShowMyTable() {
    // TODO we omit the rps chart when dealing with multiple namespaces. There is no backend
    // API support to gather the data. The whole-graph chart is of nominal value, it will likely be OK.
    return this.props.namespaces.length >= 1;
  }

  private updateMyTable = (props: SummaryPanelPropType) => {
    const objectLists: Array<object> = [];
    const serviceKey = 'destination_service';
    const workloadKey = 'destination_workload';

    for (let i = 0; i < this.props.namespaces.length; i++) {
      const optionsRequest: IstioMetricsOptions = {
        filters: ['request_count', 'request_error_count'],
        queryTime: props.queryTime,
        duration: props.duration,
        step: props.step,
        rateInterval: props.rateInterval,
        direction: 'inbound',
        reporter: 'destination',
        byLabels: ['destination_workload', 'destination_workload_namespace', 'destination_service'],
      };
      const promiseRequest = API.getNamespaceMetrics(props.namespaces[i].name, optionsRequest);

      const optionsLatency: IstioMetricsOptions = {
        filters: ['request_duration'],
        queryTime: props.queryTime,
        duration: props.duration,
        step: props.step,
        rateInterval: props.rateInterval,
        direction: 'inbound',
        reporter: 'destination',
        byLabels: ['destination_workload', 'destination_workload_namespace'],
        quantiles: ['0.5', '0.9', '0.99']
      };
      const promiseLatency = API.getNamespaceMetrics(props.namespaces[i].name, optionsLatency);
      this.metricsPromise = makeCancelablePromise(mergeMetricsResponses([promiseRequest, promiseLatency]));

      this.metricsPromise.promise
      .then(response => {
        const metrics = response.data.metrics;
        const histograms = response.data.histograms;
        for (let j = 0; j < metrics.request_count.matrix.length; j++) {
          const service = metrics.request_count.matrix[j].metric[serviceKey];
          const workload = metrics.request_count.matrix[j].metric[workloadKey];
          const requestRate = metrics.request_count.matrix[j].values.slice(-1)[0][1] * 1;
          const rt50 = histograms.request_duration['0.5'];
          const rt90 = histograms.request_duration['0.9'];
          const rt99 = histograms.request_duration['0.99'];
          const p50Latency = rt50.matrix[j].values.slice(-1)[0][1] * 1000;
          const p90Latency = rt90.matrix[j].values.slice(-1)[0][1] * 1000;
          const p99Latency = rt99.matrix[j].values.slice(-1)[0][1] * 1000;
          let errorTotal = 0;
          if (metrics.request_error_count.matrix.length !== 0) {
            errorTotal = metrics.request_error_count.matrix[j].values.slice(-1)[0][1];
          }
          const successRate = (errorTotal !== 0) ? (errorTotal / requestRate) * 100 : 100;
          objectLists.push(
            {
              service: service,
              workload: workload,
              requests: requestRate,
              p50Latency: p50Latency,
              p90Latency: p90Latency,
              p99Latency: p99Latency,
              successRate: successRate
            }
          );
        }
        if (!this.state.loading) {
          this.setState({
            meshData: update(
              this.state.meshData,
              {
                $splice: [[0, 1]],
                $push: objectLists
              }
            ),
          });
        } else {
            this.setState({
              meshData: update(
                this.state.meshData,
                {
                  $set: objectLists
                }
              ),
            });
          }
        });
    }
  }
}