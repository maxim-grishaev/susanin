import * as React from 'react';
import { values, groupBy } from 'ramda';

import '../assets/App.css';

import { createGraphFromStringMap, getStringMapFromGraph, TGraph, TVertexId, TVertexType } from '../lib/structs';
import { howToGet } from '../lib/traverse';

const logo = require('../assets/logo.svg');

// const SIZE = {
//     x: 5,
//     y: 5,
// };

class App extends React.Component {
    map = `
        ......:.
        #####.:
        ....#:.
        .:#.....
        .:######
        ........
    `;
    graph = createGraphFromStringMap(this.map);

    render () {
        console.log('[23:13:38] App.tsx >>> render', this.graph);
        const startId = this.graph.board[5][5];
        const finishId = this.graph.board[0][7];
        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo"/>
                    <h1 className="App-title">Welcome to React</h1>
                </header>
                <p className="App-intro">
                    To get started, edit <code>src/App.tsx</code> and save to reload.
                </p>
                <div style={{ textAlign: 'left' }}>
                    {startId}, {finishId}
                    <Map graph={this.graph} startId={startId} finishId={finishId} />
                </div>
            </div>
        );
    }
}

function Map ({ graph, startId, finishId }: { graph: TGraph, startId: string, finishId: string }) {
    const path = howToGet(graph, startId, finishId);
    const whOuts = groupBy(String, values(graph.wormholes));
    const pathMap = groupBy(String, path);
    return (
        <>
            <table>
                {graph.board.map((line, y) => {
                    return (
                        <tr key={y}>
                            {line.map((vId: TVertexId, x) => {
                                const v = graph.vertices[vId];
                                return (
                                    <td
                                        key={vId}
                                        style={{
                                            border: '1px solid #eee',
                                            background: vId in pathMap ? 'red' : 'white',
                                        }}
                                    >
                                        {v.type === TVertexType.Normal && <>&nbsp;</>}
                                        {v.type === TVertexType.Boulder && <>#</>}
                                        {v.type === TVertexType.Gravy && <>G</>}
                                        {vId in graph.wormholes && <>Wormhole In</>}
                                        {vId in whOuts && <>Wormhole Out</>}
                                        <br/><small style={{ color: '#999', fontSize: 'xx-small' }}>{x}, {y}</small>
                                    </td>
                                );
                            })}
                        </tr>
                    );
                })}
            </table>
            <pre>{getStringMapFromGraph(graph)}</pre>
        </>
    );
}

export default App;
