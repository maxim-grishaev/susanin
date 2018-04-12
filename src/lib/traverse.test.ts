import { createGraphFromStringMap } from './graph';
import { susanin } from './traverse';

describe('Graph traverse', () => {
    it('should find easiest', () => {
        const graph = createGraphFromStringMap('..', []);
        const route = susanin(graph, graph.board[0][0], graph.board[0][1]);
        expect(route).toMatchSnapshot();
    });
    it('should find wormhole', () => {
        const graph = createGraphFromStringMap('.#.', [
            [[0, 0], [2, 0]]
        ]);
        const route = susanin(graph, graph.board[0][0], graph.board[0][2]);
        expect(route).toMatchSnapshot();
    });
    it('should not find', () => {
        const graph = createGraphFromStringMap('.#.', []);
        const route = susanin(graph, graph.board[0][0], graph.board[0][2]);
        expect(route).toHaveLength(0);
    });
});
