import React from 'react';
import { PieChart } from 'patternfly-react';

export class ChartPie extends React.Component {
    constructor() {
        super();

        self.colors = {
            'minecraft:bat': '#5e4e34',
            'minecraft:blaze': '#d5cf3c',
            'minecraft:cat': '#9b9b9c',
            'minecraft:cave_spider': '#0b3b45',
            'minecraft:chicken': '#e1e1e1',
            'minecraft:cod': '#a99274',
            'minecraft:cow': '#4f4132',
            'minecraft:creeper': '#6ec965',
            'minecraft:dolphin': '#96abbf',
            'minecraft:donkey': '#8a7561',
            'minecraft:drowned': '#60af9e',
            'minecraft:elder_guardian': '#8183a3',
            'minecraft:ender_dragon': '#83139c',
            'minecraft:enderman': '#2a2a2a',
            'minecraft:evoker': '#8a9090',
            'minecraft:evoker_fangs': '#b4ae95',
            'minecraft:fox': '#e8903f',
            'minecraft:ghast': '#cbc7c7',
            'minecraft:giant': '#4d7b33',
            'minecraft:guardian': '#709e8b',
            'minecraft:horse': '#702b0e',
            'minecraft:husk': '#a88f61',
            'minecraft:illusioner': '#0c64a0',
            'minecraft:iron_golem': '#ccb398',
            'minecraft:rabbit': '#915a3d',
            'minecraft:llama': '#b69677',
            'minecraft:trader_llama': '#457188',
            'minecraft:magma_cube': '#c37932',
            'minecraft:mooshroom': '#a8080a',
            'minecraft:mule': '#5b5246',
            'minecraft:ocelot': '#bcaf63',
            'minecraft:panda': '#e5e5e5',
            'minecraft:parrot': '#0b920a',
            'minecraft:phantom': '#5d6cb1',
            'minecraft:pig': '#ef9d97',
            'minecraft:pillager': '#939a9a',
            'minecraft:polar_bear': '#d3d3d3',
            'minecraft:pufferfish': '#cb8a14',
            'minecraft:ravager': '#898884',
            'minecraft:salmon': '#a44849',
            'minecraft:sheep': '#c9a2a3',
            'minecraft:shulker': '#8a608a',
            'minecraft:silverfish': '#797979',
            'minecraft:skeleton': '#9e9e9e',
            'minecraft:skeleton_horse': '#7c8561',
            'minecraft:slime': '#659a58',
            'minecraft:snow_golem': '#e18d4a',
            'minecraft:spider': '#3b332e',
            'minecraft:squid': '#455e6f',
            'minecraft:stray': '#829a9b',
            'minecraft:tropical_fish': '#4552ea',
            'minecraft:turtle': '#44bd47',
            'minecraft:vex': '#72879a',
            'minecraft:villager': '#bf896c',
            'minecraft:vindicator': '#969c9c',
            'minecraft:wandering_trader': '#cdc52d',
            'minecraft:witch': '#785d6f',
            'minecraft:wither': '#44474f',
            'minecraft:wither_skeleton': '#333334',
            'minecraft:wolf': '#b44647',
            'minecraft:zombie': '#42692c',
            'minecraft:zombie_horse': '#42692c',
            'minecraft:zombie_pigman': '#9d7557',
            'minecraft:zombie_villager': '#568837',
        };

        self.legend = {
            show: true,
            position: 'bottom'
        };

        self.size = {
            height: 480,
            width: 480
        };
    }

    render() {
        let chartData = {
            columns: this.props.data,
            colors: self.colors
        };

        return (
            <PieChart data={ chartData } legend={self.legend} size={self.size} />
        );
    }
}
