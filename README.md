# UploadP
#### 4.26小结
今天有幸和一位资深架构师共进晚餐，提到了分块上传的事儿，原来不分块才比较好，前端只负责计算MD5与文件长度就够了，
后台通过链表写入文件，就可以避免分块了，所以说，这个插件的分块功能不推荐使用了。
而我，今后的技术研发目标就放在两块上：前端框架、Node.js，最好的愿景就是技术栈越来越偏向后端。

#### 4.21增加一张线上项目效果图
![img](https://github.com/TerryBeanX2/UploadP/raw/master/egImg/example.jpg)
小结：良好的代码规划、OOP习惯、与后台的密切合作，使我很快完成了实际开发，证明了插件已经可以实际使用。

#### 4.18小结
在开发过程中，业务性越来越强，偏离了我的初衷，现在想使用它进行复杂的业务代码编写，一些高级功能可能对使用者不友好。主要是在单个文件向后台细分传参部分，如果细分比较复杂，需要研究插件源码。当然了，你直接问我的话，我是可以很快帮你解决的。

#### 4.10开始更新
项目的下一版本需求将在半个月后确定，一定包含多任务断点续传，所以这个插件也一定会更新
    
### early 
    之前工作中有断点续传/前端计算MD5的需求,网上找了许多插件都没有完全吻合的,改起来又麻烦;
    
    于是我就自己写了一个,目前不是很完善,但可以满足基本上传功能,有兴趣可以点开JS查看或者尝试使用;
    
    目前我的精力放在小组React技术分享上，所以这个上传插件初期的文档就写在JS里;
    
    后续我会更新这个插件,直到良好的支持多任务并行上传;
    
    欢迎使用,如遇到问题加QQ462889217我会很详细的帮助你使用,欢迎提出问题,帮助我改进它.

    In recent work I got the demand of breakpoint http upload and calculate MD5 in front end，
    I searched many plugins but none of them fit this condition，and it is too much trouble to change them；
    So I write one for myself，for the moment，this plugin is far away from perfect,
    but it can satisfy some basic function,
    if you interest in it,please click the js file to view code or attempt to use it.
    Currently I focusing on React technology share in our H5 group,
    so the description of this plugin was writed in js file.
    I will update this plugin at some time later,
    until it can support multi files uploading at the same time;
    Welcome to use it and contact me by QQ462889217 any time if you get any problem;
    Description only support Chinese by now.
    
    上面那段英文是自己练习英文玩的，不要在意...
