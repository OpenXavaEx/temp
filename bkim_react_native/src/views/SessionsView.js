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

var buildDataSource = function(sessionsData){
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
        //基于 绝对路径、相对路径、默认值 计算 image 需要显示的图片
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

        var userCode = session.code;
        return (
        	<TouchableHighlight
        	    underlayColor={sessionsCss.TouchableHighlight.underlayColor}
        	    onPress={() => PubSub.publish("OpenSession", {userCode: userCode}) }>
	            <View style={sessionsCss.session}>
	              <View style={sessionsCss.sessionAvatarContainer}>
	                <Image source={imgSrc} style={[sessionsCss.sessionAvatar, decoratedAvatarCss]} />
	              </View>
	              <View style={sessionsCss.sessionNameContainer}>
	                <Text style={sessionsCss.sessionName}>{ session.userName || session.code }</Text>
	              </View>
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
