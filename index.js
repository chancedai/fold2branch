const {
  execSync
} = require('child_process');
// 样式
const chalk = require('chalk');

const copy = require('copy');

const mkdirp = require('mkdirp');

const fs = require('fs');
const path = require('path');
const os = require('os');

const cwd = process.cwd();

function delDir(path) {
  let files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach((file, index) => {
      let curPath = path + "/" + file;
      if (fs.statSync(curPath).isDirectory()) {
        delDir(curPath); //递归删除文件夹
      } else {
        fs.unlinkSync(curPath); //删除文件
      }
    });
    fs.rmdirSync(path);
  }
}


class Deployer {
  constructor({
    // 是否在终端显示上传信息
    log = true,

    // debug 模式下，会在项目创建临时目录，方便用户查看推送内容，并且默认打开 log;
    debug = false,

    // 要推送到分支的文件夹
    folder = '',

    // 分支名
    branch = '',

    // 仓库名
    repo = '',

    // 提交的信息
    msg = '',

    email = '340433246@qq.com',
    name = 'chancedai',

    // 执行前
    before = function () {},

    // 使用 glob 匹配目录文件
    pattern = '**/*',
    // 上传完成回调，参数 result 返回结果
    finish = function () {}
  } = {}) {
    const self = this;
    this.options = {
      log,
      debug,
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

    if (!folder || !branch || !repo) {
      this._warn('folder, branch, repo都不能为空');
      return;
    }
    this._create(function () {
      self._move(function () {
        self._gitPush();
      });
    });
  }
  _warn(msg) {
    this._log(chalk.yellow('* ' + msg));
  }
  _create(fn) {
    const tempFolder = this._getTempFolderName();
    const self = this;
    const {
      debug
    } = this.options;
    fs.access(tempFolder, function (err) {
      if (err) {
        mkdirp(tempFolder, function (err) {
          if (err) {
            throw Error(err);
          }

          // 全新的文件夹，需要初始化 git
          self._gitInit(tempFolder);
          fn();

        });
      } else {
        if (debug) { // 使用已经使用过的临时目录，不用 git 初始化，并且需要清理文件夹
          delDir(tempFolder);
          fn();
        } else { // 使用系统的临时目录，所以是全新的文件夹，需要初始化 git
          self._gitInit(tempFolder);
          fn();
        }

      }
    });
  }
  _gitInit(tempFolder) {
    const {
      email,
      name
    } = this.options;
    this._log('初始化 git');
    execSync([
      `cd ${tempFolder}`,
      'git init ',
      `git config user.email "${email||''}"`,
      `git config user.name "${name||''}"`,
      `git commit --allow-empty -m "First commit"`
    ].join('&&'), {
      cwd
    });
  }
  _getTempFolderName() {
    // 以.deploy+文件夹名+分支名为，临时目录,如 .deploy-dist-esinaimgcn(存放前端部署静态资源)，.deploy-dist-server存放后端部署资源
    const {
      folder,
      branch,
      debug
    } = this.options;
    if (debug) {
      this.tempFolder = '.folder2branch-' + folder.split('/').join('-') + '-' + branch;
    } else {
      this.tempFolder = fs.mkdtempSync(path.join(os.tmpdir(), '.folder2branch-'));
    }

    this._log('创建临时目录 ' + this.tempFolder + ' ');

    return this.tempFolder;
  }

  _log(msg) {
    if (this.options.log) {
      console.log(chalk.green('* ' + msg));
    }
  }

  _move(fn) {
    const self = this;
    const {
      pattern,
      folder
    } = this.options;

    this._log('复制目标目录 ' + folder + ' ' + pattern + ' 文件到临时目录 ' + this.tempFolder + ' ...');
    copy(path.join(folder, '/') + pattern, this.tempFolder, function (err, files) {
      if (err) throw err;
      fn();
    });
  }
  _gitPush() {

    const {
      pattern,
      folder,
      branch,
      repo,
      msg
    } = this.options;

    // 执行前
    this.options.before.call(this);
    const tempFolder = this.tempFolder;

    this._log('开始推送 ' + folder + ' ' + pattern + ' 到分支 ' + branch + '...');
    execSync([
      `cd ${tempFolder}`,
      'git add .',
      `git commit --allow-empty -m "${msg||'folder2branch push'}"`
    ].join('&&'), {
      cwd
    });

    execSync(`cd ${tempFolder} && git push -u ${repo} HEAD:${branch} --force`, {
      cwd
    });

    this.options.finish.call(this);

    this._log('推送 ' + folder + ' ' + pattern + ' 完成:）');
  }
}

module.exports = {
  Deployer
};