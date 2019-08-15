import * as React from 'react';
import { style } from 'typestyle';
import { CancelablePromise, makeCancelablePromise } from '../../utils/CancelablePromises';
import { Response } from '../../services/Api';
import * as API from '../../services/Api';
import {
 Card,
 CardBody,
 CardHeading,
 CardTitle,
 Col,
 UtilizationBar
} from 'patternfly-react';
import { InfraMetrics } from '../../types/Metrics';
import { DashboardPropType } from '../../types/Dashboard';
import { mergeInfraMetricsResponses } from './DashboardCommon';
import { InfraMetricsOptions } from '../../types/MetricsOptions';
import update from 'react-addons-update';
const cardTitleStyle = style({
 fontSize: '25px',
 fontWeight: 600
});

type Node = {
  name: string;
  value: number;
  total: number;
  used: number;
};

type State = {
  loading: boolean
  node: Node[];
};

class CardNode extends React.Component<DashboardPropType, State> {
 private metricsPromise?: CancelablePromise<Response<InfraMetrics>>;
 constructor(props: DashboardPropType) {
   super(props);
   this.state = {
    loading: false,
    node: []
   };
 }

 componentWillMount() {
   this.load();
 }

 componentDidMount() {
  this.setState({
    loading: true,
  });
  window.setInterval(this.load, 15000);
 }

 load = () => {
    const objectLists: Array<object> = [];
    const optionsNodesState: InfraMetricsOptions = {
     filters: ['node_cpu_seconds_total'],
     rateFunc: 'irate',
     mode: 'idle',
     avg: true,
     byLabels: ['instance']
   };
    const nodeTopCpuProm = API.getInfraMetrics(optionsNodesState);
    this.metricsPromise = makeCancelablePromise(mergeInfraMetricsResponses([nodeTopCpuProm]));
    this.metricsPromise.promise
    .then(response => {
      const metrics = response.data.metrics;
      const nodes = metrics.node_cpu_seconds_total.matrix;
      for (let i = 0; i < nodes.length; i++) {
        objectLists.push({
          name: nodes[i].metric.instance,
          value: 100 - Number(nodes[i].values.slice(-1)[0][1]) * 100
        });
      }
      if (!this.state.loading) {
        this.setState({
          node: update(
            this.state.node,
            {
              $splice: [[0, 1]],
              $push: objectLists
            }
         )
        });
      } else {
        this.setState({
          node: update(
            this.state.node,
            {
              $set: objectLists
            }
         )
        });
      }
    });
  }

  render() {
    return (
      this.props.name.map(name => {
        return (
          <Col sm={12} md={6} key={name}>
            <Card>
              <CardHeading>
                <CardTitle className={cardTitleStyle}>
                  {name}
                </CardTitle>
              </CardHeading>
              <CardBody>
                {this.renderStatuse(name)}
              </CardBody>
            </Card>
          </Col>
        );
      })
    );
  }

  renderStatuse(name: String) {
    if ( name === 'Node Top CPU') {
      return(
        this.state.node.map(element => {
          return (
            <UtilizationBar
              min={0}
              max={100}
              now={element.value.toFixed(2)}
              threshodWarning={40}
              thresholdError={70}
              descriptionPlacementTop={true}
              description="Node"
              label={element.name}
            />
          );
        })
      );
    }
    return ;
  }
}
export default CardNode;
