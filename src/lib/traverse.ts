import { TGraph, TGraphLinksTree, TVertexId, TVertexType } from './structs';

type TCosts = object;

const lowestCostNode = (costs: TCosts, processed: TVertexId[]): TVertexId => Object.keys(costs)
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

// function that returns the minimum cost and path to reach Finish
const dijkstra = (graph: TGraphLinksTree, startNodeName: string, endNodeName: string) => {
    // track the lowest cost to reach each node
    let costs = {};
    costs[endNodeName] = Infinity;
    costs = Object.assign(costs, graph[startNodeName]);

    // track paths
    const parents = {[endNodeName]: ''};
    Object.keys(graph[startNodeName]).forEach(child => {
        parents[child] = startNodeName;
    });

    // track nodes that have already been processed
    const processed: string[] = [];

    let node = lowestCostNode(costs, processed);

    while (node) {
        let cost = costs[node];
        let children = graph[node];
        for (let n in children) {
            if (String(n) === String(startNodeName)) {
                console.log('WE DON\'T GO BACK TO START');
            } else {
                console.log(`StartNodeName: ${startNodeName}`);
                console.log(`Evaluating cost to node ${n} (looking from node ${node})`);
                console.log(`Last Cost: ${costs[n]}`);
                let newCost = cost + children[n];
                console.log(`New Cost: ${newCost}`);
                if (!costs[n] || costs[n] > newCost) {
                    costs[n] = newCost;
                    parents[n] = node;
                    console.log('Updated cost und parents');
                } else {
                    console.log('A shorter path already exists');
                }
            }
        }
        processed.push(node);
        node = lowestCostNode(costs, processed);
    }

    let optimalPath = [endNodeName];
    let parent = parents[endNodeName];
    while (parent) {
        optimalPath.push(parent);
        parent = parents[parent];
    }
    optimalPath.reverse();

    return {
        cost: costs[endNodeName],
        path: optimalPath
    };

};

const WEIGHT_MAP = {
    [TVertexType.Normal]: 1,
    [TVertexType.Gravy]: 2,
};

export const getEdgesTree = (graph: TGraph, allowDiaginal: boolean = true): TGraphLinksTree => {
    const linksMap: TGraphLinksTree = {};

    const addEdgeToMap = (vFromId: TVertexId, vToId: TVertexId, weight: number | null = null) => {
        const vFrom = graph.vertices[vFromId];
        const vTo = graph.vertices[vToId];
        if (vFrom.type === TVertexType.Boulder || vTo.type === TVertexType.Boulder) {
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
            const { type } = graph.vertices[vertexId];
            switch (type) {
                case TVertexType.Boulder:
                    return;
                // case TVertexType.Gravy:
                // case TVertexType.Gravy:
                default:
                    // axis
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
                    break;
            }
        });
    });
    Object.keys(graph.wormholes).forEach((vertexId: string) => {
        addEdgeToMap(vertexId, graph.wormholes[vertexId], 1);
    });
    return linksMap;
};

export const howToGet = (graph: TGraph, startId: string, fnishId: string, allowDiagonal: boolean = true) => {
    const linksMap = getEdgesTree(graph, allowDiagonal);
    return dijkstra(linksMap, startId, fnishId).path;
};
