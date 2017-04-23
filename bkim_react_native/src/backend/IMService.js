'use strict';

import UITools from '../utils/UITools';

import RNFetchBlob from 'react-native-fetch-blob';

var _handleUploadError = function(fileName, err, errorCallback){
    var msg = `文件 ${fileName} 上传失败`;
    if (err && err.message){
    	msg = msg + ": " + err.message;
    }
    UITools.errorToast(msg);
    //Call error handler
    errorCallback(err);
}

export default class IMService {
	constructor(config) {
	    this.config = {
            imServerUrl: config.imServerUrl,
            peerId: config.peerId,
            token: config.token
        };
        this.uploadUrl = "http://"+config.imServerUrl+"/upload/";
    }
	
	upload(fileName, filePath, progressCallback, successCallback, errorCallback){
		RNFetchBlob.fetch('POST', this.uploadUrl, {
		    'Content-Type' : 'multipart/form-data',
		}, [
		    { name: fileName, filename: fileName, type:'application/octet-stream', data: RNFetchBlob.wrap(filePath)},
		    { name: 't', data: this.config.token},
		]).uploadProgress((written, total) => {
			progressCallback(written, total);
	    }).then((resp) => {
			var data = resp.data;
			if (! data){
				//No data - error
				_handleUploadError({message: 'Response contains no data'});
			}
			var uploadResult = null;
			try{
				uploadResult = JSON.parse(data);
			}catch(ex){
				//如果不能作为 json 正常解析, 就当作错误字符串
				_handleUploadError(fileName, {message: "[错误] " + data}, errorCallback);
			}
			if (uploadResult && uploadResult.fileName && uploadResult.url){
				//正确的返回数据
				successCallback(uploadResult);
			}else{
				//不正确的 json 数据，当作错误字符串
				_handleUploadError(fileName, {message: "[无效数据] " + data}, errorCallback);
			}
		}).catch((err) => {
			_handleUploadError(fileName, err, errorCallback);
		})
	}
}
