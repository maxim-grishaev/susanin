import * as React from 'react';
import './App.css';

import { Board, BoardWithRoute } from './Board';
import { Layout, InnerLayout } from './Layout';
import { Layer } from './Cell';

import {
    createGraphFromStringMap, getIdByCoords, updateGraphVertexById, addGraphWormhole, updateBoardSize,
    removeGraphWormhole, TVertexType, TVertexId,
} from '../lib/structs';

const assertSize = (size: number) => {
    if (size !== size) {
        throw new Error('Size: Number is expected');
    }
    if (Math.floor(size) !== size) {
        throw new Error('Size: should be integer');
    }
    if (size < 2) {
        throw new Error('Size: should be more than 2');
    }
};

export default class Main extends React.PureComponent {
    graph = createGraphFromStringMap(
        `
            ......G.
            #####.GG
            ....#G.G
            .G#.....
            .G######
            .G#.....
            ....####
            ....#...
        `,
        [
            [[5, 7], [6, 5]],
            [[0, 2], [0, 0]],
            [[3, 3], [5, 2]],
        ]
    );
    state = {
        width: this.graph.board[0].length,
        height: this.graph.board.length,
        startId: getIdByCoords(this.graph.board, 7, 7),
        finishId: getIdByCoords(this.graph.board, 7, 0),
        editingId: null,
        wormholeId: null,
        showRoute: false,
    };

    handleWidth = (event: React.ChangeEvent<HTMLInputElement>) => {
        const width = Number(event.target.value);
        assertSize(width);
        this.graph = updateBoardSize(width, this.state.height, this.graph);
        this.setState({ width });
    }

    handleHeight = (event: React.ChangeEvent<HTMLInputElement>) => {
        const height = Number(event.target.value);
        assertSize(height);
        this.graph = updateBoardSize(this.state.width, height, this.graph);
        this.setState({ height });
    }

    removeWormhole = (vertexId: TVertexId) => {
        this.graph = removeGraphWormhole(vertexId, this.graph);
        this.forceUpdate();
    }

    setupWormhole = (vertexId: TVertexId) => {
        const { wormholeId } = this.state;
        if (wormholeId == null) {
            throw new Error('Cannot setup wormhole: no entrance.');
        }
        this.graph = addGraphWormhole(String(wormholeId), vertexId, this.graph);
        this.setState({ wormholeId: null });
    }

    updateCellType = (vertexId: string, type: TVertexType) => {
        this.graph = updateGraphVertexById(type, vertexId, this.graph);
        this.forceUpdate();
    }

    renderBuildingCell = (vertexId: string) => {
        return (
            <>
                {vertexId === this.state.startId && 'Start'}
                {vertexId === this.state.finishId && 'Finish'}
                {vertexId === this.state.wormholeId && (
                    <Layer className="wormhole-in">
                        ✨
                    </Layer>
                )}
                <div className="EditCell">
                    {vertexId === this.state.editingId && (
                        <div className="EditCell-active" />
                    )}
                </div>
            </>
        );
    }

    renderMenu = () => {
        const graph = this.graph;
        const { editingId, wormholeId, startId, finishId } = this.state;
        if (editingId == null) {
            return null;
        }
        const vertexId = String(editingId);

        const hasWormhole = Object
            .keys(graph.wormholes)
            .some((k: string) => k === vertexId || graph.wormholes[k] === vertexId);

        const hasWormholeToFinish = wormholeId != null;

        return (
            <>
                <p>Editing: {vertexId}</p>
                <ul className="CellActions">
                    {vertexId !== startId && vertexId !== finishId && (
                        <li onClick={() => this.setState({ startId: vertexId })}>Start here</li>
                    )}
                    {vertexId !== startId && vertexId !== finishId && (
                        <li onClick={() => this.setState({ finishId: vertexId })}>Finish here</li>
                    )}
                    {hasWormhole && (
                        <li onClick={() => this.removeWormhole(vertexId)}>Remove wormhole pair</li>
                    )}
                    {wormholeId === vertexId && (
                        <li onClick={() => this.setState({ wormholeId: null })}>Clear wormhole</li>
                    )}
                    {!hasWormhole && !hasWormholeToFinish && (
                        <li onClick={() => this.setState({ wormholeId: vertexId })}>Set wormhole</li>
                    )}
                    {!hasWormhole && hasWormholeToFinish && wormholeId !== vertexId && (
                        <li onClick={() => this.setupWormhole(vertexId)}>Set wormhole exit</li>
                    )}
                    <li>
                        Cell type ={' '}
                        <select
                            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                                this.updateCellType(vertexId, TVertexType[event.target.value]);
                            }}
                        >
                            {[
                                TVertexType.Normal,
                                TVertexType.Boulder,
                                TVertexType.Gravel,
                            ].map((type: TVertexType) => {
                                const isSelected = type === graph.vertices[vertexId].type;
                                return (
                                    <option key={type} value={TVertexType[type]} selected={isSelected}>
                                        {TVertexType[type]}
                                    </option>
                                );
                            })}
                        </select>
                    </li>
                    <li onClick={() => this.handleCellClick(null)}>Close menu</li>
                </ul>
            </>
        );
    }

    handleCellClick = (vertexId: string | null) => {
        this.setState({ editingId: vertexId });
    }

    showRoute = () => {
        if (!this.state.startId) {
            alert('Pick start cell');
            return;
        }
        if (!this.state.finishId) {
            alert('Pick finish cell');
            return;
        }
        if (this.state.wormholeId) {
            alert('Put exit for a wormhole');
            return;
        }
        this.setState({ showRoute: true });
    }

    hideRoute = () => {
        this.setState({ showRoute: false });
    }

    render () {
        return (
            <Layout>
                {this.state.showRoute && (
                    <InnerLayout
                        leftPanel={(
                            <p>
                                <button onClick={this.hideRoute}>
                                    Edit again
                                </button>
                            </p>
                        )}
                    >
                        <BoardWithRoute
                            graph={this.graph}
                            startId={this.state.startId}
                            finishId={this.state.finishId}
                        />
                    </InnerLayout>
                )}

                {!this.state.showRoute && (
                    <InnerLayout
                        leftPanel={(
                            <>
                                <p>
                                    <button onClick={this.showRoute}>
                                        Show route
                                    </button>
                                </p>
                                <p>
                                    Board width:&nbsp;
                                    <input
                                        type="number"
                                        onChange={this.handleWidth}
                                        value={String(this.state.width)}
                                    />
                                </p>
                                <p>
                                    Board height:&nbsp;
                                    <input
                                        type="number"
                                        onChange={this.handleHeight}
                                        value={String(this.state.height)}
                                    />
                                </p>
                                {this.renderMenu()}
                            </>
                        )}
                    >
                        <Board
                            graph={this.graph}
                            onClickCell={this.handleCellClick}
                            renderCell={this.renderBuildingCell}
                        />
                    </InnerLayout>
                )}
            </Layout>
        );
    }
}
