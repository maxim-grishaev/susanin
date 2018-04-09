import { assocPath, dissocPath } from 'ramda';
import { v4 as uuid } from 'uuid';

export enum TVertexType {
    Normal,
    Boulder,
    Gravel,
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

export const createVertex = (type: TVertexType = TVertexType.Normal, id: string = uuid()): TVertex => ({ id, type });

const createArray = (size: number): string[] => [...new Array(size).join(' ').split(' ')];
const TYPE_MAP = {
    '.': TVertexType.Normal,
    'G': TVertexType.Gravel,
    '#': TVertexType.Boulder,
};
type TRevDict = { [id: string]: string };
const TYPE_MAP_REV: TRevDict = {
    [TVertexType.Normal]: '.',
    [TVertexType.Gravel]: 'G',
    [TVertexType.Boulder]: '#',
};

export const getIdByCoords = (board: TBoard, x: number, y: number): TVertexId | undefined =>
    board[y] ? board[y][x] : undefined;

export const createGraphFromStringMap = (map: string, whList: number[][][]): TGraph => {
    const vertices: TVertexDict = {};
    const board: TBoard = map.trim().split('\n')
        .map(
            (line: string, y: number) => line
                .trim()
                .split('')
                .map((type: string, x: number) => {
                    const vType = type in TYPE_MAP ? TYPE_MAP[type] : TVertexType.Boulder;
                    const vertex = createVertex(vType, JSON.stringify({ x, y, _: type }));
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

export const createEmptyGraph = (xSize: number, ySize: number): TGraph => {
    const vertices = {};
    const board = createArray(ySize)
        .map((_1, y: number) => {
            let line = createArray(xSize);
            return line.map((_2, x: number) => {
                const vertexId = JSON.stringify({ x, y });
                const vertex = createVertex(TVertexType.Normal, vertexId);
                vertices[vertex.id] = vertex;
                return vertex.id;
            });
        });

    return {
        wormholes: {},
        vertices,
        board,
    };
};

const updateArrayLength = (size: number, array: Array<string | string[]>): Array<string | string[]> => {
        if (size > array.length) {
            return array.concat(createArray(size - array.length));
        } else if (size < array.length) {
            const newArray = [...array];
            newArray.length = size;
            return newArray;
        }
        return array;
    };

const traverseBoard = (callback: Function, board: TBoard): void => {
    board.forEach((line: TVertexId[], y: number) => {
        line.forEach((vertexId: TVertexId, x: number) => {
            callback(vertexId, x, y);
        });
    });
};

export const updateBoardSize = (xSize: number, ySize: number, graph: TGraph): TGraph => {
    const vertices = { ...graph.vertices };

    // update board
    const board = updateArrayLength(ySize, graph.board)
        .map((line: string[], y: number) =>
            updateArrayLength(xSize, line || createArray(xSize))
                .map((oldVertexId: TVertexId, x: number) => {
                    let id = JSON.stringify({ x, y });
                    const vertex = oldVertexId
                        ? vertices[oldVertexId]
                        : createVertex(TVertexType.Normal, id);
                    vertices[vertex.id] = vertex;
                    return vertex.id;
                })
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
    const wormholes = { ...graph.wormholes };
    Object.keys(graph.wormholes).forEach((whInId: TVertexId) => {
        const whOutId = graph.wormholes[whInId];
        if (!vertices[whInId] || !vertices[whOutId]) {
            delete wormholes[whInId];
        }
    });

    const newGraph: TGraph = {
        board,
        wormholes,
        vertices,
    };
    return newGraph;
};

const vtxPath = (vertexId: TVertexId): string[] => ['vertices', vertexId, 'type'];
const whPath = (vertexId: TVertexId) => ['wormholes', vertexId];

export const updateGraphVertexById = (type: TVertexType, id: TVertexId, graph: TGraph): TGraph =>
    assocPath(vtxPath(id), type, graph);

export const updateGraphVertexByCoords = (type: TVertexType, x: number, y: number, graph: TGraph): TGraph => {
    const id = getIdByCoords(graph.board, x, y);
    return id ? updateGraphVertexById(type, id, graph) : graph;
};

export const addGraphWormhole = (from: TVertexId, to: TVertexId, graph: TGraph): TGraph =>
    assocPath(whPath(from), to, graph);

export const removeGraphWormhole = (vertexId: TVertexId, graph: TGraph): TGraph => {
    if (!graph.wormholes[vertexId]) {
        Object.keys(graph.wormholes).some(whInId => {
            let whOutId = graph.wormholes[whInId];
            const isFound = whOutId === vertexId;
            if (isFound) {
                vertexId = whInId;
            }
            return isFound;
        });
    }
    if (!graph.wormholes[vertexId]) {
        throw new Error(`Vertex is not in graph: ${vertexId}`);
    }
    return dissocPath(whPath(vertexId), graph);
};
