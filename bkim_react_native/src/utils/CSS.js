/**
 * Utilities for StyleSheet
 */
 'use strict';

import {Platform} from "react-native";

var _mix = function(fromStyles, toStyles){
    if (typeof(fromStyles)!='object'){
        //如果是最底层的 CSS 属性, 实际上 _mix 不会对 toStyles 对象造成影响 -- 不会覆盖
        return toStyles;
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
    return toStyles;
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
