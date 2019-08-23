import React, { PureComponent } from 'react';
import { Grid, Icon, Menu, MenuItemProps, Segment, Table } from 'semantic-ui-react';
import { Window } from 'Component/';
import AnalysisAPI from '../../../../PnApp/model/Analysis';
import Report, { Condition, Node } from '../../../../PnApp/model/Report';
import {
  dateToString,
  stringToDate,
} from '../../../../PnApp/Helper';

interface CompareReportWindowProps {
  show: boolean;
  reportA?: Report;
  reportB?: Report;
  shareNodes?: string[];
  onClose: () => void;
  analysisA?: AnalysisAPI;
  analysisB?: AnalysisAPI;
  conditions?: Condition[];
}

interface CompareReportWindowState {
  activeIndex: number;
}
export default class CompareReportWindow extends PureComponent<CompareReportWindowProps, CompareReportWindowState> {
  constructor(props: CompareReportWindowProps) {
    super(props);
    this.state = {
      activeIndex: 0,
    };

    this.onClickMenu = this.onClickMenu.bind(this);
  }

  public onClickMenu(e, props: MenuItemProps) {
    const { index } = props;
    this.setState({
      activeIndex: index as number,
    });
  }

  public getTableRow(nodes: Node[], leftHandSideNodes: Node[] = []) {
    const tableRow = nodes.map((node, index) => {
      let style;
      let variation;
      let arrow;
      if (this.props.shareNodes && this.props.shareNodes.includes(node.name)) {
        style = { backgroundColor: '#e8f7ff' };
      }
      if (leftHandSideNodes.length !== 0) {
        const nodeNames = nodes.map(node => node.name);
        const leftNodeNames = leftHandSideNodes.map(node => node.name);
        if (!(leftNodeNames.indexOf(node.name) < 0)) {
          variation = leftNodeNames.indexOf(node.name) - nodeNames.indexOf(node.name);
        }
        if (variation < 0) {
          arrow = (
            <React.Fragment>
              <Icon color='red' name='long arrow alternate down' />
              <span style={{ color: 'red' }}>{Math.abs(variation)}</span>
            </React.Fragment>
          );
        } else if (variation > 0) {
          arrow = (
            <React.Fragment>
              <Icon color='green' name='long arrow alternate up' />
              <span style={{ color: 'green' }}>{Math.abs(variation)}</span>
            </React.Fragment>
          );
        } else if (variation === 0) {
          arrow = (
            <React.Fragment>
              <Icon color='blue' name='minus' />
              <span style={{ color: 'blue' }} />
            </React.Fragment>
          );
        } else {
          arrow = <React.Fragment />;
        }
      }
      return (
        <Table.Row key={node.id} style={style}>
          <Table.Cell>
            {index + 1}&nbsp;&nbsp;&nbsp;{arrow}
          </Table.Cell>
          <Table.Cell>{node.name}</Table.Cell>
          <Table.Cell>{Math.round(node.weight)}</Table.Cell>
        </Table.Row>
      );
    });
    return tableRow;
  }

  public getTable = (tableName: string, report: Report, leftHandSideReport: Report | undefined = undefined) => {
    const nodes = report.nodes.sort((a, b) => b.weight - a.weight);
    const leftHandSideNodes = leftHandSideReport ? leftHandSideReport.nodes : [];
    const tableRow = this.getTableRow(nodes, leftHandSideNodes);
    return (
      <React.Fragment>
        <p>圖{tableName}產品數： {report.nodes.length}</p>
        <Table celled padded color='teal'>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>名次</Table.HeaderCell>
              <Table.HeaderCell>圖{tableName}產品</Table.HeaderCell>
              <Table.HeaderCell>權重</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>{tableRow}</Table.Body>
        </Table>
      </React.Fragment>
    );
  };

  public getShareProductsTable() {
    const share = this.props.shareNodes.map((node) => {
      return (
        <Table.Row key={node} style={{ backgroundColor: '#e8f7ff' }}>
          <Table.Cell>{node}</Table.Cell>
        </Table.Row>
      );
    });
    return (
      <React.Fragment>
        <p>共同產品數： {this.props.shareNodes.length}</p>
        <Table celled padded color='yellow'>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>共同產品</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>{share}</Table.Body>
        </Table>
      </React.Fragment>
    );
  }

  public getConditionRow(currentCondition: Condition, reportConditions: Condition[]) {
    let conditionRow;
    for (const reportCondition of reportConditions) {
      if (reportCondition.name === currentCondition.name) {
        conditionRow =
          reportCondition.type === 'date' ?
            dateToString(stringToDate(reportCondition.values[0])) + ' - ' + dateToString(stringToDate(reportCondition.values[1])) :
            reportCondition.values.join(', ');
        break;
      } else {
        conditionRow = '-';
      }
    }
    return conditionRow;
  }

  public getConditionTableBody() {
    const conditionTableBody = this.props.conditions.map((condition) => {
      const conditionA = this.getConditionRow(condition, this.props.reportA.conditions);
      const conditionB = this.getConditionRow(condition, this.props.reportB.conditions);
      return (
        <Table.Row key={condition.name}>
          <Table.Cell>{condition.name}</Table.Cell>
          <Table.Cell>{conditionA}</Table.Cell>
          <Table.Cell>{conditionB}</Table.Cell>
        </Table.Row>
      );
    });
    return conditionTableBody;
  }

  public render() {
    if (!this.props.show) {
      return <React.Fragment />;
    } else {
      const conditionTableBody = this.getConditionTableBody();
      const productTableA = this.getTable('左', this.props.reportA);
      const productTableB = this.getTable('右', this.props.reportB, this.props.reportA);
      const shareProductsTable = this.getShareProductsTable();
      return (
        <Window
          title='網路圖比較'
          defaultX={260}
          onClickX={this.props.onClose}
          defaultHeight={600}
          defaultWidth={1200}
        >
          <React.Fragment>
            <Menu attached='top' tabular>
              <Menu.Item
                onClick={this.onClickMenu}
                index={0}
                active={this.state.activeIndex === 0}
              >
                基本資料比較
              </Menu.Item>
              <Menu.Item
                onClick={this.onClickMenu}
                index={1}
                active={this.state.activeIndex === 1}
              >
                產品列表
              </Menu.Item>
            </Menu>
            <Segment hidden={this.state.activeIndex !== 0} attached='bottom'>
              <Table celled padded color='teal'>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell width={4}>條件名稱</Table.HeaderCell>
                    <Table.HeaderCell>圖【{this.props.analysisA.title}】</Table.HeaderCell>
                    <Table.HeaderCell>圖【{this.props.analysisB.title}】</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>{conditionTableBody}</Table.Body>
              </Table>
            </Segment>
            <Segment hidden={this.state.activeIndex !== 1} attached='bottom'>
              <Grid>
                <Grid.Row>
                  <Grid.Column width={6}>
                    {productTableA}
                  </Grid.Column>
                  <Grid.Column width={4}>
                    {shareProductsTable}
                  </Grid.Column>
                  <Grid.Column width={6}>
                    {productTableB}
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Segment>
          </React.Fragment>
        </Window>
      );
    }
  }
}
