import { assocPath } from 'ramda';
import { TGraph, TVertex, TVertexId, TVertexType } from './types';

const STRING_BY_TYPE = {
  [TVertexType.Normal]: '.',
  [TVertexType.Gravel]: 'G',
  [TVertexType.Boulder]: '#',
};

export const isJailedVertex = (v: TVertex) => v.type === TVertexType.Boulder;

export const createVertexByCoords = (type: TVertexType = TVertexType.Normal, x: number, y: number): TVertex => {
  const id = JSON.stringify({ x, y, _: STRING_BY_TYPE[type] });
  return ({ id, type });
};

const vertexPath = (vertexId: TVertexId): string[] => ['vertices', vertexId, 'type'];
export const updateGraphVertexById = (type: TVertexType, id: TVertexId, graph: TGraph): TGraph =>
  assocPath(vertexPath(id), type, graph);
