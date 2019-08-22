const { execSync } = require('child_process');
// 样式
const chalk = require('chalk');

const copy = require('copy');

const mkdirp = require('mkdirp');

const fs = require('fs');
const path = require('path');
// const os = require('os');

const cwd = process.cwd();


class Deployer {
    constructor({
      // 是否在终端显示上传信息
      log = true,
     
    // 要推送到分支的文件夹
    folder = '',

    // 分支名
    branch = '',

    // 仓库名
    repo = '',

    // 提交的信息
    msg = '',

    email = 'daichang@staff.sina.com.cn',
    name = 'daichang',

    // 执行前
    before = function(){},

      // 使用 glob 匹配目录文件
      pattern = '**/*',
      // 上传完成回调，参数 result 返回结果
      finish = function () {}
    } = {}) {
      const self = this;
      this.options = {
        log,
        folder,
        branch,
        repo,
        msg,
        email,
        name,
        pattern,
        before,
        finish
      };
      
      if(!folder|| !branch|| !repo){
        this._warn('folder, branch, repo都不能为空');
        return;
      }
      this._create(function(){
          self._move(function(){
            self.git();
          });
      });
    }
    _warn(msg) {
      this._log(chalk.yellow('* ' + msg));
    }
    _create(fn){
        const tempFolder = this._getTempFolderName();
        
        const {folder, email, name } = this.options;
        fs.access(tempFolder,function(err){
            if(err){
                mkdirp(tempFolder, function (err) {
                    if (err) {
                      throw Error(err);
                    }

                    execSync([
                        `cd ${folder}`,
                        `git config user.email "${email||''}"`,
                        `git config user.name "${name||''}"`,
                        'git init ',
                        `git commit --allow-empty -m "First commit"`
                    ].join('&&'), { cwd });
                    

                    fn();
                    
                  });
            }
        });
    }
    _getTempFolderName(){
        // 以.deploy+文件夹名+分支名为，临时目录,如 .deploy-dist-esinaimgcn(存放前端部署静态资源)，.deploy-dist-server存放后端部署资源
        const { folder, branch } = this.options;
        this.tempFolder = '.deploy-'+folder.split('/').join('-')+'-'+branch;
        return this.tempFolder;
    }
    
    _log(msg) {
      if (this.options.log) {
        console.log(msg);
      }
    }

    _move(fn){
      const self = this;
      const {
        pattern,
        folder
      } = this.options;
      copy(path.join(folder,'/')+pattern, this.tempFolder, function(err, files) {
        if (err) throw err;
        fn();
      });
    }
    git(){

        const {folder,branch,repo,email,name,msg} = this.options;

        // 执行前
        this.options.before.call(this);

        execSync([
            `cd ${folder}`,
            'git add .',
            `git commit --allow-empty -m "${msg||'folder2branch'}"`
        ].join('&&'), { cwd });

        execSync(`cd ${folder} && git push -u ${repo} HEAD:${branch} --force`, { cwd });

        this.options.finish.call(this);
    }
  }
  
  module.exports = {
    Deployer
  };

