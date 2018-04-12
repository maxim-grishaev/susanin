import { dissocPath } from 'ramda';

import { TBoard, TGraph, TVertexDict, TVertexId, TVertexType, TWormholesDict } from './types';
import { getIdByCoords, traverseBoard } from './traverse';
import { createArray, updateArrayLength } from './array';
import { createVertexByCoords } from './vertex';

const TYPE_BY_STRING = {
  '.': TVertexType.Normal,
  'G': TVertexType.Gravel,
  '#': TVertexType.Boulder,
};

/*
export const createEmptyGraph = (xSize: number, ySize: number): TGraph => {
    const vertices = {};
    const board = createArray(ySize).map(() => createArray(xSize));

    traverseBoard(
        (_: undefined, x: number, y: number) => {
            const vertex = createVertexByCoords(TVertexType.Normal, x, y);
            vertices[vertex.id] = vertex;
            return vertex.id;
        },
        board
    );

    return {
        wormholes: {},
        vertices,
        board,
    };
};
*/

export const createGraphFromStringMap = (map: string, whList: number[][][]): TGraph => {
    const vertices: TVertexDict = {};
    const board: TBoard = map.trim().split('\n').map(
        (line: string, y: number) => line
            .trim()
            .split('')
            .map((type: string, x: number) => {
                const vType = type in TYPE_BY_STRING ? TYPE_BY_STRING[type] : TVertexType.Boulder;
                const vertex = createVertexByCoords(vType, x, y);
                vertices[vertex.id] = vertex;
                return vertex.id;
            })
    );

    const wormholes = whList.reduce(
        (memo, [whFrom, whTo]) => {
            const idFrom = getIdByCoords(board, whFrom[0], whFrom[1]);
            const idTo = getIdByCoords(board, whTo[0], whTo[1]);
            if (idFrom && idTo) {
                memo[idFrom] = idTo;
            }
            return memo;
        },
        {}
    );

    return {
        wormholes,
        board,
        vertices,
    };
};

export const updateBoardSize = (xSize: number, ySize: number, graph: TGraph): TGraph => {
  const vertices = { ...graph.vertices };

  // update board size
  const board: TBoard = updateArrayLength(ySize, graph.board)
    .map((line: string[]) =>
      updateArrayLength(xSize, line || createArray(xSize))
    );

  // fill in empty vertices
  traverseBoard(
    (oldVertexId: TVertexId, x: number, y: number) => {
      const vertex = oldVertexId === ''
        ? createVertexByCoords(TVertexType.Normal, x, y)
        : vertices[oldVertexId];
      vertices[vertex.id] = vertex;
      board[y][x] = vertex.id;
    },
    board,
  );

  // remove deleted vertices
  traverseBoard(
    (vertexId: TVertexId, x: number, y: number) => {
      if (getIdByCoords(board, x, y) === undefined) {
        delete vertices[vertexId];
      }
    },
    graph.board
  );

  // remove invalid wormholes
  const wormholes = Object.keys(graph.wormholes).reduce(
    (memo: TWormholesDict, whInId: TVertexId): TWormholesDict => {
      const whOutId = graph.wormholes[whInId];
      if (vertices[whInId] && vertices[whOutId]) {
        return memo;
      }
      return dissocPath([whInId], memo);
    },
    graph.wormholes
  );

  return {
    board,
    wormholes,
    vertices,
  };
};

/*
export const getStringMapFromGraph = (graph: TGraph): string => {
    const lines: string[] = graph.board
        .map(xLine => xLine
            .map(vertexId => {
                const vertex = graph.vertices[vertexId];
                return TYPE_MAP_REV[vertex.type];
            })
            .join('')
        );
    return ['', ...lines, ''].join('\n');
};
*/
