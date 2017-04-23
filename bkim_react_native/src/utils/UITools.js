'use strict';

import Toast from 'react-native-root-toast';

var errorToast = function(message){
	Toast.show(message, {
	    duration: Toast.durations.LONG,
	    position: Toast.positions.BOTTOM,
	    shadow: true,
	    animation: true,
	    hideOnPress: true,
	    delay: 0,
	});
}

export default {
	errorToast: errorToast,
}
