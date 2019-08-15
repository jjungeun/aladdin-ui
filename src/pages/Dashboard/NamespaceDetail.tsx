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
  UtilizationBar,
//  DonutChart,
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

class NamespaceDetail extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      node: [],
      values: []
    }
  }
  
  render() {
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
              <UtilizationBar
                min={0}
                max={100}
                now={50}
                thresholdWarning={40}
                thresholdError={70}
                descriptionPlacementTop
                description="RHOS6-Controller"
                label="190.0 of 200.0 GB Used"
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

const NamespaceDetailContainer = connect( mapStateToProps )(NamespaceDetail);
export default NamespaceDetailContainer;

     