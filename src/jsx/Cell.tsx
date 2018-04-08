import * as React from 'react';
import { groupBy, values } from 'ramda';

import { TVertex, TVertexId, TVertexType, TGraph } from '../lib/structs';
import '../assets/Cell.css';

type TAny = JSX.Element | string | number | boolean | undefined;
type TChildren = TAny | TAny[];

function Vertex ({ vertex }: { vertex: TVertex }): JSX.Element {
    const { type } = vertex;
    if (type === TVertexType.Boulder) {
        return <Layer className="boulder" />;
    }
    if (type === TVertexType.Gravel) {
        return <Layer className="gravel" />;
    }
    return <Layer className="grass" />;
}

export function Cell ({
    children,
    vertexId,
    graph,
    x,
    y,
}: {
    children: TChildren,
    vertexId: TVertexId,
    graph: TGraph,
    x: number,
    y: number,
}) {
    const whOuts = groupBy(String, values(graph.wormholes));
    const vertex = graph.vertices[vertexId];
    return (
        <div className="Cell">
            <Vertex vertex={vertex} />
            {vertexId in graph.wormholes && <Layer className="wormhole-in" />}
            {vertexId in whOuts && <Layer className="wormhole-out" />}
            {children !== undefined && (
                <Layer className="route">{children}</Layer>
            )}
            <Layer className="coords">{x}, {y}</Layer>
        </div>
    );
}

function Layer ({
    children,
    className = '',
}: {
    children?: TChildren,
    className?: string,
}): JSX.Element {
    return (
        <div className={`Cell-layer ${className}`}>
            <div className="Cell-layer-in">{children}</div>
        </div>
    );
}
