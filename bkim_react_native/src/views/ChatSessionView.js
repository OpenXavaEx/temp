'use strict';

//From: http://www.himigame.com/react-native/2346.html

import React, { Component } from 'react';
import {
    View,
    ScrollView,
    Text,
    Button,
    TouchableHighlight,
    Image,
    PixelRatio,
    ListView,
    StyleSheet,
    TextInput,
    Dimensions,
    Linking,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
import ImagePicker from 'react-native-image-picker';
import Modal from 'react-native-root-modal';
import InputScrollView from 'react-native-inputscrollview';

import PubSub from 'pubsub-js';
import debounce from 'lodash.debounce';

import DialogStacks from '../utils/DialogStacks';
import UITools from '../utils/UITools';

import WebSocketService from '../backend/WebSocketService';
import IMService from '../backend/IMService';

import {colors, chatSessionCss} from '../styles';

var moment = require("moment");

export default class ChatSessionView extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            inputContentText: '',
            inputContentHeight: INPUT_HEIGHT_MIN,
            showUploadingProgress: false,
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
        	self._openURL(fileName, fileUrl);
        });
        PubSub.subscribe("ChatSessionView/Image", function(msg, file){
        	var fileName = file.name;
        	var fileUrl = file.url;
        	self._openURL(fileName, fileUrl);
        });
    }
    
    _openURL(fileName, fileUrl){
    	if (!this.websocket) return;
    	
    	var realUrl = this.websocket.buildImageUrl(fileUrl, "");
    	Linking.canOpenURL(realUrl).then(supported => {
    		if (supported) {
    			Linking.openURL(realUrl);
    		} else {
    			UITools.errorToast("当前系统不支持文件 " + fileName);
    		}
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
    
    componentDidUpdate(prevProps, prevState) {
    	if (prevProps.chatInfo.sessionStartTime != this._prevSessionStartTime){
        	//避免前一个会话消息很多(滚动到很下面)而当前会话消息很少时，ListView 滚动超过底部，导致看不到当前消息
        	this.refs._listView.scrollTo({y:0, animated:false});
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
        	var previewUrl = this.websocket.buildImageUrl(msg.data.fileUrl, "icon");
        	var fileName = msg.data.fileName;
        	chatContent = (
        		<ChatImageViewer
        		    isMe={isMe}
        		    fileUrl={msg.data.fileUrl} fileName={fileName}
        		    source={{uri: previewUrl}} />
        	);
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
        				<Text style={[{alignSelf:(isMe==true?'flex-start':'flex-end')}, styles.talkTime]}>
        				    {moment(msg.timestamp).fromNow()}
        				</Text>
    				</View>
                </View>
                <Image
                    source={isMe==true? this.myAvatar :null}
                    style={isMe==true? styles.talkImgRight :null}
                />
  			</View>
  		);
    }

    _doScrollToFooter(){
    	this.refs._listView.scrollTo({y:this.scrollToFooterDistance, animated:true});
    }
    
    scrollToRenderFooter(e){
    	//让新的数据永远展示在ListView的底部
    	//通过 ListView 的 renderFooter 绘制一个0高度的view，通过获取其Y位置，其实就是获取到了ListView内容高度底部的Y位置
    	if (! this._tempFooter){
    		var _debounce = debounce(this._doScrollToFooter, 50);    //FIXME: 此处使用 debounce 并无明显效果
            this._tempFooter =( <View onLayout={(e)=> {
                this.footerY= e.nativeEvent.layout.y;

                if (this.listHeight && this.footerY &&this.footerY>this.listHeight) {
                    this.scrollToFooterDistance = this.footerY - this.listHeight;
                    _debounce.call(this);
                }
            }}/> );
    	}
    	return this._tempFooter;
    }

    _sendMessage(type, data){
        var msg = {
        	type: type,
        	data: data,
			sender: this.chatInfo.talkFrom,
			senderName: this.chatInfo.talkFromName,
			receiver: this.chatInfo.talkTo,
			receiverName: this.chatInfo.talkToName,
			timestamp: (new Date()).getTime()
        }
        
        this.websocket.sendMessage(msg);
        this.messages.push(msg);

        if ("TEXT"==type){
            this.setState({
                inputContentText: '',
                inputContentHeight: INPUT_HEIGHT_MIN,
                dataSource: this.state.dataSource.cloneWithRows(this.messages)
            })
        }else{
            this.setState({
                dataSource: this.state.dataSource.cloneWithRows(this.messages)
            })
        }
    }
    
    pressSendBtn(){
        if(this.state.inputContentText.trim().length <= 0){
            return;
        }
        if (!this.websocket){
        	return;
        }
        
        this._sendMessage("TEXT", this.state.inputContentText);
    }
    
    pressCamera(){
		if (!this.websocket){
        	return;
        }

    	var options = {
			title: '选择图片',
			takePhotoButtonTitle: '拍照',
			chooseFromLibraryButtonTitle: '从相册选择',
			cancelButtonTitle: '取消',
			maxWidth: 1024,
		    maxHeight: 1024,
			storageOptions: {
			    skipBackup: true,
			    path: 'bkim-images'
			}
		};
    	ImagePicker.showImagePicker(options, (response) => {
			if (response.didCancel) {
			    // User cancel, do nothing
			} else if (response.error) {
				UITools.errorToast("发送图片失败: "+response.error);
			} else {
				let fileUri = response.uri;
				this.uploadingProgress.show({uri: fileUri});
				
				var filePath = response.path;
				if (!filePath){
					filePath = fileUri.replace("file://", "");    //某些情况下（比如在 iOS 下）response.path 为空
				}
				
				let imSrv = new IMService(this.props.config);
				imSrv.upload(response.fileName, filePath, (written, total) => {
					var progress = (written*100/total).toFixed(0);
					this.uploadingProgress.setProgress(progress);
				}, (result) => {
					DialogStacks.closeTop();
					this._sendMessage("IMAGE", {
		        		fileName: result.fileName,
		        		fileUrl: result.url
		        	});
				}, (err) => {
					DialogStacks.closeTop();
				});
			}
		});
    }

    _onTextChange(event) {
    	//REF: http://stackoverflow.com/questions/31475187/making-a-multiline-expanding-textinput-with-react-native/40447354#40447354
    	
        const { contentSize, text } = event.nativeEvent;
        
        var height = contentSize.height;
        var maxHeight = INPUT_HEIGHT_MIN + 3*INPUT_FONT_SIZE;    //最多扩展4行

        if (height<INPUT_HEIGHT_MIN) height = INPUT_HEIGHT_MIN;
        if (height>maxHeight) height = maxHeight;

        this.setState({
            inputContentText: text,
            inputContentHeight: height
        }); 
    }
    
    render() {
        return (
            <InputScrollView contentContainerStyle={styles.container}>
	        
              <View style={styles.title}>
	              <TouchableHighlight
  		              underlayColor={chatSessionCss.TouchableHighlight.underlayColor}
	                  onPress={()=>{DialogStacks.closeTop()}}
	              >
	                  <Icon name='close' style={styles.titleActionIcon}/>
	              </TouchableHighlight>
		          <Text style={ styles.titleText }>{this.chatInfo.talkToName}</Text>
	              <TouchableHighlight
		              underlayColor={chatSessionCss.TouchableHighlight.underlayColor}
                      onPress={()=>{/*alert("Menus")*/}}
	              >
	                  <Icon name='bars' style={styles.titleActionIcon}/>
	              </TouchableHighlight>
		      </View>

              <ListView style={ styles.messageList }
                  ref='_listView'
                  onLayout={(e)=>{this.listHeight = e.nativeEvent.layout.height;}}
                  dataSource={this.state.dataSource}
                  renderRow={this.renderEveryData.bind(this)}
                  renderFooter={this.scrollToRenderFooter.bind(this)}
                  enableEmptySections={true}
                  pageSize={1000}   /* 设置较大的 pageSize 可以避免加载历史消息时多次 renderFooter */
              />

              <View style={[
            	  {height: this.state.inputContentHeight+INPUT_CONTAINER_PADDING*2},
            	  styles.bottomView
              ]}>
                  <Icon name="camera" style={styles.chatImageHandler} onPress={this.pressCamera.bind(this)}/>
                
                  <View style={[{height: this.state.inputContentHeight}, styles.chatInputArea]}>
                    <TextInput
                        ref='_textInput'
                        value={this.state.inputContentText}
                        onChange={this._onTextChange.bind(this)}
                        placeholder=' 请输入对话内容'
                        returnKeyType='done'
                        multiline={true}
                        style={[{height: this.state.inputContentHeight}, styles.inputText]}
                    />
                  </View>

                  <Button onPress={ this.pressSendBtn.bind(this) }
                    title="发送"
                    style={chatSessionCss.button}
                  />
              </View>
              
              <UploadProgress
                  ref={(uploadingProgress) => { this.uploadingProgress = uploadingProgress; }}
              />

            </InputScrollView>
        );
    }
}

/**
 * 上传进度对话框
 */
class UploadProgress extends React.Component {
	constructor(props) {
        super(props);
        
        this.state = {
        	visible: false,
        	progress: 0,
        	image: null
        };
    }
	
	_renderImage(){
		if (this.state.image){
			return (
			    <Image
		            source={this.state.image}
		            style={styles.uploadingImage}
		        />
			);
		}else{
			return null;
		}
	}
	
	render(){
		return (
			<Modal visible={this.state.visible} >
			    <View style={styles.uploadingDialog}>
			        {this._renderImage()}
    		        <Text style={styles.uploadingTitle}>正在上传 {this.state.progress}% ...</Text>
			    </View>
			</Modal>
		);
	}
	
	show(imageSource){
		this.setState({visible: true, image: imageSource});
		DialogStacks.push(this, function(dialog, data){
			dialog.setState({visible: false});
		});
	}
	
	setProgress(progress){
		this.setState({progress: progress});
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
		try{
			Image.getSize(this.props.source.uri, (width, height) => {
				this.setState({width, height}); 
			});
		}catch(ex){
			//Ignore exception
		}
	}
	render() {
		if (this.state.width && this.state.height){
			return (
				<TouchableHighlight
				    underlayColor={chatSessionCss.TouchableHighlight.underlayColor}
				    onPress={() => PubSub.publish("ChatSessionView/Image", {
				    	name: this.props.fileName, url: this.props.fileUrl
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

const INPUT_HEIGHT_MIN=40;
const INPUT_FONT_SIZE=14;
const INPUT_CONTAINER_PADDING=5;

var styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EEEEEE',
    },
    
    uploadingDialog: {
    	flexDirection:'column',
        alignItems: 'center',
        height: 200,
        width: 260,
    },
    uploadingTitle: {
    	position: 'relative',
    	top: -146,
    	left: 14,	//4+(260-240)/2
    	color: colors.DimGray,
        fontSize: 16,
        backgroundColor: 'rgba(211,211,211,0.8)',	//211=D3, colors.LightGray with alpha=0.8
        padding: 3,
        borderRadius: 3,
        alignSelf: 'flex-start',
    },
    uploadingImage: {
        height: 150,
        width: 240,
        padding: 5,
        borderWidth: 2,
        borderColor: colors.DimGray,
        borderRadius: 10,
    },
    
    title: {
        padding: 9,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        borderBottomWidth: 0.5,
        backgroundColor: '#F9F9FB',
        borderColor: '#DAD9DC',
        flexDirection:'row',
    },
    titleText: {
        color: '#7F7D89',
        fontSize: 16,
        textAlign: "center",
        flex: 1,
    },
    titleActionIcon: {
        color: colors.Gray,
        fontSize: 16,
        paddingTop: 3,
        paddingBottom: 3,
        paddingLeft: 9,
        paddingRight: 9,
        borderRadius: 5,
        //borderWidth: 1,
        //borderColor: colors.DimGray,
    },
    
    messageList: {
        paddingTop: 9,
        paddingBottom: 9,
    },
    
    bottomView:{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#DDDDDD',
        padding: INPUT_CONTAINER_PADDING
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
    talkTime:{
    	fontSize: 10,
        fontWeight: 'normal',
    	color: colors.DimGray,
        backgroundColor: 'rgba(211,211,211,0.3)',	//211=D3, colors.LightGray with alpha=0.3
        padding: 1,
        paddingLeft: 5,
        paddingRight: 5,
        borderRadius: 3,
        position: 'relative',
        top: 3,
    },

    chatImageHandler: {
    	width: 32,
    	height: 32,
    	fontSize: 16,
    	padding: 8,
        borderRadius: 16,  // 设置圆角边
        borderWidth: 1,
        borderColor: colors.White,
    },
    chatInputArea: {
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
        fontSize: INPUT_FONT_SIZE,
        marginLeft:5
    },
    buttomSpacer: {
    	height: 40,
    }
});