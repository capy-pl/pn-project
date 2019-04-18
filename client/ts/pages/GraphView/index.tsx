import React, { Component } from 'react';
import { DataSet, Network } from 'vis';

import Global, { Edge, Node } from '../../PnApp/global';
import { getRandomColor } from '../../PnApp/helper';

const { data } = Global;

const style = {
  height: '800px',
};

interface GraphNode extends Node {
  label: string;
  group?: number;
}

interface GraphEdge extends Edge {
}

for (const node of data.nodes) {
  node.group = node.community;
}

export default class GraphView extends Component {
  public graphRef: React.RefObject<HTMLDivElement>;
  public network?: Network;
  constructor(props) {
    super(props);
    this.graphRef = React.createRef();
  }

  public componentDidMount() {
    const nodes = new DataSet<GraphNode>();
    const edges = new DataSet<GraphEdge>();
    for (const node of data.nodes) {
      node.label = node.name;
      nodes.add(node);
    }
    for (const edge of data.edges) {
      edges.add(edge);
    }
    if (this.graphRef.current) {
      this.network = new Network(this.graphRef.current, {
        edges,
        nodes,
      }, {
        edges: {
          smooth: false,
        },
        nodes: {
          shape: ' ellipse',
        },
        physics: {
          barnesHut: {
            springLength: 250,
          },
          stabilization: false,
        },
      });
    }
  }

  public render() {
    return (
      <div id='pn-graph' style={style} ref={this.graphRef} />
    );
  }
}
