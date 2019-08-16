import React, { PureComponent } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Button, Divider, DropdownProps, Label, Menu, Sidebar } from 'semantic-ui-react';

import { DropdownSearchItem } from 'Component/dropdown';
import { ModalAddAnalysis } from 'Component/modal';
import Graph from '../../components/graph';
import Loader from '../../components/Loader';
import { DropdownMenu } from '../../components/menu';
import { CharacterMessage, CommunitiesMessage, ProductRank } from '../../components/message';

import { Analysis } from '../../PnApp/model';
import ReportAPI from '../../PnApp/model/Report';
import { Community, Node } from '../../PnApp/model/Report';

interface ReportState {
  loading: boolean;
  report?: ReportAPI;
  showCommunity: boolean;
  content: string;
  communitiesInfo?: Community[];
  selectedCommunities?: Community[];
  selectedProduct?: Node[];
  searchItems?: DropdownProps['value'];
  modalOpen: boolean;
  visible: boolean;
  title?: string;
}

const sidebarStyle: React.CSSProperties = {
  zIndex: 100,
  height: '80%',
  width: '15%',
  position: 'absolute',
  top: '20%',
  right: 0,
};

export default class Report extends PureComponent<RouteComponentProps<{ id: string }>, ReportState> {
  constructor(props: RouteComponentProps<{ id: string }>) {
    super(props);
    this.state = {
      loading: true,
      showCommunity: false,
      content: '',
      modalOpen: false,
      visible: false,
    };
    this.onShowProductNetwork = this.onShowProductNetwork.bind(this);
    this.onShowCommunities = this.onShowCommunities.bind(this);
    this.onShowCharacter = this.onShowCharacter.bind(this);
    this.onShowProductRank = this.onShowProductRank.bind(this);
    this.onShowCommunitiesRank = this.onShowCommunitiesRank.bind(this);
    this.updateCommunitiesGraph = this.updateCommunitiesGraph.bind(this);
    this.updateProductGraph = this.updateProductGraph.bind(this);
    this.onSaveGraph = this.onSaveGraph.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onConfirm = this.onConfirm.bind(this);
    this.onItemSearch = this.onItemSearch.bind(this);
    this.handleToggleSidebar = this.handleToggleSidebar.bind(this);
    this.clearSelected = this.clearSelected.bind(this);
    this.updateFormAdd = this.updateFormAdd.bind(this);
  }

  public async componentDidMount() {
    const report = await ReportAPI.get(this.props.match.params.id);
    this.setState({
      report,
      loading: false,
    });
  }

  public clearSelected() {
    this.setState({ content: '' });
    this.setState({ selectedCommunities: undefined });
    this.setState({ selectedProduct: undefined });
  }

  public onShowProductNetwork() {
    this.setState({ showCommunity: false });
    this.clearSelected();
  }

  public onShowCommunities() {
    this.setState({ showCommunity: true });
    this.clearSelected();
    this.setState({ searchItems: undefined });
  }

  public onShowCharacter(event) {
    event.stopPropagation();
    this.setState({ content: 'character' });
  }

  public onShowProductRank(event) {
    event.stopPropagation();
    this.setState({ content: 'productRank' });
  }

  public onShowCommunitiesRank(event) {
    event.stopPropagation();
    this.setState({ content: 'communitiesRank' });
  }

  public updateCommunitiesGraph(communitiesList: Community[] | undefined) {
    this.setState({ selectedCommunities: communitiesList });
  }

  public updateProductGraph(product) {
    if (product === undefined) {
      this.setState({ selectedProduct: undefined });
    } else {
      if (this.state.report) {
        const selectedProduct = this.state.report.nodes.filter((node) => node.name === product.name);
        this.setState({ selectedProduct });
      }
    }
  }

  public onSaveGraph() {
    this.setState({
      modalOpen: true,
    });
  }

  public onCancel() {
    this.setState({
      modalOpen: false,
    });
  }

  public onConfirm() {
    this.setState({
      modalOpen: false,
      loading: true,
    });
    if (this.state.report) {
<<<<<<< HEAD
      const title = this.state.title;
      Analysis.add({report: this.state.report.id, title})
        .then(() => {
          this.setState({loading: false});
        });
=======
      Analysis.add({ report: this.state.report.id, title: 'testtest1' });
>>>>>>> a1396ee371266121f53a3b17d399ac7326d66fe7
    }
  }

  public updateFormAdd(title) {
    this.setState({title});
  }

  public onItemSearch(event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) {
    this.setState({ searchItems: data.value });
  }

  public handleToggleSidebar() {
    this.setState((prevState) => ({ visible: !prevState.visible }));
  }

  public getMessageComponent(): React.ReactChild {
    let message: React.ReactChild;
    const report = this.state.report as ReportAPI;
    switch (this.state.content) {
      case 'character':
        message = <CharacterMessage communitiesInfo={report.communities} hookInfo={report.hooks} />;
        break;
      case 'productRank':
        message = (
          <ProductRank
            productRankInfo={report.rank}
            updateProductGraph={this.updateProductGraph}
            nodes={report.nodes}
            edges={report.edges}
          />
        );
        break;
      case 'communitiesRank':
        message = (
          <CommunitiesMessage
            communitiesInfo={report.communities}
            updateCommunitiesGraph={this.updateCommunitiesGraph}
          />
        );
        break;
      default:
        return <React.Fragment />;
    }
    return message;
  }

  public getDropdownSearch(): React.ReactChild {
    let searchItemDropdown: React.ReactChild;
    const report = this.state.report as ReportAPI;
    const dropdownOptions = report.nodes.map((node) => {
      return { key: node.name, value: node.name, text: node.name };
    });
    if (!this.state.showCommunity) {
      searchItemDropdown = (
        <DropdownSearchItem
          options={dropdownOptions}
          placeholder='搜尋商品：請輸入商品名稱'
          onChange={this.onItemSearch}
        />
      );
    } else {
      return <React.Fragment />;
    }
    return searchItemDropdown;
  }

  public render() {
    if (this.state.loading) {
      return <Loader size='huge' />;
    } else {
      if (this.state.report) {
        const message: React.ReactChild = this.getMessageComponent();
        const searchItemDropdown: React.ReactChild = this.getDropdownSearch();
        const conditionList = this.state.report.conditions.map((condition) => {
          const values = condition.values.map((value) => {
            return (
              <Label key={value} style={{ margin: '.2rem' }}>
                {value}
              </Label>
            );
          });
          return (
            <div key={condition.name} style={{ margin: '1rem 0 1rem 0' }}>
              <h5>{condition.name}: </h5>
              {values}
              <Divider />
            </div>
          );
        });
        return (
          <React.Fragment>
            <DropdownMenu
              onShowProductNetwork={this.onShowProductNetwork}
              onShowCommunities={this.onShowCommunities}
              onShowProductRank={this.onShowProductRank}
              onShowCommunitiesRank={this.onShowCommunitiesRank}
              onShowCharacter={this.onShowCharacter}
              showCommunity={this.state.showCommunity}
            />
            {message}
            <Sidebar.Pushable style={sidebarStyle}>
              <Sidebar
                as={Menu}
                animation='overlay'
                direction='right'
                icon='labeled'
                vertical
                visible={this.state.visible}
                width='thin'
              >
                {conditionList}
              </Sidebar>
            </Sidebar.Pushable>
            <div
              style={{
                position: 'absolute',
                top: 80,
                right: 120,
                minWidth: '12%',
                zIndex: 101,
              }}
            >
              {searchItemDropdown}
            </div>
            <Button
              onClick={this.handleToggleSidebar}
              style={{ position: 'absolute', top: 80, right: 20, zIndex: 101 }}
            >
              條件
            </Button>
            <div style={{ position: 'absolute', bottom: 10, left: 10, zIndex: 100 }}>
              <ModalAddAnalysis
                header='編輯圖片'
                open={this.state.modalOpen}
                onCancel={this.onCancel}
                onConfirm={this.onConfirm}
                updateFormAdd={this.updateFormAdd}
              >
                <Button color='blue' onClick={this.onSaveGraph}>
                  儲存圖片
                </Button>
              </ModalAddAnalysis>
            </div>
            <Graph
              nodes={this.state.report.nodes}
              edges={this.state.report.edges}
              showCommunity={this.state.showCommunity}
              selectedCommunities={this.state.selectedCommunities}
              selectedProduct={this.state.selectedProduct}
              searchItems={this.state.searchItems}
            />
          </React.Fragment>
        );
      }
    }
  }
}
