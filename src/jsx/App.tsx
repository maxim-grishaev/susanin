import * as React from 'react';
import './App.css';

import { TVertexType, TVertexId } from '../lib/types';
import { getIdByCoords } from '../lib/traverse';
import { createGraphFromStringMap, updateBoardSize } from '../lib/graph';
import { updateGraphVertexById } from '../lib/vertex';
import { addGraphWormhole, removeGraphWormhole } from '../lib/wormhole';

import { Board, BoardWithRoute } from './Board';
import { Layout, InnerLayout } from './Layout';
import { Layer } from './Cell';

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
        allowDiagonal: true,
        allowPassByWormhole: false,
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

    handleTypeUpdate = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const type = TVertexType[event.target.value];
        const vertexId = String(this.state.editingId);
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
        const isWormholeEditingCell = hasWormholeToFinish && wormholeId === vertexId;
        const canSetWormholeEnter = !hasWormhole && !hasWormholeToFinish;
        const canSetWormholeExit = !hasWormhole && hasWormholeToFinish && wormholeId !== vertexId;
        const isStartOrFinish = vertexId !== startId && vertexId !== finishId;
        return (
            <>
                <p>Editing: {vertexId}</p>
                <ul className="CellActions">
                    {isStartOrFinish && (
                        <li onClick={() => this.setState({ startId: vertexId })}>Start here</li>
                    )}
                    {isStartOrFinish && (
                        <li onClick={() => this.setState({ finishId: vertexId })}>Finish here</li>
                    )}
                    {hasWormhole && (
                        <li onClick={() => this.removeWormhole(vertexId)}>Remove wormhole pair</li>
                    )}
                    {isWormholeEditingCell && (
                        <li onClick={() => this.setState({ wormholeId: null })}>Clear wormhole</li>
                    )}
                    {canSetWormholeEnter && (
                        <li onClick={() => this.setState({ wormholeId: vertexId })}>Set wormhole</li>
                    )}
                    {canSetWormholeExit && (
                        <li onClick={() => this.setupWormhole(vertexId)}>Set wormhole exit</li>
                    )}
                    <li>
                        Cell type ={' '}
                        <select
                            onChange={this.handleTypeUpdate}
                        >
                            {[
                                TVertexType.Normal,
                                TVertexType.Boulder,
                                TVertexType.Gravel,
                            ].map((type: TVertexType) => {
                                const vertex = graph.vertices[vertexId];
                                const isSelected = vertex && type === vertex.type;
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
        this.setState({ showRoute: true });
    }

    hideRoute = () => {
        this.setState({ showRoute: false });
    }

    handleDiagonal = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            allowDiagonal: event.target.checked,
        });
    }
    handlePassBy = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            allowPassByWormhole: event.target.checked,
        });
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
                            allowPassByWormhole={this.state.allowPassByWormhole}
                            allowDiagonal={this.state.allowDiagonal}
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
                                    Board width:{' '}
                                    <input
                                        type="number"
                                        onChange={this.handleWidth}
                                        value={String(this.state.width)}
                                        disabled={this.state.editingId !== null}
                                    />
                                </p>
                                <p>
                                    Board height:{' '}
                                    <input
                                        type="number"
                                        onChange={this.handleHeight}
                                        value={String(this.state.height)}
                                        disabled={this.state.editingId !== null}
                                    />
                                </p>
                                <p>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={this.state.allowDiagonal}
                                            onChange={this.handleDiagonal}
                                        />
                                        Allow Diagonal moves
                                    </label>
                                </p>
                                <p>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={this.state.allowPassByWormhole}
                                            onChange={this.handlePassBy}
                                        />
                                        Allow pass by wormholes
                                    </label>
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
