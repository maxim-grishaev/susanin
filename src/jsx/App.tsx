import * as React from 'react';

import { Cell } from './Cell';
import '../assets/App.css';

import { createGraphFromStringMap, TGraph, TVertexId, getIdByCoords } from '../lib/structs';
import { showMeRoute } from '../lib/traverse';

const logo = require('../assets/logo.svg');

class App extends React.Component {
    map = `
        ......G.
        #####.GG
        ....#G.G
        .G#.....
        .G######
        .G#.....
        ....####
        ....#...
    `;
    graph = createGraphFromStringMap(this.map, [
        [[5, 7], [6, 5]],
        [[0, 2], [0, 0]],
        [[3, 3], [5, 2]],
    ]);

    render () {
        const startId = getIdByCoords(this.graph.board, 7, 7);
        const finishId = getIdByCoords(this.graph.board, 7, 0);
        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo"/>
                    <h1 className="App-title">Welcome to React</h1>
                </header>
                <Map graph={this.graph} startId={startId} finishId={finishId} />
            </div>
        );
    }
}

const getRouteMap = (route: string[]): object => route.reduce(
    (memo, id, i) => {
        memo[id] = String(i);
        return memo;
    },
    {}
);

function Map ({ graph, startId, finishId }: { graph: TGraph, startId: string, finishId: string }) {
    const route = showMeRoute(graph, startId, finishId);
    const routeMap = getRouteMap(route);
    routeMap[startId] = 'Start';
    routeMap[finishId] = 'Finish';
    return (
        <div className="Board">
            <table>
                {graph.board.map((line, y) => {
                    return (
                        <tr key={y}>
                            {line.map((vertexId: TVertexId, x) => (
                                <td key={vertexId}>
                                    <Cell
                                        vertexId={vertexId}
                                        graph={graph}
                                        x={x}
                                        y={y}
                                    >
                                        <strong>{routeMap[vertexId]}</strong>
                                    </Cell>
                                </td>
                            ))}
                        </tr>
                    );
                })}
            </table>
        </div>
    );
}

export default App;
