import { showMeRoute } from './traverse';
import { createGraphFromStringMap } from './structs';

describe('Graph traverse', () => {
    it('shold find easiest', () => {
        const graph = createGraphFromStringMap('..', []);
        const route = showMeRoute(graph, graph.board[0][0], graph.board[0][1]);
        expect(route).toMatchSnapshot();
    });
    it('shold find wormhole', () => {
        const graph = createGraphFromStringMap('.#.', [
            [[0, 0], [2, 0]]
        ]);
        const route = showMeRoute(graph, graph.board[0][0], graph.board[0][2]);
        expect(route).toMatchSnapshot();
    });
    it('shold not find', () => {
        const graph = createGraphFromStringMap('.#.', []);
        const route = showMeRoute(graph, graph.board[0][0], graph.board[0][2]);
        expect(route).toHaveLength(0);
    });
})
