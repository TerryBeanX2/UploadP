!function () {
    //按钮选择器可以是#id、.class、tag,
    //支持多选
    //队列自动去重
    //请用form包裹你的上传inputTag，期间不要插入任何东西：<from><input type='file'></form>

    //必须的参数：inputTag、url
    //需要注意的参数：文件本体参数名 theFile 、文件总大小参数明 totalSizeName 、文件名参数名 fileNameName 无论如何上传，这些参数都会打包进dataform表单，通常情况下后台需要这些参数
    //有关联的参数：useChunk设置为true时，总块数参数名 chunksName、当前块参数名 currentChunkName 两个参数需要与后台协商入参
    //有关联的参数：needAddParam设置为true时，collectPara_doSth 函数必须被重写，addParam_JoinQueue按钮必须被绑定，点击此按钮会调用collectParam函数并自动打包你传入的参数
    //有关联的参数：useMD5设置为true时，MD5参数名 MD5KeyName 参数需要与后台协商入参
    //有关联的参数：useCurrentSize 设置为true时，getCurrentSize 函数必须被重写

    //全局属性：window.upLoadPList 上传队列数组，多个实例共用
    //全局属性：window.uploading 有文件正在上传，多个实例共用
    //全局属性：window.nowUploadingNum 同时正在上传的文件数，多个实例共用
    //全局属性：window.numOneTime 当前页面最多可以同时上传的文件数，多个实例共用
    //全局属性：window.upLoadPFileId 每个文件的ID，多个实例共用,在文件对应的DOM中通过这个Id来操作会很方便

    function UploadP(option) {
        this.o = {
            inputTag: '', //Input标签--必须
            url: '', //上传链接--必须
            maxSize: 1024 * 1024 * 1000, //限制文件大小，默认1G
            useConfirmExt: false, // 是否限制格式为
            confirmExtArr: ['mp4', 'mpg', 'ts', 'avi', 'mkv', 'mov', 'vob', 'm2t', 'wmv', 'flv'], //限制格式为的数组
            useExceptExt: false,// 是否排除格式
            exceptExtArr: ['mp4', 'mpg', 'ts', 'mkv', 'rmvb', 'avi', 'mpeg4', 'rm', 'm2t', 'wmv', 'mov', 'vob', "flv", "asf", "3gp"],//排除格式的数组
            autoUpload: true, //选择文件后是否自动上传，如果中途需要加入自定义参数后上传，则必须设为false
            param: {}, //如果队列都是统一的自定义参数，实例化时在此传入
            needAddParam: false, //是否需要在上传队列中每个文件都另加自定义参数(选择文件后追加表单参数)
            addParam_JoinQueue: '', //加入自定义参数，并将当前文件加入队列的按钮
            pauseBtn: '', //(弃用)暂停队列按钮,需要开启断点续传(此按钮会在暂停前调用beforeStop函数)--多个实例共用，不会重复绑定
            startQueueBtn: '',//(弃用)开始队列按钮(此按钮会在开始队列钱调用beforeUpload函数)--多个实例共用，不会重复绑定
            useChunk: false,//是否分块,
            dataFilter: null, //对ajax回掉函数中的data进行判定成功操作，决定是否正常执行上传，格式{条件:条件值}
            theFile: 'file',//自定义传给后台当前文件对象的key值
            totalSizeName: 'totalSize',//自定义传给后台当前文件总大小key值
            fileNameName: 'name',//自定义传给后台当前文件名Kdy值
            chunksName: 'chunks',//若分块，自定义传递给后台的总块数key值
            currentChunkName: 'chunk',//若分块，自定义传递给后台的当前块key值
            chunkSize: 1024 * 1024 * 50, //块大小,
            useCurrentSize: false, //是否断点续传(此功能需同时打开MD5功能、原理是用MD5值去请求到断点处的大小，从断点处的size截取到文件末尾传给后台)
            useMD5: false, //是否在上传参数中追加MD5：需要先引入spark-md5.js，为了速度，大于8M的文件，本MD5计算采用截取文件前后4m拼接后的值
            MD5KeyName: 'mdId', //使用MD5的话，自定义传给后台参数的key
            numOneTime: 1, //队列可同时上传个数(只在第一个实例化中生效)
            dataCallback: function (data) {
                //发起上传请求后得到data的自定义回调函数
                //do sth what you want to data
            },
            getFilesList: function (arr) {
                //若需要取出当前一次选取文件的files对象进行操作(如将文件名作为列表展示给用户,提供删除功能等)，请重写此函数
                //do sth what you want to files arr
            },
            beforeUpload: function () {
                //如果你想在上传前做一些事情，比如改变按钮样式等等，请写在这里
                //这里获取upLoadPList
                //do sth what you want before uploading
            },
            beforeStop: function () {
                //如果你想在停止时做一些事情，比如改变按钮样式等等，请写在这里
                //do sth what you want before stop
            },
            collectPara_doSth: function (arr) {
                //参数arr为此次想要一并加入队列的未做传参处理的文件arr
                //若需要自定义传参，请设置needAddParam为true，并重写此函数，不允许异步
                //此函数在点击addParam_JoinQueue时触发，改变队列DOM请在这里操作
                //param为空，则不触发上传，所以处理你自定义的过滤之类的事情写在这里，不满足就在param之前return false;
                var param = {};
                //fill the param;
                return param; //必须
            },
            progressFn: function (upLoadPFileId, per) {
                //如果你想把文件上传的进度展示给用户，请使用此函数
                //index is the index in whole list witch the progress you want
                //per is the live num of file progress
            },
            getCurrentSize: function (md5, fn) {
                //如果你想从上次中断的字节数位置继续上传，请以md5作为参数向后台请求currentSize，并在回掉中调用fn(currentSize);
                var currentSize = 0;
                //currentSize = get your currentSize
                fn(currentSize); //必须
            },
            oneItemComplete: function (item) {
                //完成一个文件的上传后触发此函数，index为完成的文件在队列中的index值;
            },
            queueComplete: function () {
                //队列完成后调用的函数
            },
            oneCancel:function () {
                //取消一个条目后调用的函数
            },
            failFn:function (data) {
                //上传返回异常数据处理
                console.log(data);
            }
        };
        this.extend(this.o, option);
        this.extend(this, this.o);
        this.init();
    }

    UploadP.prototype = {
        extend: function (newObj, obj) {
            for (var i in obj) {
                newObj[i] = obj[i];
            }
        },
        $: function (ele) {
            if (ele == '') return;
            return document.querySelector(ele);
        },
        init: function () {
            var self = this;
            self.nowSelectedArr = [];
            if (typeof window.uploading != 'boolean') window.uploading = false;
            if (typeof window.nowUploadingNum != 'number') window.nowUploadingNum = 0;
            if (typeof window.numOneTime != 'number') window.numOneTime = self.numOneTime;
            if (typeof window.upLoadPFileId != 'number') window.upLoadPFileId = 0;
            window.onbeforeunload = function () {
                console.log(window.uploadPList);
                if (window.uploadPList.length) return '';
            };
            if (!window.uploadPList) {
                window.uploadPList = [];
                if (self.startQueueBtn) {
                    self.addEvent(self.$(self.startQueueBtn), 'click', function () {
                        self.Event.emit('startUpload');
                    });
                }
                if (self.pauseBtn) {
                    self.addEvent(self.$(self.pauseBtn), 'click', function () {
                        self.Event.emit('pauseUpload');
                    });
                }
            }
            if (self.addParam_JoinQueue) {
                self.addEvent(self.$(self.addParam_JoinQueue), 'click', function () {
                    self.addInParam(self.collectPara_doSth(self.nowSelectedArr));
                });
            }
            if (this.useMD5) {
                var bs = new FileReader().readAsBinaryString;
                if (!FileReader.prototype.readAsBinaryString) {
                    //兼容IE的读取二进制
                    FileReader.prototype.readAsBinaryString = function (fileData) {
                        var binary = "";
                        var pt = this;
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            var bytes = new Uint8Array(reader.result);
                            var length = bytes.byteLength;
                            for (var i = 0; i < length; i++) {
                                binary += String.fromCharCode(bytes[i]);
                            }
                            //pt.result  - readonly so assign binary
                            pt.content = binary;
                            pt.onload(binary);
                        };
                        reader.readAsArrayBuffer(fileData);
                    };
                }
                this.MD5 = function calculateMD5(file, fn) {
                    var fileReader = new FileReader(),
                        blobSlice = File.prototype.mozSlice || File.prototype.webkitSlice || File.prototype.slice,
                        chunkSize = 1024 * 1024 * 4,
                        spark = new SparkMD5(),
                        done = false;
                    if (file.size >= chunkSize * 2) {
                        fileReader.readAsBinaryString(blobSlice.call(file, 0, chunkSize));
                    } else {
                        fileReader.readAsBinaryString(blobSlice.call(file, 0, file.size));
                        done = true;
                    }
                    fileReader.onload = function (ee) {
                        if (bs) {
                            spark.append(ee.target.result);
                        } else {
                            spark.append(ee);
                        }
                        if (done) {
                            var md5 = spark.end();
                            //执行上传
                            fn(md5);
                        } else if (file.size >= chunkSize * 2) {
                            fileReader.readAsBinaryString(blobSlice.call(file, file.size - chunkSize, file.size));
                            done = true;
                        }
                    };
                }
            }
            //自定义事件机制
            this.Event = {
                on: function (eventName, callback) {
                    if (!this[eventName]) {
                        this[eventName] = [];
                    }
                    this[eventName].push(callback);
                },
                emit: function (eventName) {
                    var that = this;
                    var params = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : [];
                    if (that[eventName]) {
                        Array.prototype.forEach.call(that[eventName], function (arg) {
                            arg.apply(self, params);
                        });
                    }
                }
            };
            this.Event.on('startUpload', function () {
                // console.log('listLength='+window.uploadPList.length)
                if (!window.uploadPList.length || window.nowUploadingNum >= window.numOneTime) return;
                window.uploading = true;
                self.beforeUpload();
                self.startUpload();
            });
            this.Event.on('pauseUpload', function () {
                if (!window.uploadPList.length || !window.uploading) return;
                self.beforeStop();
                self.pauseUpload();
            });
            this.Event.on('oneComplete', function (item) {
                console.log('trigger one complete');
                item.complete = true;
                item.uploading = false;
                self.oneItemComplete(item);
                window.uploadPList.forEach(function (_item, _index, list) {
                    if (item.upLoadPFileId == _item.upLoadPFileId) {
                        window.uploadPList.splice(_index,1)
                    }
                });
                window.nowUploadingNum--;
                if (window.nowUploadingNum == 0)window.uploading = false;
            });
            if (!self.inputTag) return alert('please bind your inputTag') & console.log('please bind your inputTag');
            self.addEvent(self.$(self.inputTag), 'change', function () {
                var arr = this.files;
                var arrA = self.nowSelectedArr;
                var arrB = window.uploadPList.slice(0);
                var arrC = [];
                Array.prototype.forEach.call(arr, function (item, index, list) {
                    var repeated = false;
                    if (arrA.some(function (_item, index) {
                            return (_item.name == item.name)
                        }) || arrB.some(function (__item, index) {
                            return (__item.name == item.name)
                        })) {
                        repeated = true;
                    }
                    if (self.compareMaxSize(item.size) && (self.useConfirmExt ? self.confirmExt(item.name) : true) && (self.useExceptExt ? self.exceptExt(item.name) : true) && !repeated) {
                        item.upLoadPFileId = window.upLoadPFileId++;
                        item.complete = false;
                        item.uploading = false;
                        item.canEmit = false;
                        item.haveGotCurrentSize = false;
                        item.currentChunk = 0;
                        item.chunks = 1;
                        item.param = {};
                        if (self.useChunk) {
                            item.chunks = Math.ceil(item.size / self.chunkSize)
                        } else {
                            item.chunks = 1;
                        }
                        arrC.push(item);
                    } else {
                        console.log('filter auto ignored');
                    }
                });
                self.nowSelectedArr = self.nowSelectedArr.concat(arrC);
                console.log(self.nowSelectedArr)
                self.getFilesList(arrC);
                if (!self.needAddParam) {
                    window.uploadPList = window.uploadPList.concat(arrC);
                    self.Event.emit('startUpload');
                }
                //这行代码会重置表格，确保表格内没有你不希望被重置的控件
                if (this.form) this.form.reset();
            });
        },
        addEvent: function (ele, event_name, func) {
            if (window.attachEvent) {
                ele.attachEvent('on' + event_name, func);
            }
            else {
                ele.addEventListener(event_name, func, false);
            }
        },
        addInParam: function (param) {
            if (!param) return;
            var self = this;
            this.nowSelectedArr.forEach(function (item, index, list) {
                self.extend(list[index].param, param)
            });
            window.uploadPList = window.uploadPList.concat(this.nowSelectedArr);
            this.nowSelectedArr = [];
            this.Event.emit('startUpload');
        },
        startUpload: function () {
            var self = this;
            if (!window.uploadPList.length) return console.log('no file in queue');
            // if (window.uploadPList.every(function (item, index) {
            //         return item.complete;
            //     })) {
            //     console.log('queue all done');
            //     self.queueComplete();
            //     window.uploadPList = [];
            //     window.nowUploadingNum = 0;
            //     return;
            // }
            window.uploadPList.forEach(function (item, index, list) {
                if (item.complete || item.paused) return;
                if (!item.xhr) {
                    item.xhr = new XMLHttpRequest();
                    item.xhr.upload.onprogress = function (evt) {
                        var loaded = evt.loaded;
                        var tot = evt.total;
                        var per = 100 * loaded / tot;
                        var perA = 0;
                        if (self.useChunk) {
                            if (item.currentSize) {
                                perA = (((item.currentSize) + (item.currentChunk) * (self.chunkSize) + loaded) * 100 / item.size).toFixed(1);
                            } else {
                                perA = (((item.currentChunk) * (self.chunkSize) + loaded) * 100 / item.size).toFixed(1);
                            }
                        } else {
                            perA = per.toFixed(1);
                        }
                        self.progressFn(item.upLoadPFileId, perA);
                    };
                    item.xhr.onreadystatechange = function () {
                        if (item.xhr.readyState == 4) {
                            if (item.xhr.status == 200) {
                                var data = JSON.parse(item.xhr.responseText);
                                if (self.dataFilter && (data[self.dataFilter[0]] == self.dataFilter[1]) || !self.dataFilter) {
                                    if (typeof  self.dataCallback == 'function') self.dataCallback(item.xhr.responseText);
                                    if (item.currentChunk == item.chunks - 1) {
                                        self.Event.emit('oneComplete', item);
                                        self.Event.emit('startUpload');
                                        return
                                    }
                                    if (item.currentChunk == item.chunks) return console.error('bug , chunks overflow');
                                    item.currentChunk++;
                                    self.transformParamToFormData(item);
                                } else {
                                    if (typeof self.failFn == 'function') self.failFn(item.xhr.responseText);
                                }
                            } else {
                                // console.log('disconnected!');
                            }
                        }
                    };
                }
                if (!item.complete && !item.uploading) {
                    if (!item.canEmit) {
                        self.Event.on.call(item, 'paramFilled', function (form, currentSize) {
                            if (currentSize) item.currentSize = currentSize;
                            item.form = form;
                            item.xhr.open("POST", self.url);
                            item.xhr.send(item.form);
                            item.uploading = true;
                            item.paused = false;
                        });
                        item.canEmit = true;
                    }
                    if (window.nowUploadingNum >= window.numOneTime)return;
                    window.nowUploadingNum++;
                    if (self.useMD5 && !item.param[self.MD5KeyName]) {
                        self.MD5(item, function (md5) {
                            item.param[self.MD5KeyName] = md5;
                            self.transformParamToFormData(item);
                        })
                    } else {
                        self.transformParamToFormData(item);
                    }
                }
            })
        },
        pauseUploadArr: function (arr) {
            var self = this;
            arr.forEach(function (item, index) {
                window.uploadPList.forEach(function (_item, _index, list) {
                    if ((item == _item.upLoadPFileId) && _item.xhr) {
                        if (_item.uploading == false) return;
                        self.pauseOneItem(_item);
                    }
                })
            });
        },
        startUploadArr: function (arr) {
            var self = this;
            arr.forEach(function (item, index) {
                window.uploadPList.forEach(function (_item, _index, list) {
                    if ((item == _item.upLoadPFileId) && _item.xhr) {
                        if (_item.uploading || window.nowUploadingNum >= window.numOneTime) return;
                        self.startOneItem(_item);
                        if (self.useMD5 && !_item.param[self.MD5KeyName]) {
                            self.MD5(_item, function (md5) {
                                _item.param[self.MD5KeyName] = md5;
                                self.transformParamToFormData(_item);
                            })
                        } else {
                            self.transformParamToFormData(_item);
                        }
                    }
                })
            });
        },
        cancelUploadArr: function (arr) {
            var self = this;
            arr.forEach(function (item, index) {
                window.uploadPList.forEach(function (_item, _index, list) {
                    if ((item == _item.upLoadPFileId)) {
                        if(_item.xhr&&_item.uploading){
                            _item.xhr.abort();
                            window.nowUploadingNum--;
                        }
                        self.oneCancel(_item);
                        window.uploadPList.splice(_index,1)
                    }
                })
            });
        },
        pauseAll: function () {
            var self = this;
            window.uploadPList.forEach(function (item, index) {
                if (item.uploading) {
                    self.pauseOneFile(item)
                }
            })
        },
        pauseOneItem: function (item) {
            item.paused = true;
            item.xhr.abort();
            item.uploading = false;
            item.haveGotCurrentSize = false;
            item.currentChunk = 0;
            this.progressFn(item.upLoadPFileId, '暂停');
            window.nowUploadingNum--;
        },
        startOneItem: function (item) {
            item.paused = false;
            item.uploading = true;
            window.nowUploadingNum++;
        },
        compareMaxSize: function (size) {
            if (size < this.maxSize) {
                return true;
            } else {
                console.log("one file's size overflow");
                return false;
            }
        },
        confirmExt: function (str) {
            var arr = this.confirmExtArr;
            var ext = str.match(/\.\w*$/i);
            if (!ext) return -1;
            if ($.inArray(ext[0].replace('.', '').toLowerCase(), arr) == -1) {
                console.log('one file not apply your confirmExtArr, ignored');
                return false;
            } else {
                return true;
            }
        },
        exceptExt: function (str) {
            var arr = this.exceptExtArr;
            var ext = str.match(/\.\w*$/i);
            if ($.inArray(ext[0].replace('.', '').toLowerCase(), arr) != -1) {
                console.log('one file apply your exceptExtArr, ignored');
                return false;
            } else {
                return true;
            }
        },
        MD5: function (file, fn) {
            fn();
        },
        getCurrentSize: function (item, fn) {
            var currentSize = 0;
            //currentSize = get your currentSize
            fn(currentSize);
        },
        transformParamToFormData: function (item) {
            var self = this;
            var form = new FormData();
            if (item.param) {
                for (var i in item.param) {
                    form.append(i, item.param[i]);
                }
            }
            if (this.param) {
                for (var i in this.param) {
                    form.append(i, this.param[i]);
                }
            }
            form.append(this.totalSizeName, item.size);
            form.append('name', item.name);
            form.append(this.currentChunkName, item.currentChunk);
            if (this.useCurrentSize && this.useMD5 && !item.haveGotCurrentSize) {
                this.getCurrentSize(item, function (currentSize,isUpload) {
                    if(isUpload==1){
                        return self.Event.emit('oneComplete',item)
                    }
                    doNext(currentSize);
                    item.haveGotCurrentSize = true;
                });
            } else {
                doNext();
            }
            function doNext(currentSize) {
                if (currentSize || currentSize == 0) {
                    currentSize = Number(currentSize);
                    item.currentSize = currentSize;
                    item.chunks = Math.ceil((item.size - currentSize) / self.chunkSize);
                }
                form.append(self.chunksName, item.chunks);
                if (!self.useChunk) {
                    form.append(self.theFile, item);
                } else if (self.useCurrentSize) {
                    item.currentChunk == item.chunks - 1 ? form.append(self.theFile, item.slice(item.currentSize + item.currentChunk * self.chunkSize, item.currentSize + item.size))
                        : form.append(self.theFile, item.slice(item.currentSize + item.currentChunk * self.chunkSize, item.currentSize + (item.currentChunk + 1) * self.chunkSize));
                } else {
                    item.currentChunk == item.chunks - 1 ? form.append(self.theFile, item.slice(item.currentChunk * self.chunkSize, item.size))
                        : form.append(self.theFile, item.slice(item.currentChunk * self.chunkSize, (item.currentChunk + 1) * self.chunkSize));
                }
                self.Event.emit.call(item, 'paramFilled', form, item.currentSize);
            }
        },
        deleteNowSelectItem: function (upLoadPFileId) {
            var self = this;
            this.nowSelectedArr.forEach(function (item, index) {
                if (item.upLoadPFileId == upLoadPFileId) self.nowSelectedArr.splice(index, 1);
            });
        }
    };
    Object.defineProperty(window, 'UploadP', {
        configurable: true,
        enumerable: true,
        value: UploadP
    })

}();


