let now = 0;
Date.now = jest.fn(() => ++now);
jest.mock('uuid/v4', () => {
    let id = 0;
    return jest.fn(() => ++id);
});
