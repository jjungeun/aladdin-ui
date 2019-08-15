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
  Card,
  CardTitle,
  CardBody
} from 'patternfly-react';
import update from 'react-addons-update';
import { DashboardPropType } from '../../types/Dashboard';

const cardTitleStyle = style({ 
  fontSize: '25px',
  fontWeight: 600
});

const cardBodyStyle = style({
  fontSize: '35px',
  fontWeight: 'bold'
});

type State = {
  node: string[];
  daemonSetTotal: number;
  daemonSetReady: number;
  deploymentTotal: number;
  deploymentReady: number; 
  replicaSetTotal: number;
  replicaSetReady: number;
  podTotal: number;
  podReady: number;
};

class CardK8sWorkloads extends React.Component<DashboardPropType, State> {
  private metricsPromise?: CancelablePromise<Response<InfraMetrics>>;

  constructor(props: DashboardPropType) {
    super(props);
    this.state = {
      node: [],
      daemonSetTotal: 0,
      daemonSetReady: 0,
      deploymentTotal: 0,
      deploymentReady: 0,
      replicaSetTotal: 0,
      replicaSetReady: 0,
      podTotal: 0,
      podReady: 0
    };
  }
  componentWillMount() {
    this.load();
  }

  load = () => {
    const optionsDaemonSetsTotal: InfraMetricsOptions = {
      filters: ['daemonset_labels'],
    };
    const daemonSetTotalProm = API.getInfraMetrics(optionsDaemonSetsTotal);
    
    this.metricsPromise = makeCancelablePromise(mergeInfraMetricsResponses([daemonSetTotalProm]));
    this.metricsPromise.promise
    .then(response => {
      const metrics = response.data.metrics;
      this.setState({
        daemonSetTotal: update(
          this.state.daemonSetTotal,
          {
            $set: metrics.daemonset_labels.matrix.length
          }
        )
      });
    });

    const optionsDaemonSetsReady: InfraMetricsOptions = {
      filters: ['daemonset_unavailable']
    };
    const daemonSetReadyProm = API.getInfraMetrics(optionsDaemonSetsReady);

    this.metricsPromise = makeCancelablePromise(mergeInfraMetricsResponses([daemonSetReadyProm]));
    this.metricsPromise.promise
    .then(response => {
      const metrics = response.data.metrics;
      let currentDaemonSet = 0;
      for (let j = 0; j < metrics.daemonset_unavailable.matrix.length; j++) {
        if (metrics.daemonset_unavailable.matrix[j].values.slice(-1)[0][1] * 1 === 0) {
          currentDaemonSet = currentDaemonSet + 1;
        }
      }
      this.setState({
        daemonSetReady: update(
          this.state.daemonSetReady,
          {
            $set: currentDaemonSet
          }
        )
      });
    });

    const optionsDeploymentsTotal: InfraMetricsOptions = {
      filters: ['deployment_labels'],
    };
    const deploymentTotalProm = API.getInfraMetrics(optionsDeploymentsTotal);
    
    this.metricsPromise = makeCancelablePromise(mergeInfraMetricsResponses([deploymentTotalProm]));
    this.metricsPromise.promise
    .then(response => {
      const metrics = response.data.metrics;
      this.setState({
        deploymentTotal: update(
          this.state.deploymentTotal,
          {
            $set: metrics.deployment_labels.matrix.length
          }
        )
      });
    });

    const optionsDeploymentReady: InfraMetricsOptions = {
      filters: ['deployment_labels', 'deployment_status_replicas', 'deployment_status_replicas_available']
    };
    const deploymentReadyProm = API.getInfraMetrics(optionsDeploymentReady);

    this.metricsPromise = makeCancelablePromise(mergeInfraMetricsResponses([deploymentReadyProm]));
    this.metricsPromise.promise
    .then(response => {
      const metrics = response.data.metrics;
      let currentDeployment = 0;
      
      for (let j = 0; j < metrics.deployment_labels.matrix.length; j++) {
        if (metrics.deployment_status_replicas.matrix[j].values.slice(-1)[0][1]
        === metrics.deployment_status_replicas_available.matrix[j].values.slice(-1)[0][1]) {
          currentDeployment = currentDeployment + 1;
        }
      }
      this.setState({
        deploymentReady: update(
          this.state.deploymentReady,
          {
            $set: currentDeployment
          }
        )
      });
    });

    const optionsReplicaSetTotal: InfraMetricsOptions = {
      filters: ['replicaset_labels'],
    };
    const replicaSetTotalProm = API.getInfraMetrics(optionsReplicaSetTotal);
    
    this.metricsPromise = makeCancelablePromise(mergeInfraMetricsResponses([replicaSetTotalProm]));
    this.metricsPromise.promise
    .then(response => {
      const metrics = response.data.metrics;
      this.setState({
        replicaSetTotal: update(
          this.state.replicaSetTotal,
          {
            $set: metrics.replicaset_labels.matrix.length
          }
        )
      });
    });

    const optionsReplicaSetReady: InfraMetricsOptions = {
      filters: ['replicaset_labels', 'replicaset_status_replicas', 'deployment_status_replicas_available'],
    };
    const replicaSetReadyProm = API.getInfraMetrics(optionsReplicaSetReady);
    
    this.metricsPromise = makeCancelablePromise(mergeInfraMetricsResponses([replicaSetReadyProm]));
    this.metricsPromise.promise
    .then(response => {
      const metrics = response.data.metrics;
      let currentReplicaSet = 0;

      metrics.replicaset_status_replicas.matrix.sort((a, b) => {
        return (a.metric.replicaset < b.metric.replicaset) ? -1 : (a.metric.replicaset > b.metric.replicaset) ? 1 : 0;
      });

      metrics.deployment_status_replicas_available.matrix.sort((a, b) => {
        return (a.metric.replicaset < b.metric.replicaset) ? -1 : (a.metric.replicaset > b.metric.replicaset) ? 1 : 0;
      });
      
      for (let j = 0; j < metrics.replicaset_labels.matrix.length; j++) {
        if (metrics.replicaset_status_replicas.matrix[j].values.slice(-1)[0][1] * 1 === 0 
        || metrics.replicaset_status_replicas.matrix[j].values.slice(-1)[0][1] 
            === metrics.deployment_status_replicas_available.matrix[j].values.slice(-1)[0][1]) {
          currentReplicaSet = currentReplicaSet + 1;
        }
      }
      this.setState({
        replicaSetReady: update(
          this.state.replicaSetReady,
          {
            $set: currentReplicaSet
          }
        )
      });
    });

    const optionsPodsTotal: InfraMetricsOptions = {
      filters: ['pod_labels'],
    };
    const podTotalProm = API.getInfraMetrics(optionsPodsTotal);
    
    this.metricsPromise = makeCancelablePromise(mergeInfraMetricsResponses([podTotalProm]));
    this.metricsPromise.promise
    .then(response => {
      const metrics = response.data.metrics;
      this.setState({
        podTotal: update(
          this.state.podTotal,
          {
            $set: metrics.pod_labels.matrix.length
          }
        )
      });
    });

    const optionsPodReady: InfraMetricsOptions = {
      filters: ['pod_status_phase'],
      phase: 'Running',
    };
    const podReadyProm = API.getInfraMetrics(optionsPodReady);
    
    this.metricsPromise = makeCancelablePromise(mergeInfraMetricsResponses([podReadyProm]));
    this.metricsPromise.promise
    .then(response => {
      const metrics = response.data.metrics;
      this.setState({
        podReady: update(
          this.state.podReady,
          {
            $set: metrics.pod_status_phase.matrix.length
          }
        )
      });
    });
  }

  render() {
    const [sm, md] = [12, 3];
    return (
      this.props.name.map(name => {
        return (
          // aTODO: Card 스타일 바꾸기
          <Col sm={sm} md={md} key={name}>
            <Card matchHeight={true} accented={true} aggregated={true}>
              <CardTitle className={cardTitleStyle}>
                {name}
              </CardTitle>
              <CardBody className={cardBodyStyle}>
                {this.renderStatuse(name)}
              </CardBody>
            </Card>
          </Col>
        );
      })
    );
  }

  renderStatuse(name: String) {
    if ( name === 'Daemon Sets') {
      return this.state.daemonSetReady + '/' + this.state.daemonSetTotal;
    } else if ( name === 'Deployments') {
       return this.state.deploymentReady + '/' + this.state.deploymentTotal;
    } else if (name === 'Replica Sets') {
      return this.state.replicaSetReady + '/' + this.state.replicaSetTotal;
    } else if (name === 'Pods') {
      return this.state.podReady + '/' + this.state.podTotal;
    }
    return ;
  }
}

export default CardK8sWorkloads;