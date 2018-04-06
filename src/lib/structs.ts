import { assocPath, dissocPath } from 'ramda';
import { v4 as uuid } from 'uuid';

export enum TVertexType {
    Normal,
    Boulder,
    Gravy,
    Wormhole,
}
export type TGraphLinksTreeNode = { [id: string]: number };
export type TGraphLinksTree = { [id: string]: TGraphLinksTreeNode };
export type TVertexId = string;
export type TVertex = {
    id: TVertexId,
    type: TVertexType,
};
export type TWormholeDict = { [id: string]: TVertexId };
type TVertexDict = { [id: string]: TVertex };
export type TGraph = {
    wormholes: TWormholeDict,
    vertices: TVertexDict,
    board: TBoard,
};
export type TBoard = TVertexId[][];

export const createVertex = (type: TVertexType, id: string = uuid()): TVertex => ({ id, type });

const createArray = (size: number): string[] => [...new Array(size).join(' ').split(' ')];
const TYPE_MAP = {
    '.': TVertexType.Normal,
    's': TVertexType.Normal,
    'f': TVertexType.Normal,
    ':': TVertexType.Gravy,
    '#': TVertexType.Boulder
};
type TRevDict = { [id: string]: string };
const TYPE_MAP_REV: TRevDict = {
    [TVertexType.Normal]: '.',
    [TVertexType.Gravy]: ':',
    [TVertexType.Boulder]: '#',
};

export const createGraphFromStringMap = (map: string): TGraph => {
    const vertices: TVertexDict = {};
    const board: TBoard = map.trim().split('\n')
        .map(
            (line: string, y: number) => line
                .trim()
                .split('')
                .map((type: string, x: number) => {
                    const vertex = createVertex(TYPE_MAP[type], JSON.stringify({ x, y, type }));
                    vertices[vertex.id] = vertex;
                    return vertex.id;
                })
        );
    return {
        wormholes: {},
        board,
        vertices,
    };
};

export const getStringMapFromGraph = (graph: TGraph): string => {
    const lines: string[] = graph.board
        .map(xLine => xLine
            .map(vertexId => {
                const vertex = graph.vertices[vertexId];
                return TYPE_MAP_REV[vertex.type] || TYPE_MAP_REV[TVertexType.Normal];
            })
            .join('')
        );
    return ['', ...lines, ''].join('\n');
};

export const createEmptyGraph = (xSize: number, ySize: number): TGraph => {
    const vertexes = {};
    const board = createArray(ySize)
        .map((_1, y: number) => {
            let line = createArray(xSize);
            return line.map((_2, x: number) => {
                const vertexId = JSON.stringify({ x, y });
                const vertex = createVertex(TVertexType.Normal, vertexId);
                vertexes[vertex.id] = vertex;
                return vertex.id;
            });
        });

    return {
        wormholes: {},
        vertices: vertexes,
        board,
    };
};

const vtxPath = (vertexId: TVertexId) => ['vertexes', vertexId, 'type'];
export const updateGraphVertex = (type: TVertexType, x: number, y: number, graph: TGraph) => {
    let id: TVertexId = graph.board[x][y];
    return assocPath(vtxPath(id), type, graph);
};

const whPath = (vertexId: TVertexId) => ['wormholes', vertexId];
export const addGraphWormhole = (from: TVertexId, to: TVertexId, graph: TGraph) => assocPath(whPath(from), to, graph);
export const removeGraphWormhole = (from: TVertexId, graph: TGraph) => dissocPath(whPath(from), graph);
