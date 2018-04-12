export enum TVertexType {
    Normal,
    Boulder,
    Gravel,
}
export type TVertexId = string;
export type TVertex = {
    id: TVertexId,
    type: TVertexType,
};

export type TVertexDict = { [id: string]: TVertex };
export type TWormholesDict = { [id: string]: TVertexId };
export type TBoard = TVertexId[][];
export type TGraph = {
    wormholes: TWormholesDict,
    vertices: TVertexDict,
    board: TBoard,
};
