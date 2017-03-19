'use strict';

import React, { Component } from 'react';
import {
    Text,
    View, ScrollView,
    TextInput, Button,
} from 'react-native';
import ModalPicker from 'react-native-modal-picker';
import Prompt from 'react-native-prompt';

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
            imServerUrl: '',
            hostServerUrl: '',
            clientId: '',
            toClientId: '',
            token: '',
            _promptValue: '',
            _promptVisible: false
        };
        this.initialized = false;

        var self = this;
        perf.load('ConfigView', function(values){
            if (values){
                values._promptVisible = false;
                self.setState(values);
            }
        });
    }
    setState(values) {
        super.setState(values, function(){
            perf.save('ConfigView', this.state);
        });
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
    _buildModalPickerData(values){
    	var list = [];
    	for (var i=0; i<values.length; i++){
    		var value = values[i];
    		var data = {key:i, label: value||"(未指定)"};
    		list.push(data);
    	}
    	return list;
    }
    _doPromptSubmit(value){
        this.setState({
            imServerUrl: value + ":7778/boke-messager",
            hostServerUrl: value + ":8080/im-service/${service}.json",
            _promptVisible: false,
            _promptValue: value
        });
    }
    _doMessagerInit(){
        if (!this.state.imServerUrl && !this.state.hostServerUrl){
            this.setState({_promptVisible: true});
            return;
        }

        if (!this.state.imServerUrl || !this.state.hostServerUrl || !this.state.clientId){
            alert("IM 服务器地址 / 主服务器地址 / 当前用户编号 未填写完全");
            return;
        }
        var token = "dev-mode-test-token:" + this.state.clientId; //测试用的 token
        this.setState({token: token});

        this.props.configCallback("init", this.state);
        this.initialized = true;
    }
    _doTalkTo(){
        if (!this.state.toClientId){
            alert("对话用户编号 未填写完全");
            return;
        }
        if (!this.initialized){
            alert("IM 未初始化，请先执行 [初始化 IM]");
            return;
        }
        this.props.configCallback("talk", this.state);
    }
    _renderBody() {
        return (
            <ScrollView>
                <View style={configCss.section}>
                    <Text style={configCss.label}>IM 服务器地址(ws:// | http://): </Text>
                    <TextInput
                        style={configCss.input}
                        placeholder="example.com:7778/boke-messager"
                        value={this.state.imServerUrl}
                        onChangeText={(text) => this.setState({imServerUrl: text})}
                    />
                </View>
                <View style={configCss.section}>
                    <Text style={configCss.label}>主服务器地址(http://): </Text>
                    <TextInput
                        style={configCss.input}
                        placeholder="example.com:8080/im-service/${service}.json"
                        value={this.state.hostServerUrl}
                        onChangeText={(text) => this.setState({hostServerUrl: text})}
                    />
                </View>

                <View style={configCss.section}>
                    <Text style={configCss.label}>当前用户编号:</Text>
                    <ModalPicker
                        style={configCss.touchableInput}
                        data={this._buildModalPickerData(TEST_CLIENTS)}
                        initValue="请选择用户编号"
                        onChange={ (option)=>{this.setState({clientId:option.label, toClientId:""})} }>
	                    <Text>{this.state.clientId || "请选择用户编号"}</Text>
                    </ModalPicker>
                    <View style={configCss.buttons}>
                        <Button onPress={ e=>this._doMessagerInit(e) }
                          title="初始化 IM"
                          style={configCss.button}
                        />
                    </View>
                </View>
                <View style={configCss.section}>
                    <Text style={configCss.label}>对话用户编号:</Text>
                    <ModalPicker
	                    style={configCss.touchableInput}
	                    data={this._buildModalPickerData(this._getToClientsDynamically())}
	                    initValue="请选择对话用户编号"
	                    onChange={ (option)=>{this.setState({toClientId:option.label})} }>
	                    <Text>{this.state.toClientId || "请选择对话用户编号"}</Text>
	                </ModalPicker>
                    <View style={configCss.buttons}>
                        <Button onPress={ e=>this._doTalkTo(e) }
                          title="打开用户会话"
                          style={configCss.button}
                        />
                    </View>
                </View>

                <Prompt
                    title="快速输入服务器地址："
                    placeholder="example.com"
                    defaultValue={this.state._promptValue}
                    visible={this.state._promptVisible}
                    onCancel={() => this.setState({ _promptVisible: false})}
                    onSubmit={(value) => this._doPromptSubmit(value)}/>
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
