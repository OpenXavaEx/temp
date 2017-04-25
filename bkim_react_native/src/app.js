'use strict';

import React, { Component, PropTypes } from 'react';
import {
    Text,
    Button,
    View,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    StyleSheet,
    BackAndroid
} from 'react-native';
import ErrorUtils from "ErrorUtils";

import ScrollableTabView, {DefaultTabBar, } from 'react-native-scrollable-tab-view';

import PopupDialog from 'react-native-popup-dialog';

import PubSub from 'pubsub-js';

import DialogStacks from './utils/DialogStacks';
import UITools from './utils/UITools';

import ConfigView from './views/ConfigView';
import ContactsView from './views/ContactsView';
import SessionsView from './views/SessionsView';
import ChatSessionView from './views/ChatSessionView';

import HostService from './backend/HostService';
import WebSocketService from './backend/WebSocketService';

import {colors, mainCss} from './styles';

//初始化 moment.js
var moment = require("moment");
require("moment/locale/zh-cn");
moment.locale("zh-cn");

var IM_CONFIGS = {/*
    imServerUrl:    'example.com:7778/boke-messager',
    hostServerUrl:  'example.com:8080/im-service/${service}.json',
    peerId:         'boke-test-002',
    token:          'dev-mode-test-token:boke-test-002'
*/};

var doInitIM = function(app, manual){
	if (!manual && !app.props.debugMode){
		//如果是正式运行状态, 初始化全局错误处理
    	ErrorUtils.setGlobalHandler((e)=>{
    	　　UITools.errorToast("系统错误: " + JSON.stringify(e))
    	});
	}
	
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
    	//补充当前会话信息中的用户名称/icon
		var userCodes = [];
		var sessions = data.sessions;
		for (var i=0; i<sessions.length; i++){
			userCodes.push(sessions[i].code);
		}
		var hs = new HostService(IM_CONFIGS);
		hs.fetchUserInfo(userCodes, function(userInfoTable){
			for (var i=0; i<sessions.length; i++){
				var user = userInfoTable[sessions[i].code];
				if (user){
					sessions[i].userName = user.name;
					sessions[i].userIcon = user.icon;
				}
			}
	        app.setState({myActiveConnectData: data});
		});
    });
    PubSub.subscribe("OpenChatSession", function(msg, data){
    	var userCode = data.userCode;
    	doOpenChatSession(app, userCode);
    });
}

var doOpenChatSession = function(app, userCode){
	var hs = new HostService(IM_CONFIGS);
	hs.fetchUserInfo([userCode, IM_CONFIGS.peerId], function(userInfoTable){
		var user = userInfoTable[userCode];
		var userName = (user)?user.name:userCode;
		var userIcon = (user)?user.icon:null;
		var my = userInfoTable[IM_CONFIGS.peerId];
		var myName = (my)?my.name:IM_CONFIGS.peerId;
		var myIcon = (my)?my.icon:null;
		app.setState({
			chatInfo: {
				talkFrom: IM_CONFIGS.peerId,
				talkFromName: myName,
				talkFromAvatar: my.icon,
				talkTo: userCode,
				talkToName: userName,
				talkToAvatar: userIcon,
				sessionStartTime: (new Date()).getTime()
			}
		});
		app.chattingDialog.show();
		DialogStacks.push(app.chattingDialog, function(dialog, data){
			//关闭会话窗口后，中断原有 WebSocket 连接(重新构建一个 self connection)
		    var ws = new WebSocketService(IM_CONFIGS);
		    ws.initConnect();
			
			dialog.dismiss();
			return true;
		});
	});
}

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            contactsData: [],
            myActiveConnectData: [],
            chatInfo: {},
            navigatorOffSet: 0, //通过计算因为 navigator 等外部因素引入的顶部空间, 以实现聊天对话框的正确显示
        };
        
        if (this.props.debugMode){
        	alert("Run BKIM with configuration: \n" + JSON.stringify(this.props.config));
        }
        subscribeMessages(this);
    }
    componentDidMount() {
        if (!this.props.config){
            switch2Tab(this, 2);  //如果在启动阶段没有 IM 配置数据, 直接显示 “配置” Tab
        }else{
            IM_CONFIGS = this.props.config;
            doInitIM(this);
        }
	    BackAndroid.addEventListener('hardwareBackPress', DialogStacks.hardwareBackEventHandler);
    }
	componentWillUnmount() {
	    BackAndroid.removeEventListener('hardwareBackPress', DialogStacks.hardwareBackEventHandler);
	}
    _configCallback(action, configObject) {
        //响应 ConfigView 的 “初始化 IM” 和 “打开用户会话” 两个 callback
        if ("init"==action){
            IM_CONFIGS = {
                imServerUrl: configObject.imServerUrl,
                hostServerUrl: configObject.hostServerUrl,
                peerId: configObject.peerId,
                token: configObject.token,
            };
            doInitIM(this, true);
        }
        if ("talk"==action){
            var talk2PeerId = configObject.talk2PeerId;
            alert(`TALK to '${talk2PeerId}': \n`+JSON.stringify(configObject));
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
    _measureNavigatorOffSet(evtLayout) {
    	var {x, y, width, height} = evtLayout.nativeEvent.layout;
    	var offset = Dimensions.get('window').height-height;
    	if (offset != this.state.navigatorOffSet){
        	this.setState({navigatorOffSet: offset});
    	}
    }

    //在 react-native-scrollable-tab-view DefaultTabBar 的 renderTab 基础上修改
    _renderTab(name, page, isTabActive, onPressHandler) {
	    const activeTextColor  = 'navy';
	    const inactiveTextColor = 'black';
	    const textColor = isTabActive ? activeTextColor : inactiveTextColor;
	    const fontWeight = isTabActive ? 'bold' : 'normal';

	    const styles = StyleSheet.create({
    	    tab: {
    	        flex: 1,
    	        flexDirection: 'row',
    	        alignItems: 'center',
    	        justifyContent: 'center',
    	        paddingBottom: 10,
    	    },
    	    flexOne: {
    	        flex: 1,
    	    },
    	});
	    
	    var decoration = null;
	    if (1==page /*第二页: “会话”*/){
	    	var unreaded = 0;
	    	if (this.state.myActiveConnectData){
	    		unreaded = this.state.myActiveConnectData.total;
	    	}
	    	if (unreaded && unreaded > 0){
	    		decoration = (
	    			<View style={mainCss.messageNotice} />
	    		);
	    	}
	    }
	    
	    return (
	        <TouchableOpacity
		      style={styles.flexOne}
		      key={name}
		      onPress={() => onPressHandler(page)}
		    >
				<View style={[styles.tab, ]}>
				    <Text style={[{color: textColor, fontWeight, }, ]}>
				      {name}
				    </Text>
    			    {decoration}
				</View>
			</TouchableOpacity>
	    );
	}
    
    render() {
        return (
        	<View style={{flex:1, flexDirection: 'row'}}
        	    onLayout={(event) => {this._measureNavigatorOffSet(event)}}>
        	
	            <ScrollableTabView ref='mainTab'
	                style={{marginTop: 10, }}
	                renderTabBar={() => <DefaultTabBar renderTab={this._renderTab.bind(this)}/>}
	            >
	                <ContactsView tabLabel='联系人' contacts={this.state.contactsData}/>
	                <SessionsView tabLabel='会话' sessions={this.state.myActiveConnectData.sessions}/>
	                {this._configTabRenderIf()}
	            </ScrollableTabView>
	            
                <PopupDialog
                    ref={(chattingDialog) => { this.chattingDialog = chattingDialog; }}
                    height={1} /* 1=100% */ 
                    dismissOnHardwareBackPress={false} /* 通过 DialogStacks 管理各个 dialog 对 back 键的响应 */
                >
                    <ChatSessionView
                      chatInfo={this.state.chatInfo}
                      config={IM_CONFIGS}
                    />
    		        <View style={{height: this.state.navigatorOffSet}}></View>
		        </PopupDialog>

            </View>
        );
    }
}
