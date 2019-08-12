import React, { PureComponent } from 'react';
import { Button, Grid, Header, Portal, Segment, Tab, Table } from 'semantic-ui-react';
import AnalysisAPI from '../../PnApp/model/Analysis' ;
import Report, { Condition, Node } from '../../PnApp/model/Report';

interface ComparePortalProps {
  open: boolean;
  reportA?: Report;
  reportB?: Report;
  shareNodes?: string[];
  onClose: () => void;
  analysisA?: AnalysisAPI;
  analysisB?: AnalysisAPI;
}

interface ComparePortalState {
  conditions: Condition[];
}

const segmentStyle = {
  position: 'fixed',
  left: '15%',
  top: '18%',
  zIndex: 1000,
  overflow: 'auto',
  maxHeight: '75%',
  width: '70%',
  textAlign: 'center',
};

export default class ComparePortal extends PureComponent<ComparePortalProps, ComparePortalState> {
  constructor(props: ComparePortalProps) {
    super(props);
  }

  public async componentDidMount() {
    const conditions = await Report.getConditions();
    this.setState({conditions});
  }
  public getTableRow = (nodes: Node[]) => {
    const tableRow = nodes.map((node, index) => {
      let style;
      if (this.props.shareNodes.includes(node.name)) {
        style = {backgroundColor: '#e8f7ff'};
      }
      return (
        <Table.Row key={node.id} style={style}>
          <Table.Cell>{index + 1}</Table.Cell>
          <Table.Cell>{node.name}</Table.Cell>
          <Table.Cell>{Math.round(node.weight)}</Table.Cell>
        </Table.Row>
      );
    });
    return tableRow;
  }
  public getTable = (name: string, tableRow: JSX.Element[]) => {
    return (
      <Table celled padded color='teal'>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>名次</Table.HeaderCell>
            <Table.HeaderCell>圖{name}產品</Table.HeaderCell>
            <Table.HeaderCell>權重</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {tableRow}
        </Table.Body>
      </Table>
    );
  }
  public TabPanel = () => {
    const nodesA = this.props.reportA.nodes.sort((a, b) => b.weight - a.weight);
    const nodesB = this.props.reportB.nodes.sort((a, b) => b.weight - a.weight);
    const tableRowA = this.getTableRow(nodesA);
    const tableRowB = this.getTableRow(nodesB);
    const tableA = this.getTable('A', tableRowA);
    const tableB = this.getTable('B', tableRowB);

    const share = this.props.shareNodes.map((node) => {
      return (
        <Table.Row key={node} >
          <Table.Cell>{node}</Table.Cell>
        </Table.Row>
      );
    });
    const conditionRows = this.state.conditions.map((condition) => {
      let conditionA;
      let conditionB;
      for (const reportACondition of this.props.reportA.conditions) {
        if (reportACondition.name === condition.name) {
          conditionA = reportACondition.values.join(', ');
          break;
        } else {
          conditionA = '-';
        }
      }
      for (const reportBCondition of this.props.reportB.conditions) {
        if (reportBCondition.name === condition.name) {
          conditionB = reportBCondition.values.join(', ');
          break;
        } else {
          conditionB = '-';
        }
      }
      return (
        <Table.Row key={condition.name}>
          <Table.Cell>{condition.name}</Table.Cell>
          <Table.Cell>{conditionA}</Table.Cell>
          <Table.Cell>{conditionB}</Table.Cell>
        </Table.Row>
      );
    });

    const panes = [
      { menuItem: '基本資料比較', render: () => {
          return(
            <Tab.Pane>
              <Grid>
                <Grid.Row>
                  <Grid.Column>
                    <Table celled padded color='teal'>
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell width={4}>條件名稱</Table.HeaderCell>
                          <Table.HeaderCell>圖【{this.props.analysisA.title}】</Table.HeaderCell>
                          <Table.HeaderCell>圖【{this.props.analysisB.title}】</Table.HeaderCell>
                        </Table.Row>
                      </Table.Header>

                      <Table.Body>
                        {conditionRows}
                      </Table.Body>
                    </Table>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Tab.Pane>
          );
        },
      },
      { menuItem: '產品列表', render: () => {
          return(
            <Tab.Pane>
              <Grid>
                <Grid.Row>
                  <Grid.Column width={6}>
                    <p>圖A產品數： {this.props.reportA.nodes.length}</p>
                    {tableA}
                  </Grid.Column>

                  <Grid.Column width={4}>
                    <p>共同產品數： {this.props.shareNodes.length}</p>
                    <Table celled padded color='yellow'>
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell>共同產品</Table.HeaderCell>
                        </Table.Row>
                      </Table.Header>

                      <Table.Body>
                        {share}
                      </Table.Body>
                    </Table>
                  </Grid.Column>

                  <Grid.Column width={6}>
                    <p>圖B產品數： {this.props.reportB.nodes.length}</p>
                    {tableB}
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Tab.Pane>
          );
        },
      },
    ];
    return(
      <Tab panes={panes} />
    );
  }

  public render() {
    return (
      <Portal onClose={this.props.onClose} open={this.props.open}>
        <Segment
          style={segmentStyle}
        >
          <Header style={{display: 'inline'}}>網路圖比較</Header>
          <Button
            content='關閉'
            negative
            onClick={this.props.onClose}
            style={{position: 'absolute', right: '10px'}}
          />
          <this.TabPanel />
        </Segment>
      </Portal>
    );
  }
}