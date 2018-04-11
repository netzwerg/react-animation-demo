import * as React from 'react';
import './Box.css';

type BoxProps = {
    width: number;
    height: number;
    showCircle: boolean;
};

const Box = ({width, height, showCircle}: BoxProps) => {
    return (
        <g className={'Box'}>
            <rect width={width} height={height}/>
            {showCircle ? <circle cx={width / 2} cy={height / 2}/> : <g/>}
        </g>
    );
};

export default Box;