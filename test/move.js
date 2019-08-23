const folder2branch = require('../index.js');
new folder2branch.Deployer({

    folder: 'test/_dist',
    // debug:true,
    // 不部署 html 
    pattern: '**/!(*.html)',
    branch:'esinaimgcn',
    repo:'https://git.staff.sina.com.cn/ssfe/folder2branch',
    finish: function () {

    }
});

new folder2branch.Deployer({

    folder: 'test/_dist',
    // debug: false,
    // 只部署 html
    pattern: '**/*.html',
    branch:'server',
    repo:'https://git.staff.sina.com.cn/ssfe/folder2branch',
    finish: function () {

    }
});
