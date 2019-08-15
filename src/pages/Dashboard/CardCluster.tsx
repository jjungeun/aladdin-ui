import * as React from 'react';
import { style } from 'typestyle';
import { InfraMetricsOptions } from '../../../src/types/MetricsOptions';
import * as API from '../../services/Api';
import { CancelablePromise, makeCancelablePromise } from '../../utils/CancelablePromises';
import { Response } from '../../services/Api';
import { InfraMetrics } from '../../types/Metrics';
import { mergeInfraMetricsResponses } from './DashboardCommon';
import { 
  Col,
  CardTitle,
  CardBody,
  UtilizationCard,
  UtilizationCardDetails,
  UtilizationCardDetailsCount,
  UtilizationCardDetailsDesc,
  UtilizationCardDetailsLine1,
  UtilizationCardDetailsLine2,
  DonutChart,
  patternfly
} from 'patternfly-react';
import update from 'react-addons-update';
import { DashboardPropType } from '../../types/Dashboard';

const cardTitleStyle = style({ 
  fontSize: '20px',
  fontWeight: 600
});

type State = {
  CpuTotal: number;
  CpuUsed: number;
  CpuUsage: number;
  MemTotal: number;
  MemUsed: number;
  MemUsage: number;
  PodTotal: number;
  PodUsed: number;
  PodUsage: number;
};

class CardCluster extends React.Component<DashboardPropType, State> {
  private metricsPromise?: CancelablePromise<Response<InfraMetrics>>;

  constructor(props: DashboardPropType) {
    super(props);
    this.state = {
      CpuTotal: 0,
      CpuUsed: 0,
      CpuUsage: 0,
      MemTotal: 0,
      MemUsed: 0,
      MemUsage: 0,
      PodTotal: 0,
      PodUsed: 0,
      PodUsage: 0
    };
  }
  componentWillMount() {
    this.load();
  }

  componentDidMount() {
    window.setInterval(this.load, 15000);
  }

  load = () => {
    const optionsCpuTotal: InfraMetricsOptions = {
      filters: ['machine_cpu_cores'],
    };
    const cpuTotalProm = API.getInfraMetrics(optionsCpuTotal);
    
    this.metricsPromise = makeCancelablePromise(mergeInfraMetricsResponses([cpuTotalProm]));
    this.metricsPromise.promise
    .then(response => {
      let sum = 0;
      const metrics = response.data.metrics;
      const cpuMetrics = metrics.machine_cpu_cores.matrix;
      for (let i = 0; i < cpuMetrics.length; i++) {
        sum += Number(cpuMetrics[i].values.slice(-1)[0][1]);
      }
      this.setState({
        CpuTotal: update(
          this.state.CpuTotal,
          {
            $set: sum
          }
        )
      });
    });

    const optionsCpuUsed: InfraMetricsOptions = {
      filters: ['container_cpu_usage_seconds_total'],
      id: '/',
      rateFunc: 'rate'
    };
    const cpuUsedProm = API.getInfraMetrics(optionsCpuUsed);

    this.metricsPromise = makeCancelablePromise(mergeInfraMetricsResponses([cpuUsedProm]));
    this.metricsPromise.promise
    .then(response => {
      let sum = 0;
      const metrics = response.data.metrics;
      const cpuMetrics = metrics.container_cpu_usage_seconds_total.matrix;
      for (let i = 0; i < cpuMetrics.length; i++) {
        sum += Number(cpuMetrics[i].values.slice(-1)[0][1]);
      }
      this.setState({
        CpuUsed: update(
          this.state.CpuUsed,
          {
            $set: sum
          }
        )
      });
    });

    const optionsMemTotal: InfraMetricsOptions = {
      filters: ['machine_memory_bytes'],
    };
    const memTotalProm = API.getInfraMetrics(optionsMemTotal);
    
    this.metricsPromise = makeCancelablePromise(mergeInfraMetricsResponses([memTotalProm]));
    this.metricsPromise.promise
    .then(response => {
      let sum = 0;
      const metrics = response.data.metrics;
      const memMetrics = metrics.machine_memory_bytes.matrix;
      for (let i = 0; i < memMetrics.length; i++) {
        sum += Number(memMetrics[i].values.slice(-1)[0][1]);
      }
      this.setState({
        MemTotal: update(
          this.state.MemTotal,
          {
            $set: sum
          }
        )
      });
    });

    const optionsMemUsed: InfraMetricsOptions = {
      filters: ['container_memory_usage_bytes'],
      rateFunc: 'rate'
    };
    const memUsedProm = API.getInfraMetrics(optionsMemUsed);

    this.metricsPromise = makeCancelablePromise(mergeInfraMetricsResponses([memUsedProm]));
    this.metricsPromise.promise
    .then(response => {
      let sum = 0;
      const metrics = response.data.metrics;
      const memMetrics = metrics.container_memory_usage_bytes.matrix;
      for (let i = 0; i < memMetrics.length; i++) {
        sum += Number(memMetrics[i].values.slice(-1)[0][1]);
      }
      this.setState({
        MemUsed: update(
          this.state.MemUsed,
          {
            $set: sum
          }
        )
      });
    });

    const optionsPodTotal: InfraMetricsOptions = {
      filters: ['node_status_allocatable_pods'],
    };
    const podTotalProm = API.getInfraMetrics(optionsPodTotal);
    
    this.metricsPromise = makeCancelablePromise(mergeInfraMetricsResponses([podTotalProm]));
    this.metricsPromise.promise
    .then(response => {
      let sum = 0;
      const metrics = response.data.metrics;
      const podMetrics = metrics.node_status_allocatable_pods.matrix;
      for (let i = 0; i < podMetrics.length; i++) {
        sum += Number(podMetrics[i].values.slice(-1)[0][1]);
      }
      this.setState({
        PodTotal: update(
          this.state.PodTotal,
          {
            $set: sum
          }
        )
      });
    });

    const optionsPodUsed: InfraMetricsOptions = {
      filters: ['pod_status_phase'],
      phase: 'Running'
    };
    const podUsedProm = API.getInfraMetrics(optionsPodUsed);

    this.metricsPromise = makeCancelablePromise(mergeInfraMetricsResponses([podUsedProm]));
    this.metricsPromise.promise
    .then(response => {
      let sum = 0;
      const metrics = response.data.metrics;
      const podMetrics = metrics.pod_status_phase.matrix;
      for (let i = 0; i < podMetrics.length; i++) {
        sum += Number(podMetrics[i].values.slice(-1)[0][1]);
      }
      this.setState({
        PodUsed: update(
          this.state.PodUsed,
          {
            $set: sum
          }
        )
      });
    });
  }

  render() {
    const [sm, md] = [12, 4];
    let available, total, used;
    return (
      this.props.name.map(name => {
        total = this.renderTotal(name);
        used = this.renderUsed(name);
        available = this.renderAvailable(name);
        return (
          <Col sm={sm} md={md} key={name}>
            <UtilizationCard>
              <CardTitle className={cardTitleStyle}>
                {name}
              </CardTitle>
              <CardBody>
                <UtilizationCardDetails>
                  <UtilizationCardDetailsCount>{available}</UtilizationCardDetailsCount>
                  <UtilizationCardDetailsDesc>
                    <UtilizationCardDetailsLine1>Available</UtilizationCardDetailsLine1>
                    <UtilizationCardDetailsLine2>of {total}</UtilizationCardDetailsLine2>
                  </UtilizationCardDetailsDesc>
                </UtilizationCardDetails>
                <DonutChart
                  title={{
                    primary: used,
                    secondary: 'Used'
                  }}
                  size={{ height: 150 }}
                  data={{
                    colors: {
                      Used: patternfly.pfPaletteColors.green400,
                      Available: patternfly.pfPaletteColors.black200,
                    },
                    columns: [
                      [
                        'Used',
                        used
                      ],
                      [
                        'Available',
                        available
                      ]
                    ],
                    groups: [
                      ['used', 'available']
                    ],
                    order: null,
                    type: 'donut'
                  }}
                  tooltip={{
                    contents: patternfly.pfDonutTooltipContents,
                    show: true,
                  }}
                />
              </CardBody>
            </UtilizationCard>
          </Col>
        );
      })
    );
  }

  // aTODO: 계산 맞는지 확인
  renderTotal(name: String) {
    if ( name === 'Cluster CPU Utilization') {
      return (this.state.CpuTotal).toFixed(0);
    } else if ( name === 'Cluster Memory Utilization') {
      return (this.state.MemTotal / Math.pow(10, 9)).toFixed(2);
    } else if (name === 'Cluster Pod Utilization') {
      return (this.state.PodTotal).toFixed(0);
    }
    return ;
  }

  renderAvailable(name: String) {
    if ( name === 'Cluster CPU Utilization') {
      return (this.state.CpuTotal - this.state.CpuUsed).toFixed(0);
    } else if ( name === 'Cluster Memory Utilization') {
      return (this.state.MemTotal / Math.pow(10, 9) - this.state.MemUsed / Math.pow(10, 9)).toFixed(2);
    } else if (name === 'Cluster Pod Utilization') {
      return (this.state.PodTotal - this.state.PodUsed).toFixed(0);
    }
    return ;
  }

  renderUsed(name: String) {
    if ( name === 'Cluster CPU Utilization') {
      return (this.state.CpuUsed).toFixed(0);
    } else if ( name === 'Cluster Memory Utilization') {
      return (this.state.MemUsed / Math.pow(10, 9)).toFixed(2);
    } else if (name === 'Cluster Pod Utilization') {
      return (this.state.PodUsed).toFixed(0);
    }
    return ;
  }
}

export default CardCluster;