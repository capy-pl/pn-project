import React, { PureComponent } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Button, DropdownProps } from 'semantic-ui-react';

import Graph from '../../components/graph';
import Loader from '../../components/Loader';
import { DropdownMenu } from '../../components/menu';
import { CharacterMessage, CommunitiesMessage, ProductRank } from '../../components/message';

import { ModalSave } from 'Component/modal';
import { SearchDropdown } from '../../components/dropdown';

import ReportAPI from '../../PnApp/Model/Report' ;
import { Node } from '../../PnApp/Model/Report';
interface ReportProps extends RouteComponentProps<{ id: string }> {
}

interface ReportState {
  loading: boolean;
  report?: ReportAPI;
  hookInfo?: {};
  showCommunity?: boolean;
  content: string;
  communitiesInfo?: {};
  selectedCommunities?: [];
  selectedProduct?: Node[];
  modalOpen: boolean;
  searchItems?: any;
}

export default class Report extends PureComponent<ReportProps, ReportState> {
  constructor(props: ReportProps) {
    super(props);
    this.state = {
      loading: true,
      showCommunity: false,
      content: '',
      modalOpen: false,
    };
    this.onClickP = this.onClickP.bind(this);
    this.onClickC = this.onClickC.bind(this);
    this.onShowCharacter = this.onShowCharacter.bind(this);
    this.onShowProductRank = this.onShowProductRank.bind(this);
    this.onShowCommunities = this.onShowCommunities.bind(this);
    this.updateGraph = this.updateGraph.bind(this);
    this.updateProductGraph = this.updateProductGraph.bind(this);
    this.onSaveGraph = this.onSaveGraph.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onItemSearch = this.onItemSearch.bind(this);
  }

  public async componentDidMount() {
    const report = await ReportAPI.get(this.props.match.params.id);
    this.setState({
      report,
      loading: false,
      hookInfo: [
        'milk',
        'egg',
      ],
      selectedCommunities: [],
      selectedProduct: [],
    });
  }

  public onClickP() {
    this.setState({showCommunity: false});
    this.setState({content: ''});
    this.setState({selectedCommunities: []});
    this.setState({selectedProduct: []});
  }

  public onClickC() {
    this.setState({showCommunity: true});
    this.setState({content: ''});
    this.setState({selectedCommunities: []});
    this.setState({selectedProduct: []});

  }

  public onShowCharacter(event) {
    event.stopPropagation();
    this.setState({content: 'character'});
  }

  public onShowProductRank(event) {
    event.stopPropagation();
    this.setState({content: 'productRank'});
  }

  public onShowCommunities(event) {
    event.stopPropagation();
    this.setState({content: 'communities'});
  }

  public updateGraph(communitiesList): void {
    console.log('got', communitiesList);
    this.setState({selectedCommunities: communitiesList});
  }

  public updateProductGraph(productName) {
    console.log('got', productName);
    const selected = [...this.state.report.nodes].filter((node) => node.name === productName);
    console.log(selected[0].name, selected[0].neighbors);
    this.setState({selectedProduct: selected});
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

  public onItemSearch(event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) {
    console.log(data.value);
    this.setState({searchItems: data.value});
  }

  public render() {
    let message;
    if (this.state.report) {
      if (this.state.content === 'character') {
        message =  <CharacterMessage communitiesInfo={this.state.report.communities} hookInfo={this.state.hookInfo} />;
      } else if (this.state.content === 'productRank') {
        message = <ProductRank productRankInfo={this.state.report.rank} updateProductGraph={this.updateProductGraph} />;
      } else if (this.state.content === 'communities') {
        message = <CommunitiesMessage communitiesInfo={this.state.report.communities} updateGraph={this.updateGraph} />;
      }
    }
    if (this.state.loading) {
      return <Loader size='huge' />;
    } else {
      if (this.state.report) {
        const dropdownOptions = this.state.report.nodes.map((node) => {
          return ({key: node.name, value: node.name, text: node.name});
        });
        return (
          <React.Fragment>
            <DropdownMenu
              reportId={this.state.report.id}
              onClickP={this.onClickP}
              onClickC={this.onClickC}
              onShowCharacter={this.onShowCharacter}
              onShowProductRank={this.onShowProductRank}
              onShowCommunities={this.onShowCommunities}
            />
            <div style={{ position: 'relative' }}>
              <div style={{ width: '100%', position: 'absolute' }}>
                <Graph
                  nodes={this.state.report.nodes}
                  edges={this.state.report.edges}
                  showCommunity={this.state.showCommunity}
                  selectedCommunities={this.state.selectedCommunities}
                  selectedProduct={this.state.selectedProduct}
                  searchItems={this.state.searchItems}
                />
              </div>
              <div style={{ width: '20%', position: 'absolute', overflow: 'auto', maxHeight: 550 }}>
                {message}
              </div>
              <div style={{ position: 'fixed', bottom: 0, right: 0 }}>
                <ModalSave
                  header='編輯圖片'
                  // content='Are you sure?'
                  open={this.state.modalOpen}
                  onCancel={this.onCancel}
                  // onConfirm={this.onConfirm}
                >
                  <Button
                    color='blue'
                    onClick={this.onSaveGraph}
                  >儲存圖片
                  </Button>
                </ModalSave>
              </div>
              <div style={{ position: 'fixed', top: 80, right: 20 }}>
                <SearchDropdown
                  options={dropdownOptions}
                  placeholder='請輸入商品名稱'
                  onChange={this.onItemSearch}
                />
              </div>
            </div>
          </React.Fragment>
        );
      }
    }
  }
}
