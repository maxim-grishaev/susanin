import { TGraph, TVertexId, TVertexType } from './types';
import { isJailedVertex } from './vertex';

// It describes the edges of the graph:
export type TGraphEdgesTree = {
  // [vertexInId]
  [id: string]: {
    // [vertexOutId]: edgeWeight
    [id: string]: number,
  },
};

export type TOptions = {
  allowDiagonal?: boolean,
  allowPassByWormhole?: boolean,
};

const WEIGHT_MAP = {
  [TVertexType.Normal]: 1,
  [TVertexType.Gravel]: 2,
};

export const getEdgesTree = (
  graph: TGraph,
  {
    allowDiagonal = true,
    allowPassByWormhole = false,
  }: TOptions = {},
): TGraphEdgesTree => {
  const edgesTree: TGraphEdgesTree = {};

  const addEdgeToTree = (vFromId: TVertexId, vToId: TVertexId, weightArg: number | null = null) => {
    const vFrom = graph.vertices[vFromId];
    const vTo = graph.vertices[vToId];
    if (isJailedVertex(vFrom) || isJailedVertex(vTo)) {
      return;
    }
    if (!edgesTree[vFrom.id]) {
      edgesTree[vFrom.id] = {};
    }

    let weight: number = WEIGHT_MAP[vFrom.type] + WEIGHT_MAP[vTo.type];
    if (weightArg != null) {
      weight = weightArg;
    }
    edgesTree[vFrom.id][vTo.id] = weight;
  };

  const addEdgeByCoords = (vFromId: TVertexId, x: number, y: number) => {
    let line = graph.board[y];
    const vToId: TVertexId | null = line && line[x];
    if (!vToId) {
      return;
    }
    addEdgeToTree(vFromId, vToId);
  };

  graph.board.forEach((line: TVertexId[], y: number) => {
    line.forEach((vertexId: TVertexId, x: number) => {
      const v = graph.vertices[vertexId];
      if (isJailedVertex(v)) {
        return;
      }
      if (vertexId in graph.wormholes) {
        addEdgeToTree(vertexId, graph.wormholes[vertexId], 1);
        if (!allowPassByWormhole) {
          return;
        }
      }
      addEdgeByCoords(vertexId, x - 1, y);
      addEdgeByCoords(vertexId, x + 1, y);
      addEdgeByCoords(vertexId, x, y - 1);
      addEdgeByCoords(vertexId, x, y + 1);
      if (allowDiagonal) {
        addEdgeByCoords(vertexId, x - 1, y - 1);
        addEdgeByCoords(vertexId, x + 1, y + 1);
        addEdgeByCoords(vertexId, x - 1, y + 1);
        addEdgeByCoords(vertexId, x + 1, y - 1);
      }
    });
  });
  return edgesTree;
};
