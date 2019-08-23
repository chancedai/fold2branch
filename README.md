

# folder2branch: 把某个文件夹内容推送到某个分支

## 使用场景

- 在一个前端项目中，把构建出来的文件（如 dist 下的分支），推送到一个专门用于管理部署文件的分支（如 fe）;方便保持源文件分支清晰，方便做自动部署。
  
## 使用方法

- **安装**

```bash
#全局
npm i -D git+ssh://git@git.staff.sina.com.cn:ssfe/folder2branch.git
```

- **调用**
```bash
const folder2branch = require('folder2branch');
new folder2branch.Deployer({

    folder: 'test/_dist',
    // debug:true,
    // 不部署 html 
    pattern: '**/!(*.html)',
    branch:'fe',
    repo:'https://git.staff.sina.com.cn/ssfe/folder2branch',
    finish: function () {

    }
});

new folder2branch.Deployer({

    folder: 'test/_dist',
    // debug: false,
    // 只部署 html
    pattern: '**/*.html',
    branch:'be',
    repo:'https://git.staff.sina.com.cn/ssfe/folder2branch',
    finish: function () {

    }
});

```


