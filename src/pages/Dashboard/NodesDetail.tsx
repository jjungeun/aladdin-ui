import * as React from 'react';
// import { style } from 'typestyle';
// import { InfraMetricsOptions } from '../../../src/types/MetricsOptions';
// import * as API from '../../services/Api';
// import { CancelablePromise, makeCancelablePromise } from '../../utils/CancelablePromises';
// import { Response } from '../../services/Api';
// import { InfraMetrics } from '../../types/Metrics';
// import { mergeInfraMetricsResponses } from './DashboardCommon';
import { connect } from 'react-redux';
import { KialiAppState } from '../../store/Store';
import { meshWideMTLSStatusSelector } from '../../store/Selectors';
import { 
  Col,
  Card,
  CardTitle,
  CardBody,
  Row,
  CardHeading,
 // UtilizationBar,
  LineChart,
} from 'patternfly-react';
// import update from 'react-addons-update';
// import { DashboardPropType } from '../../types/Dashboard';

type Props = {
  name: string[];
};

type State = {
  node: string[];
  values: number[];
};

class NodesDetail extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      node: [],
      values: []
    }
  }
  
  render() {
  //  const time= [0, 10, 20, 30, 40, 50];
    const lineChartDataColumns = [
      ['data1', 30, 200, 100, 400, 150, 250],
      ['data2', 50, 220, 310, 240, 115, 25],
      ['data3', 70, 100, 390, 295, 170, 220],
      ['data4', 10, 340, 30, 290, 35, 20],
      ['data5', 90, 150, 160, 165, 180, 5]
    ];
    const splineChartConfigData = {
      date: ['123', '124','125', '126', '127', '128'],
      columns: lineChartDataColumns,
    };
    console.log(splineChartConfigData)
    return (
      <Row>
        <Col sm={12} md={6} >
          <Card>
            <CardHeading>
              <h3 className={CardTitle}>
                Quotas
              </h3>
            </CardHeading>
            <CardBody>
              {/* <LineChart
                id="line-chart-2"
                type="line"
                data={{
                  xs: [1,2,3,4,5],
                  columns: ['data1', 30, 200, 100, 400, 150, 250],
                }}
                axis ={{
                    x: {
                        type: 'timeseries',
                        tick: {
                          format: '%Y-%m-%d %H:%M'
                        },
                    },
                }}
                grid={{
                  y: {
                    show: false
                  },
                }}
                point={{
                  show: false
              }}
              /> */}
              <LineChart
                id="line-chart-4"
                data={splineChartConfigData}
                size={{ width: 600 }}
                zoom={{ enabled: true }}
              />
              {/* <UtilizationBar
                min={0}
                max={100}
                now={50}
                thresholdWarning={60}
                thresholdError={80}
                descriptionPlacementTop
                description="CFMEQE-Cluster"
                label="100.0 of 200.0 GB Used"
              />
              <UtilizationBar
                min={0}
                max={100}
                now={70}
                thresholdWarning={40}
                thresholdError={80}
                descriptionPlacementTop
                description="RHOS-Undercloud"
                label="140.0 of 200.0 GB Used"
              /> */}
            </CardBody>
          </Card>
        </Col>
      </Row>
    )
  }
  
}

const mapStateToProps = (state: KialiAppState) => ({
  meshStatus: meshWideMTLSStatusSelector(state)
});

const NodesDetailContainer = connect( mapStateToProps )(NodesDetail);
export default NodesDetailContainer;

     