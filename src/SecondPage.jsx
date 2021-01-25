import React from 'react';
import ReactDOM from 'react-dom';
import { Toolbar, Page, Button, BackButton, Col, Row, Switch } from 'react-onsenui';
import './style.css'

export default class SecondPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      field: [],
      flagsCount: 0,
      minesCount: 10,
      time: 10,
      mode: false,
      size: 9,
      minePoses: [],
      remainCount: Math.pow(9, 2),
      timer: undefined,
      clearFlag: 0,
    };
    this.initField = this.initField.bind(this);
    this.setMines = this.setMines.bind(this);
    this.initTimer = this.initTimer.bind(this);
    this.loadField = this.loadField.bind(this);
    this.checkCell = this.checkCell.bind(this);
    this.turnCell = this.turnCell.bind(this);
    this.turnFlag = this.turnFlag.bind(this);
    this.openMines = this.openMines.bind(this);
    this.initField();
    this.initTimer();
  }

  // フィールドを初期化する
  initField() {
    var s = this.state;
    // 壁を増やすために2足す
    var fsize = s.size + 2;
    var f = []
    const wall = { type: -999, state: -1 };
    //上の壁を埋める
    f.push(new Array(fsize).fill(wall));
    //中
    for (var i = 0; i < s.size; i++) {
      var tmp = [];
      // 左端の壁を入れる
      tmp.push(wall);
      // メインのマスを入れる
      for (var j = 0; j < s.size; j++) {
        tmp.push({ type: 0, state: 0 });
      }
      // 右端の壁を入れる
      tmp.push(wall);
      f.push(tmp);
    }
    //下の壁を埋める
    f.push(new Array(fsize).fill(wall));

    // 爆弾を置く
    s.field = this.setMines(f);

    this.setState(s);
  }

  setMines(field) {
    var s = this.state;
    var poses = [];
    // 座標の重複確認用
    const findArrFromArr = (array, element) => {
      return array.find(elm => elm.toString() == element.toString());
    }
    while (poses.length < s.minesCount) {
      // 爆弾用の座標を生成
      // 壁の分だけ1ずらす
      var row = Math.floor(Math.random() * s.size) + 1;
      var col = Math.floor(Math.random() * s.size) + 1;
      // 同じ座標に爆弾があったらやり直し
      if (findArrFromArr(poses, [row, col]) != undefined) {
        console.log("undefinedって何");
        continue;
      }
      // 座標を保管
      const tmp = [row, col];
      poses.push(tmp);
      // 座標を爆弾に設定
      field[row][col].type = -1;
      // 座標の周りの空白マスのtypeに1加算
      for (var i = -1; i < 2; i++) {
        for (var j = -1; j < 2; j++) {
          if (i == 0 && j == 0) {
            continue;
          }
          // そのマスのタイプが壁(-999)か爆弾(-1)じゃなかったらタイプを加算する
          var cell = field[row + i][col + j];
          if (cell.type > -1) {
            cell.type += 1;
          }
        }
      }
    }
    s.minePoses = poses;
    return field;
  }

  initTimer() {
    var timer = setInterval(() => {
      var s = this.state;
      s.time -= 1;
      if(s.time <= 0){
        s.clearFlag = -1;
      }
      this.setState(s);
    }, 1000);
    var s = this.state;
    s.timer = timer;
    this.setState(s);
  }

  loadField() {
    var s = this.state;
    var html = [];
    for (var row = 1; row < s.size + 1; row++) {
      var tmp = [];
      for (var col = 1; col < s.size + 1; col++) {
        const r = row;
        const c = col;
        const cell = s.field[row][col];
        switch (cell.state) {
          // 開いていないマス
          case 0:
            tmp.push(<Col className="closed-state square" onClick={() => this.checkCell(r, c)}></Col>);
            break;
          // 開いているマス
          case 1:
            if (cell.type == 0) {
              tmp.push(<Col className="opened-state square"></Col>);
            }
            else if (cell.type > 0) {
              tmp.push(<Col className="opened-state square">{cell.type}</Col>);
            }
            else {
              tmp.push(<Col className="opened-state square">💣</Col>);
            }
            break;
          // 旗を立てたマス
          case 2:
            tmp.push(<Col className="closed-state square" onClick={() => this.checkCell(r, c)}>🚩</Col>);
            break;
          default:
            tmp.push(<Col className="">◆</Col>);
            break;
        }
      }
      html.push(<Row>{tmp.concat()}</Row>);
    }
    console.log("Reloaded field.");
    return html;
  }

  checkCell(row, col) {
    var s = this.state;
    // ゲーム終了後は何もしない
    if (s.clearFlag != 0) {
      return;
    }
    var f = s.field;
    var cell = f[row][col];
    // 旗モード
    if (s.mode) {
      this.turnFlag(f, row, col);
      this.setState(s);
    }
    // 開モード
    else if (cell.state != 2) {
      // 爆弾マスならゲームオーバー
      if (cell.type == -1) {
        this.openMines();
        s.clearFlag = -1;
        clearInterval(s.timer);
        console.log("GameOver");
      }
      // それ以外なら開く
      else {
        this.turnCell(s, row, col);
      }
      // 
      if (s.remainCount == s.minesCount) {
        s.clearFlag = 1;
        clearInterval(s.timer);
        console.log("GameClear");
      }

      this.setState(s);

    }
  }

  turnCell(state, row, col) {
    var openedCell = this.state.openedCellCount;
    var f = state.field;
    var cell = f[row][col];
    // 爆弾や壁 または すでに開いているなら止まる
    if (cell.type < 0 || cell.state == 1) {
      return;
    }
    // マスを開ける
    cell.state = 1;
    // 開けたマスを加算する
    state.remainCount -= 1;
    // 0マスの時のみ周りを開ける
    if (cell.type == 0) {
      // 周りのマスを開ける
      for (var i = -1; i < 2; i++) {
        for (var j = -1; j < 2; j++) {
          if (i == 0 && j == 0) {
            continue;
          }
          this.turnCell(state, row + i, col + j);
        }
      }
    }
    return;
  }

  turnFlag(f, row, col) {
    var cell = f[row][col];
    if (cell.state == 0) {
      cell.state = 2;
    }
    else {
      cell.state = 0;
    }
    return f;
  }

  openMines() {
    var s = this.state;
    s.minePoses.map(pos => {
      s.field[pos[0]][pos[1]].state = 1;
    });
    this.setState(s);
  }

  popPage() {
    if(this.state.clearFlag == 1)
    this.props.updateScore(this.state.time);
    this.props.navigator.popPage();
  }

  render() {
    return (
      <Page>
        <div className="flex-container flex-justify">
          <div className="info">
            💣{this.state.flagsCount}/{this.state.minesCount}
          </div>
          <div className="info">
            ⏰{this.state.time}
          </div>
        </div>
        <div className="flex-container flex-left">
          <div>
            ⛏ <Switch onChange={(event) => {
              var s = this.state; // stateの値を取得してsに入れる
              s.mode = event.value; // evant.valueの値がスイッチの状態を表しています
              this.setState(s); // this.stateをsを使って更新する
            }}
              checked={this.state.mode}></Switch> 🚩
          </div>
        </div>
        <p style={{ textAlign: 'center' }}>
          <Button onClick={this.popPage.bind(this)}>戻る</Button>
        </p>
        <p>
          {this.loadField()}
        </p>
      </Page>
    );
  }
}