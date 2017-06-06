import React, { Components } from 'react'
import d3 from 'd3'
import { Animated,StyleSheet} from 'react-native';
import ReactArt, { Surface, Group, Shape, Text } from 'ReactNativeART';
import * as d3shape from 'd3-shape';
import * as d3scale from 'd3-scale';

class Arc extends Component {
    render() {
        const { r, progress, d } = this.props;
        let outerRadius = 0.8 * r;
        let innerRadius = 0;
        const arc = d3shape.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
            .startAngle((d) => d.startAngle * progress)
            .endAngle((d) => d.endAngle * progress);
        return <Shape d={arc(d)} fill={d.data.color} stroke='#999' strokeWidth='1' />
    }
}

const AnimatedArc = Animated.createAnimatedComponent(Arc);

export default class PieChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            progress: new Animated.Value(0)
        };
    }

    componentWillReceiveProps(nextProps) {
        Animated.spring(
            this.state.progress,
            {
                toValue: 1,
                friction: 3
            }
        ).start();
    }

    render() {
        const { data, width, height } = this.props;
        const pie = d3shape.pie().value((d) => d.value);
        const colors = d3scale.schemeCategory20b;
        let pieData = data;
        if(data.data) {
            pieData = data.data;
        }
        let color = d3scale.scaleOrdinal(colors).domain(pieData.map((d) => d[0]));
        let items = pie(pieData.map((d) => {
            return {
                color: color(d[0]),
                text: d[0],
                value: d[1],
                type: data.dataType
            }
        }));
        return (
            <Surface width={width} height={height} style={{ backgroundColor: '#ffffff' }}>
                <Group x={width / 2} y={Math.min(width, height) / 2}>
                    {
                        items.map((d, i) =>
                            <AnimatedArc
                                r={Math.min(width, height) / 2}
                                progress={this.state.progress}
                                key={d.data.dataType + d.data.text}
                                d={d} />
                        )
                    }
                </Group>
            </Surface>
        )
    }
}