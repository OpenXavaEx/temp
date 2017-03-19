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
var doWebSocketConnect = function(config, fromUser, toUser, fromUserName, toUserName){
	var wsUrl = "ws://" + config.imServerUrl + "/messager/" + config.token + "/" + fromUser + "/to/" + toUser;

    localVars.ws_Ready = false;
    if (webSocketClient){
    	webSocketClient.close();
    }
    webSocketClient = new WebSocket(wsUrl);
    webSocketClient.onopen = () => {
        // 打开一个连接
        localVars.ws_Ready = true;
    };
    webSocketClient.onerror = (evt) => {
        // 发生了一个错误
        console.log("WebSocker Error: ", evt.message);
    };
    webSocketClient.onclose = (evt) => {
        // 连接被关闭了
        console.log("WebSocket closed with code/reason: ", evt.code, evt.reason);
        webSocketClient = null;
        localVars.ws_Ready = false;
    };
    webSocketClient.onmessage = (evt) => {
        // 接收到了一个消息
        if (! evt.data) return;

        var msg = JSON.parse(evt.data);
        var type = msg.type;
        if ("BLANK"!=type){		//BLANK 类型的数据不处理
            //localDataClient.pushLocalMessageHistory(msg.sender, msg.sender, msg);
        }

        //处理 attachments
        var attachments = msg.attachments;
        if (attachments && Array.isArray(attachments)){
            for(var i=0; i<attachments.length; i++){
                var attachment = attachments[i];
                if (attachment && "MyActiveConnectData"==attachment.dataType){
                    //处理 MyActiveConnectData 类型
                    PubSub.publish(attachment.dataType, attachment);
                }else if ("RecentHistory"==attachment.dataType){
                    //处理最近的历史信息
                }else if ("ReconnectData"==attachment.dataType){
                    inReconnecting=true;
                    //closeMainPanel();
                    if(((new Date().getTime())/1000-lastConnectTimestamp/1000)>30){
                        //doInitMessager();
                        inReconnecting=false;
                    }
                }
            }
        }
    };
    localVars.ws_Sender = fromUser;
    localVars.ws_Receiver = toUser;
    localVars.ws_SenderName = fromUserName;
    localVars.ws_ReceiverName = toUserName;
}

var WebSocketService = function(config){
    this.config = {
        imServerUrl: config.imServerUrl,
        clientId: config.clientId,
        token: config.token
    };
}

WebSocketService.prototype.initConnect = function(){
    doWebSocketConnect(this.config, this.config.clientId, this.config.clientId, null, null);
}

module.exports = WebSocketService;
