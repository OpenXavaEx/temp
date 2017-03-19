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
import ContactsView from './views/ContactsView';

import HostService from './backend/HostService';

var IM_CONFIGS = {/*
    imServerUrl:    'example.com:7778/boke-messager',
    hostServerUrl:  'example.com:8080/im-service/${service}.json',
    clientId:       'boke-test-002',
    token:          'dev-mode-test-token:boke-test-002'
*/};

var doInitIM = function(app){
    var hs = new HostService(IM_CONFIGS);
    hs.loadContactsData(function(data){
        app.setState({contactsData: data});
    });
}

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            contactsData: []
        };
    }
    componentDidMount() {
        var tab = this.refs.mainTab;
        if (!this.props.config){
            setTimeout(function(){  //不使用 setTimeout 时 Tab head 切换过去，但是 body 部分不会切换
                tab.goToPage(2);    //如果在启动阶段没有 IM 配置数据, 直接显示 “配置” Tab
            }, 200);
        }else{
            IM_CONFIGS = this.props.config;
            doInitIM(this);
        }
    }
    _configCallback(action, configObject) {
        //响应 ConfigView 的 “初始化 IM” 和 “打开用户会话” 两个 callback
        if ("init"==action){
            IM_CONFIGS = {
                imServerUrl: configObject.imServerUrl,
                hostServerUrl: configObject.hostServerUrl,
                clientId: configObject.clientId,
                token: configObject.token,
            };
            doInitIM(this);
        }
        if ("talk"==action){
            var toClientId = configObject.toClientId;
            alert(`TALK to '${toClientId}': \n`+JSON.stringify(configObject));
        }
    }
    _configTabRenderIf() {
        //通过是否配置 config 信息来控制是否显示 配置 Tab 页
        if (!this.props.config){
            return (
                <ConfigView tabLabel='配置' configCallback={(action, config) => this._configCallback(action, config)} />
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
                <ContactsView tabLabel='联系人' contacts={this.state.contactsData}/>
                <ScrollView tabLabel='会话'>
                    <Text>Sessions</Text>
                </ScrollView>
                {this._configTabRenderIf()}
            </ScrollableTabView>
        );
    }
}
