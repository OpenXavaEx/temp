'use strict';

var HostService = function(config){
    this.hostServerUrl = config.hostServerUrl;
    this.peerId = config.peerId;
    this.token = config.token;

    this.baseServiceUrl = "http://" + this.hostServerUrl.substring(0, this.hostServerUrl.indexOf("/"));

    this.buddiesServiceUrl = "http://" + this.hostServerUrl.replace("${service}", "buddies");
    
    this.userInfosCache = {};
    this.userinfoServiceUrl = "http://" + this.hostServerUrl.replace("${service}", "userinfo");
}

/**
 * 返回聊天伙伴信息的服务(相对)地址: 聊天伙伴及其分组信息;
 * 返回数据格式:
 *     [{
 *         groupName: "XXXX",               //分组名称
 *         groupType: 'blacklist'/'normal', //分组类型，normal-普通分组(此时 groupType 属性可省略), blacklist-黑名单
 *         users: [{                        //分组包含的用户
 *             code: "XXXX",                     //用户 code
 *             name: "XXXX",                     //用户名称(用于显示)
 *             icon: "/.../user01.png",          //用户的头像, 相对或者绝对 URL
 *         }, ...]
 *     }, ...]
 */
HostService.prototype.loadContactsData = function(callback){
    fetch(this.buddiesServiceUrl, {
        method: 'POST',
        body: `t=${this.token}`
    }).then(
        (response) => response.json()
    ).then((groups) => {
        for (var i=0; i<groups.length; i++){
            var users = groups[i].users;
            for (var j=0; j<users.length; j++){
                var user = users[j];
                if (user.icon && user.icon.startsWith("/")){
                    //如果是使用 “/” 开头的图片地址，统一在前面拼上 baseServiceUrl
                    user.icon = this.baseServiceUrl + user.icon;
                }
            }
        }
        callback(groups);
    });
}

/**
 * 返回用户信息的服务(相对)地址: 因为 messager 的 websocket 服务器不保留用户信息, 因此客户端需要通过这个服务获取相关的用户信息;
 * 请求的数据格式: {users: [userCode1, userCode2, ...]}
 * 返回数据格式: {
 *     “XXXX": {    //以用户的 code 为 key
 *         name: "XXXX",             //用户名称(用于显示)
 *         icon: "/.../user01.png",  //用户的头像, 相对或者绝对 URL
 *     }, ...
 * }
 */
HostService.prototype.fetchUserInfo = function(userCodes, callback){
    var userInfoTable = {};
	var codesToQuery = [];
    for (var i=0; i<userCodes.length; i++){
    	var ucode = userCodes[i];
        if (this.userInfosCache[ucode]){	//缓存中存在的用户信息不需要到后台再去查找了
        	userInfoTable[ucode] = this.userInfosCache[ucode];
        }else {
        	codesToQuery.push(ucode);
        }
    }
    if (codesToQuery.length <= 0){
    	callback(userInfoTable);
    }else{
    	var self = this;
    	var usersParam = JSON.stringify(codesToQuery);
    	fetch(this.userinfoServiceUrl, {
            method: 'POST',
            body: `users=${usersParam}&t=${this.token}`
        }).then(
            (response) => response.json()
        ).then((usersData) => {
        	for (var i=0; i<codesToQuery.length; i++){
        		var ucode = codesToQuery[i];
        		var userData = usersData[ucode];
        		if (userData){
        			if (userData.icon && userData.icon.startsWith("/")){
                        //如果是使用 “/” 开头的图片地址，统一在前面拼上 baseServiceUrl
        				userData.icon = this.baseServiceUrl + userData.icon;
                    }
        			//组织 callback 需要的参数数据
        			userInfoTable[ucode] = userData;
        			self.userInfosCache[ucode] = userData;	//顺便记录到缓存中
        		}
        	}
        	callback(userInfoTable);
        });
    }
}

module.exports = HostService;
