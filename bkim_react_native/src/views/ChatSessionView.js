'use strict';

//From: http://www.himigame.com/react-native/2346.html

import React, { Component } from 'react';
import {
    View,
    Text,
    Button,
    TouchableHighlight,
    Image,
    PixelRatio,
    ListView,
    StyleSheet,
    TextInput,
    Alert,
    Dimensions,
} from 'react-native';

import PubSub from 'pubsub-js';

import WebSocketService from '../backend/WebSocketService';

import {colors, chatSessionCss} from '../styles';

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
        PubSub.subscribe("OnMessage", function(msg, receivedMessage){
        	self.messages.push(receivedMessage);
        	self.setState({
                dataSource: self.state.dataSource.cloneWithRows(self.messages)
            });
        });
        PubSub.subscribe("ChatSessionView/File", function(msg, file){
        	var fileName = file.name;
        	var fileUrl = file.url;
        	alert(fileUrl);
        });
        PubSub.subscribe("ChatSessionView/Image", function(msg, file){
        	var fileName = file.name;
        	var fileUrl = file.url;
        	alert(fileUrl);
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
        	chatContent = (
        		<Text style={ isMe==true?styles.talkTextRight:styles.talkText }>
                    {msg.data}
                </Text>
            );
        }else if ("IMAGE"==msgType){
        	var url = msg.data.fileUrl;
        	var previewUrl = this.websocket.buildImageUrl(msg, "icon");
        	var fileName = msg.data.fileName;
        	chatContent = <ChatImageViewer isMe={isMe} fileName={fileName} source={{uri: previewUrl}} />
        }else if ("FILE"==msgType){
        	var url = msg.data.fileUrl;
        	var fileName = msg.data.fileName;
        	chatContent = (
        		<TouchableHighlight
        		    underlayColor={chatSessionCss.TouchableHighlight.underlayColor}
        		    onPress={() => PubSub.publish("ChatSessionView/File", {name: fileName, url: url})}
        		>
	        		<Text style={ isMe==true?styles.talkTextRight:styles.talkText }>
	        			{"[文件] "}<Text style={styles.talkFile}>{fileName}</Text>
			        </Text>
		        </TouchableHighlight>
		    );
        }else {
        	chatContent = (
        		<Text style={ isMe==true?styles.talkTextRight:styles.talkText }>
        			{"未知类型: " + msgType}
		        </Text>
		    );
        }
        
        var sWidth = Dimensions.get('window').width;
  		return (
  			<View style={isMe==true?styles.everyRowRight:styles.everyRow}>
                <Image
                  source={isMe==true? null: this.talkToAvatar}
                  style={isMe==true? null: styles.talkImg}
                />
                <View style={{width:sWidth - 20}}>
    				<View style={isMe==true?styles.talkViewRight:styles.talkView}>
                        {chatContent}
    				</View>
                </View>
                <Image
                    source={isMe==true? this.myAvatar :null}
                    style={isMe==true? styles.talkImgRight :null}
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
        if (!this.websocket){
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
        
        this.websocket.sendMessage(txtMsg);
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

                <Button onPress={ this.pressSendBtn.bind(this) }
                  title="发送"
                  style={chatSessionCss.button}
                />
                </View>
            </View>
        );
    }
}

/**
 * 支持自动根据图片大小调整显示区域的图片显示组件
 */
class ChatImageViewer extends React.Component {
	constructor(props) {
        super(props);
        
        this.state = {
        	width: 0,
        	height: 0
        };
    }
	componentDidMount() {
		Image.getSize(this.props.source.uri, (width, height) => {
			this.setState({width, height}); 
		});
	}
	render() {
		if (this.state.width && this.state.height){
			return (
				<TouchableHighlight
				    underlayColor={chatSessionCss.TouchableHighlight.underlayColor}
				    onPress={() => PubSub.publish("ChatSessionView/Image", {
				    	name: this.props.fileName, url: this.props.source.uri
				    })}
				>
					<Image
			            source={this.props.source}
			            style={{
			            	height: this.state.height,
			            	width: this.state.width,
			            	resizeMode: Image.resizeMode.contain
			            }}
			        />
				</TouchableHighlight>
			);
		}else{
			return (
				<Text style={ this.props.isMe==true?styles.talkTextRight:styles.talkText }>
					<Text style={ styles.talkMessageInfo }>
		        		{"正在加载: "} <Text style={{fontStyle: 'italic'}}>{this.props.fileName}</Text> {" ..."}
		        	</Text>
				</Text>
            );
		}
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
        backgroundColor: colors.Blue,
        padding: 10,
        borderRadius:5,
        height:40,
    },
    bottomBtnText: {
        flex: 1,
        color: colors.White,
        fontSize: 16,
        fontWeight: 'bold',
    },

    everyRow:{
        flexDirection:'row',
        alignItems: 'center'
    },
    everyRowRight:{
        flexDirection:'row',
        alignItems: 'center',
        justifyContent:'flex-end'
    },
    talkView: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius:5,
        marginLeft:5,
        marginRight:55,
        marginBottom:10,
        alignSelf:'flex-start',
    },
    talkViewRight: {
        backgroundColor: '#cbeaf9',
        padding: 10,
        borderRadius:5,
        marginLeft:55,
        marginRight:5,
        marginBottom:10,
        alignSelf:'flex-end',
    },
    talkText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    talkTextRight: {
        fontSize: 16,
        fontWeight: 'bold',
        alignSelf:'flex-end',
    },
    talkFile: {
    	color: colors.Blue,
    	textDecorationLine: 'underline',
    },
    talkImg: {
        height: 40,
        width: 40,
        marginLeft:10,
        marginBottom:10
    },
    talkImgRight: {
        height: 40,
        width: 40,
        marginRight:10,
        marginBottom:10
    },
    talkMessageInfo: {
        flex: 1,
        fontSize: 10,
        fontWeight: 'normal',
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