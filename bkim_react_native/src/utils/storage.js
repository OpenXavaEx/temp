'use strict';

import Storage from 'react-native-storage';
import { AsyncStorage } from 'react-native';

/**
 * perfStorage - 配置信息存储对象
 */
var perfStorage = new Storage({
    // 最大容量，默认值1000条数据循环存储
    size: 1000,

    // 存储引擎：对于RN使用AsyncStorage，对于web使用window.localStorage
    // 如果不指定则数据只会保存在内存中，重启后即丢失
    storageBackend: AsyncStorage,

    // 数据过期时间，默认一整天（1000 * 3600 * 24 毫秒），设为null则永不过期
    defaultExpires: null,

    // 读写时在内存中缓存数据。默认启用。
    enableCache: true,

    // 如果storage中没有相应数据，或数据已过期，
    // 则会调用相应的sync方法，无缝返回最新数据。
    sync: null
});

var perf = {
    load: function(key, callback){
        perfStorage.load({
            key: key,
            // autoSync(默认为true)意味着在没有找到数据或数据过期时自动调用相应的sync方法
            autoSync: false,
        }).then(ret => {
            if (! ret) ret = {};
            callback(ret);
        }).catch(err => {
            //如果没有找到数据且没有sync方法，
            //或者有其他异常，则在catch中返回
            switch (err.name) {
                case 'NotFoundError':
                    callback({});
                    break;
                case 'ExpiredError':
                    callback({});
                    break;
                default:
                    console.warn(err.message);
                    alert("读取配置信息错误: "+err.name+" - "+err.message);
            }
        });
    },
    save: function(key, value){
        perfStorage.save({
            key: key,  // 注意:请不要在key中使用_下划线符号!
            rawData: value,
            // 如果不指定过期时间，则会使用defaultExpires参数
            // 如果设为null，则永不过期
            expires: null
        });
    }
}

module.exports = {
    perf: perf,
}
