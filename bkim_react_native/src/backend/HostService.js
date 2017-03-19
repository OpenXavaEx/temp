'use strict';

var seq = 0;
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
 var data1 = [{
       groupName: "VIP 客户",
       groupType:"normal",
       users: [{
              code: "boke-test-002",
              name: "测试用户2",
              icon: "/user-icons/02.png"
       }, {
              code: "boke-test-004",
              name: "测试用户4",
              icon: "/user-icons/04.png"
       }]
 }, {
       groupName: "普通客户",
       groupType:"normal",
       users: [{
              code: "boke-test-005",
              name: "测试用户5-上海博科资讯股份有限公司",
              //icon: "/user-icons/05.png"
       }, {
              code: "boke-test-007",
              name: "测试用户7",
              icon: "/user-icons/07.png"
       }]
 }, {
       groupName: "潜在客户",
       groupType:"normal",
       users: [{
              code: "boke-test-006",
              name: "测试用户6-上海博科资讯股份有限公司",
              icon: "/user-icons/06.png"
       }, {
              code: "boke-test-008",
              name: "测试用户8",
              icon: null
       }]
 }, {
       groupName: "更多测试",
       groupType:"normal",
       users: [{
              code: "boke-test-011",
              name: "测试用户11-上海博科资讯股份有限公司",
              icon: null
       }, {
              code: "boke-test-012",
              name: "测试用户12",
              icon: null
       }]
 },{
     groupName: "黑名单",
     groupType:"blacklist",
     users: [{
         code: "boke-test-009",
         name: "测试用户9",
         icon: null
     }, {
         code: "boke-test-010",
         name: "测试用户10",
         icon: null
     }]
 }];

 var data2 = [{
       groupName: "VIP 客户",
       groupType:"normal",
       users: [{
              code: "boke-test-002",
              name: "测试用户2",
              icon: "/user-icons/02.png"
       }, {
              code: "boke-test-004",
              name: "测试用户4",
              icon: "/user-icons/04.png"
       }]
 },{
     groupName: "黑名单",
     groupType:"blacklist",
     users: [{
         code: "boke-test-009",
         name: "测试用户9",
         icon: null
     }, {
         code: "boke-test-010",
         name: "测试用户10",
         icon: null
     }]
 }];

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
