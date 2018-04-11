import * as React from 'react';
import './App.css';
import Timer = NodeJS.Timer;
import Box from './Box';

type State = {
    box: 'UPPER' | 'LOWER';
};

class App extends React.Component<object, State> {

    private timer: Timer;

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

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    render() {

        const viewBox = {width: 100, height: 100};
        const margin = {top: 10, right: 10, bottom: 10, left: 10};
        const width = viewBox.width - margin.left - margin.right;
        const height = viewBox.height - margin.top - margin.bottom;

        return (
            <div className="App">
                <svg viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}>
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

}

export default App;