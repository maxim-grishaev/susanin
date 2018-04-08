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
const susanin = (graph: TGraphLinksTree, startId: string, finishId: string) => {
    // track the lowest cost to reach each vertexId
    const costs = {
        [finishId]: Infinity,
        ...graph[startId],
    };

    // track nodes that have already been processed
    const processed: string[] = [];

    // track paths
    const parents = Object.keys(graph[startId]).reduce(
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
        let cost = costs[vertexId];
        let children = graph[vertexId];
        Object.keys(children).forEach((n: string) => {
            if (String(n) === String(startId)) {
                console.log('WE DON\'T GO BACK TO START', startId);
                return;
            }
            console.log(`StartNodeName: ${startId}`);
            console.log(`Evaluating cost to node ${n} (looking from node ${vertexId})`);
            console.log('Last Cost:', costs[n]);

            const newCost = cost + children[n];
            console.log('New Cost:', newCost);
            if (costs[n] != null && costs[n] <= newCost) {
                console.log('A shorter path already exists');
                return;
            }

            costs[n] = newCost;
            parents[n] = vertexId;
            console.log('Updated cost and parents');
        });
        processed.push(vertexId);
        vertexId = getLowestCostNode(costs, processed);
    }

    const optimalPath = getOptimalPath(parents, finishId);
    return {
        cost: costs[finishId],
        path: optimalPath
    };

};

const WEIGHT_MAP = {
    [TVertexType.Normal]: 1,
    [TVertexType.Gravel]: 2,
};

export const isJailed = (v: TVertex) => v.type === TVertexType.Boulder
    || v.type === TVertexType.Empty;

export const getEdgesTree = (graph: TGraph, allowDiaginal: boolean = true): TGraphLinksTree => {
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
            addByCoords(vertexId, x - 1, y);
            addByCoords(vertexId, x + 1, y);
            addByCoords(vertexId, x, y - 1);
            addByCoords(vertexId, x, y + 1);
            if (allowDiaginal) {
                addByCoords(vertexId, x - 1, y - 1);
                addByCoords(vertexId, x + 1, y + 1);
                addByCoords(vertexId, x - 1, y + 1);
                addByCoords(vertexId, x + 1, y - 1);
            }
        });
    });
    Object.keys(graph.wormholes).forEach((vertexId: string) => {
        addEdgeToMap(vertexId, graph.wormholes[vertexId], 1);
    });
    return linksMap;
};

export const showMeRoute = (graph: TGraph, startId: string, fnishId: string, allowDiagonal: boolean = true) => {
    const linksMap = getEdgesTree(graph, allowDiagonal);
    return susanin(linksMap, startId, fnishId).path;
};
