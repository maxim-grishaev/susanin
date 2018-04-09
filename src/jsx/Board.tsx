import * as React from 'react';
import './Board.css';

import { TGraph, TVertexId } from '../lib/structs';
import { showMeRoute } from '../lib/traverse';

import { Cell } from './Cell';

export const Board = ({
    graph,
    onClickCell,
    renderCell,
}: {
    graph: TGraph,
    onClickCell?: Function
    renderCell?: Function,
}) => (
    <div className="Board">
        <table>
            <tbody>
                {graph.board.map((line, y) => (
                    <tr key={y}>
                        {line.map((vertexId: TVertexId, x) => (
                            <td key={vertexId}>
                                <Cell
                                    onClick={onClickCell}
                                    vertexId={vertexId}
                                    graph={graph}
                                    x={x}
                                    y={y}
                                >
                                    {renderCell && renderCell(vertexId, x, y)}
                                </Cell>
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const getRouteMap = (route: string[]): object => route.reduce(
    (memo, id, i) => {
        memo[id] = String(i);
        return memo;
    },
    {}
);

export function BoardWithRoute ({
    graph,
    startId,
    finishId,
    allowDiagonal = true,
    allowPassByWormhole = false,
}: {
    graph: TGraph,
    startId?: TVertexId,
    finishId?: TVertexId,
    allowDiagonal?: boolean,
    allowPassByWormhole?: boolean,
}) {
    startId = String(startId);
    finishId = String(finishId);
    if (!graph.vertices[startId] || !graph.vertices[finishId]) {
        return (
            <div className="BoardWithRoute-overlay-wrap">
                <div className="BoardWithRoute-overlay">
                    {!graph.vertices[startId] && (
                        <p>Start missing</p>
                    )}
                    {!graph.vertices[finishId] && (
                        <p>Finish missing</p>
                    )}
                </div>
                <Board graph={graph}/>
            </div>
        );
    }

    const route = showMeRoute(graph, startId, finishId, {
        allowDiagonal,
        allowPassByWormhole,
    });
    const routeMap = getRouteMap(route);
    routeMap[startId] = 'Start';
    routeMap[finishId] = 'Finish';
    const board = (
        <Board
            graph={graph}
            renderCell={(vertexId: string) => (
                <strong>{routeMap[vertexId]}</strong>
            )}
        />
    );
    return route.length < 2 ? (
        <div className="BoardWithRoute-overlay-wrap">
            <div className="BoardWithRoute-overlay">
                Start and finish are not connected
            </div>
            {board}
        </div>
    ) : board;
}
