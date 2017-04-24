'use strict';

import React, { Component } from 'react';
import {
    View, ScrollView, TouchableHighlight,
    ListView,
    Text,
    Image,
} from 'react-native';

import PubSub from 'pubsub-js';

import {colors, sessionsCss} from '../styles';

var moment = require("moment");

var buildDataSource = function(sessionsData){
	//按照时间逆序
	sessionsData.sort(function(a, b){
		return b.lastTime - a.lastTime;
	});
	//构造数据源
    var dataSource = new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2
    });
    return dataSource.cloneWithRows(sessionsData);
}

export default class SessionsView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dataSource: buildDataSource(this.props.sessions||[])
        };
    }
    componentWillReceiveProps(nextProps){
        this.setState({dataSource: buildDataSource(nextProps.sessions||[])});
    }
    renderSession(session) {
        //基于 绝对路径、默认值 计算 用户头像 需要显示的图片
        var icon = session.userIcon;
        var imgSrc;
        if (icon){
            imgSrc = {uri: icon};
        }else{
            imgSrc = require("../resources/default-avatar/icon-user.png");
        }
        //基于 用户状态、是否黑名单，计算 图标颜色 的修饰
        var decoratedAvatarCss = {};
        if ("offline"==session.state){
            decoratedAvatarCss.tintColor = colors.DarkGray;
        }

        //会话信息 - 新记录数、最后消息/时间等
        var msgInfo = "";
        if (session.lastMsg){
            var lastMsg = session.lastMsg;
            if ("TEXT"==lastMsg.type){
            	msgInfo = lastMsg.data;
            }else if ("IMAGE"==lastMsg.type){
            	msgInfo = "[图像]: "+lastMsg.data.fileName;
            }else if ("FILE"==lastMsg.type){
            	msgInfo = "[文件]: "+lastMsg.data.fileName;
            }
        }
    	msgInfo = "<"+moment(lastMsg.timestamp).fromNow()+"> "+msgInfo;

    	var msgCntNode = null;
    	var count = session.count;
        if (count && count>0){
        	if (count>99){
        		count = " 99+ ";
        	}
        	msgCntNode = (
              <View style={sessionsCss.sessionMsgCountContainer}>
                <View style={{flexDirection: 'row', flex: 1, alignItems: 'center'}}>
                  <Text style={sessionsCss.sessionMsgCount}>{count}</Text>
                </View>
              </View>
        	);
        }
        
        return (
        	<TouchableHighlight
        	    underlayColor={sessionsCss.TouchableHighlight.underlayColor}
        	    onPress={() => PubSub.publish("OpenChatSession", {userCode: session.code}) }>
	            <View style={sessionsCss.session}>
	              <View style={sessionsCss.sessionAvatarContainer}>
	                <Image source={imgSrc} style={[sessionsCss.sessionAvatar, decoratedAvatarCss]} />
	              </View>
	              <View style={sessionsCss.sessionNameContainer}>
	                <Text numberOfLines={1} style={sessionsCss.sessionName}>{ session.userName || session.code }</Text>
	                <Text numberOfLines={1} style={sessionsCss.sessionMessage}>{ msgInfo }</Text>
	              </View>
	              { msgCntNode }
	            </View>
            </TouchableHighlight>
        );
    }
    render() {
        return (
            <ScrollView>
                <ListView
                    dataSource={this.state.dataSource}
                    renderRow={this.renderSession}
                    enableEmptySections={true}
                />
            </ScrollView>
        )
    }
}
