'use strict';

import React, { Component } from 'react';
import {
    Text,
    View, ScrollView,
    TextInput, Picker, Button,
} from 'react-native';

import {colors, configCss} from '../styles';

import { perf } from '../utils/storage';

const TEST_CLIENTS = [
    "",
    "boke-test-001",
    "boke-test-002",
    "boke-test-003",
    "boke-test-004",
    "boke-test-005",
    "boke-test-006",
    "boke-test-007",
    "boke-test-008",
    "boke-test-009",
    "boke-test-010",
    "boke-test-011",
    "boke-test-012",
];

export default class ConfigView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            imAddr: '',
            hostAddr: '',
            clientId: '',
            toClientId: '',
        };
        var self = this;
        perf.load('ConfigView', function(values){
            self.setState(values);
        });
    }
    setState(values) {
        super.setState(values);
        perf.save('ConfigView', this.state);
    }
    _getToClientsDynamically() {
        var selfId = this.state.clientId;
        if (! selfId){
            return [""];
        }
        var result = [];
        for(var i=0; i<TEST_CLIENTS.length; i++){
            if (selfId != TEST_CLIENTS[i]){
                result.push(TEST_CLIENTS[i]);
            }
        }
        return result;
    }
    _doMessagerInit(){
        if (!this.state.imAddr || !this.state.hostAddr || !this.state.clientId){
            alert("IM 服务器地址 / 主服务器地址 / 当前用户编号 未填写完全");
            return;
        }
        alert("TODO: \n"+JSON.stringify(this.state));
    }
    _doTalkTo(){
        if (!this.state.toClientId){
            alert("对话用户编号 未填写完全");
            return;
        }
        alert("TODO: \n"+JSON.stringify(this.state));
    }
    _renderBody() {
        return (
            <ScrollView>
                <View style={configCss.section}>
                    <Text style={configCss.label}>IM 服务器地址(ws:// | http://): </Text>
                    <TextInput
                        style={configCss.input}
                        placeholder="example.com:7778/boke-messager"
                        value={this.state.imAddr}
                        onChangeText={(text) => this.setState({imAddr: text})}
                    />
                </View>
                <View style={configCss.section}>
                    <Text style={configCss.label}>主服务器地址(http://): </Text>
                    <TextInput
                        style={configCss.input}
                        placeholder="example.com:8080/im-service/${service}.json"
                        value={this.state.hostAddr}
                        onChangeText={(text) => this.setState({hostAddr: text})}
                    />
                </View>
                <View style={configCss.section}>
                    <Text style={configCss.label}>当前用户编号:</Text>
                    <Picker selectedValue={this.state.clientId}
                        onValueChange={(id) => this.setState({clientId: id, toClientId: ''})}>
                        {
                            TEST_CLIENTS.map((s, i) => {
                                return <Picker.Item key={i} value={s} label={s?s:'(未指定)'} />
                            })
                        }
                    </Picker>
                    <View style={configCss.buttons}>
                        <Button onPress={ e=>this._doMessagerInit(e) }
                          title="初始化 IM"
                          color={colors.DarkBlue}
                        />
                    </View>
                </View>
                <View style={configCss.section}>
                    <Text style={configCss.label}>对话用户编号:</Text>
                    <Picker selectedValue={this.state.toClientId}
                        onValueChange={(id) => this.setState({toClientId: id})}>
                        {
                            this._getToClientsDynamically().map((s, i) => {
                                return <Picker.Item key={i} value={s} label={s?s:'(未指定)'} />
                            })
                        }
                    </Picker>
                    <View style={configCss.buttons}>
                        <Button onPress={ e=>this._doTalkTo(e) }
                          title="打开用户会话"
                          color={colors.DarkBlue}
                        />
                    </View>
                </View>
            </ScrollView>
        );
    }
    render() {
        return (
            <View>
                <Text style={configCss.title}>boke-messager 配置项和测试参数</Text>
                { this._renderBody() }
                <View style={configCss.line}></View>
                <Text style={configCss.noticeLabel}>注意: 此处的配置项和参数仅用于测试 !</Text>
            </View>
        );
    }
}
