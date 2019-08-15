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
import { Link } from 'react-router-dom';
//import history from '../../app/History';


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
  nodeTotal: number;
  nodeReady: number;
  namespaceTotal: number;
  namespaceActive: number;
};

class CardK8sCluster extends React.Component<DashboardPropType, State> {
  private metricsPromise?: CancelablePromise<Response<InfraMetrics>>;

  constructor(props: DashboardPropType) {
    super(props);
    this.state = {
      node: [],
      nodeTotal: 0,
      nodeReady: 0,
      namespaceTotal: 0,
      namespaceActive: 0,
    };
  }
  componentWillMount() {
    this.load();
  }
  
  componentDidMount() {
    window.setInterval(this.load, 15000);
  }
  // kch TODO: filters 줄이기
  load = () => {
    const optionsTotalnodes: InfraMetricsOptions = {
      filters: ['node_labels'],
    };
    const infraprom = API.getInfraMetrics(optionsTotalnodes);
    
    this.metricsPromise = makeCancelablePromise(mergeInfraMetricsResponses([infraprom]));
    this.metricsPromise.promise
    .then(response => {
      const metrics = response.data.metrics;
      for (let j = 0; j < metrics.node_labels.matrix.length; j++) {
        this.state.node.push(metrics.node_labels.matrix[j].metric.node);
      }
      this.setState({
        nodeTotal: update(
          this.state.nodeTotal,
          {
            $set: metrics.node_labels.matrix.length
          }
        )
      });
    });

    const optionsNodesState: InfraMetricsOptions = {
      filters: ['node_status_condition'],
      condition: 'Ready',
      status: 'true',
    };

    const nodeState = API.getInfraMetrics(optionsNodesState);
    this.metricsPromise = makeCancelablePromise(mergeInfraMetricsResponses([nodeState]));
    this.metricsPromise.promise
    .then(response => {
      const metrics = response.data.metrics;
      let currentNode = 0;
      for (let j = 0; j < metrics.node_status_condition.matrix.length; j++) {
        if (metrics.node_status_condition.matrix[j].values.slice(-1)[0][1] * 1 === 1) {
          currentNode = currentNode + 1;
        }
      }
      this.setState({
        nodeReady: update(
          this.state.nodeReady,
          {
            $set: currentNode
          }
        )
      });
    });

    // kch : 기존 문서와 다른 방법으로 쿼리를 보냄(위에선 2번 쿼리를 보내지만 아래의 코드는 1번만 보냄)
    // const optionsNodesState: InfraMetricsOptions = {
    //   filters: ['node_status_condition'],
    //   condition: 'Ready',
    //   status: 'true',
    // };
  
    // const nodeState = API.getInfraMetrics(optionsNodesState);
    // this.metricsPromise = makeCancelablePromise(mergeInfraMetricsResponses([nodeState]));
    // this.metricsPromise.promise
    // .then(response => {
    //   const metrics = response.data.metrics;
    //   let currentNode = 0;
    //   for (let j = 0; j < metrics.node_status_condition.matrix.length; j++) {
    //     if( metrics.node_status_condition.matrix[j].values.slice(-1)[0][1] == 1)
    //       currentNode = currentNode + 1;
    //   }
    //   this.setState({
    //     nodeReady: update(
    //       this.state.nodeReady,
    //       {
    //         $set: currentNode
    //       }
    //     )
    //   })
    //   this.setState({
    //     nodeTotal: update(
    //       this.state.nodeTotal,
    //       {
    //         $set: metrics.node_status_condition.matrix.length
    //       }
    //     )
    //   })
    // });

    const optionsNamespaceLabels: InfraMetricsOptions = {
      filters: ['namespace_labels'],
    };
    const namespaceAllProm = API.getInfraMetrics(optionsNamespaceLabels);

    this.metricsPromise = makeCancelablePromise(mergeInfraMetricsResponses([namespaceAllProm]));
    this.metricsPromise.promise
    .then(response => {
      const metrics = response.data.metrics;
      this.setState({
        namespaceTotal: update(
          this.state.namespaceTotal,
          {
            $set: metrics.namespace_labels.matrix.length
          }
        )
      });
    });

    const optionsNamespaceStatus: InfraMetricsOptions = {
      filters: ['namespace_status_phase'],
      phase: 'Active'
    };
    const namespaceCurrentProm = API.getInfraMetrics(optionsNamespaceStatus);
    
    this.metricsPromise = makeCancelablePromise(mergeInfraMetricsResponses([namespaceCurrentProm]));
    this.metricsPromise.promise
    .then(response => {
      const metrics = response.data.metrics;
      let currentNamespace = 0;
      for (let j = 0; j < metrics.namespace_status_phase.matrix.length; j++) {
        if (metrics.namespace_status_phase.matrix[j].values.slice(-1)[0][1] * 1 === 1) {
          currentNamespace = currentNamespace + 1;
        }
      }
      this.setState({
        namespaceActive: update(
          this.state.namespaceActive,
          {
            $set: currentNamespace
          }
        )
      });
    });
  }
  
//kch Link 추가
  render() {
    const [sm, md] = [12, 6];
    return (
      this.props.name.map(name => {
        return (
          <Col sm={sm} md={md} key={name}>
            <Card matchHeight={true} accented={true} aggregated={true}>
              <CardTitle className={cardTitleStyle}>
                {/* <Link id='Dashboard' to={name}> */}
                <Link to={`/kubernetes/${encodeURIComponent(name)}`}>
                  {name}
                </Link>
              </CardTitle>
              <CardBody className={cardBodyStyle}>
                <Link to={`/kubernetes/${encodeURIComponent(name)}`}>
                  {this.renderStatuse(name)}
                </Link>  
              </CardBody>
            </Card>
          </Col>
        );
      })
    );
  }

  renderStatuse(name: String) {
    if ( name === 'Nodes') {
      return this.state.nodeReady + '/' + this.state.nodeTotal;
    } 
    if ( name === 'Namespace') {
       return this.state.namespaceActive + '/' + this.state.namespaceTotal;
    }
    return ;
  }
}

export default CardK8sCluster;