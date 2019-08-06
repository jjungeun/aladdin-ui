import * as React from 'react';
import { 
  CardGrid,
  Row,
  Col,
  Card,
  CardTitle,
  CardBody
} from 'patternfly-react';
// import { CancelablePromise } from '../../utils/CancelablePromises';
// import _ from 'lodash';

// import { Response } from '../../services/Api';
// import * as API from '../../services/Api';
// import { InfraMetrics } from '../../types/Metrics';
import { style } from 'typestyle';
import { PromisesRegistry } from '../../utils/CancelablePromises';
import { KialiAppState } from '../../store/Store';
import { connect } from 'react-redux';
import { meshWideMTLSStatusSelector } from '../../store/Selectors';
import { cardItems } from './DashBoardInfo';
import DashBoardCardContent from './DashBoardCardContent';
// import { InfraMetricsOptions } from '../../types/MetricsOptions';

const cardGridStyle = style({ width: '100%' });

type DashBoardState = {
};

type ReduxProps = {
  meshStatus: string;
};

type DashBoardProps = ReduxProps &{};

export class DashboardPage extends React.Component<DashBoardProps, DashBoardState> {
  private promises = new PromisesRegistry();

  componentDidMount() {
    // this.load();
  }

  componentWillUnmount() {
    this.promises.cancelAll();
  }

  // aTODO: sort

  render() {
    const [xs, sm, md] = [12, 6, 2];
    return (
      <>
      <CardGrid matchHeight={true} className={cardGridStyle}>
        <Row style={{ marginBottom: '20px', marginTop: '20px' }}>
          {cardItems.map(card => {
            return (
              <Col xs={xs} sm={sm} md={md} key={card.title}>
                <Card matchHeight={true} accented={true} aggregated={true}>
                  <CardTitle>
                    {card.title}
                  </CardTitle>
                  <CardBody>
                    <DashBoardCardContent name={card.title} />
                    {/* <OverviewCardLinks name={ns.name} /> */}
                  </CardBody>
                </Card>
              </Col>
            );
          })}
        </Row>
      </CardGrid>
      </>
    );
  }
}

const mapStateToProps = (state: KialiAppState) => ({
  meshStatus: meshWideMTLSStatusSelector(state)
});

const DashboardPageContainer = connect(mapStateToProps)(DashboardPage);
export default DashboardPageContainer;