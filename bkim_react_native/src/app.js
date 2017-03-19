'use strict';

import React, { Component, PropTypes } from 'react';
import {
    Text,
    View,
    ScrollView,
} from 'react-native';

import ScrollableTabView, {DefaultTabBar, } from 'react-native-scrollable-tab-view';

import PubSub from 'pubsub-js';

import styles from './styles';

import ConfigView from './views/ConfigView';
import ContactsView from './views/ContactsView';
import SessionsView from './views/SessionsView';

import HostService from './backend/HostService';
import WebSocketService from './backend/WebSocketService';

var IM_CONFIGS = {/*
    imServerUrl:    'example.com:7778/boke-messager',
    hostServerUrl:  'example.com:8080/im-service/${service}.json',
    clientId:       'boke-test-002',
    token:          'dev-mode-test-token:boke-test-002'
*/};

var doInitIM = function(app, manual){
    var ws = new WebSocketService(IM_CONFIGS);
    ws.initConnect();

    var hs = new HostService(IM_CONFIGS);
    hs.loadContactsData(function(data){
        app.setState({contactsData: data}, function(){
            if (manual){    //如果是测试时手动通过按钮初始化, 切换到联系人 Tab
                switch2Tab(app, 0);
            }
        });
    });
}

var switch2Tab = function(app, index){
    setTimeout(function(){  //不使用 setTimeout 时 Tab head 切换过去，但是 body 部分不会切换
        var tab = app.refs.mainTab;
        tab.goToPage(index);
    }, 200);
}

var subscribeMessages = function(app){
    PubSub.subscribe("MyActiveConnectData", function(msg, data){
        app.setState({myActiveConnectData: data});
    });
}

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            contactsData: [],
            myActiveConnectData: [],
        };

        subscribeMessages(this);
    }
    componentDidMount() {
        if (!this.props.config){
            switch2Tab(this, 2);  //如果在启动阶段没有 IM 配置数据, 直接显示 “配置” Tab
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
            doInitIM(this, true);
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
                <SessionsView tabLabel='会话' sessions={this.state.myActiveConnectData.sessions}/>
                {this._configTabRenderIf()}
            </ScrollableTabView>
        );
    }
}
