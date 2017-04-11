'use strict';

//From: http://www.himigame.com/react-native/2346.html

import React, { Component } from 'react';
import {
    View,
    Text,
    TouchableHighlight,
    Image,
    PixelRatio,
    ListView,
    StyleSheet,
    TextInput,
    Alert,
} from 'react-native';

import PubSub from 'pubsub-js';

import WebSocketService from '../backend/WebSocketService';

export default class ChatSessionView extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            inputContentText:'',
            dataSource: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }),
        };
        
        this.listHeight = 0;
        this.footerY = 0;
        
        this.chatInfo = {};
        this.messages = [];
        
        this.websocket = null;
        
        var self = this;
        PubSub.subscribe("RecentHistory", function(msg, data){
        	self.messages = data.messages;
        	self.setState({
                dataSource: self.state.dataSource.cloneWithRows(data.messages)
            });
        });

    }

    componentWillReceiveProps(nextProps){
        var chatInfo = nextProps.chatInfo;
        
        if (!chatInfo || !chatInfo.talkFrom || !chatInfo.talkTo){
        	this.chatInfo = {};
        	return;    //避免在 IM 没有初始化情况下无效的 WebSocket 连接
        }
        
        this.chatInfo = chatInfo;
        
        if (!this.websocket ||
        		!this._prevSessionStartTime || this._prevSessionStartTime!=chatInfo.sessionStartTime){
        	//开始新的聊天时, 重新执行 WebSocket 连接
        	this.websocket = new WebSocketService(nextProps.config);
        	this.websocket.connectTo(chatInfo.talkTo, chatInfo.talkFromName, chatInfo.talkToName);
            this._prevSessionStartTime = chatInfo.sessionStartTime;

            //新聊天 - 处理用户头像
            if (chatInfo.talkFromAvatar){
            	this.myAvatar = {uri: chatInfo.talkFromAvatar};
            }else{
            	this.myAvatar = require("../resources/default-avatar/icon-myself.png");
            }
            if (chatInfo.talkToAvatar){
            	this.talkToAvatar = {uri: chatInfo.talkToAvatar};
            }else{
            	this.talkToAvatar = require("../resources/default-avatar/icon-user.png");
            }
        }
    }

    renderEveryData(msg) {
        var msgType = msg.type;
        if ("BLANK"==msgType){
        	return null;    //不处理 BLANK 类型的数据
        }
        
        var isMe = (msg.sender == this.chatInfo.talkFrom);
        
        var chatContent = null;
        if ("TEXT"==msgType){
        	chatContent =
        		<Text style={ styles.talkText }>
                    {msg.data}
                </Text>;
        }else if ("IMAGE"==msgType){
        	var url = this.websocket.buildImageUrl(msg, "icon");
        	var fileName = msg.data.fileName;
        	chatContent =
        		<TouchableHighlight>
        	        <Image source={{uri: url}} style={styles.talkUploadedImage}/>
        	    </TouchableHighlight>
        }else if ("FILE"==msgType){
        	chatContent =
        		<Text style={ styles.talkText }>
                    {"未知: " + msgType}
                </Text>;
        }else {
        	chatContent =
        		<Text style={ styles.talkText }>
                    {"未知: " + msgType}
                </Text>;
        }
        
    	return (
            <View style={{flexDirection:'row',alignItems: 'center'}}>
                <Image
                  source={isMe==true? null: this.talkToAvatar}
                  style={isMe==true?null:styles.talkImg}
                />
                <View style={isMe==true?styles.talkViewRight:styles.talkView}>
                    {chatContent}
                </View>
                <Image
                    source={isMe==true? this.myAvatar :null}
                    style={isMe==true?styles.talkImgRight:null}
                />
            </View>
        );
    }

    myRenderFooter(e){
    	//让新的数据永远展示在ListView的底部
    	//通过ListView的renderFooter 绘制一个0高度的view，通过获取其Y位置，其实就是获取到了ListView内容高度底部的Y位置
        return <View onLayout={(e)=> {
            this.footerY= e.nativeEvent.layout.y;

            if (this.listHeight && this.footerY &&this.footerY>this.listHeight) {
                var scrollDistance = this.listHeight - this.footerY;
                this.refs._listView.scrollTo({y:-scrollDistance});
            }
        }}/>
    }

    pressSendBtn(){
        if(this.state.inputContentText.trim().length <= 0){
            return;
        }
        
        var txtMsg = {
        	type: "TEXT",
        	data: this.state.inputContentText,
			sender: this.chatInfo.talkFrom,
			senderName: this.chatInfo.talkFromName,
			receiver: this.chatInfo.talkTo,
			receiverName: this.chatInfo.talkToName,
			timestamp: (new Date()).getTime()
        }
        
        
        this.messages.push(txtMsg);

        this.refs._textInput.clear();
        this.setState({
            inputContentText:'',
            dataSource: this.state.dataSource.cloneWithRows(this.messages)
        })
    }

    render() {
        return (
            <View style={ styles.container }>

              <ListView
                ref='_listView'
                onLayout={(e)=>{this.listHeight = e.nativeEvent.layout.height;}}
                dataSource={this.state.dataSource}
                renderRow={this.renderEveryData.bind(this)}
                renderFooter={this.myRenderFooter.bind(this)}
                enableEmptySections={true}
              />

              <View style={styles.bottomView}>
                <View style={styles.chatInputArea}>
                  <TextInput
                      ref='_textInput'
                      onChangeText={(text) =>{this.state.inputContentText=text}}
                      placeholder=' 请输入对话内容'
                      returnKeyType='done'
                      style={styles.inputText}
                  />
                </View>

                <TouchableHighlight
                  underlayColor={'#AAAAAA'}
                  activeOpacity={0.5}
                  onPress={this.pressSendBtn.bind(this)}
                >
                    <View style={styles.sendBtn}>
                        <Text style={ styles.bottomBtnText }>发送</Text>
                    </View>
                </TouchableHighlight>
              </View>
            </View>
        );
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EEEEEE'
    },
    bottomView:{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#DDDDDD',
        height: 52,
        padding:5
    },
    sendBtn: {
        alignItems: 'center',
        backgroundColor: '#FF88C2',
        padding: 10,
        borderRadius:5,
        height:40,
    },
    bottomBtnText: {
        flex: 1,
        fontSize: 16,
        fontWeight: 'bold',
    },

    talkView: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'white',
        flexDirection: 'row',
        padding: 10,
        borderRadius:5,
        marginLeft:5,
        marginRight:55,
        marginBottom:10
    },
    talkImg: {
        height: 40,
        width: 40,
        marginLeft:10,
        marginBottom:10
    },
    talkText: {
        flex: 1,
        fontSize: 14,
        fontWeight: 'bold',
    },
    talkUploadedImage: {
        width: 200,
        height: 200,
        resizeMode: "contain"
    },
    talkViewRight: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#90EE90',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 10,
        borderRadius:5,
        marginLeft:55,
        marginRight:5,
        marginBottom:10
    },
    talkImgRight: {
        height: 40,
        width: 40,
        marginRight:10,
        marginBottom:10
    },
    chatInputArea: {
        height: 40,
        flexDirection: 'row',
        flex:1,  // 类似于android中的layout_weight,设置为1即自动拉伸填充
        borderRadius: 5,  // 设置圆角边
        backgroundColor: 'white',
        alignItems: 'center',
        marginLeft:5,
        marginRight:5,
        marginTop:10,
        marginBottom:10,
    },
    inputText: {
        flex:1,
        backgroundColor: 'transparent',
        fontSize: 14,
        marginLeft:5
    },
    buttomSpacer: {
    	height: 40,
    }
});