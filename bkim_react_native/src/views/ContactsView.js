'use strict';

import React, { Component } from 'react';
import {
    View, ScrollView,
    ListView,
    Text,
    Image,
} from 'react-native';

import Accordion from 'react-native-accordion';

import {colors, contactsCss} from '../styles';

var buildDataSource = function(contactsData){
    var dataSource = new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2
    });
    return dataSource.cloneWithRows(contactsData);
}

export default class ContactsView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dataSource: buildDataSource(this.props.contacts)
        };
    }
    componentWillReceiveProps(nextProps){
        //对于通过 props 属性影响的数据，在 componentWillReceiveProps 方法中 setState 比较合适
        this.setState({dataSource: buildDataSource(nextProps.contacts)});
    }
    renderGroupRow(group) {
        var users = group.users||[];
        var groupType = group.groupType;

        var header = (
            <View style={contactsCss.groupHeader}>
                <Text style={contactsCss.groupTitle}>{group.groupName}</Text>
                <Text style={contactsCss.groupTags}>{users.length}</Text>
            </View>
        );

        var userDs = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2
        });
        var renderUserRow = function(user){
            //基于 绝对路径、相对路径、默认值 计算 image 需要显示的图片
            var icon = user.icon;
            var imgSrc;
            if (icon){
                imgSrc = {uri: icon};
            }else{
                imgSrc = require("../resources/default-avatar/icon-user.png");
            }
            //基于 用户状态、是否黑名单，计算 图标颜色 的修饰
            var decoratedAvatarCss = {};
            if ("blacklist"==groupType){
                decoratedAvatarCss.tintColor = colors.DarkGray;
            }

            return (
                <View style={contactsCss.contact}>
                  <View style={contactsCss.contactAvatarContainer}>
                    <Image source={imgSrc} style={[contactsCss.contactAvatar, decoratedAvatarCss]} />
                  </View>
                  <View style={contactsCss.contactNameContainer}>
                    <Text style={contactsCss.contactName}>{ user.name }</Text>
                  </View>
                </View>

            );
        }
        var content = (
            <ListView
                dataSource={userDs.cloneWithRows(users)}
                renderRow={renderUserRow}
            />
        );

        return (
            <Accordion
                header={header}
                content={content}
                easing="easeOutCubic"
            />
        );
    }
    render() {
        return (
            <ScrollView>
                <ListView
                    dataSource={this.state.dataSource}
                    renderRow={this.renderGroupRow}
                    enableEmptySections={true}
                />
            </ScrollView>
        )
    }
}
