# susanin

Visual obstacle course solver. The obstacle course game is played on a grid of cells. The object of the game is to calculate a route from the starting location to the target location, navigating the terrain in the grid. Each game starts with a blank grid and consists of 2 phases:

1. The player places the starting location, the target location and a number of
obstacles on cells on the grid.
2. The solver calculates the shortest route from the starting location to the target location and displays the route on the grid.

The obstacles that can be placed are:

- *boulder* -- there is no way to travel through boulders
- *gravel* -- when travelling across gravel you can only go at half the speed of travel
across regular terrain
- *wormhole entrance* -- you can travel instantaneously to any wormhole exit from this
location
- *wormhole exit* -- this location can be reached instantaneously from any wormhole
entrance

Keep the following in mind:
- There is only one starting and one target location per game.
- If the solver is unable to calculate a route, it displays a message to that effect.

Pathfinder (https://en.wikipedia.org/wiki/Ivan_Susanin)

## How to 

Based on [Create React App](./README.cra.md) + TypeScript

## Known issues, todo

- full tests coverage
- proper state management
- css modules
- better performance for big boards (Maybe [react-virtualized](https://github.com/bvaughn/react-virtualized))
- refactoring for lib: better traversing, id generation
- refactoring for lib: more functional, less imperative
- Use UI lib: [Semantic](https://react.semantic-ui.com) or [Material](https://www.npmjs.com/package/material-ui)
- // tslint:disable-next-line: no-any
