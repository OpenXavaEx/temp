'use strict';

import React, { Component, PropTypes } from 'react';
import {
    Text,
    View,
    ScrollView,
} from 'react-native';

import ScrollableTabView, {DefaultTabBar, } from 'react-native-scrollable-tab-view';

import styles from './styles';

import ConfigView from './views/ConfigView';

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            config: null
        };
    }
    componentDidMount() {
        var tab = this.refs.mainTab;
        if (!this.state.config){
            setTimeout(function(){  //不使用 setTimeout 时 Tab head 切换过去，但是 body 部分不会切换
                tab.goToPage(2);    //如果在启动阶段没有 IM 配置数据, 直接显示 “配置” Tab
            }, 200);
        }
    }
    _configTabRenderIf() {
        //通过是否配置 config 信息来控制是否显示 配置 Tab 页
        if (!this.state.config){
            return (
                <ConfigView tabLabel='配置'></ConfigView>
            );
        }else{
            return null;
        }
    }
    render() {
        return (
            <ScrollableTabView ref='mainTab'
              style={{marginTop: 10, }}
              renderTabBar={() => <DefaultTabBar/>} >
                <ScrollView tabLabel='联系人'>
                    <Text>Contacts</Text>
                </ScrollView>
                <ScrollView tabLabel='会话'>
                    <Text>Sessions</Text>
                </ScrollView>
                {this._configTabRenderIf()}
            </ScrollableTabView>
        );
    }
}
