import * as React from 'react';
import { style } from 'typestyle';
import { 
  CardGrid,
  Row,
  Col
} from 'patternfly-react';
import { KialiAppState } from '../../store/Store';
import { connect } from 'react-redux';
import { meshWideMTLSStatusSelector } from '../../store/Selectors';
import { DashboardPropType } from '../../types/Dashboard';
import CardK8sCluster from './CardK8sCluster';
import CardInfrastructure from './CardInfrastructure';
import CardK8sWorkloads from './CardK8sWorkloads';
import CardCluster from './CardCluster';
import CardNode from './CardNode';
import CardPod from './CardPod';

const cardGridStyle = style({ width: '100%' });

const titleStyle = style({ 
  fontSize: '20px',
  fontFamily: 'system-ui',
  lineHeight: '1em',
  padding: '20px'
});

const backgroundStyle = style({ background: '#f5f5f5' });

type DashboardState = {
};

class DashboardPage extends React.Component<DashboardPropType, DashboardState> {

  constructor(props: DashboardPropType) {
    super(props);
  }

  render() {
    return (
      <div className={backgroundStyle}>
        <CardGrid matchHeight={true} className={cardGridStyle}>
          <Row>
            <Col sm={12} md={8} >
            {/* aTODO :: name을 dashboardinfo로 하기 */}
              <Row>
                <div className={titleStyle}>
                  Kubernetes Cluster
                </div>
                <CardK8sCluster name={['Nodes', 'Namespace']}/>
              </Row>
              <Row>
                <div className={titleStyle}>
                  Kubernetes Workloads
                </div>
                <CardK8sWorkloads name={['Daemon Sets', 'Deployments', 'Replica Sets', 'Pods']} />
              </Row>
              <Row>
                <div className={titleStyle}>
                  Cluster
                </div>
                <CardCluster name={['Cluster CPU Utilization', 'Cluster Memory Utilization', 'Cluster Pod Utilization']} />
              </Row>
            </Col>
            <Col sm={12} md={4}>
              <div className={titleStyle}>
                Infrastructures
              </div>
              <CardInfrastructure name={['Host', 'DockerContainer']} />
            </Col>
          </Row>
          <Row>
            <Col sm={12} md={6}>
              <div className={titleStyle}>
                Node
              </div>
              <CardNode name={['Node Top CPU']} />
            </Col>
            <Col sm={12} md={6}>
              <div className={titleStyle}>
                Pod
              </div>
              <CardPod name={['Pods Top CPU', 'Pods Top Memory']} />
            </Col>
          </Row>
        </CardGrid>
      </div>
    );
  }
}

// overview 탭처럼 KialiAppState로 사용
const mapStateToProps = (state: KialiAppState) => ({
  meshStatus: meshWideMTLSStatusSelector(state)
});

const DashboardPageContainer = connect( mapStateToProps )(DashboardPage);
export default DashboardPageContainer;