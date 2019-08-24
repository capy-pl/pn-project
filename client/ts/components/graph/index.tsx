import { isEqual, isNumber, isUndefined } from 'lodash';
import React, { PureComponent } from 'react';
import { DataSet, EdgeOptions, Network, NodeOptions, Options } from 'vis';

import Jgraph from '../../PnApp/Jgraph';
import { Edge, Node } from '../../PnApp/model/Report';

interface GraphNode extends Node, NodeOptions {}

interface GraphEdge extends Edge, EdgeOptions {}

const customScalingFunction = (
  min: number,
  max: number,
  total: number,
  value: number,
): number => {
  if (max === min) {
    return 0.03;
  } else {
    const scale = 1 / (max - min);
    return Math.max(0, (value - min) * scale);
  }
};

interface GraphProps {
  nodes: Node[];
  edges: Edge[];
  showCommunity?: boolean;
  selectedCommunities?: number[];
  selectedProduct?: number;
  focusElement?: number;
}

const graphOption: Options = {
  edges: {
    smooth: false,
    scaling: {
      customScalingFunction,
      max: 30,
      min: 1,
    },
  },
  layout: {
    improvedLayout: false,
    randomSeed: 5,
  },
  nodes: {
    scaling: {
      customScalingFunction,
      label: {
        enabled: true,
      },
      max: 100,
      min: 30,
    },
    shape: 'dot',
  },
  physics: {
    barnesHut: {
      springLength: 270,
      centralGravity: 0.15,
      avoidOverlap: 0.2,
    },
  },
  interaction: {
    hover: true,
    tooltipDelay: 100,
  },
};

export default class GraphView extends PureComponent<GraphProps, {}> {
  public graphRef: React.RefObject<HTMLDivElement>;
  public network?: Network;
  public jgraph?: Jgraph;
  public nodes: DataSet<GraphNode>;
  public edges: DataSet<GraphEdge>;

  constructor(props: GraphProps) {
    super(props);
    this.graphRef = React.createRef();
    this.nodes = new DataSet();
    this.edges = new DataSet();
  }

  public componentDidMount() {
    if (this.graphRef.current) {
      this.graphRef.current.style.height = this.getHeight();
    }
    this.initializeGraph();
  }

  public componentDidUpdate(prevProps: GraphProps) {
    // Do not call repaint if correspondent props don't change.
    if (!isEqual(this.props.showCommunity, prevProps.showCommunity)) {
      this.paintCommunity();
    }

    const isSelectedProductEqual = isEqual(
      this.props.selectedProduct,
      prevProps.selectedProduct,
    );

    const isSelectedCommunitiesEqual = isEqual(
      this.props.selectedCommunities,
      prevProps.selectedCommunities,
    );

    if (!isSelectedProductEqual || !isSelectedCommunitiesEqual) {
      this.repaint();
    }

    if (!isSelectedProductEqual) {
      this.paintSelectedProduct();
    }

    if (!isSelectedCommunitiesEqual) {
      this.paintSelectedCommunity();
    }

    if (!isEqual(this.props.focusElement, prevProps.focusElement)) {
      this.focusNode();
    }
  }

  public focusNode(): void {
    if (this.network && isNumber(this.props.focusElement)) {
      this.network.focus(this.props.focusElement, {
        scale: 1,
      });
    }
  }

  public getHeight(): string {
    let height = 'auto';
    if (this.graphRef.current) {
      if (this.graphRef.current) {
        const { top } = this.graphRef.current.getBoundingClientRect();
        height = `${window.innerHeight - top}px`;
      }
    }
    return height;
  }

  public toNode(node: Node): GraphNode {
    const copy: GraphNode = Object.assign({}, node);
    copy.label = node.name;
    copy.value = node.weight;
    copy.title = `
    <div>
      <p>${copy.name}</p>
      <p>社群編號: ${copy.community}</p>
      <p>weight: ${Math.round(copy.weight)}</p>
      <p>連接節點數: ${copy.degree}</p>
    </div>
    `;
    copy.color = '#8DC1FF';
    return copy;
  }

  public toEdge(edge: Edge): GraphEdge {
    const copy: GraphEdge = Object.assign({}, edge);
    copy.value = edge.weight;
    copy.title = `
    <div>
      <p>edge weight: ${Math.round(copy.weight)}</p>
    </div>
    `;
    return copy;
  }

  public repaint(): void {
    const updateList: GraphNode[] = this.nodes.map(
      (node) =>
        ({
          id: node.id,
          label: node.name,
          group: this.props.showCommunity ? node.community : undefined,
          color: '#8DC1FF',
          hidden: false,
        } as any),
    );
    this.nodes.update(updateList);
    (this.network as Network).fit({
      nodes: this.nodes.map((node) => {
        return node.id.toString();
      }),
      animation: false,
    });
  }

  public paintSelectedProduct(): void {
    if (!isUndefined(this.props.selectedProduct)) {
      const selectedNode: GraphNode = {
        id: this.props.selectedProduct,
        color: {
          background: 'orange',
          hover: 'orange',
          highlight: 'orange',
        },
      } as any;
      const connectedNodes = (this.network as Network).getConnectedNodes(selectedNode.id);
      const updateList = this.nodes
        .map<GraphNode>((node) => {
          if (!connectedNodes.includes(node.id as any) && node.id !== selectedNode.id) {
            return {
              id: node.id,
              hidden: true,
            } as any;
          }
        })
        .filter((node) => node);
      updateList.push(selectedNode);
      this.nodes.update(updateList);
      (this.network as Network).focus(selectedNode.id, {
        scale: 0.9,
      });
    }
  }

  public paintSelectedCommunity(): void {
    if (this.props.selectedCommunities && this.props.selectedCommunities.length) {
      const selectedNodes: GraphNode[] = [];
      this.nodes.forEach((node) => {
        const update: any = {
          id: node.id,
          hidden: !(this.props.selectedCommunities as number[]).includes(node.community),
        };
        selectedNodes.push(update);
      });
      this.nodes.update(selectedNodes);
    } else {
      this.repaint();
    }
  }

  public paintCommunity(): void {
    if (this.props.showCommunity) {
      const nodes: GraphNode[] = this.nodes.map((node) => {
        return {
          id: node.id,
          group: node.community,
          title: `
            <div>
              <p>${node.name}</p>
              <p>community: ${node.community}</p>
              <p>weight: ${Math.round(node.weight)}</p>
              <p>連接節點數: ${node.degree}</p>
            </div>
          `,
          borderWidth: node.core ? 5 : 1,
        } as any;
      });
      this.nodes.update(nodes);
    } else {
      const nodes: GraphNode[] = this.nodes.map((node) => {
        return {
          id: node.id,
          group: undefined,
          title: `
            <div>
              <p>${node.name}</p>
              <p>weight: ${Math.round(node.weight)}</p>
              <p>連接節點數: ${node.degree}</p>
            </div>
          `,
          color: '#8DC1FF',
          borderWidth: 1,
        } as any;
      });
      this.nodes.update(nodes);
    }
  }

  public initializeGraph(): void {
    for (const node of this.props.nodes) {
      this.nodes.add(this.toNode(node));
    }

    for (const edge of this.props.edges) {
      this.edges.add(this.toEdge(edge));
    }

    if (this.graphRef.current) {
      this.network = new Network(
        this.graphRef.current,
        {
          nodes: this.nodes,
          edges: this.edges,
        },
        graphOption,
      );
    }
  }

  public render() {
    return <div id='pn-graph' style={{ zIndex: -1 }} ref={this.graphRef} />;
  }
}

export { GraphView };
