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
import { InfraMetrics, TimeSeries } from '../../types/Metrics';
import { InfrastructurePropType } from '../../types/Infrastructure';
import { mergeInfraMetricsResponses } from './InfrastructureCommon';
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
  cpu: Node[];
  memory: Node[];
};

class CardNode extends React.Component<InfrastructurePropType, State> {
  private metricsPromise?: CancelablePromise<Response<InfraMetrics>>;
  constructor(props: InfrastructurePropType) {
    super(props);
    this.state = {
      loading: false,
      cpu: [],
      memory: []
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
    const nodeCPULists: Array<object> = [];
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

        nodeCPULists.sort((a, b) => b[1] - a[1]);
        for (let i = 0; i < nodes.length; i++) {
          if (nodeCPULists.length > 3) {
            break;
          }
          nodeCPULists.push({
            name: nodes[i].metric.instance,
            value: 100 - Number(nodes[i].values.slice(-1)[0][1]) * 100
          });
        }

        if (!this.state.loading) {
          this.setState({
            cpu: update(
              this.state.cpu,
              {
                $splice: [[0, 1]],
                $push: nodeCPULists
              }
            )
          });
        } else {
          this.setState({
            cpu: update(
              this.state.cpu,
              {
                $set: nodeCPULists
              }
            )
          });
        }
      });

    let nodeMemLists: Array<object> = [];
    const optionsNodesMemoryState: InfraMetricsOptions = {
      filters: ['node_memory_MemFree_bytes', 'node_memory_Cached_bytes', 'node_memory_Buffers_bytes', 'node_memory_MemTotal_bytes'],
    };
    const nodeTopMeoryProm = API.getInfraMetrics(optionsNodesMemoryState);
    this.metricsPromise = makeCancelablePromise(mergeInfraMetricsResponses([nodeTopMeoryProm]));
    this.metricsPromise.promise
      .then(response => {
        const metrics = response.data.metrics;
        const querys: Array<TimeSeries[]> = [
          metrics.node_memory_MemFree_bytes.matrix,
          metrics.node_memory_Cached_bytes.matrix,
          metrics.node_memory_Buffers_bytes.matrix,
          metrics.node_memory_MemTotal_bytes.matrix,
        ];
        const array: Array<Array<object>> = [];

        for (let i = 0; i < querys.length; ++i) {
          querys[i].map((node) => {
            nodeMemLists.push([
              node.metric.instance,
              Number(node.values.slice(-1)[0][1])
            ]);
          });
          array.push(nodeMemLists);
          nodeMemLists = [];
        }

        for (let i = 0; i < querys[0].length; i++) {
          if (nodeMemLists.length > 3) {
            break;
          }
          const value = 100 - (Number(array[0][i][1]) + Number(array[1][i][1]) + Number(array[2][i][1])) / array[3][i][1] * 100;
          nodeMemLists.push({
            name: querys[0][i].metric.instance,
            value: value
          });
        }

        nodeMemLists.sort((a, b) => b[1] - a[1]);

        if (!this.state.loading) {
          this.setState({
            memory: update(
              this.state.memory,
              {
                $splice: [[0, 1]],
                $push: nodeMemLists
              }
            )
          });
        } else {
          this.setState({
            memory: update(
              this.state.memory,
              {
                $set: nodeMemLists
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
          <Col sm={12} md={6}>
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
    if (name === 'Node Top CPU') {
      return (
        this.state.cpu.map(element => {
          return (
            <UtilizationBar
              min={0}
              max={100}
              now={element.value.toFixed(2)}
              thresholdWarning={40}
              thresholdError={70}
              descriptionPlacementTop
              description="Node"
              label={element.name}
            />
          );
        })
      );
    }
    else if (name === 'Node Top Memory') {
      return (
        this.state.memory.map(element => {
          return (
            <UtilizationBar
              min={0}
              max={100}
              now={element.value.toFixed(2)}
              thresholdWarning={40}
              thresholdError={70}
              descriptionPlacementTop
              description="Node"
              label={element.name}
            />
          );
        })
      );
    }

    return;
  }

}
export default CardNode;