'use strict';

var stacks = [/* {
    dialog: dialogA,
    onDismissing: callback1,
    data: {} //And other data
}, {
    dialog: dialogB,
    onDismissing: callback2,
    data: [] //And other data
}*/];

var push = function(dialog, dismissingCallback){
	stacks.push({
		dialog: dialog,
		onDismissing: dismissingCallback
	});
}

var closeTop = function(){
	if (stacks.length>0){
		var item = stacks[stacks.length-1];
		var cont = item.onDismissing(item.dialog, item.data);
		if (null==cont || cont){
			stacks.pop();
			return true;
		}
	}
	return false;
}

var hardwareBackEventHandler = function(){
	if (stacks.length<=0){
		return false;	//默认行为
	}
	
	var closed = closeTop();
	if (closed){
		return true;	//已经关闭了一层对话框, 不用再响应系统行为了
	}else{
		return false;
	}
}


export default {
	push: push,
	closeTop: closeTop,
	hardwareBackEventHandler: hardwareBackEventHandler
}
