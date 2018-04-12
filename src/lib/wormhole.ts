import { assocPath, dissocPath } from 'ramda';

import {
    TGraph,
    TVertexId,
} from './types';

const wormholePath = (vertexId: TVertexId) => ['wormholes', vertexId];
export const addGraphWormhole = (from: TVertexId, to: TVertexId, graph: TGraph): TGraph =>
    assocPath(wormholePath(from), to, graph);

export const removeGraphWormhole = (vertexId: TVertexId, graph: TGraph): TGraph => {
    if (graph.wormholes[vertexId]) {
        return dissocPath(wormholePath(vertexId), graph);
    }
    const wnOutId: string | undefined = Object.keys(graph.wormholes)
        .find((whInId: TVertexId) => graph.wormholes[whInId] === vertexId);
    if (wnOutId) {
        return dissocPath(wormholePath(wnOutId), graph);
    }
    // if (!graph.wormholes[vertexId]) {
    //     throw new Error(`Vertex is not in graph: ${vertexId}`);
    // }
    return graph;
};
