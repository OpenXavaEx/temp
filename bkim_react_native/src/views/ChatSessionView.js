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

var datas =[{
    isMe:false,
    talkContent:'最近在学习React Native哦！',
},{
    isMe:true,
    talkContent:'听说是个跨平台开发原生App的开源引擎',
}, {
    isMe:false,
    talkContent:'嗯啊，很不错，可以尝试下吧。过了这段时间继续研究UE去了。唉～技术出身，就是放不下技术呀～',
}, {
    isMe:false,
    talkContent:'感觉编不下去对话了呀......感觉编不下去对话了呀......感觉编不下去对话了呀......感觉编不下去对话了呀......',
}, {
    isMe:true,
    talkContent:'无语！',
}, {
    isMe:false,
    talkContent:'自说自话，好难！随便补充点字数吧，嗯 就酱紫 :) ',
}, {
    isMe:true,
    talkContent:'感觉编不下去对话了呀......感觉编不下去对话了呀..',
}, {
    isMe:false,
    talkContent:'GG,思密达编不下去了！',
}];

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
    }

    componentDidMount() {
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(datas)
        });
    }

    renderEveryData(eData) {
          return (
              <View style={{flexDirection:'row',alignItems: 'center'}}>
                <Image
                  source={eData.isMe==true? null:require("../resources/default-avatar/icon-user.png")}
                  style={eData.isMe==true?null:styles.talkImg}
                />
                  <View style={eData.isMe==true?styles.talkViewRight:styles.talkView}>
                    <Text style={ styles.talkText }>
                              {eData.talkContent}
                    </Text>
                  </View>
                <Image
                    source={eData.isMe==true? require("../resources/default-avatar/icon-myself.png") :null}
                    style={eData.isMe==true?styles.talkImgRight:null}
                />
              </View>
          );
      }

    myRenderFooter(e){
    }

    pressSendBtn(){
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
});