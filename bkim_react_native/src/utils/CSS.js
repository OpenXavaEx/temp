/**
 * Utilities for StyleSheet
 */
 'use strict';

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

export default {
    mix: _mix,
}
