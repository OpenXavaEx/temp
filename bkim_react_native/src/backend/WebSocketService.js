'use strict';

import PubSub from 'pubsub-js';

//本地全局变量
var localVars = {
	/** WebSocket 连接状态标识 */
	ws_Ready: false,
	/** WebSocket 当前连接的 Sender */
	ws_Sender: null,
	/** WebSocket 当前连接的 Receiver */
	ws_Receiver: null,
	/** WebSocket 当前连接的 Sender 的名称 */
	ws_SenderName: null,
	/** WebSocket 当前连接的 Receiver 的名称 */
	ws_ReceiverName: null
}

var webSocketClient;

var cachedMessages = {};    //以 Sender/receiver 为 key 存储未发送的 消息数组
var getCachedMessages = function(sender, receiver){
	if (! cachedMessages[sender]){
		cachedMessages[sender] = {};
	}
	var bySender = cachedMessages[sender];
	
	if (! bySender[receiver]){
		bySender[receiver] = [];
	}
	
	return bySender[receiver];
}

var doWebSocketConnect = function(config, fromUser, toUser, fromUserName, toUserName){
	var wsUrl = "ws://" + config.imServerUrl + "/messager/" + config.token + "/" + fromUser + "/to/" + toUser;

    localVars.ws_Ready = false;
    if (webSocketClient){
    	webSocketClient.close();
    }
    
    //FIXME: 目前在连接出错的情况下没有太好的方法清除原有的消息显示
    PubSub.publish("RecentHistory", {messages: []});
    
    webSocketClient = new WebSocket(wsUrl);
    webSocketClient.onopen = () => {
        // 打开一个连接
        localVars.ws_Ready = true;
        //发送可能存在的缓存消息
    	doSendMessage(config);
    };
    webSocketClient.onerror = (evt) => {
        // 发生了一个错误
        console.log("WebSocker Error: ", evt.message);
    };
    webSocketClient.onclose = (evt) => {
        // 连接被关闭了
        console.log("WebSocket closed with code/reason: ", evt.code, evt.reason);
        //webSocketClient = null;    注意！前一个 socket 关闭时不能把全局变量设置为 null
        localVars.ws_Ready = false;
    };
    webSocketClient.onmessage = (evt) => {
        // 接收到了一个消息
        if (! evt.data) return;

        var msg = JSON.parse(evt.data);
        var type = msg.type;
        if ("BLANK"!=type){		//BLANK 类型的数据不处理
        	PubSub.publish("OnMessage", msg);
        }

        //处理 attachments
        var attachments = msg.attachments;
        if (attachments && Array.isArray(attachments)){
            for(var i=0; i<attachments.length; i++){
                var attachment = attachments[i];
                if (!attachment){
                	//Do nothing
                }else if ("MyActiveConnectData"==attachment.dataType){
                    //处理 MyActiveConnectData 类型
                    PubSub.publish("MyActiveConnectData", attachment);
                }else if ("RecentHistory"==attachment.dataType){
                	if (localVars.ws_Sender && localVars.ws_Sender!=localVars.ws_Receiver){
                        //处理最近的历史信息(针对不是 self connection 的情况)
                    	PubSub.publish("RecentHistory", attachment);
                	}
                }else if ("ReconnectData"==attachment.dataType){
                	PubSub.publish("ReconnectData", attachment);
                }
            }
        }
    };
    localVars.ws_Sender = fromUser;
    localVars.ws_Receiver = toUser;
    localVars.ws_SenderName = fromUserName;
    localVars.ws_ReceiverName = toUserName;
}

var doSendMessage = function(config, message){
	if (localVars.ws_Sender && localVars.ws_Sender==localVars.ws_Receiver){
		return;    //预防: 在 self connecting 状态不能发送消息
	}
	
	var cached = getCachedMessages(localVars.ws_Sender, localVars.ws_Receiver);
	if (message){
		cached.push(message);    //在发送前先提交到缓存, 以适应网络出现问题的情况
	}
	
	if ( !webSocketClient || webSocketClient.readyState!=1/*连接成功*/ ){
		if (!webSocketClient || webSocketClient.readyState!=0/*正在连接*/){
			//检查 WebSocket 是否正常连接, 没有正常连接的话, 重新连接
			doWebSocketConnect(
					config, config.peerId, localVars.ws_Receiver, localVars.ws_SenderName, localVars.ws_ReceiverName);
		}
	}else{
		for (var i=0; i<cached.length; i++){
			var msg = cached[i];
			var msgText = JSON.stringify(msg);
			webSocketClient.send(msgText);
		}
		cached.splice(0, cached.length);    //发送完成后清除消息缓存
	}
}


var WebSocketService = function(config){
    this.config = {
        imServerUrl: config.imServerUrl,
        peerId: config.peerId,
        token: config.token
    };
    this.uploadUrl = "http://"+config.imServerUrl+"/upload/";
}

WebSocketService.prototype.initConnect = function(){
    doWebSocketConnect(this.config, this.config.peerId, this.config.peerId, null, null);
}

WebSocketService.prototype.connectTo = function(talkToPeerId, myName, talkToName){
    doWebSocketConnect(this.config, this.config.peerId, talkToPeerId, myName, talkToName);
}

WebSocketService.prototype.sendMessage = function(message){
	doSendMessage(this.config, message);
}

WebSocketService.prototype.buildImageUrl = function(message, resizeType){
	var imgUrl = message.data.fileUrl;
	return this.uploadUrl + message.data.fileUrl + "?resize="+resizeType+"&t="+this.config.token;
}

module.exports = WebSocketService;
