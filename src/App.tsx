import * as React from 'react';
import './App.css';
import Timer = NodeJS.Timer;
import Box from './Box';
import { select } from 'd3-selection';
import { easeBounceOut, easeCubicInOut } from 'd3-ease';
import 'd3-transition';

type State = {
    readonly box: 'UPPER' | 'LOWER';
};

type Coordinate = {
    readonly cx: number
    readonly cy: number
};

class App extends React.Component<object, State> {

    private timer: Timer;
    private coordinateCache?: Coordinate;
    private svgRoot: SVGSVGElement;

    constructor(props: object) {
        super(props);
        this.state = {box: 'UPPER'};
    }

    componentDidMount() {
        this.timer = setInterval(() => this.switchBox(), 1000);
    }

    switchBox() {
        this.setState(prevState => ({box: prevState.box === 'UPPER' ? 'LOWER' : 'UPPER'}));
    }

    render() {

        const viewBox = {width: 100, height: 100};
        const margin = {top: 10, right: 10, bottom: 10, left: 10};
        const width = viewBox.width - margin.left - margin.right;
        const height = viewBox.height - margin.top - margin.bottom;

        return (
            <div className="App">
                <svg viewBox={`0 0 ${viewBox.width} ${viewBox.height}`} ref={(svgRoot) => { this.svgRoot = svgRoot!; }}>
                    <g transform={`translate(${margin.left}, ${margin.top})`}>
                        <g>
                            <Box showCircle={this.state.box === 'UPPER'} width={width} height={height / 2}/>
                        </g>
                        <g transform={`translate(0,${height / 2})`}>
                            <Box showCircle={this.state.box === 'LOWER'} width={width} height={height / 2}/>
                        </g>
                    </g>
                </svg>
            </div>
        );
    }

    /**
     * This is where the animation happens (on the real DOM). Technically, it is performed through a D3 transition.
     * Such transitions simply change a value (the location of our circle) over time.
     *
     * The circle needs to be transitioned from previous to current coordinates. The problem is, that a circle's
     * coordinates are expressed relative to its containing Box, so it actually has the _same_ coordinates before and
     * after.
     *
     * In order for a circle to travel _across_ the boxes, the animation has to happen in a global
     * coordinate system relative to the view port of the svg root (0).
     *
     * The DOM already contains the circle at its new position. We clone it (1) to get a dedicated element that we
     * animate in global coordinates. We thus need to attach the clone directly to the root (2).
     *
     * During the animation, we only want to show the animated circle and thus temporarily hide the real one (3).
     * At the end of the animation, we get rid of the animated circle (5) and un-hide the current one (6).
     */
    componentDidUpdate() {

            const circle = this.svgRoot.getElementsByTagName('circle').item(0) as SVGCircleElement;

            if (circle) {

                // (0) Calculate current coordinates relative to global view port
                const currentCoordinates = this.getCoordinates(this.svgRoot, circle);

                const previousCoordinates = this.coordinateCache || currentCoordinates;

                this.coordinateCache = currentCoordinates;

                const easingFunction = currentCoordinates.cy > previousCoordinates.cy ? easeBounceOut : easeCubicInOut;

                // (1) This clone will be used for the animation
                const animatedCircle = circle.cloneNode(true) as SVGCircleElement;

                // (2) Attach to root element (animated x/y coordinates are in the system of the global view port)
                this.svgRoot.appendChild(animatedCircle);

                // (3) The DOM already contains the circle at the new position -> hide it until the animation is over
                select(circle)
                    .attr('visibility', 'hidden');

                // (4) The actual animation
                select(animatedCircle)
                    .attr('visibility', 'visible')
                    .attr('cx', previousCoordinates.cx)
                    .attr('cy', previousCoordinates.cy)
                    .transition()
                    .duration(1000)
                    .ease(easingFunction)
                    .attr('cx', currentCoordinates.cx)
                    .attr('cy', currentCoordinates.cy)
                    .remove(); // (5) Detach the animated circle once we're done

                // (6) Once the animation is over, we can again show the new state (already properly placed in the DOM)
                select(circle)
                    .transition()
                    .delay(10000)
                    .attr('visibility', 'visible');

            }

    }

    /**
     * Determines the coordinates of an SVG circle in the coordinate system of the SVG root view port.
     * See https://www.sitepoint.com/how-to-translate-from-dom-to-svg-coordinates-and-back-again
     */
    getCoordinates(svg: SVGSVGElement, circleNode: SVGCircleElement) {
        const point = svg.createSVGPoint();
        const circleClientRect = circleNode.getBoundingClientRect();

        const circleX = circleClientRect.left + circleClientRect.width / 2;
        const circleY = circleClientRect.top + circleClientRect.height / 2;

        point.x = circleX;
        point.y = circleY;

        const screenCTM = svg.getScreenCTM();

        if (screenCTM) {
            const circleCoordinates = point.matrixTransform(screenCTM.inverse());
            return { cx: circleCoordinates.x, cy: circleCoordinates.y};
        } else {
            return { cx: 0, cy: 0};
        }
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

}

export default App;