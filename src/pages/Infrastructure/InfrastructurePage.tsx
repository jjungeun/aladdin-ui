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
import { InfrastructurePropType } from '../../types/Infrastructure';
import CardInfrastructure from './CardInfrastructure';
import CardHexgrid from './CardHexgrid'
import CardNode from './CardNode';

const cardGridStyle = style({ width: '100%' });

const titleStyle = style({ 
  fontSize: '20px',
  fontFamily: 'system-ui',
  lineHeight: '1em',
  padding: '20px'
});

const backgroundStyle = style({ background: '#f5f5f5' });

const paddingStyle = style({ paddingTop: '50px' });

type InfrastructurePropTypeState = {
};

class InfrastructurePage extends React.Component<InfrastructurePropType, InfrastructurePropTypeState> {

  constructor(props: InfrastructurePropType) {
    super(props);
  }

  render() {
    return (
      <div className={backgroundStyle}>
        <CardGrid matchHeight={true} className={cardGridStyle}>
          <Row>
            <Col sm={12} md={8}>
              <Row>
                <div className={titleStyle}>
                  Infrastructures
                </div>
                <CardInfrastructure name={['Host', 'DockerContainer']} />
              </Row>
              <Row>
                <div className={paddingStyle}></div>
                <CardHexgrid name={['test', 'Infrastructure Map']} />
              </Row>
              <Row>
                <div className={paddingStyle}></div>
                <CardNode name={['Node Top CPU', 'Node Top Memory']} />
              </Row>
            </Col>
          </Row>
         
            {/* <Row>
            <Col sm={12} md={8}>
              <div>dsge</div>
            </Col>
          </Row> */}
        </CardGrid>
      </div>
    );
  }
}

// overview 탭처럼 KialiAppState로 사용
const mapStateToProps = (state: KialiAppState) => ({
  meshStatus: meshWideMTLSStatusSelector(state)
});

const InfrastructurePageContainer = connect( mapStateToProps )(InfrastructurePage);
export default InfrastructurePageContainer;