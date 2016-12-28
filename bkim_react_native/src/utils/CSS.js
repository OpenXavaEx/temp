/**
 * Utilities for StyleSheet
 */
 'use strict';

import {Platform} from "react-native";
 
var _mix = function(fromStyles, toStyles){
    if (typeof(fromStyles)!='object'){
        return;
    }
    for (var itemName in fromStyles){
        var style = fromStyles[itemName];
        if (style) {
            if (toStyles[itemName]){
                _mix(style, toStyles[itemName]);
            }else{
                toStyles[itemName] = style;
            }
        }
    }
}

var _platform = function(iosStyle, androidStyle){
	if (Platform.OS=="ios"){
		return iosStyle;
	}else{
		return androidStyle;
	}
}

export default {
    mix: _mix,
    platform: _platform,
}
