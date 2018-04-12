import { getEdgesTree, TGraphEdgesTree, TOptions } from './edge';
import { TGraph, TVertexId, TBoard } from './types';

export const getIdByCoords = (board: TBoard, x: number, y: number): TVertexId | undefined =>
  board[y] ? board[y][x] : undefined;

type TCosts = { [id: string]: number };
type TProcessed = { [id: string]: true };
const getLowestCostNode = (costs: TCosts, processed: TProcessed): TVertexId => Object.keys(costs)
    .reduce(
        (cheapVertexId: TVertexId, vertexId: TVertexId) => {
            const isCheaper = cheapVertexId === '' || costs[vertexId] < costs[cheapVertexId];
            if (isCheaper && !processed[vertexId]) {
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
const dijkstra = (graphEdgesTree: TGraphEdgesTree, startId: string, finishId: string) => {
    // track the lowest cost to reach each vertexId
    const costs = {
        [finishId]: Infinity,
        ...graphEdgesTree[startId],
    };

    // track nodes that have already been processed
    const processed: TProcessed = {};

    // track paths
    const parents = Object.keys(graphEdgesTree[startId] || {}).reduce(
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
        const children = graphEdgesTree[vertexId] || {};
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
        processed[vertexId] = true;
        vertexId = getLowestCostNode(costs, processed);
    }

    const optimalPath = getOptimalPath(parents, finishId);
    const cost = costs[finishId];
    return {
        cost,
        path: cost === Infinity ? [] : optimalPath,
    };
};

export const susanin = (graph: TGraph, startId: TVertexId, finishId: TVertexId, options: TOptions = {}) => {
    const linksMap = getEdgesTree(graph, options);
    const pathResult = dijkstra(linksMap, startId, finishId);
    return pathResult.path;
};

// TODO: make it fnctional
export const traverseBoard = (callback: ((vertexId: TVertexId, x: number, y: number) => void), board: TBoard): void => {
  board.forEach((line: TVertexId[], y: number) => {
    line.forEach((vertexId: TVertexId, x: number) => {
      callback(vertexId, x, y);
    });
  });
};
