import * as React from 'react';
import { InfraMetrics } from '../../types/Metrics';
// import { DurationInSeconds } from '../../types/Common';
import { GridGenerator, HexGrid, Layout, Hexagon } from 'react-hexgrid';
import '../../styles/App.css';
import ReactTooltip from 'react-tooltip';
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
} from 'patternfly-react';
import { InfrastructurePropType } from '../../types/Infrastructure';
import { mergeInfraMetricsResponses } from './InfrastructureCommon';
import { InfraMetricsOptions } from '../../types/MetricsOptions';
// import { node } from 'prop-types';
// import { string } from 'prop-types';
import update from 'react-addons-update';

// const cardBodyStyle = style({
//   fontSize: '35px',
//   fontWeight: 'bold'
// });

const cardTitleStyle = style({
  fontSize: '20px',
  fontWeight: 600
});

type Container = {
  name: string;
  value: number;
};

type Node = {
  nodeName: string;
  containers: Container[];
}

type State = {
  loading: boolean
  cpu : Node[];
};

class CardHexgrid extends React.Component<InfrastructurePropType, State> {
  private metricsPromise?: CancelablePromise<Response<InfraMetrics>>;
  constructor(props: InfrastructurePropType) {
    super(props);
    this.state = {
      loading: false,
      cpu: []
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
    const nodeNameLists: Array<Object> = [];
    // const containerCPULists: Array<Object> = [];
    const optionNodeName: InfraMetricsOptions = {
      filters: ['node_labels']
    }
    const nodeNameProm = API.getInfraMetrics(optionNodeName);
    this.metricsPromise = makeCancelablePromise(mergeInfraMetricsResponses([nodeNameProm]));
    this.metricsPromise.promise
      .then(response => {
        const metrics = response.data.metrics;
        const nodeNameMetrics = metrics.node_labels.matrix;
        for (let i = 0; i < nodeNameMetrics.length; i++){
          nodeNameLists.push([nodeNameMetrics[i].metric.label_kubernetes_io_hostname, []])
        }
    }); 

    const optionContainerCpu: InfraMetricsOptions = {
      filters: ['container_cpu_usage_seconds_total'],
      rateFunc: 'rate'
    };
    const containerCpuProm = API.getInfraMetrics(optionContainerCpu);
    this.metricsPromise = makeCancelablePromise(mergeInfraMetricsResponses([containerCpuProm]));
    this.metricsPromise.promise
      .then(response => {
        const metrics = response.data.metrics;
        const cpuMetrics = metrics.container_cpu_usage_seconds_total.matrix;
        for(let i = 0; i < cpuMetrics.length; i++){
          if (cpuMetrics[i].metric.container_name && cpuMetrics[i].metric.container_name !== 'POD'){
            // containerCPULists.push([cpuMetrics[i].metric.container_name, cpuMetrics[i].values.slice(-1)[0][1]])
            for (let j = 0; j < nodeNameLists.length; j++){
              if ( nodeNameLists[j][0] === cpuMetrics[i].metric.kubernetes_io_hostname){
                nodeNameLists[j][1].push([cpuMetrics[i].metric.container_name, cpuMetrics[i].values.slice(-1)[0][1]])
                break
              }
            }
            // console.log(cpuMetrics[1].values.slice(-1)[0][1])
            // let j = 0
            // for(j = 0; j < containerCPULists.length; j++){
            //   if(containerCPULists[j]['node_name'] === cpuMetrics[i].metric.kubernetes_io_hostname){
            //     break
            //   }        console.log(containerCPULists)

            // }
            // if(j == 0 || j == containerCPULists.length){
            //   containerCPULists.push({node_name: cpuMetrics[i].metric.kubernetes_io_hostname})
            // }


          }
        }
        if (!this.state.loading) {
          this.setState({
            cpu: update(
              this.state.cpu,
              {
                $splice: [[0, 1]],
                $push: nodeNameLists
              }
            )
          });
        } else {
          this.setState({
            cpu: update(
              this.state.cpu,
              {
                $set: nodeNameLists
              }
            )
          });
        }
    });
    console.log(this.state)
  }
  
  render(){
    return (
      this.props.name.map(name=> {
        return(
          this.renderTest(name)
        );
      })
    );
  }

  renderTest(name: String){
    if (name ==='test'){
      return(
        <Col sm={12} md={6}>
          <Card accented={true}>
            <CardHeading>
              <CardTitle className={cardTitleStyle}>
                {name}
              </CardTitle>
            </CardHeading>
            <CardBody>
              check
            </CardBody>
          </Card>
        </Col>
      );
    } else if( name === 'Infrastructure Map'){
      return(
        this.state.cpu.map(node => {
          return (
            <Col sm={12} md={6}>
            <Card matchHeight={true} accented={true} aggregated={true}>
              <CardTitle className={cardTitleStyle}>
                {node[0]}
              </CardTitle>
              <CardBody>
                  <>
                <div>
            <HexGrid width={'100%'} height={200} viewBox="-10 -10 20 20">
              <Layout size={{ x: 2, y: 2 }} flat={false} spacing={1.02} origin={{ x: 0, y: 0 }}>
                {GridGenerator.hexagon_aladdin(node[1].length).map((hex, i) => <a data-tip data-for={node[1][0][0]}> <Hexagon fill={(parseInt("ff0000",16)+i*0x2000).toString(16)} key={i} q={hex.q} r={hex.r} s={hex.s} />
                </a>)}
              </Layout>
            </HexGrid> 
            </div>
            <ReactTooltip id={node[1][0][0]} effect="solid" type="info">
              {node[1][0][0]}
              <br></br>
              {node[1][0][1]}
              {/* <p>{element.value.toFixed(2)}</p> */}
            </ReactTooltip>
            </>
              </CardBody>
            </Card>
          </Col>
          );
        })        
      );
    }
    return;
  }

  // render() {
  //   return (
  //     this.props.name.map(name => {
  //       return (
          // <Col sm={12} md={6}>
          //   <Card accented={true}>
          //     <CardHeading>
          //       <CardTitle className={cardTitleStyle}>
          //         {name}
          //       </CardTitle>
          //     </CardHeading>
          //     <CardBody>
          //       {this.renderStatuse(name)}
          //     </CardBody>
          //   </Card>
          // </Col>
  //       );
  //     })
  //   );
  // }

  // renderStatuse(name: String) {
  //   // const count = 0;//this.props.status.inError.length + this.props.status.inWarning.length + this.props.status.inSuccess.length + this.props.status.notAvailable.length;

  //   if (name === 'test') {
  //     const moreHexas = GridGenerator.hexagon_aladdin(this.state.cpu.length);
  //     const color = "ff0000";
  //         return (
  //           <>
  //           <div>
  //       <HexGrid width={400} height={200} viewBox="-10 -10 20 20">
  //         <Layout size={{ x: 2, y: 2 }} flat={false} spacing={1.02} origin={{ x: 0, y: 0 }}>
  //           {moreHexas.map((hex, i) => <a data-tip data-for="test1"> <Hexagon fill={(parseInt(color,16)+i*0x2000).toString(16)} key={i} q={hex.q} r={hex.r} s={hex.s} />
  //           </a>)}
  //         </Layout>
  //       </HexGrid> 
  //       </div>
        
        
  //       <ReactTooltip id="test1" effect="solid" type="info">
  //         {'hello'}
  //         {/* <p>{element.value.toFixed(2)}</p> */}
  //       </ReactTooltip>
  //       </>
  //         );
  //       // })
  // //     // );
  //   } else if( name == 'Infrastructure Map'){
  //     const moreHexas = GridGenerator.hexagon_aladdin(this.state.cpu.length);
  //     const color = "ff0000";
  //           // return (
  //       // this.state.node.map(element => {
  //         return (
  //           <>
  //           <div>
  //       <HexGrid width={400} height={200} viewBox="-10 -10 20 20">
  //         <Layout size={{ x: 2, y: 2 }} flat={false} spacing={1.02} origin={{ x: 0, y: 0 }}>
  //           {moreHexas.map((hex, i) => <a data-tip data-for="global"> <Hexagon fill={(parseInt(color,16)+i*0x2000).toString(16)} key={i} q={hex.q} r={hex.r} s={hex.s} />
  //           </a>)}
  //         </Layout>
  //       </HexGrid> 
  //       </div>
  //       <ReactTooltip id="global" effect="solid" type="info">
  //         {'check'}
  //         {/* <p>{element.value.toFixed(2)}</p> */}
  //       </ReactTooltip>
  //       </>
  //         );
  //   } else if( name == 'Infrastructure Map'){
  // //     const [sm, md] = [12, 6];
  // //     return(
  //       // this.state.cpu.map(node => {
  //       //   return (
  //       //     <Col sm={sm} md={md}>
  //       //     <Card matchHeight={true} accented={true} aggregated={true}>
  //       //       <CardTitle className={cardTitleStyle}>
  //       //         {node[0]}
  //       //       </CardTitle>
  //       //       <CardBody className={cardBodyStyle}>
  //       //         {node[1]}
  //       //       </CardBody>
  //       //     </Card>
  //       //   </Col>
  //       //   );
  //       // })
  //   //   );
  //   // }
   
  //   return;
  // }
  
}
export default CardHexgrid;