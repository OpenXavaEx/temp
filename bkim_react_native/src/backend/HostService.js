'use strict';

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

var HostService = function(config){
    this.hostServerUrl = config.hostServerUrl;
    this.clientId = config.clientId;
    this.token = config.token;

    this.baseServiceUrl = "http://" + this.hostServerUrl.substring(0, this.hostServerUrl.indexOf("/"));
    this.buddiesServiceUrl = "http://" + this.hostServerUrl.replace("${service}", "buddies");
}

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

module.exports = HostService;
