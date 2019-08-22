const folder2branch = require('../index.js');
new folder2branch.Deployer({

    folder: 'test/esinaimgcn',
    pattern: '**/*',
    branch:'esinaimgcn',
    repo:'https://github.com/chancedai/folder2branch',
    finish: function (result) {
        // 上传完成后
        console.log(result);
    }
});

new folder2branch.Deployer({

    folder: 'test/server',
    pattern: '**/*',
    branch:'server',
    repo:'https://github.com/chancedai/folder2branch',
    finish: function (result) {
        // 上传完成后
        console.log(result);
    }
});
