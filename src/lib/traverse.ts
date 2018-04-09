import { TGraph, TGraphLinksTree, TVertex, TVertexId, TVertexType } from './structs';

type TCosts = object;

const getLowestCostNode = (costs: TCosts, processed: TVertexId[]): TVertexId => Object.keys(costs)
    .reduce(
        (cheapVertexId: TVertexId, vertexId: TVertexId) => {
            const isCheaper = cheapVertexId === '' || costs[vertexId] < costs[cheapVertexId];
            const isNew = processed.indexOf(vertexId) === -1;
            if (isCheaper && isNew) {
                cheapVertexId = vertexId;
            }
            return cheapVertexId;
        },
        ''
    );

type TParents = { [id: string]: string };
const getOptimalPath = (parents: TParents, finishId: string) => {
    const optimalPath = [];
    let parent = finishId;
    do {
        optimalPath.push(parent);
        parent = parents[parent];
    } while (parent);
    optimalPath.reverse();
    return optimalPath;
};

// function that returns the minimum cost and path to reach Finish
const susanin = (graphLinksTree: TGraphLinksTree, startId: string, finishId: string) => {
    // track the lowest cost to reach each vertexId
    const costs = {
        [finishId]: Infinity,
        ...graphLinksTree[startId],
    };

    // track nodes that have already been processed
    const processed: string[] = [];

    // track paths
    const parents = Object.keys(graphLinksTree[startId] || {}).reduce(
        (memo, child) => {
            memo[child] = startId;
            return memo;
        },
        {
            [finishId]: ''
        }
    );

    let vertexId = getLowestCostNode(costs, processed);

    while (vertexId) {
        const currentCost = costs[vertexId];
        const children = graphLinksTree[vertexId] || {};
        Object.keys(children).forEach((n: string) => {
            if (String(n) === String(startId)) {
                // console.log('WE DON\'T GO BACK TO START', startId);
                return;
            }
            // console.log(`StartNodeName: ${startId}`);
            // console.log(`Evaluating cost to node ${n} (looking from node ${vertexId})`);
            // console.log('Last Cost:', costs[n]);

            const newCost = currentCost + children[n];
            // console.log('New Cost:', newCost);
            if (costs[n] != null && costs[n] <= newCost) {
                // console.log('A shorter path already exists');
                return;
            }

            costs[n] = newCost;
            parents[n] = vertexId;
            // console.log('Updated cost and parents');
        });
        processed.push(vertexId);
        vertexId = getLowestCostNode(costs, processed);
    }

    const optimalPath = getOptimalPath(parents, finishId);
    const cost = costs[finishId];
    return {
        cost,
        path: cost === Infinity ? [] : optimalPath,
    };
};

const WEIGHT_MAP = {
    [TVertexType.Normal]: 1,
    [TVertexType.Gravel]: 2,
};

export const isJailed = (v: TVertex) => v.type === TVertexType.Boulder;

type TOptions = {
    allowDiagonal?: boolean,
    allowPassByWormhole?: boolean,
};

export const getEdgesTree = (
    graph: TGraph,
    {
        allowDiagonal = true,
        allowPassByWormhole = false,
    }: TOptions = {},
): TGraphLinksTree => {
    const linksMap: TGraphLinksTree = {};

    const addEdgeToMap = (vFromId: TVertexId, vToId: TVertexId, weight: number | null = null) => {
        const vFrom = graph.vertices[vFromId];
        const vTo = graph.vertices[vToId];
        if (isJailed(vFrom) || isJailed(vTo)) {
            return;
        }
        if (!linksMap[vFrom.id]) {
            linksMap[vFrom.id] = {};
        }

        linksMap[vFrom.id][vTo.id] = weight === null ? WEIGHT_MAP[vFrom.type] + WEIGHT_MAP[vTo.type] : weight;
    };

    const addByCoords = (vFromId: TVertexId, x: number, y: number) => {
        let line = graph.board[y];
        const vToId: TVertexId | null = line && line[x];
        if (!vToId) {
            return;
        }
        addEdgeToMap(vFromId, vToId);
    };

    graph.board.forEach((line: TVertexId[], y: number) => {
        line.forEach((vertexId: TVertexId, x: number) => {
            const v = graph.vertices[vertexId];
            if (isJailed(v)) {
                return;
            }
            if (vertexId in graph.wormholes) {
                addEdgeToMap(vertexId, graph.wormholes[vertexId], 1);
                if (!allowPassByWormhole) {
                    return;
                }
            }
            addByCoords(vertexId, x - 1, y);
            addByCoords(vertexId, x + 1, y);
            addByCoords(vertexId, x, y - 1);
            addByCoords(vertexId, x, y + 1);
            if (allowDiagonal) {
                addByCoords(vertexId, x - 1, y - 1);
                addByCoords(vertexId, x + 1, y + 1);
                addByCoords(vertexId, x - 1, y + 1);
                addByCoords(vertexId, x + 1, y - 1);
            }
        });
    });
    return linksMap;
};

export const showMeRoute = (graph: TGraph, startId: TVertexId, finishId: TVertexId, options: TOptions = {}) => {
    const linksMap = getEdgesTree(graph, options);
    const pathResult = susanin(linksMap, startId, finishId);
    return pathResult.path;
};
